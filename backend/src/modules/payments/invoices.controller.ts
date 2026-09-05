import { Controller, Get, Patch, Post, Param, Query, Body, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import type { Response } from 'express';

@ApiTags('Invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get('my')
  @ApiOperation({ summary: 'List my invoices' })
  my(@CurrentTenantId() tenantId: string, @CurrentUser('id') userId: string) {
    return this.invoices.listMine(tenantId, userId);
  }

  @Get('admin/all')
  @Roles('admin', 'super_admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'List all invoices (admin)' })
  adminAll(@CurrentTenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.invoices.listAdmin(tenantId, pagination.page, pagination.limit);
  }

  @Post('admin/repair')
  @Roles('admin', 'super_admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Generate missing invoices for completed payments (admin)' })
  repairInvoices(@CurrentTenantId() tenantId: string) {
    return this.invoices.generateMissingInvoices(tenantId);
  }

  @Patch('admin/:id/void')
  @Roles('admin', 'super_admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Void an invoice (admin)' })
  voidInvoice(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.invoices.voidInvoice(id, tenantId);
  }

  @Post(':id/send-email')
  @ApiOperation({ summary: 'Send invoice to email' })
  async sendEmail(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roleCode') roleCode?: string,
    @Body() body?: { email?: string },
  ) {
    const isAdmin = roleCode === 'admin' || roleCode === 'super_admin' || roleCode === 'manager' || roleCode === 'moderator';
    return this.invoices.sendByEmail(id, tenantId, isAdmin ? body?.email : undefined, isAdmin ? undefined : userId);
  }

  // Public, keyed on the booking code (the capability token the /pay/{code}
  // page already exposes). Declared before @Get(':id') so 'public' is never
  // captured as an invoice id.
  @Get('public/:bookingCode/:invoiceId')
  @Public()
  @ApiOperation({ summary: 'Get invoice HTML for a booking code (public)' })
  async getPublicOne(
    @Param('bookingCode') bookingCode: string,
    @Param('invoiceId') invoiceId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    const invoice = await this.invoices.getByBookingCode(tenantId, bookingCode, invoiceId);
    let html: string;
    try {
      html = await this.invoices.renderHtml(invoice);
    } catch {
      html = `<p>Invoice ${invoice.invoiceNumber}</p><p>Total: ${invoice.currency} ${invoice.total}</p>`;
    }
    return { ...invoice, html };
  }

  @Get('public/:bookingCode/:invoiceId/pdf')
  @Public()
  @ApiOperation({ summary: 'Get invoice PDF for a booking code (public, inline when ?inline=1)' })
  async getPublicPdf(
    @Param('bookingCode') bookingCode: string,
    @Param('invoiceId') invoiceId: string,
    @CurrentTenantId() tenantId: string,
    @Query('inline') inline: string | undefined,
    @Res() res: Response,
  ) {
    const invoice = await this.invoices.getByBookingCode(tenantId, bookingCode, invoiceId);
    const pdfAndInfo = await this.invoices.buildPdf(invoice);
    const disposition = inline === '1' || inline === 'true'
      ? `inline; filename="invoice-${pdfAndInfo.invoiceNumber}.pdf"`
      : `attachment; filename="invoice-${pdfAndInfo.invoiceNumber}.pdf"`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', disposition);
    res.send(pdfAndInfo.buffer);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download invoice as PDF' })
  async getPdf(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
    @CurrentUser('roleCode') roleCode: string | undefined,
    @CurrentUser('id') userId: string,
    @Query('inline') inline: string | undefined,
    @Res() res: Response,
  ) {
    const isAdmin = roleCode === 'admin' || roleCode === 'super_admin' || roleCode === 'manager' || roleCode === 'moderator';
    const pdfAndInfo = await this.invoices.getPdf(id, tenantId, isAdmin ? undefined : userId);
    const pdf = pdfAndInfo.buffer;
    const disposition = inline === '1' || inline === 'true'
      ? `inline; filename="invoice-${pdfAndInfo.invoiceNumber}.pdf"`
      : `attachment; filename="invoice-${pdfAndInfo.invoiceNumber}.pdf"`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', disposition);
    res.send(pdf);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice with printable HTML' })
  getOne(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roleCode') roleCode?: string,
  ) {
    const isAdmin = roleCode === 'admin' || roleCode === 'super_admin' || roleCode === 'manager' || roleCode === 'moderator';
    return this.invoices.getOne(id, tenantId, isAdmin ? undefined : userId);
  }
}
