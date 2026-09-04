import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
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
    if (paid < total) {
      lineItems.push({
        description: 'Balance Due',
        quantity: 1,
        unitPrice: total - paid,
        amount: total - paid,
      });
    }

    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
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
      } catch (err: any) {
        if (err.code === 'P2002' && attempt < maxRetries - 1) {
          this.logger.warn(`Invoice creation collision (attempt ${attempt + 1}), retrying...`);
          continue;
        }
        throw err;
      }
    }
    throw new Error('Failed to create invoice after retries');
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
    let html: string;
    try {
      html = await this.renderHtml(invoice);
    } catch (err: any) {
      this.logger.warn(`HTML render failed for invoice ${id}: ${err.message}`);
      html = `<p>Invoice ${invoice.invoiceNumber}</p><p>Total: ${invoice.currency} ${invoice.total}</p>`;
    }
    return { ...invoice, html };
  }

  async getPdf(id: string, tenantId: string, userId?: string) {
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
    const settings = await this.prisma.tenantSettings.findUnique({ where: { tenantId } });
    const company = settings?.companyName || 'Flyngo Tours & Travels';

    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const pageWidth = 595;
    const pageHeight = 842;
    const margin = 48;
    const footerHeight = 40;
    let currentPage = doc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    const blue = rgb(0.09, 0.50, 1.0);
    const orange = rgb(0.95, 0.39, 0.14);
    const gray = rgb(0.4, 0.45, 0.53);
    const dark = rgb(0.12, 0.14, 0.18);

    const ensureSpace = (needed: number) => {
      if (y - needed < margin + footerHeight) {
        currentPage = doc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
    };

    const wrapText = (text: string, maxWidth: number, fontSize: number, fontToUse: typeof font): string[] => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = fontToUse.widthOfTextAtSize(testLine, fontSize);
        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines.length > 0 ? lines : [''];
    };

    const drawWrappedText = (text: string, x: number, maxWidth: number, fontSize: number, fontToUse: typeof font, color: typeof dark) => {
      const lines = wrapText(text, maxWidth, fontSize, fontToUse);
      for (const line of lines) {
        ensureSpace(fontSize + 4);
        currentPage.drawText(line, { x, y, size: fontSize, font: fontToUse, color });
        y -= fontSize + 4;
      }
    };

    // Header bar
    currentPage.drawRectangle({ x: 0, y: pageHeight - 70, width: pageWidth, height: 70, color: blue });
    const companyLines = wrapText(company, pageWidth - 2 * margin - 100, 22, bold);
    currentPage.drawText(companyLines[0] || company, { x: margin, y: pageHeight - 44, size: 22, font: bold, color: rgb(1, 1, 1) });
    currentPage.drawText('INVOICE', { x: pageWidth - margin - 70, y: pageHeight - 44, size: 18, font: bold, color: rgb(1, 1, 1) });

    y = pageHeight - 100;

    // Invoice number / dates
    currentPage.drawText(`Invoice No:  ${invoice.invoiceNumber}`, { x: margin, y, size: 11, font: bold, color: dark });
    y -= 16;
    currentPage.drawText(`Issued:  ${new Date(invoice.issuedAt).toLocaleDateString()}`,
      { x: margin, y, size: 10, font, color: gray });
    if (invoice.paidAt) {
      currentPage.drawText(`Paid:  ${new Date(invoice.paidAt).toLocaleDateString()}`,
        { x: margin + 180, y, size: 10, font, color: gray });
    }
    y -= 14;
    currentPage.drawText(`Status:  ${invoice.status.toUpperCase()}`,
      { x: margin, y, size: 10, font: bold, color: invoice.status === 'paid' ? rgb(0.05, 0.63, 0.34) : orange });
    y -= 34;

    // Bill to + company
    currentPage.drawText('BILL TO', { x: margin, y, size: 10, font: bold, color: gray });
    y -= 16;
    const customerName = invoice.user?.fullName || 'Customer';
    drawWrappedText(customerName, margin, pageWidth - 2 * margin, 11, bold, dark);
    if (invoice.user?.email) {
      drawWrappedText(invoice.user.email, margin, pageWidth - 2 * margin, 10, font, gray);
    }
    if (invoice.user?.phone) {
      drawWrappedText(invoice.user.phone, margin, pageWidth - 2 * margin, 10, font, gray);
    }
    y -= 4;
    const bookingCode = invoice.booking?.bookingCode || invoice.hajjUmrahBooking?.bookingCode || '—';
    const service = invoice.booking?.bookingType || invoice.hajjUmrahBooking?.kind || 'booking';
    currentPage.drawText(`Booking:  ${bookingCode}`, { x: pageWidth - margin - 220, y: y - 2, size: 10, font: bold, color: dark });
    currentPage.drawText(`Service:  ${service}`, { x: pageWidth - margin - 220, y: y - 16, size: 10, font, color: gray });

    y -= 40;

    // Table header
    const lineY = y;
    const col = {
      desc: margin,
      qty: pageWidth - margin - 240,
      unit: pageWidth - margin - 150,
      amt: pageWidth - margin - 60,
    };
    currentPage.drawRectangle({ x: margin - 8, y: lineY - 22, width: pageWidth - 2 * margin + 16, height: 24, color: rgb(0.96, 0.97, 0.98) });
    currentPage.drawText('DESCRIPTION', { x: col.desc, y: lineY - 16, size: 9, font: bold, color: gray });
    currentPage.drawText('QTY', { x: col.qty, y: lineY - 16, size: 9, font: bold, color: gray });
    currentPage.drawText('UNIT', { x: col.unit, y: lineY - 16, size: 9, font: bold, color: gray });
    currentPage.drawText('AMOUNT', { x: col.amt, y: lineY - 16, size: 9, font: bold, color: gray });
    y = lineY - 44;

    const items: any[] = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];
    const descMaxWidth = col.qty - col.desc - 10;
    for (const it of items) {
      ensureSpace(22);
      const descLines = wrapText(String(it.description || ''), descMaxWidth, 10, font);
      for (const line of descLines) {
        currentPage.drawText(line, { x: col.desc, y, size: 10, font, color: dark });
        y -= 14;
      }
      y += 14;
      currentPage.drawText(String(it.quantity), { x: col.qty, y, size: 10, font, color: dark });
      currentPage.drawText(this.money(it.unitPrice, invoice.currency), { x: col.unit, y, size: 10, font, color: dark });
      currentPage.drawText(this.money(it.amount, invoice.currency), { x: col.amt, y, size: 10, font, color: dark });
      y -= 22;
    }

    // Totals
    ensureSpace(120);
    y -= 10;
    const totals = [
      { label: 'Subtotal', value: this.money(invoice.subtotal, invoice.currency) },
      { label: 'Discount', value: this.money(invoice.discount, invoice.currency) },
    ];
    for (const t of totals) {
      currentPage.drawText(t.label, { x: col.unit, y, size: 10, font, color: gray });
      currentPage.drawText(t.value, { x: col.amt, y, size: 10, font, color: dark });
      y -= 18;
    }
    currentPage.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, color: gray, thickness: 0.8 });
    y -= 22;
    currentPage.drawText('TOTAL', { x: col.unit, y, size: 12, font: bold, color: dark });
    currentPage.drawText(this.money(invoice.total, invoice.currency), { x: col.amt - 10, y, size: 13, font: bold, color: orange });
    y -= 18;
    currentPage.drawText('PAID', { x: col.unit, y, size: 10, font: bold, color: gray });
    currentPage.drawText(this.money(invoice.paidAmount, invoice.currency), { x: col.amt - 10, y, size: 10, font: bold, color: dark });
    
    if (Number(invoice.total) > Number(invoice.paidAmount)) {
      y -= 18;
      const balanceDue = Number(invoice.total) - Number(invoice.paidAmount);
      currentPage.drawText('BALANCE DUE', { x: col.unit, y, size: 10, font: bold, color: orange });
      currentPage.drawText(this.money(balanceDue, invoice.currency), { x: col.amt - 10, y, size: 10, font: bold, color: orange });
    }
    y -= 40;

    currentPage.drawText(`Thank you for travelling with ${company}`, { x: margin, y, size: 10, font, color: gray });

    return {
      buffer: Buffer.from(await doc.save()),
      invoiceNumber: invoice.invoiceNumber,
    };
  }

  private money(n: any, currency: string) {
    return `${currency} ${Number(n || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  async voidInvoice(id: string, tenantId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    
    const updated = await this.prisma.invoice.update({ where: { id }, data: { status: 'void' } });
    
    if (invoice.user?.email) {
      try {
        const settings = await this.prisma.tenantSettings.findUnique({ where: { tenantId } });
        const company = settings?.companyName || 'Flyngo Tours & Travels';
        await this.notifications.sendRawHtmlEmail(
          invoice.user.email,
          `Invoice ${invoice.invoiceNumber} Voided — ${company}`,
          `<div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <p style="color:#333;font-size:14px">Hi ${this.esc(invoice.user.fullName || 'there')},</p>
            <p style="color:#333;font-size:14px">Your invoice <strong>${this.esc(invoice.invoiceNumber)}</strong> has been voided.</p>
            <p style="color:#666;font-size:13px">If you have any questions, please contact support.</p>
            <p style="color:#999;font-size:12px;margin-top:32px">Thank you for travelling with ${this.esc(company)}.</p>
          </div>`,
        );
      } catch (err: any) {
        this.logger.warn(`Void notification email failed: ${err.message}`);
      }
    }
    
    return updated;
  }

  async sendByEmail(id: string, tenantId: string, targetEmail?: string, userId?: string) {
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

    const email = targetEmail || invoice.user?.email;
    if (!email) throw new NotFoundException('No email address found for this user');

    let html: string;
    try {
      html = await this.renderHtml(invoice);
    } catch (err: any) {
      this.logger.warn(`HTML render failed for email invoice ${id}: ${err.message}`);
      html = `<p>Invoice ${invoice.invoiceNumber} - Total: ${invoice.currency} ${invoice.total}</p>`;
    }
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flyngo.world';
    const bookingCode = invoice.booking?.bookingCode || invoice.hajjUmrahBooking?.bookingCode || '';
    const payUrl = bookingCode ? `${siteUrl}/pay/${bookingCode}` : siteUrl;

    const wrappedHtml = `
      <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <p style="color:#333;font-size:14px">Hi ${this.esc(invoice.user?.fullName || 'there')},</p>
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

    // Generate the PDF to attach to the email.
    let pdfBuffer: Buffer | undefined;
    try {
      const pdf = await this.getPdf(id, tenantId, undefined);
      pdfBuffer = pdf.buffer;
    } catch (err: any) {
      this.logger.warn(`PDF generation for email failed: ${err.message}`);
    }

    await this.notifications.sendRawHtmlEmail(
      email,
      `Invoice ${invoice.invoiceNumber} — Flyngo`,
      wrappedHtml,
      pdfBuffer
        ? { filename: `invoice-${invoice.invoiceNumber}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }
        : undefined,
    );
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
