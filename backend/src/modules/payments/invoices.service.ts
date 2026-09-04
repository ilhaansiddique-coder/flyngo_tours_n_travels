import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { randomBytes } from 'crypto';

type LineItem = { description: string; quantity: number; unitPrice: number; amount: number };

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async generateForPayment(paymentId: string, tenantId: string) {
    const existing = await this.prisma.invoice.findFirst({ where: { paymentId, tenantId } });
    if (existing) return existing;

    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, tenantId },
      include: {
        booking: true,
        hajjUmrahBooking: true,
        user: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const booking = payment.booking;
    const pilgrimage = payment.hajjUmrahBooking;
    const total = booking
      ? Number(booking.totalAmount)
      : pilgrimage
        ? Number(pilgrimage.totalAmount)
        : Number(payment.amount);
    const discount = booking
      ? Number(booking.discountAmount || 0) + Number(booking.referralDiscount || 0)
      : pilgrimage
        ? Number(pilgrimage.discountAmount || 0) + Number(pilgrimage.referralDiscount || 0)
        : 0;
    const subtotal = Math.max(0, total + discount);
    const paid = Number(payment.amount);
    const currency = payment.currency || booking?.currency || pilgrimage?.currency || 'BDT';

    const title = await this.resolveItemTitle(
      tenantId,
      booking?.bookingType || pilgrimage?.kind || 'booking',
      booking?.itemId || pilgrimage?.packageId || '',
      booking?.hotelName || pilgrimage?.packageTitle,
    );
    const qty = booking?.guests || pilgrimage?.numPilgrims || 1;
    const unitPrice = qty > 0 ? subtotal / qty : subtotal;
    const lineItems: LineItem[] = [
      {
        description: title,
        quantity: qty,
        unitPrice: Math.round(unitPrice * 100) / 100,
        amount: Math.round(subtotal * 100) / 100,
      },
    ];
    if (discount > 0) {
      lineItems.push({
        description: 'Discount',
        quantity: 1,
        unitPrice: -discount,
        amount: -discount,
      });
    }

    const invoice = await this.prisma.invoice.create({
      data: {
        tenantId,
        invoiceNumber: this.nextInvoiceNumber(),
        userId: payment.userId,
        bookingId: payment.bookingId,
        hajjUmrahBookingId: payment.hajjUmrahBookingId,
        paymentId: payment.id,
        status: payment.status === 'completed' ? 'paid' : 'issued',
        subtotal,
        discount,
        total,
        paidAmount: paid,
        currency,
        lineItems: lineItems as any,
        paidAt: payment.status === 'completed' ? new Date() : null,
      },
    });
    return invoice;
  }

  async listMine(tenantId: string, userId: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId, userId },
      orderBy: { createdAt: 'desc' },
      include: {
        payment: { select: { id: true, method: true, status: true, transactionId: true, bkashTrxId: true } },
        booking: { select: { id: true, bookingCode: true, bookingType: true } },
        hajjUmrahBooking: { select: { id: true, bookingCode: true, kind: true } },
      },
    });
  }

  async listAdmin(tenantId: string, page = 1, limit = 20) {
    const where = { tenantId };
    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          payment: { select: { id: true, method: true, status: true, transactionId: true, bkashTrxId: true } },
          booking: { select: { id: true, bookingCode: true, bookingType: true } },
          hajjUmrahBooking: { select: { id: true, bookingCode: true, kind: true } },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getOne(id: string, tenantId: string, userId?: string) {
    const where: any = { id, tenantId };
    if (userId) where.userId = userId;
    const invoice = await this.prisma.invoice.findFirst({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        payment: true,
        booking: true,
        hajjUmrahBooking: true,
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    const html = await this.renderHtml(invoice);
    return { ...invoice, html };
  }

  async voidInvoice(id: string, tenantId: string) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id, tenantId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return this.prisma.invoice.update({ where: { id }, data: { status: 'void' } });
  }

  async sendByEmail(id: string, tenantId: string, targetEmail?: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        payment: true,
        booking: true,
        hajjUmrahBooking: true,
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const email = targetEmail || invoice.user?.email;
    if (!email) throw new NotFoundException('No email address found for this user');

    const html = await this.renderHtml(invoice);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flyngo.world';
    const bookingCode = invoice.booking?.bookingCode || invoice.hajjUmrahBooking?.bookingCode || '';
    const payUrl = bookingCode ? `${siteUrl}/pay/${bookingCode}` : siteUrl;

    const wrappedHtml = `
      <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <p style="color:#333;font-size:14px">Hi ${invoice.user?.fullName || 'there'},</p>
        <p style="color:#333;font-size:14px">Please find your invoice <strong>${invoice.invoiceNumber}</strong> below.</p>
        <div style="margin:20px 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc">
          <p style="margin:0;font-size:13px;color:#666">Invoice ${invoice.invoiceNumber}</p>
          <p style="margin:4px 0 0;font-size:20px;font-weight:700">${invoice.currency} ${Number(invoice.total).toLocaleString('en-BD', { minimumFractionDigits: 2 })}</p>
        </div>
        <p style="font-size:13px;color:#666">You can view, print, or download your invoice anytime from your dashboard.</p>
        <a href="${payUrl}" style="display:inline-block;padding:10px 24px;background:linear-gradient(90deg,#1881FF,#F36523);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;margin:12px 0">View Invoice</a>
        ${html}
        <p style="color:#999;font-size:12px;margin-top:32px">Thank you for travelling with Flyngo.</p>
      </div>`;

    await this.notifications.sendRawHtmlEmail(email, `Invoice ${invoice.invoiceNumber} — Flyngo`, wrappedHtml);
    return { sent: true, email };
  }

  async renderHtml(invoice: {
    invoiceNumber: string;
    status: string;
    subtotal: any;
    discount: any;
    total: any;
    paidAmount: any;
    currency: string;
    lineItems: any;
    issuedAt: Date;
    paidAt: Date | null;
    user?: { fullName?: string | null; email?: string | null; phone?: string | null } | null;
    booking?: { bookingCode?: string | null; bookingType?: string | null } | null;
    hajjUmrahBooking?: { bookingCode?: string | null; kind?: string | null } | null;
    payment?: { method?: string | null; bkashTrxId?: string | null; transactionId?: string | null } | null;
    tenantId: string;
  }): Promise<string> {
    const settings = await this.prisma.tenantSettings.findUnique({ where: { tenantId: invoice.tenantId } });
    const company = settings?.companyName || 'Flyngo Tours & Travels';
    const address = settings?.companyAddress || '';
    const phone = settings?.companyPhone || '';
    const email = settings?.companyEmail || '';
    const items: LineItem[] = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];
    const bookingCode = invoice.booking?.bookingCode || invoice.hajjUmrahBooking?.bookingCode || '—';
    const service = invoice.booking?.bookingType || invoice.hajjUmrahBooking?.kind || 'booking';
    const customer = invoice.user?.fullName || 'Customer';
    const money = (n: any) =>
      `${invoice.currency} ${Number(n || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const rows = items
      .map(
        (i) =>
          `<tr><td>${this.esc(i.description)}</td><td style="text-align:center">${i.quantity}</td><td style="text-align:right">${money(i.unitPrice)}</td><td style="text-align:right">${money(i.amount)}</td></tr>`,
      )
      .join('');
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${this.esc(invoice.invoiceNumber)}</title>
<style>
  body{font-family:ui-sans-serif,system-ui,sans-serif;color:#111;margin:40px;background:#fff}
  h1{margin:0 0 4px;font-size:22px}
  .muted{color:#666;font-size:13px}
  table{width:100%;border-collapse:collapse;margin-top:24px}
  th,td{padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:13px}
  th{text-align:left;background:#f8fafc;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#64748b}
  .totals{margin-top:16px;margin-left:auto;width:280px}
  .totals div{display:flex;justify-content:space-between;padding:4px 0;font-size:13px}
  .badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;background:#ecfdf5;color:#047857}
  @media print{body{margin:16px}}
</style></head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <h1>${this.esc(company)}</h1>
      <div class="muted">${this.esc(address)}</div>
      <div class="muted">${this.esc([phone, email].filter(Boolean).join(' · '))}</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#64748b">Invoice</div>
      <div style="font-weight:700;font-size:18px">${this.esc(invoice.invoiceNumber)}</div>
      <div class="muted">${new Date(invoice.issuedAt).toLocaleDateString()}</div>
      <div class="badge">${this.esc(invoice.status)}</div>
    </div>
  </div>
  <div style="display:flex;gap:48px;margin-top:28px">
    <div>
      <div class="muted" style="text-transform:uppercase;letter-spacing:.08em;font-size:11px">Bill to</div>
      <div style="font-weight:600">${this.esc(customer)}</div>
      <div class="muted">${this.esc(invoice.user?.email || '')}</div>
      <div class="muted">${this.esc(invoice.user?.phone || '')}</div>
    </div>
    <div>
      <div class="muted" style="text-transform:uppercase;letter-spacing:.08em;font-size:11px">Booking</div>
      <div style="font-weight:600">${this.esc(bookingCode)}</div>
      <div class="muted">${this.esc(service)}</div>
      ${invoice.payment?.bkashTrxId ? `<div class="muted">bKash Trx: ${this.esc(invoice.payment.bkashTrxId)}</div>` : ''}
      ${invoice.payment?.transactionId ? `<div class="muted">Ref: ${this.esc(invoice.payment.transactionId)}</div>` : ''}
    </div>
  </div>
  <table>
    <thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div><span>Subtotal</span><span>${money(invoice.subtotal)}</span></div>
    <div><span>Discount</span><span>${money(invoice.discount)}</span></div>
    <div style="font-weight:700;font-size:16px;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:4px"><span>Total</span><span>${money(invoice.total)}</span></div>
    <div><span>Paid</span><span>${money(invoice.paidAmount)}</span></div>
  </div>
  <p class="muted" style="margin-top:40px">Thank you for travelling with ${this.esc(company)}.</p>
</body></html>`;
  }

  private nextInvoiceNumber() {
    const d = new Date();
    const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
    return `INV-${ymd}-${randomBytes(3).toString('hex').toUpperCase()}`;
  }

  private esc(s: string) {
    return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
  }

  private async resolveItemTitle(tenantId: string, type: string, itemId: string, fallback?: string | null) {
    if (fallback) return `${type}: ${fallback}`;
    if (!itemId) return type;
    try {
      switch (type) {
        case 'tour': {
          const r = await this.prisma.tour.findFirst({ where: { id: itemId, tenantId }, select: { title: true } });
          return r?.title ? `Tour: ${r.title}` : `Tour ${itemId}`;
        }
        case 'hotel': {
          const r = await this.prisma.hotel.findFirst({ where: { id: itemId, tenantId }, select: { name: true } });
          return r?.name ? `Hotel: ${r.name}` : `Hotel ${itemId}`;
        }
        case 'flight': {
          const r = await this.prisma.flight.findFirst({ where: { id: itemId, tenantId }, select: { flightNumber: true } });
          return r?.flightNumber ? `Flight: ${r.flightNumber}` : `Flight ${itemId}`;
        }
        case 'visa': {
          const r = await this.prisma.visaService.findFirst({ where: { id: itemId, tenantId }, select: { title: true } });
          return r?.title ? `Visa: ${r.title}` : `Visa ${itemId}`;
        }
        case 'transport': {
          const r = await this.prisma.transport.findFirst({ where: { id: itemId, tenantId }, select: { title: true } });
          return r?.title ? `Transport: ${r.title}` : `Transport ${itemId}`;
        }
        case 'hajj': {
          const r = await this.prisma.hajjPackage.findFirst({ where: { id: itemId, tenantId }, select: { title: true } });
          return r?.title ? `Hajj: ${r.title}` : `Hajj ${itemId}`;
        }
        case 'umrah': {
          const r = await this.prisma.umrahPackage.findFirst({ where: { id: itemId, tenantId }, select: { title: true } });
          return r?.title ? `Umrah: ${r.title}` : `Umrah ${itemId}`;
        }
        default:
          return `${type} ${itemId}`;
      }
    } catch (err: any) {
      this.logger.warn(`resolveItemTitle failed: ${err.message}`);
      return `${type} ${itemId}`;
    }
  }
}
