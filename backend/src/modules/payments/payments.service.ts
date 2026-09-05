import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import * as crypto from 'crypto';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '../../config/config.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { EmailQueueService } from '../notifications/email-queue.service';
import { MediaService } from '../media/media.service';
import { BankAccountsService } from './bank-accounts.service';
import { MobileWalletsService, WALLET_PROVIDERS } from './mobile-wallets.service';
import { InvoicesService } from './invoices.service';
import { NotificationsService } from '../notifications/notifications.service';

const OFFLINE_METHODS = [...WALLET_PROVIDERS, 'bank_transfer', 'cash'] as const;
type OfflineMethod = (typeof OFFLINE_METHODS)[number];
const WALLET_METHOD_SET = new Set<string>(WALLET_PROVIDERS);

export interface SubmitConfirmationInput {
  bookingCode: string;
  method: string;
  amount?: number;
  bkashTrxId?: string;
  bankAccountId?: string;
  mobileWalletId?: string;
  receiptUrls?: string[];
  senderName?: string;
  senderAccount?: string;
  payerPhone?: string;
  notes?: string;
}

export interface RecordAdminPaymentInput {
  bookingCode: string;
  method: string;
  amount?: number;
  bkashTrxId?: string;
  bankAccountId?: string;
  mobileWalletId?: string;
  receiptUrls?: string[];
  senderName?: string;
  senderAccount?: string;
  payerPhone?: string;
  notes?: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe: Stripe | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly loyaltyService: LoyaltyService,
    private readonly emailQueueService: EmailQueueService,
    private readonly mediaService: MediaService,
    private readonly bankAccounts: BankAccountsService,
    private readonly mobileWallets: MobileWalletsService,
    private readonly invoices: InvoicesService,
    private readonly notificationsService: NotificationsService,
  ) {
    const stripeKey = this.configService.getOrNull('STRIPE_SECRET_KEY');
    this.stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' as any }) : null;
  }

  async createPaymentIntent(tenantId: string, userId: string, bookingId: string, method: string, _requestedAmount: number) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, tenantId, userId },
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    // Never trust the amount sent by the browser. Referral and loyalty
    // discounts are stored on the booking and must be reflected server-side.
    const amount = Math.max(
      0,
      Number(booking.totalAmount) -
        Number(booking.referralDiscount || 0) -
        Number(booking.pointsRedemptionBdt || 0),
    );

    const payment = await this.prisma.payment.create({
      data: {
        tenantId,
        userId,
        bookingId,
        amount,
        currency: booking.currency,
        method,
        status: 'pending',
        transactionId: `PAY-${randomUUID()}`,
      },
    });

    return payment;
  }

  async getPaymentStatus(id: string, tenantId: string, userId: string) {
    return this.prisma.payment.findFirst({
      where: { id, tenantId, userId },
    });
  }

  async getMyPayments(tenantId: string, userId: string) {
    return this.prisma.payment.findMany({
      where: { tenantId, userId },
      orderBy: { createdAt: 'desc' },
      include: {
        booking: { select: { id: true, bookingCode: true, bookingType: true, totalAmount: true, paidAmount: true, referralDiscount: true, pointsRedemptionBdt: true, currency: true } },
        hajjUmrahBooking: { select: { id: true, bookingCode: true, kind: true, totalAmount: true, advancePaid: true, currency: true } },
        invoice: { select: { id: true, invoiceNumber: true, status: true } },
        bankAccount: { select: { id: true, bankName: true, accountNumber: true } },
        mobileWallet: { select: { id: true, provider: true, accountName: true, walletNumber: true } },
      },
    });
  }

  /**
   * Verify and process a Stripe webhook payload.
   *
   * Throws BadRequestException if signature verification fails or the event
   * is malformed. Caller (controller) should map that to a 400 so Stripe stops
   * retrying bad events; genuine handler errors propagate as 500 so Stripe
   * retries.
   */
  async handleStripeWebhook(signature: string | undefined, payload: Buffer) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured on this server');
    }
    const secret = this.configService.getOrNull('STRIPE_WEBHOOK_SECRET');
    if (!secret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET is not set');
    }
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (err) {
      this.logger.warn(`Stripe signature verification failed: ${(err as Error).message}`);
      throw new BadRequestException('Invalid Stripe signature');
    }

    return this.processStripeEvent(event);
  }

  private async processStripeEvent(event: Stripe.Event) {
    // Idempotency: if we already recorded this Stripe event id, skip it.
    // Stripe retries webhooks on 5xx — without this a retried
    // payment_intent.succeeded would re-mark the payment (harmless here,
    // but charge.refunded could double-refund / double-log).
    if (!(await this.claimWebhookEvent('stripe', event.id, event.type, event))) {
      return { received: true, type: event.type, duplicate: true };
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await this.markPaymentByTransaction(pi.id, 'completed', { stripeEventId: event.id });
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await this.markPaymentByTransaction(pi.id, 'failed', { stripeEventId: event.id });
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
        if (piId) {
          await this.markPaymentByTransaction(piId, 'refunded', { stripeEventId: event.id });
        }
        break;
      }
      default:
        this.logger.log(`Unhandled Stripe event type: ${event.type}`);
    }
    return { received: true, type: event.type };
  }

  /**
   * Atomically claim a webhook event for processing. Returns false if an
   * event with the same (provider, eventId) was already handled. Uses
   * create-then-catch on the unique index rather than a check-then-write so
   * two concurrent retries can't both pass.
   */
  private async claimWebhookEvent(
    provider: 'stripe' | 'bkash',
    eventId: string,
    eventType: string | undefined,
    payload: unknown,
  ): Promise<boolean> {
    try {
      await this.prisma.webhookEventLog.create({
        data: { provider, eventId, eventType, payload: payload as any },
      });
      return true;
    } catch (err: any) {
      if (err?.code === 'P2002') {
        this.logger.log(`Duplicate webhook event ${provider}/${eventId} ignored`);
        return false;
      }
      throw err;
    }
  }

  private async markPaymentByTransaction(
    transactionId: string,
    status: 'pending' | 'completed' | 'failed' | 'refunded',
    extra: Record<string, unknown> = {},
  ) {
    const payment = await this.prisma.payment.findFirst({ where: { transactionId } });
    if (!payment) {
      this.logger.warn(`No payment found for transactionId=${transactionId}`);
      return;
    }
    const prev = payment.status;
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status, ...extra },
    });

    // When a webhook completes a payment, run the same side-effects as the
    // admin path: update booking paidAmount, generate invoice, send email/SMS.
    if (status === 'completed' && prev !== 'completed') {
      const full = await this.prisma.payment.findFirst({
        where: { id: payment.id },
        include: {
          booking: true,
          hajjUmrahBooking: true,
          user: { select: { id: true, fullName: true, email: true, phone: true } },
        },
      });
      if (full) {
        const invoice = await this.applyCompletedPayment(payment.tenantId, full);

        if (!invoice) {
          try {
            const hasInvoice = await this.prisma.invoice.findFirst({ where: { paymentId: payment.id, tenantId: payment.tenantId } });
            if (!hasInvoice) {
              await this.invoices.generateForPayment(payment.id, payment.tenantId);
            }
          } catch (err: any) {
            this.logger.warn(`Invoice recovery in webhook path failed: ${err.message}`);
          }
        }

        // Best-effort confirmation email
        try {
          const email = full.user?.email;
          const code = full.booking?.bookingCode ?? full.hajjUmrahBooking?.bookingCode ?? full.id;
          if (email && full.user) {
            await this.emailQueueService.addEmail(email, `Payment Received — ${code}`, 'payment-receipt', {
              customerName: full.user.fullName || 'Customer',
              bookingCode: code,
              amount: `${full.currency || 'BDT'} ${full.amount}`,
              invoiceNumber: invoice?.invoiceNumber,
              invoiceUrl: invoice
                ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://flyngo.world'}/pay/${code}`
                : undefined,
            });
          }
        } catch (err: any) {
          this.logger.warn(`Webhook payment confirmation email failed: ${err.message}`);
        }

        // Best-effort confirmation SMS
        try {
          const phone = full.booking?.customerPhone || full.user?.phone;
          if (phone) {
            const code = full.booking?.bookingCode ?? full.id;
            const amount = full.booking
              ? `${full.booking.currency || 'BDT'} ${full.booking.totalAmount}`
              : `${full.currency || 'BDT'} ${full.amount}`;
            await this.notificationsService.sendSms(
              phone,
              `Payment received for your ${full.booking?.bookingType || 'Flyngo'} booking ${code}. Amount: ${amount}. Thank you for choosing Flyngo.`,
            );
          }
        } catch (err: any) {
          this.logger.warn(`Webhook payment receipt SMS failed: ${err.message}`);
        }
      }
    }
  }

  /**
   * Refund a captured payment. Currently Stripe-only (bKash refunds are
   * performed out-of-band via the bKash dashboard since the tokenized API
   * does not support programmatic refunds).
   */
  async refundPayment(tenantId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, tenantId },
    });
    if (!payment) throw new BadRequestException('Payment not found');
    if (payment.status !== 'completed') {
      throw new BadRequestException(`Only completed payments can be refunded (current: ${payment.status})`);
    }
    if (!payment.transactionId) {
      throw new BadRequestException('Payment has no gateway transaction id — cannot refund');
    }

    if (payment.method === 'stripe') {
      if (!this.stripe) {
        throw new BadRequestException('Stripe is not configured on this server');
      }
      const refund = await this.stripe.refunds.create({
        payment_intent: payment.transactionId,
      });
      this.logger.log(
        `Stripe refund issued: payment=${payment.id} refund=${refund.id} amount=${refund.amount}`,
      );
      return {
        ok: true as const,
        refundId: refund.id,
        amount: refund.amount,
        currency: refund.currency,
      };
    }

    if (payment.method === 'bkash') {
      // bKash tokenized API does not support programmatic refunds. Mark
      // the payment as refunded on our side (so the booking cancel flow
      // can proceed) and require the operator to reconcile the actual
      // money movement in the bKash dashboard.
      this.logger.warn(
        `bKash refund requested for payment ${payment.id} — must be reconciled manually in the bKash dashboard.`,
      );
      return {
        ok: true as const,
        refundId: `manual-bkash-${payment.id}`,
        manual: true,
      };
    }

    throw new BadRequestException(`Refunds for method '${payment.method}' are not supported yet`);
  }

  /**
   * Verify and process a bKash payment webhook.
   *
   * bKash signs the payload with an HMAC-SHA256 over the raw body using
   * BKASH_SECRET_KEY. The header is `x-bkash-signature`.
   */
  async handleBKashWebhook(signature: string | undefined, payload: Buffer) {
    const secret = this.configService.getOrNull('BKASH_SECRET_KEY');
    if (!secret) {
      throw new BadRequestException('BKASH_SECRET_KEY is not set');
    }
    if (!signature) {
      throw new BadRequestException('Missing x-bkash-signature header');
    }

    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const provided = signature.trim();
    const ok =
      provided.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'));
    if (!ok) {
      this.logger.warn('bKash signature verification failed');
      throw new BadRequestException('Invalid bKash signature');
    }

    let body: any;
    try {
      body = JSON.parse(payload.toString('utf8'));
    } catch {
      throw new BadRequestException('Invalid bKash payload (not JSON)');
    }

    const trxId: string | undefined = body?.trxID ?? body?.paymentID ?? body?.transactionId;
    if (!trxId) {
      throw new BadRequestException('bKash payload missing transaction id');
    }

    // Idempotency key from the payload — bKash retries on non-2xx, so the
    // same transaction may arrive more than once.
    const eventId = body?.eventId ?? `${body?.merchantInvoiceNumber ?? 'bkash'}:${trxId}`;
    if (!(await this.claimWebhookEvent('bkash', eventId, body?.status, body))) {
      return { received: true, trxId, duplicate: true };
    }

    const status: string | undefined = body?.transactionStatus ?? body?.status;
    if (status === 'Completed' || status === 'completed') {
      await this.markPaymentByTransaction(trxId, 'completed');
    } else if (status === 'Failed' || status === 'failed' || status === 'Cancelled') {
      await this.markPaymentByTransaction(trxId, 'failed');
    } else {
      this.logger.log(`Unhandled bKash status: ${status}`);
    }

    return { received: true, trxId, status };
  }

  async listAllPayments(tenantId: string, page = 1, limit = 20, filters?: { status?: string; method?: string }) {
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.method) where.method = filters.method;
    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true } },
          booking: { select: { id: true, bookingCode: true, bookingType: true, totalAmount: true, paidAmount: true } },
          hajjUmrahBooking: { select: { id: true, bookingCode: true, kind: true, totalAmount: true, advancePaid: true } },
          bankAccount: { select: { id: true, bankName: true, accountName: true, accountNumber: true } },
          mobileWallet: { select: { id: true, provider: true, accountName: true, walletNumber: true } },
          invoice: { select: { id: true, invoiceNumber: true, status: true } },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async updatePaymentStatus(id: string, tenantId: string, status: string, adminUserId?: string) {
    const allowed = ['pending', 'processing', 'completed', 'failed', 'refunded'];
    if (!allowed.includes(status)) throw new BadRequestException(`Invalid status '${status}'`);

    const existing = await this.prisma.payment.findFirst({
      where: { id, tenantId },
      include: {
        booking: true,
        hajjUmrahBooking: true,
        user: { select: { email: true, fullName: true, phone: true } },
      },
    });
    if (!existing) throw new BadRequestException('Payment not found');

    const prev = existing.status;
    const updated = await this.prisma.payment.update({
      where: { id },
      data: {
        status,
        verifiedAt: status === 'completed' ? new Date() : existing.verifiedAt,
        verifiedById: status === 'completed' ? adminUserId ?? existing.verifiedById : existing.verifiedById,
      },
    });

    let invoice: { id: string; invoiceNumber: string } | null = null;
    if (status === 'completed' && prev !== 'completed') {
      invoice = await this.applyCompletedPayment(tenantId, existing);
    }

    if (status === 'completed' && !invoice) {
      const hasInvoice = await this.prisma.invoice.findFirst({ where: { paymentId: id, tenantId } });
      if (!hasInvoice) {
        try {
          invoice = await this.invoices.generateForPayment(id, tenantId);
        } catch (err: any) {
          this.logger.warn(`Invoice recovery in updatePaymentStatus failed: ${err.message}`);
        }
      }
    }

    if (status === 'refunded' && prev === 'completed') {
      await this.reverseCompletedPayment(tenantId, existing);
    }

    if (status === 'completed' && prev !== 'completed') {
      try {
        const email = existing.user?.email;
        const code = existing.booking?.bookingCode ?? existing.hajjUmrahBooking?.bookingCode ?? id;
        if (email && existing.user) {
          await this.emailQueueService.addEmail(email, `Payment Received — ${code}`, 'payment-receipt', {
            customerName: existing.user.fullName || 'Customer',
            bookingCode: code,
            amount: `${existing.currency || 'BDT'} ${existing.amount}`,
            invoiceNumber: invoice?.invoiceNumber,
            invoiceUrl: invoice
              ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://flyngo.world'}/pay/${code}`
              : undefined,
          });
        }
      } catch (err: any) {
        this.logger.warn(`Payment confirmation email failed: ${err.message}`);
      }

      // Payment receipt SMS — to the phone captured at booking time, falling
      // back to the linked account's phone. Best-effort so a gateway failure
      // never blocks the payment status update.
      try {
        const phone = existing.booking?.customerPhone || existing.user?.phone;
        if (phone) {
          const code = existing.booking?.bookingCode ?? id;
          const amount = existing.booking
            ? `${existing.booking.currency || 'BDT'} ${existing.booking.totalAmount}`
            : `${existing.currency || 'BDT'} ${existing.amount}`;
          await this.notificationsService.sendSms(
            phone,
            `Payment received for your ${existing.booking?.bookingType || 'Flyngo'} booking ${code}. Amount: ${amount}. Thank you for choosing Flyngo.`,
          );
        }
      } catch (err: any) {
        this.logger.warn(`Payment receipt SMS failed: ${err.message}`);
      }
    }

    return updated;
  }

  async getPaymentStats(tenantId: string) {
    const [total, byStatus, byMethod, sum] = await Promise.all([
      this.prisma.payment.count({ where: { tenantId } }),
      this.prisma.payment.groupBy({ by: ['status'], where: { tenantId }, _count: { id: true } }),
      this.prisma.payment.groupBy({ by: ['method'], where: { tenantId }, _count: { id: true } }),
      this.prisma.payment.aggregate({ where: { tenantId, status: 'completed' }, _sum: { amount: true } }),
    ]);
    return {
      total,
      totalCompleted: sum._sum.amount || 0,
      byStatus: byStatus.reduce((acc: Record<string, number>, b) => ({ ...acc, [b.status]: b._count.id }), {}),
      byMethod: byMethod.reduce((acc: Record<string, number>, b) => ({ ...acc, [b.method]: b._count.id }), {}),
    };
  }

  async getOfflineMethods(tenantId: string) {
    const [settings, bankAccounts, wallets] = await Promise.all([
      this.prisma.tenantSettings.findUnique({
        where: { tenantId },
        select: {
          bkashWalletNumber: true,
          bkashMerchantName: true,
          paymentInstructions: true,
          companyName: true,
          companyPhone: true,
        },
      }),
      this.bankAccounts.listPublic(tenantId),
      this.mobileWallets.listPublic(tenantId),
    ]);
    const bkashWallet = wallets.find((w) => w.provider === 'bkash');
    return {
      wallets,
      bkash: {
        walletNumber: bkashWallet?.walletNumber || settings?.bkashWalletNumber || null,
        merchantName: bkashWallet?.accountName || settings?.bkashMerchantName || settings?.companyName || 'Flyngo',
      },
      bankAccounts,
      instructions: settings?.paymentInstructions || null,
      companyPhone: settings?.companyPhone || null,
    };
  }

  async uploadReceipt(tenantId: string, file: Express.Multer.File) {
    return this.mediaService.upload(file, {
      tenantId,
      folder: 'receipts',
      allowDocuments: true,
    });
  }

  async submitConfirmation(tenantId: string, userId: string | null, input: SubmitConfirmationInput) {
    const method = (input.method || '').trim() as OfflineMethod;
    if (!OFFLINE_METHODS.includes(method)) {
      throw new BadRequestException(`method must be one of: ${OFFLINE_METHODS.join(', ')}`);
    }
    const code = (input.bookingCode || '').trim();
    if (!code) throw new BadRequestException('bookingCode is required');

    const target = await this.findBookable(tenantId, code);
    if (userId && target.userId && target.userId !== userId) {
      throw new BadRequestException('Booking not found');
    }

    if (target.status === 'cancelled') {
      throw new BadRequestException('Cannot pay a cancelled booking');
    }

    const due = Math.max(0, target.total - target.paid);
    if (due <= 0) throw new BadRequestException('This booking is already paid');

    const amount = input.amount != null ? Number(input.amount) : due;
    if (!Number.isFinite(amount) || amount <= 0) throw new BadRequestException('Invalid amount');
    if (amount > due + 0.01) throw new BadRequestException(`Amount exceeds balance due (${due})`);

    let bkashTrxId: string | null = null;
    let bankAccountId: string | null = null;
    let mobileWalletId: string | null = null;
    const receiptUrls = (input.receiptUrls || []).filter((u) => typeof u === 'string' && u.trim()).map((u) => u.trim());

    if (WALLET_METHOD_SET.has(method)) {
      bkashTrxId = this.normalizeBkashTrx(input.bkashTrxId);
      if (!bkashTrxId) throw new BadRequestException('Transaction ID is required');
      const dup = await this.prisma.payment.findFirst({
        where: { tenantId, bkashTrxId },
        select: { id: true },
      });
      if (dup) throw new BadRequestException('This transaction ID has already been submitted');
      if (input.mobileWalletId) {
        const wallet = await this.prisma.mobileWallet.findFirst({
          where: { id: input.mobileWalletId, tenantId, isActive: true, deletedAt: null },
          select: { id: true, provider: true },
        });
        if (!wallet) throw new BadRequestException('Mobile wallet not found');
        if (wallet.provider !== method) {
          throw new BadRequestException('mobileWalletId does not match the selected payment method');
        }
        mobileWalletId = wallet.id;
      }
    }

    if (method === 'bank_transfer') {
      if (!input.bankAccountId) throw new BadRequestException('bankAccountId is required');
      const account = await this.prisma.bankAccount.findFirst({
        where: { id: input.bankAccountId, tenantId, isActive: true, deletedAt: null },
        select: { id: true },
      });
      if (!account) throw new BadRequestException('Bank account not found');
      bankAccountId = account.id;
      if (!input.senderName?.trim()) {
        throw new BadRequestException('Sender name is required for bank transfers');
      }
      if (!(Number.isFinite(amount) && amount > 0)) {
        throw new BadRequestException('Amount is required and must be greater than zero');
      }
      if (receiptUrls.length === 0) {
        throw new BadRequestException('Please upload a money receipt image or PDF');
      }
    }

    let created;
    try {
      created = await this.prisma.payment.create({
        data: {
          tenantId,
          userId: target.userId,
          bookingId: target.kind === 'booking' ? target.id : null,
          hajjUmrahBookingId: target.kind === 'hajjUmrah' ? target.id : null,
          amount,
          currency: target.currency,
          method,
          status: 'pending',
          transactionId: `PAY-${randomUUID()}`,
          bkashTrxId,
          bankAccountId,
          mobileWalletId,
          receiptUrls,
          senderName: input.senderName?.trim() || null,
          senderAccount: input.senderAccount?.trim() || null,
          payerPhone: input.payerPhone?.trim() || null,
          notes: input.notes?.trim() || null,
        },
        include: {
          bankAccount: { select: { id: true, bankName: true, accountName: true, accountNumber: true } },
          mobileWallet: { select: { id: true, provider: true, accountName: true, walletNumber: true } },
        },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new BadRequestException('This transaction ID has already been submitted');
      }
      throw err;
    }

    // Customer-initiated payments count as paid immediately: credit the
    // booking's paid amount, flip it to 'paid' when fully settled, generate the
    // invoice and fire the receipt notifications — no manual admin verification
    // step required.
    try {
      await this.updatePaymentStatus(created.id, tenantId, 'completed');
    } catch (err: any) {
      this.logger.error(`Auto-complete of payment ${created.id} failed: ${err.message}`);
    }

    return this.prisma.payment.findUnique({
      where: { id: created.id },
      include: {
        bankAccount: { select: { id: true, bankName: true, accountName: true, accountNumber: true } },
        mobileWallet: { select: { id: true, provider: true, accountName: true, walletNumber: true } },
      },
    });
  }

  async recordAdminPayment(tenantId: string, adminUserId: string, input: RecordAdminPaymentInput) {
    const method = (input.method || '').trim() as OfflineMethod;
    if (!OFFLINE_METHODS.includes(method)) {
      throw new BadRequestException(`method must be one of: ${OFFLINE_METHODS.join(', ')}`);
    }
    const code = (input.bookingCode || '').trim();
    if (!code) throw new BadRequestException('bookingCode is required');

    const target = await this.findBookable(tenantId, code);
    if (target.status === 'cancelled') {
      throw new BadRequestException('Cannot pay a cancelled booking');
    }

    const due = Math.max(0, target.total - target.paid);
    if (due <= 0) throw new BadRequestException('This booking is already paid');

    const amount = input.amount != null ? Number(input.amount) : due;
    if (!Number.isFinite(amount) || amount <= 0) throw new BadRequestException('Invalid amount');
    if (amount > due + 0.01) throw new BadRequestException(`Amount exceeds balance due (${due})`);

    let bkashTrxId: string | null = null;
    let bankAccountId: string | null = null;
    let mobileWalletId: string | null = null;
    const receiptUrls = (input.receiptUrls || []).filter((u) => typeof u === 'string' && u.trim()).map((u) => u.trim());

    if (WALLET_METHOD_SET.has(method)) {
      bkashTrxId = this.normalizeBkashTrx(input.bkashTrxId);
      if (!bkashTrxId) throw new BadRequestException('Transaction ID is required');
      const dup = await this.prisma.payment.findFirst({
        where: { tenantId, bkashTrxId },
        select: { id: true },
      });
      if (dup) throw new BadRequestException('This transaction ID has already been submitted');
      if (input.mobileWalletId) {
        const wallet = await this.prisma.mobileWallet.findFirst({
          where: { id: input.mobileWalletId, tenantId, isActive: true, deletedAt: null },
          select: { id: true, provider: true },
        });
        if (!wallet) throw new BadRequestException('Mobile wallet not found');
        if (wallet.provider !== method) {
          throw new BadRequestException('mobileWalletId does not match the selected payment method');
        }
        mobileWalletId = wallet.id;
      }
    }

    if (method === 'bank_transfer' && input.bankAccountId) {
      const account = await this.prisma.bankAccount.findFirst({
        where: { id: input.bankAccountId, tenantId, isActive: true, deletedAt: null },
        select: { id: true },
      });
      if (!account) throw new BadRequestException('Bank account not found');
      bankAccountId = account.id;
      if (!input.senderName?.trim()) {
        throw new BadRequestException('Sender name is required for bank transfers');
      }
      if (receiptUrls.length === 0) {
        throw new BadRequestException('Please upload a money receipt image or PDF');
      }
    }

    let created;
    try {
      created = await this.prisma.payment.create({
        data: {
          tenantId,
          userId: target.userId,
          bookingId: target.kind === 'booking' ? target.id : null,
          hajjUmrahBookingId: target.kind === 'hajjUmrah' ? target.id : null,
          amount,
          currency: target.currency,
          method,
          status: 'pending',
          transactionId: `PAY-${randomUUID()}`,
          bkashTrxId,
          bankAccountId,
          mobileWalletId,
          receiptUrls,
          senderName: input.senderName?.trim() || null,
          notes: input.notes?.trim() || 'Recorded by admin',
        },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new BadRequestException('This transaction ID has already been submitted');
      }
      throw err;
    }

    return this.updatePaymentStatus(created.id, tenantId, 'completed', adminUserId);
  }

  async getBookingPaymentSummary(tenantId: string, bookingCode: string) {
    const target = await this.findBookable(tenantId, bookingCode);
    const payments = await this.prisma.payment.findMany({
      where: {
        tenantId,
        ...(target.kind === 'booking' ? { bookingId: target.id } : { hajjUmrahBookingId: target.id }),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        currency: true,
        method: true,
        status: true,
        transactionId: true,
        bkashTrxId: true,
        receiptUrls: true,
        createdAt: true,
        invoice: { select: { id: true, invoiceNumber: true, status: true } },
      },
    });
    return {
      bookingCode: target.bookingCode,
      bookingType: target.bookingType,
      status: target.status,
      totalAmount: target.total,
      paidAmount: target.paid,
      balanceDue: Math.max(0, target.total - target.paid),
      currency: target.currency,
      customerName: target.customerName,
      payments,
    };
  }

  private normalizeBkashTrx(raw?: string): string | null {
    if (!raw) return null;
    const cleaned = raw.trim().toUpperCase().replace(/\s+/g, '');
    if (cleaned.length < 5 || cleaned.length > 40) return null;
    if (!/^[A-Z0-9-]+$/.test(cleaned)) return null;
    return cleaned;
  }

  private async findBookable(tenantId: string, code: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { tenantId, bookingCode: code, deletedAt: null },
      select: {
        id: true, userId: true, bookingCode: true, bookingType: true, status: true,
        totalAmount: true, paidAmount: true, referralDiscount: true, pointsRedemptionBdt: true,
        currency: true, customerName: true,
      },
    });
    if (booking) {
      const total = Math.max(
        0,
        Number(booking.totalAmount) - Number(booking.referralDiscount || 0) - Number(booking.pointsRedemptionBdt || 0),
      );
      return {
        kind: 'booking' as const,
        id: booking.id,
        userId: booking.userId,
        bookingCode: booking.bookingCode,
        bookingType: booking.bookingType,
        status: booking.status,
        total,
        paid: Number(booking.paidAmount || 0),
        currency: booking.currency,
        customerName: booking.customerName,
      };
    }

    const pilgrimage = await this.prisma.hajjUmrahBooking.findFirst({
      where: { tenantId, bookingCode: code },
      select: {
        id: true, userId: true, bookingCode: true, kind: true, status: true,
        totalAmount: true, advancePaid: true, currency: true, customerName: true,
      },
    });
    if (pilgrimage) {
      return {
        kind: 'hajjUmrah' as const,
        id: pilgrimage.id,
        userId: pilgrimage.userId,
        bookingCode: pilgrimage.bookingCode || code,
        bookingType: pilgrimage.kind,
        status: pilgrimage.status,
        total: Number(pilgrimage.totalAmount),
        paid: Number(pilgrimage.advancePaid || 0),
        currency: pilgrimage.currency,
        customerName: pilgrimage.customerName,
      };
    }

    throw new NotFoundException('No booking found for that code');
  }

  private async applyCompletedPayment(
    tenantId: string,
    payment: {
      id: string;
      amount: any;
      userId: string | null;
      booking: any | null;
      hajjUmrahBooking: any | null;
    },
  ): Promise<{ id: string; invoiceNumber: string } | null> {
    const add = Number(payment.amount);
    if (payment.booking) {
      const paid = Number(payment.booking.paidAmount || 0) + add;
      const due = Math.max(
        0,
        Number(payment.booking.totalAmount) -
          Number(payment.booking.referralDiscount || 0) -
          Number(payment.booking.pointsRedemptionBdt || 0),
      );
      const fullyPaid = paid + 0.01 >= due;
      const nextStatus =
        fullyPaid && payment.booking.status === 'pending' ? 'paid' : payment.booking.status;
      await this.prisma.booking.update({
        where: { id: payment.booking.id },
        data: { paidAmount: paid, ...(nextStatus !== payment.booking.status ? { status: nextStatus } : {}) },
      });
      if ((nextStatus === 'paid' || nextStatus === 'confirmed') && payment.booking.status !== 'paid' && payment.booking.status !== 'confirmed' && payment.booking.userId) {
        try {
          const productPoints = await this.loyaltyService.getProductPoints(
            tenantId,
            payment.booking.bookingType,
            payment.booking.itemId,
          );
          await this.loyaltyService.awardBookingConfirmation(
            tenantId,
            payment.booking.id,
            payment.booking.userId,
            payment.booking.bookingType,
            productPoints,
          );
        } catch (err: any) {
          this.logger.warn(`Loyalty award on payment failed: ${err.message}`);
        }
      }
    }

    if (payment.hajjUmrahBooking) {
      const paid = Number(payment.hajjUmrahBooking.advancePaid || 0) + add;
      const total = Number(payment.hajjUmrahBooking.totalAmount);
      const balance = Math.max(0, total - paid);
      const paymentStatus = paid <= 0 ? 'unpaid' : balance <= 0.01 ? 'paid' : 'partial';
      const nextStatus =
        paymentStatus === 'paid' && payment.hajjUmrahBooking.status === 'pending'
          ? 'paid'
          : payment.hajjUmrahBooking.status;
      await this.prisma.hajjUmrahBooking.update({
        where: { id: payment.hajjUmrahBooking.id },
        data: {
          advancePaid: paid,
          balanceDue: balance,
          paymentStatus,
          ...(nextStatus !== payment.hajjUmrahBooking.status ? { status: nextStatus } : {}),
        },
      });
      if ((nextStatus === 'paid' || nextStatus === 'confirmed') && payment.hajjUmrahBooking.status !== 'paid' && payment.hajjUmrahBooking.status !== 'confirmed' && payment.hajjUmrahBooking.userId) {
        try {
          const productPoints = await this.loyaltyService.getProductPoints(
            tenantId,
            payment.hajjUmrahBooking.kind,
            payment.hajjUmrahBooking.packageId,
          );
          await this.loyaltyService.awardHajjUmrahConfirmation(
            tenantId,
            payment.hajjUmrahBooking.id,
            payment.hajjUmrahBooking.userId,
            payment.hajjUmrahBooking.kind,
            productPoints,
          );
        } catch (err: any) {
          this.logger.warn(`Hajj/Umrah loyalty award on payment failed: ${err.message}`);
        }
      }
    }

    let invoice: { id: string; invoiceNumber: string } | null = null;
    try {
      invoice = await this.invoices.generateForPayment(payment.id, tenantId);
      if (invoice && payment.userId) {
        try {
          await this.notificationsService.createNotification(tenantId, {
            userId: payment.userId,
            type: 'invoice_generated',
            title: 'Invoice ready',
            body: `Your invoice ${invoice.invoiceNumber} has been generated. You can view and download it from your dashboard.`,
            data: { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber },
          });
        } catch (err: any) {
          this.logger.warn(`Invoice notification creation failed: ${err.message}`);
        }
      }
    } catch (err: any) {
      this.logger.warn(`Invoice generation failed: ${err.message}`);
    }
    return invoice;
  }

  private async reverseCompletedPayment(
    tenantId: string,
    payment: {
      amount: any;
      booking: any | null;
      hajjUmrahBooking: any | null;
    },
  ) {
    const sub = Number(payment.amount);
    if (payment.booking) {
      const paid = Math.max(0, Number(payment.booking.paidAmount || 0) - sub);
      await this.prisma.booking.update({
        where: { id: payment.booking.id },
        data: { paidAmount: paid },
      });
      if (payment.booking.userId) {
        try {
          await this.loyaltyService.reverseBookingPoints(tenantId, payment.booking.id, payment.booking.userId);
        } catch (err: any) {
          this.logger.warn(`Loyalty reversal on refund failed: ${err.message}`);
        }
      }
    }
    if (payment.hajjUmrahBooking) {
      const paid = Math.max(0, Number(payment.hajjUmrahBooking.advancePaid || 0) - sub);
      const total = Number(payment.hajjUmrahBooking.totalAmount);
      await this.prisma.hajjUmrahBooking.update({
        where: { id: payment.hajjUmrahBooking.id },
        data: {
          advancePaid: paid,
          balanceDue: Math.max(0, total - paid),
          paymentStatus: 'refunded',
        },
      });
    }
  }
}
