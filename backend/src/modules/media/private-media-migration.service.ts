import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { MediaService } from './media.service';
import { PRIVATE_FOLDERS, PRIVATE_MEDIA_PREFIX } from './private-storage';

/** Runs before HTTP listening. Retry-safe copy -> commit references -> remove public originals. */
@Injectable()
export class PrivateMediaMigrationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PrivateMediaMigrationService.name);
  constructor(private readonly prisma: PrismaService, private readonly media: MediaService) {}

  async onApplicationBootstrap() {
    await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(71420261117::bigint)::text AS locked`;
      await this.migrate(tx);
    }, { timeout: 600_000, maxWait: 600_000 });
    // A crash after the commit leaves legacyUrl populated, so removal retries at next startup.
    const originals = await this.prisma.media.findMany({ where: { isPrivate: true, legacyUrl: { not: null } }, select: { id: true, legacyUrl: true } });
    for (const file of originals) {
      await this.media.deleteAccountObject(file.legacyUrl!);
      await this.prisma.media.updateMany({ where: { id: file.id, legacyUrl: file.legacyUrl }, data: { legacyUrl: null } });
    }
    this.logger.log('Private documents ready; legacy public originals removed');
  }

  private async migrate(tx: Prisma.TransactionClient) {
    const candidates = new Map<string, { tenantId: string; url: string; folder: string; ownerId?: string }>();
    const add = (tenantId: string, url: string | null | undefined, folder: string, ownerId?: string) => {
      if (url && !url.startsWith(PRIVATE_MEDIA_PREFIX)) candidates.set(tenantId + '\n' + url, { tenantId, url, folder, ownerId });
    };
    const users = await tx.user.findMany({ select: { id: true, tenantId: true, nationalIdFrontUrl: true, nationalIdBackUrl: true, passportUrl: true } });
    for (const user of users) for (const url of [user.nationalIdFrontUrl, user.nationalIdBackUrl, user.passportUrl]) add(user.tenantId, url, 'user-documents', user.id);
    const documents = await tx.userDocument.findMany({ select: { tenantId: true, userId: true, url: true } });
    for (const document of documents) add(document.tenantId, document.url, 'user-documents', document.userId);
    const payments = await tx.payment.findMany({ select: { id: true, tenantId: true, receiptUrls: true } });
    for (const payment of payments) for (const url of payment.receiptUrls) add(payment.tenantId, url, 'receipts');
    const bookings = await tx.booking.findMany({ where: { meta: { not: Prisma.DbNull } }, select: { id: true, tenantId: true, userId: true, meta: true } });
    for (const booking of bookings) {
      if (!booking.meta || typeof booking.meta !== 'object' || Array.isArray(booking.meta)) continue;
      for (const [key, value] of Object.entries(booking.meta)) {
        if (key.startsWith('doc_') && typeof value === 'string') {
          for (const url of value.split(',').map((part) => part.trim()).filter((part) => /^(https?:\/\/|\/api\/v1\/uploads\/)/.test(part))) add(booking.tenantId, url, 'visa-documents', booking.userId || undefined);
        }
      }
    }
    const registered = await tx.media.findMany({ where: { isPrivate: false, folder: { in: PRIVATE_FOLDERS } } });
    for (const file of registered) if (!candidates.has(file.tenantId + '\n' + file.url)) add(file.tenantId, file.url, file.folder!);

    const replacements = new Map<string, Map<string, string>>();
    for (const candidate of candidates.values()) {
      const existing = await tx.media.findFirst({ where: { tenantId: candidate.tenantId, url: candidate.url } });
      const id = existing?.id || createHash('sha256').update(candidate.tenantId + '\n' + candidate.url).digest('hex');
      await this.media.copyLegacyToPrivate(id, candidate.url);
      const url = PRIVATE_MEDIA_PREFIX + id;
      const data = { isPrivate: true, url, legacyUrl: candidate.url, folder: candidate.folder,
        // Ownership is checked from the authoritative document/payment references below.
        uploadedById: null, uploadTokenHash: null, uploadTokenExpiresAt: null };
      if (existing) await tx.media.update({ where: { id }, data });
      else await tx.media.create({ data: { id, tenantId: candidate.tenantId, ...data, filename: 'document' } });
      if (!replacements.has(candidate.tenantId)) replacements.set(candidate.tenantId, new Map());
      replacements.get(candidate.tenantId)!.set(candidate.url, url);
      for (const field of ['nationalIdFrontUrl', 'nationalIdBackUrl', 'passportUrl'] as const) {
        await tx.user.updateMany({ where: { tenantId: candidate.tenantId, [field]: candidate.url }, data: { [field]: url } });
      }
      await tx.userDocument.updateMany({ where: { tenantId: candidate.tenantId, url: candidate.url }, data: { url } });
    }
    for (const payment of payments) {
      const mapping = replacements.get(payment.tenantId);
      if (mapping && payment.receiptUrls.some((url) => mapping.has(url))) {
        await tx.payment.update({ where: { id: payment.id }, data: { receiptUrls: payment.receiptUrls.map((url) => mapping.get(url) || url) } });
      }
    }
    for (const booking of bookings) {
      const mapping = replacements.get(booking.tenantId);
      if (!mapping) continue;
      let json = JSON.stringify(booking.meta);
      const original = json;
      for (const [oldUrl, newUrl] of mapping) json = json.split(oldUrl).join(newUrl);
      if (json !== original) await tx.booking.update({ where: { id: booking.id }, data: { meta: JSON.parse(json) } });
    }
  }
}
