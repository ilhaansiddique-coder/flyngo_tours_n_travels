import {
  Controller, Post, Get, Patch, Param, Body, Query, Headers, Req,
  UseGuards, UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PaymentsService, SubmitConfirmationInput, RecordAdminPaymentInput } from './payments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('methods')
  @Public()
  @ApiOperation({ summary: 'Public offline payment methods (wallets + bank accounts)' })
  methods(@CurrentTenantId() tenantId: string) {
    return this.paymentsService.getOfflineMethods(tenantId);
  }

  @Get('booking/:code')
  @Public()
  @ApiOperation({ summary: 'Payment summary for a booking code (public, limited fields)' })
  bookingSummary(@Param('code') code: string, @CurrentTenantId() tenantId: string) {
    return this.paymentsService.getBookingPaymentSummary(tenantId, code.trim());
  }

  @Post('receipt')
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } }, required: ['file'] } })
  @ApiOperation({ summary: 'Upload a money-receipt image' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadReceipt(
    @CurrentTenantId() tenantId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided in form-data field "file"');
    return this.paymentsService.uploadReceipt(tenantId, file);
  }

  @Post('confirm')
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Submit offline payment confirmation (bKash trx ID / bank receipt)' })
  confirm(
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string | undefined,
    @Body() body: SubmitConfirmationInput,
  ) {
    return this.paymentsService.submitConfirmation(tenantId, userId ?? null, body);
  }

  @Post('intent')
  @ApiOperation({ summary: 'Create payment intent' })
  async createIntent(
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { bookingId: string; method: string; amount: number },
  ) {
    return this.paymentsService.createPaymentIntent(tenantId, userId, body.bookingId, body.method, body.amount);
  }

  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user payments' })
  async myPayments(
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentsService.getMyPayments(tenantId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment status' })
  async getStatus(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentsService.getPaymentStatus(id, tenantId, userId);
  }

  @Post('webhook/stripe')
  @Public()
  @ApiOperation({ summary: 'Stripe webhook' })
  async stripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
  ) {
    return this.paymentsService.handleStripeWebhook(signature, req.rawBody);
  }

  @Post('webhook/bkash')
  @Public()
  @ApiOperation({ summary: 'bKash webhook' })
  async bkashWebhook(
    @Headers('x-bkash-signature') signature: string,
    @Req() req: any,
  ) {
    return this.paymentsService.handleBKashWebhook(signature, req.rawBody);
  }

  @Post('admin/record')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Record a received payment against a booking (admin)' })
  record(
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') adminUserId: string,
    @Body() body: RecordAdminPaymentInput,
  ) {
    return this.paymentsService.recordAdminPayment(tenantId, adminUserId, body);
  }

  @Get('admin/all')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'List all payments (admin)' })
  async listAll(
    @CurrentTenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
    @Query('method') method?: string,
  ) {
    return this.paymentsService.listAllPayments(tenantId, pagination.page, pagination.limit, { status, method });
  }

  @Get('admin/stats')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get payment statistics (admin)' })
  async stats(@CurrentTenantId() tenantId: string) {
    return this.paymentsService.getPaymentStats(tenantId);
  }

  @Patch('admin/:id/status')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Update payment status (admin)' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') adminUserId: string,
    @Body('status') status: string,
  ) {
    return this.paymentsService.updatePaymentStatus(id, tenantId, status, adminUserId);
  }
}
