import { Controller, Post, Get, Param, Body, Headers, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';

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
}
