import { Controller, Get, Patch, Post, Param, Query, Body, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
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
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all invoices (admin)' })
  adminAll(@CurrentTenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.invoices.listAdmin(tenantId, pagination.page, pagination.limit);
  }

  @Patch('admin/:id/void')
  @Roles('admin', 'super_admin')
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
    const isAdmin = roleCode === 'admin' || roleCode === 'super_admin';
    return this.invoices.sendByEmail(id, tenantId, isAdmin ? body?.email : undefined, isAdmin ? undefined : userId);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download invoice as PDF' })
  async getPdf(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
    @CurrentUser('roleCode') roleCode: string | undefined,
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const isAdmin = roleCode === 'admin' || roleCode === 'super_admin';
    const pdfAndInfo = await this.invoices.getPdf(id, tenantId, isAdmin ? undefined : userId);
    const pdf = pdfAndInfo.buffer;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${pdfAndInfo.invoiceNumber}.pdf"`,
    );
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
    const isAdmin = roleCode === 'admin' || roleCode === 'super_admin';
    return this.invoices.getOne(id, tenantId, isAdmin ? undefined : userId);
  }
}
