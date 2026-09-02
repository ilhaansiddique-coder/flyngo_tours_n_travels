import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { Queue, Worker } from 'bullmq';
import { NotificationsService, EmailTemplate } from './notifications.service';

export interface EmailJob {
  to: string;
  subject: string;
  template: EmailTemplate;
  data: Record<string, any>;
}

@Injectable()
export class EmailQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(EmailQueueService.name);
  private queue: Queue<EmailJob> | null = null;
  private worker: Worker<EmailJob> | null = null;
  private readonly enabled: boolean;

  constructor(
    private readonly config: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.enabled = this.config.getBoolean('EMAIL_QUEUE_ENABLED', false);
    if (!this.enabled) return;

    const connection = {
      host: this.config.get('REDIS_HOST', 'localhost'),
      port: this.config.getNumber('REDIS_PORT', 6379),
      password: this.config.get('REDIS_PASSWORD', ''),
    };

    try {
      this.queue = new Queue<EmailJob>('flyngo-emails', {
        connection,
        defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
      });
      this.worker = new Worker<EmailJob>(
        'flyngo-emails',
        async (job) => {
          const { to, subject, template, data } = job.data;
          await this.notificationsService.sendEmail(to, subject, template, data);
        },
        { connection },
      );
      this.worker.on('failed', (job, err) => {
        this.logger.error(`Email job ${job?.id} failed: ${err.message}`);
      });
      this.logger.log('Email queue initialized');
    } catch (err: any) {
      this.logger.warn(`Email queue disabled (Redis unavailable): ${err.message}`);
      this.queue = null;
      this.worker = null;
    }
  }

  async addEmail(to: string, subject: string, template: EmailTemplate, data: Record<string, any>): Promise<boolean> {
    if (!this.enabled || !this.queue) {
      await this.notificationsService.sendEmail(to, subject, template, data);
      return false;
    }
    await this.queue.add('send', { to, subject, template, data });
    return true;
  }

  async onModuleDestroy() {
    try {
      await this.worker?.close();
      await this.queue?.close();
    } catch {
      // ignore shutdown errors
    }
  }
}