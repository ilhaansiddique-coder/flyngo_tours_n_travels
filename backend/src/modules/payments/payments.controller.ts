import { Controller, Post, Get, Patch, Param, Body, Query, Headers, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intent')
  @ApiOperation({ summary: 'Create payment intent' })
  async createIntent(
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { bookingId: string; method: string; amount: number },
  ) {
    return this.paymentsService.createPaymentIntent(tenantId, userId, body.bookingId, body.method, body.amount);
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

  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user payments' })
  async myPayments(
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentsService.getMyPayments(tenantId, userId);
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
  async bkashWebhook(@Body() body: any) {
    return this.paymentsService.handleBKashWebhook(body);
  }

  @Get('admin/all')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
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
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get payment statistics (admin)' })
  async stats(@CurrentTenantId() tenantId: string) {
    return this.paymentsService.getPaymentStats(tenantId);
  }

  @Patch('admin/:id/status')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update payment status (admin)' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
    @Body('status') status: string,
  ) {
    return this.paymentsService.updatePaymentStatus(id, tenantId, status);
  }
}
