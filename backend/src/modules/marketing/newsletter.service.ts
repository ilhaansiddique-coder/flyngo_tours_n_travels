import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '../../config/config.service';
import { NotificationsService } from '../notifications/notifications.service';

const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const acknowledgement = { accepted: true, message: 'Request received. If confirmation is needed, check your inbox. You are subscribed only after confirmation.' };

@Injectable()
export class NewsletterService {
  constructor(private readonly db: PrismaService, private readonly notifications: NotificationsService, private readonly config: ConfigService) {}

  async subscribe(tenantId: string, address: string) {
    if (!this.notifications.getDeliveryStatus().email.configured) throw new ServiceUnavailableException('Newsletter signup is temporarily unavailable. Please try again later.');
    const email = address.trim().toLowerCase();
    const now = new Date();
    const existing = await this.db.newsletterSubscription.findUnique({ where: { tenantId_email: { tenantId, email } } });
    if (existing?.status === 'confirmed' || (existing?.lastRequestedAt && now.getTime() - existing.lastRequestedAt.getTime() < 15 * 60_000)) return acknowledgement;
    const confirmation = randomBytes(32).toString('hex');
    const unsubscribe = randomBytes(32).toString('hex');
    const data = { status: 'pending', consentVersion: 'newsletter-v1', confirmationHash: hash(confirmation),
      confirmationExpiresAt: new Date(now.getTime() + 24 * 60 * 60_000), unsubscribeHash: hash(unsubscribe), lastRequestedAt: now,
      confirmedAt: null, unsubscribedAt: null };
    let id: string;
    if (existing) {
      const claimed = await this.db.newsletterSubscription.updateMany({ where: { id: existing.id, lastRequestedAt: existing.lastRequestedAt, status: existing.status }, data });
      if (!claimed.count) return acknowledgement;
      id = existing.id;
    } else {
      try { id = (await this.db.newsletterSubscription.create({ data: { tenantId, email, ...data } })).id; }
      catch (error: any) { if (error.code === 'P2002') return acknowledgement; throw error; }
    }
    const base = new URL(this.config.getOrNull('FRONTEND_URL') || 'http://localhost:3000').origin;
    const confirmationUrl = `${base}/newsletter/confirm#token=${confirmation}`;
    const unsubscribeUrl = `${base}/newsletter/unsubscribe#token=${unsubscribe}`;
    try {
      const result = await this.notifications.sendRawHtmlEmail(email, 'Confirm your Flyngo newsletter subscription',
        `<p>Confirm that you want Flyngo travel news and offers.</p><p><a href="${confirmationUrl}">Confirm subscription</a></p><p>Confirmation link: ${confirmationUrl}</p><p>This link expires in 24 hours. If you did not request this, ignore this email.</p><p><a href="${unsubscribeUrl}">Unsubscribe</a></p><p>Unsubscribe link: ${unsubscribeUrl}</p>`);
      if (!result.sent) throw new Error('Message was not accepted');
    } catch {
      await this.db.newsletterSubscription.updateMany({ where: { id, confirmationHash: data.confirmationHash }, data: { lastRequestedAt: null, confirmationHash: null, confirmationExpiresAt: null } });
      throw new ServiceUnavailableException('We could not send your confirmation email. Please try again later.');
    }
    return acknowledgement;
  }

  async confirm(tenantId: string, token: string) {
    const result = await this.db.newsletterSubscription.updateMany({ where: { tenantId, status: 'pending', confirmationHash: hash(token), confirmationExpiresAt: { gt: new Date() } },
      data: { status: 'confirmed', confirmedAt: new Date(), confirmationHash: null, confirmationExpiresAt: null } });
    if (!result.count) throw new BadRequestException('This confirmation link is invalid or expired. Please subscribe again.');
    return { confirmed: true };
  }

  async unsubscribe(tenantId: string, token: string) {
    const result = await this.db.newsletterSubscription.updateMany({ where: { tenantId, unsubscribeHash: hash(token) },
      data: { status: 'unsubscribed', unsubscribedAt: new Date(), confirmationHash: null, confirmationExpiresAt: null, lastRequestedAt: null } });
    if (!result.count) throw new BadRequestException('This unsubscribe link is invalid.');
    return { unsubscribed: true };
  }

  async listConfirmed(tenantId: string, page = 1, limit = 20) {
    const where = { tenantId, status: 'confirmed' };
    const [items, total] = await Promise.all([this.db.newsletterSubscription.findMany({ where, skip: (page - 1) * limit, take: limit,
      orderBy: { confirmedAt: 'desc' }, select: { id: true, email: true, confirmedAt: true, consentVersion: true } }), this.db.newsletterSubscription.count({ where })]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
