import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MediaService } from './media.service';
import { Prisma } from '@prisma/client';

/** Durable file cleanup after account deletion; transient storage errors are retried. */
@Injectable()
export class MediaDeletionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MediaDeletionService.name);
  private timer?: ReturnType<typeof setInterval>;
  private running = false;

  constructor(private readonly prisma: PrismaService, private readonly media: MediaService) {}

  onModuleInit() {
    this.timer = setInterval(() => { void this.flush(); }, 60_000);
    this.timer.unref();
    void this.flush();
  }

  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }

  async hasLiveReferences(url: string, db: Prisma.TransactionClient = this.prisma, includeMedia = false) {
    const tables = Prisma.dmmf.datamodel.models.filter((model) => model.name !== 'MediaDeletionJob' && (includeMedia || model.name !== 'Media'));
    const queries = tables.map((model) => Prisma.sql`SELECT 1 FROM ${Prisma.raw(`"${(model.dbName ?? model.name).replace(/"/g, '""')}"`)} account_delete_record
      WHERE POSITION(${url} IN row_to_json(account_delete_record.*)::text) > 0`);
    const [usage] = await db.$queryRaw<{ shared: boolean }[]>(Prisma.sql`SELECT EXISTS (${Prisma.join(queries, ' UNION ALL ')}) AS shared`);
    return usage.shared;
  }

  async flush(tenantId?: string) {
    if (this.running) return;
    this.running = true;
    try {
      const jobs = await this.prisma.mediaDeletionJob.findMany({
        where: { ...(tenantId ? { tenantId } : {}), retryAfter: { lte: new Date() } },
        orderBy: { createdAt: 'asc' }, take: 50,
      });
      for (const job of jobs) {
        try {
          // Recheck after commit in case another account began using the object.
          if (await this.hasLiveReferences(job.url, this.prisma, true)) {
            await this.prisma.mediaDeletionJob.deleteMany({ where: { id: job.id } });
            continue;
          }
          await this.media.deleteAccountObject(job.url);
          await this.prisma.mediaDeletionJob.deleteMany({ where: { id: job.id } });
        } catch {
          await this.prisma.mediaDeletionJob.updateMany({ where: { id: job.id }, data: {
            attempts: { increment: 1 }, retryAfter: new Date(Date.now() + 60_000),
          } });
          this.logger.warn(`File deletion ${job.id} will be retried`);
        }
      }
    } catch (error) {
      this.logger.warn(`File deletion queue unavailable: ${(error as Error).message}`);
    } finally { this.running = false; }
  }
}
