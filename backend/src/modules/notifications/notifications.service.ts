import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as admin from 'firebase-admin';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '../../config/config.service';

export type EmailTemplate = 'booking-confirmation' | 'password-reset' | 'welcome' | 'booking-cancelled' | 'payment-receipt' | 'invoice' | 'referral_signup' | 'custom';

// bulkSMSbd.net — a Bangladeshi SMS gateway. Submitting an SMS returns one of
// their codes (https://bulksmsbd.net); 202 means the message was handed to the
// carrier. Any other code is a hard failure we surface in logs.
const BULKSMS_SUCCESS_CODE = 202;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private mailer: nodemailer.Transporter | null = null;
  private firebaseInitialized = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.initMailer();
    this.initFirebase();
  }

  private initMailer() {
    const host = this.configService.getOrNull('SMTP_HOST');
    const user = this.configService.getOrNull('SMTP_USER');
    const pass = this.configService.getOrNull('SMTP_PASSWORD');
    if (host && user && pass) {
      this.mailer = nodemailer.createTransport({
        host,
        port: Number(this.configService.getOrNull('SMTP_PORT') || 587),
        secure: (this.configService.getOrNull('SMTP_SECURE') || 'false') === 'true',
        auth: { user, pass },
      });
      this.logger.log(`SMTP mailer configured (host=${host})`);
    } else {
      this.logger.warn('SMTP not configured — email sends will be logged but not delivered');
    }
  }

  private initFirebase() {
    const projectId = this.configService.getOrNull('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.getOrNull('FIREBASE_CLIENT_EMAIL');
    const privateKeyRaw = this.configService.getOrNull('FIREBASE_PRIVATE_KEY');
    if (projectId && clientEmail && privateKeyRaw) {
      try {
        const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
          });
        }
        this.firebaseInitialized = true;
        this.logger.log('Firebase Admin initialized for FCM push');
      } catch (err) {
        this.logger.error(`Firebase init failed: ${(err as Error).message}`);
      }
    } else {
      this.logger.warn('Firebase not configured — push sends will be logged but not delivered');
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    template: EmailTemplate,
    data: Record<string, any> = {},
  ): Promise<{ sent: boolean; provider: 'resend' | 'smtp' | 'log'; id?: string }> {
    const { html, text } = this.renderEmailTemplate(template, subject, data);
    const from =
      this.configService.getOrNull('EMAIL_FROM') ||
      this.configService.getOrNull('SMTP_FROM') ||
      'noreply@flyngo.world';

    // 1) Resend (HTTP API) — preferred when a key is present. No SDK needed;
    //    Node's global fetch posts straight to the Resend endpoint.
    const resendKey = this.configService.getOrNull('RESEND_API_KEY');
    if (resendKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from, to, subject, html, text }),
        });
        if (!res.ok) throw new Error(`Resend HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
        const json: any = await res.json().catch(() => ({}));
        this.logger.log(`Email sent via Resend to ${to} (id=${json?.id ?? '?'})`);
        return { sent: true, provider: 'resend', id: json?.id };
      } catch (err) {
        this.logger.error(`Resend send to ${to} failed: ${(err as Error).message}`);
        // fall through to SMTP / log so a transient Resend error still delivers.
      }
    }

    // 2) SMTP
    if (this.mailer) {
      try {
        const info = await this.mailer.sendMail({ from, to, subject, html, text });
        this.logger.log(`Email sent to ${to} (messageId=${info.messageId})`);
        return { sent: true, provider: 'smtp', id: info.messageId };
      } catch (err) {
        this.logger.error(`Email send to ${to} failed: ${(err as Error).message}`);
        throw err;
      }
    }

    // 3) Nothing configured — log so nothing crashes.
    this.logger.log(`[email:log] to=${to} subject="${subject}" template=${template}`);
    return { sent: true, provider: 'log' };
  }

  /**
   * Send an email with arbitrary HTML body (used for invoice HTML), optionally
   * with an attachment (e.g. the invoice PDF).
   */
  async sendRawHtmlEmail(
    to: string,
    subject: string,
    html: string,
    attachment?: { filename: string; content: Buffer; contentType: string },
  ): Promise<{ sent: boolean; provider: 'resend' | 'smtp' | 'log'; id?: string }> {
    const from =
      this.configService.getOrNull('EMAIL_FROM') ||
      this.configService.getOrNull('SMTP_FROM') ||
      'noreply@flyngo.world';
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    const resendKey = this.configService.getOrNull('RESEND_API_KEY');
    if (resendKey) {
      try {
        const body: any = { from, to, subject, html, text };
        if (attachment) {
          body.attachments = [
            {
              filename: attachment.filename,
              content: attachment.content.toString('base64'),
              encoding: 'base64',
              contentType: attachment.contentType || 'application/pdf',
            },
          ];
        }
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`Resend HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
        const json: any = await res.json().catch(() => ({}));
        this.logger.log(`Raw HTML email sent via Resend to ${to} (id=${json?.id ?? '?'})`);
        return { sent: true, provider: 'resend', id: json?.id };
      } catch (err) {
        this.logger.error(`Resend raw email to ${to} failed: ${(err as Error).message}`);
      }
    }

    if (this.mailer) {
      try {
        const mailOpts: any = { from, to, subject, html, text };
        if (attachment) {
          mailOpts.attachments = [
            {
              filename: attachment.filename,
              content: attachment.content,
            },
          ];
        }
        const info = await this.mailer.sendMail(mailOpts);
        this.logger.log(`Raw HTML email sent to ${to} (messageId=${info.messageId})`);
        return { sent: true, provider: 'smtp', id: info.messageId };
      } catch (err) {
        this.logger.error(`SMTP raw email to ${to} failed: ${(err as Error).message}`);
        throw err;
      }
    }

    this.logger.log(`[email:log] to=${to} subject="${subject}" (raw HTML)`);
    return { sent: true, provider: 'log' };
  }

  private renderEmailTemplate(template: EmailTemplate, subject: string, data: Record<string, any>) {
    const brand = 'Flyngo';
    const greeting = data.fullName ? `Hi ${data.fullName},` : 'Hi,';
    const lines: string[] = [];
    switch (template) {
      case 'welcome':
        lines.push(`Welcome to ${brand}! Your account is ready.`);
        break;
      case 'booking-confirmation':
        lines.push(`Your booking ${data.bookingCode ?? ''} is confirmed.`);
        if (data.totalAmount) lines.push(`Total: ${data.totalAmount} ${data.currency ?? 'BDT'}`);
        break;
      case 'booking-cancelled':
        lines.push(`Your booking ${data.bookingCode ?? ''} has been cancelled.`);
        break;
      case 'password-reset':
        lines.push('We received a request to reset your password. Use the link below — it expires in 1 hour.');
        if (data.resetUrl) lines.push(String(data.resetUrl));
        lines.push("If you didn't request this, you can safely ignore this message.");
        break;
      case 'payment-receipt':
        lines.push(`Payment of ${data.amount} ${data.currency ?? 'BDT'} received for booking ${data.bookingCode ?? ''}.`);
        if (data.invoiceNumber) {
          lines.push('Your invoice ' + String(data.invoiceNumber) + ' has been generated.');
          if (data.invoiceUrl) lines.push('View & print your invoice: ' + data.invoiceUrl);
        }
        break;
      case 'invoice':
        lines.push(`Your invoice ${data.invoiceNumber ?? ''} is ready.`);
        if (data.amount) lines.push(`Amount: ${data.amount}`);
        if (data.viewUrl) lines.push(`View & print: ${data.viewUrl}`);
        break;
      case 'custom':
      default:
        if (data.message) lines.push(String(data.message));
    }
    const text = `${greeting}\n\n${lines.join('\n')}\n\n— The ${brand} team`;
    const html = `<p>${greeting}</p>${lines.map((l) => `<p>${this.escape(l)}</p>`).join('')}<p>— The ${brand} team</p>`;
    return { html, text };
  }

  private escape(s: string) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
  }

  async sendSms(to: string, message: string): Promise<{ sent: boolean; provider: 'bulksmsbd' | 'log'; id?: string }> {
    const apiKey = this.configService.getOrNull('SMS_API_KEY');
    const senderId = this.configService.getOrNull('SMS_SENDER_ID') || '8809648906698';
    if (!apiKey) {
      this.logger.log(`[sms:log] to=${to} body="${message}"`);
      return { sent: true, provider: 'log' };
    }
    try {
      const url = new URL('https://bulksmsbd.net/api/smsapi');
      url.searchParams.set('api_key', apiKey);
      url.searchParams.set('type', 'text');
      url.searchParams.set('number', to);
      url.searchParams.set('senderid', senderId);
      url.searchParams.set('message', message);
      const res = await fetch(url.toString(), { method: 'GET' });
      const text = await res.text();
      let code: string | null = null;
      try {
        code = JSON.parse(text)?.code ?? null;
      } catch {
        // Non-JSON body (e.g. provider outage) — fall through to failure path.
      }
      if (res.ok && code === String(BULKSMS_SUCCESS_CODE)) {
        this.logger.log(`SMS sent to ${to} (code=${code})`);
        return { sent: true, provider: 'bulksmsbd', id: code };
      }
      this.logger.error(`SMS send to ${to} failed: HTTP ${res.status} code=${code} body="${text.slice(0, 200)}"`);
      return { sent: false, provider: 'bulksmsbd', id: code ?? undefined };
    } catch (err) {
      this.logger.error(`SMS send to ${to} failed: ${(err as Error).message}`);
      throw err;
    }
  }

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data: Record<string, any> = {},
  ): Promise<{ sent: boolean; provider: 'fcm' | 'log'; ids?: string[] }> {
    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId, deletedAt: null },
      select: { token: true },
    });

    if (tokens.length === 0) {
      this.logger.log(`[push:log] no device tokens for user ${userId}; title="${title}" body="${body}"`);
      return { sent: true, provider: 'log' };
    }

    if (!this.firebaseInitialized) {
      this.logger.log(`[push:log] Firebase not configured; user ${userId} has ${tokens.length} device(s); title="${title}"`);
      return { sent: true, provider: 'log' };
    }

    try {
      const res = await admin.messaging().sendEachForMulticast({
        tokens: tokens.map((t) => t.token),
        notification: { title, body },
        data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      });
      this.logger.log(`Push sent to user ${userId} (success=${res.successCount} failure=${res.failureCount})`);

      // Prune dead tokens reported by FCM.
      const deadTokens: string[] = [];
      res.responses.forEach((r, idx) => {
        if (!r.success && r.error) {
          const code = r.error.code;
          if (
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token'
          ) {
            deadTokens.push(tokens[idx].token);
          }
        }
      });
      if (deadTokens.length) {
        await this.prisma.deviceToken.updateMany({
          where: { token: { in: deadTokens } },
          data: { deletedAt: new Date() },
        });
      }

      return { sent: res.successCount > 0, provider: 'fcm', ids: res.responses.map((r) => r.messageId).filter(Boolean) as string[] };
    } catch (err) {
      this.logger.error(`Push send to user ${userId} failed: ${(err as Error).message}`);
      throw err;
    }
  }

  async getNotifications(userId: string, tenantId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId, tenantId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId, tenantId } }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async markAsRead(id: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
    return { success: true };
  }

  async markAllAsRead(userId: string, tenantId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, tenantId, readAt: null },
      data: { readAt: new Date() },
    });
    return { success: true };
  }

  async listAllNotifications(tenantId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { tenantId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, fullName: true, email: true } } },
      }),
      this.prisma.notification.count({ where: { tenantId } }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async createNotification(tenantId: string, data: { userId?: string; userIds?: string[]; type: string; title: string; body: string; data?: any }) {
    let userIds: string[] = data.userIds ?? [];
    if (data.userId) userIds = [data.userId];
    if (userIds.length === 0) {
      const users = await this.prisma.user.findMany({ where: { tenantId, deletedAt: null }, select: { id: true } });
      userIds = users.map((u) => u.id);
    }
    const created = await this.prisma.$transaction(
      userIds.map((uid) => ({
        tenantId,
        userId: uid,
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.data ?? undefined,
        sentAt: new Date(),
      })).map((payload) => this.prisma.notification.create({ data: payload as any })),
    );
    return { count: created.length };
  }

  async removeNotification(id: string, tenantId: string) {
    const existing = await this.prisma.notification.findFirst({ where: { id, tenantId } });
    if (!existing) return { success: false };
    await this.prisma.notification.delete({ where: { id } });
    return { success: true };
  }

  async registerDeviceToken(
    tenantId: string,
    userId: string,
    body: { token: string; platform?: string },
  ) {
    if (!body?.token) throw new BadRequestException('Token is required');
    const existing = await this.prisma.deviceToken.findFirst({
      where: { tenantId, userId, token: body.token },
    });
    if (existing) return { registered: true, alreadyExists: true };

    await this.prisma.deviceToken.create({
      data: { tenantId, userId, token: body.token, platform: body.platform || 'web' },
    });
    return { registered: true };
  }
}
