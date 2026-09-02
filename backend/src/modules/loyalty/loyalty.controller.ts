import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RedeemPointsDto } from './dto/loyalty.dto';

@ApiTags('Loyalty / Rewards')
@ApiBearerAuth()
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('me')
  @ApiOperation({ summary: 'My loyalty account — tier, points, recent transactions' })
  async myAccount(
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.loyaltyService.getMyAccount(tenantId, userId);
  }

  @Get('overview')
  @ApiOperation({ summary: 'My Phase 1 loyalty overview' })
  async overview(@CurrentTenantId() tenantId: string, @CurrentUser('id') userId: string) {
    return this.loyaltyService.getOverview(tenantId, userId);
  }

  @Get('referral-link')
  @ApiOperation({ summary: 'Get my referral link' })
  async referralLink(@CurrentTenantId() tenantId: string, @CurrentUser('id') userId: string) {
    return this.loyaltyService.getReferralLink(tenantId, userId);
  }

  @Get('referrals')
  @ApiOperation({ summary: 'List my referrals' })
  async referrals(
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
  ) {
    return this.loyaltyService.getReferrals(tenantId, userId, status);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List my point ledger transactions' })
  async transactions(
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string,
    @Query('type') type?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.loyaltyService.getTransactions(tenantId, userId, type, cursor);
  }

  @Post('redeem/preview')
  @ApiOperation({ summary: 'Preview BDT value of redeeming N points' })
  async previewRedemption(
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { points: number },
  ) {
    return this.loyaltyService.previewRedemption(tenantId, userId, body.points);
  }

  @Post('redemption-quote')
  @ApiOperation({ summary: 'Phase 2 redemption quote placeholder' })
  async redemptionQuote() {
    return this.loyaltyService.previewRedemption('', '', 0);
  }

  @Get('redemption-quote')
  @ApiOperation({ summary: 'Phase 2 redemption quote placeholder' })
  async redemptionQuoteGet() {
    return this.loyaltyService.previewRedemption('', '', 0);
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Redeem points (returns BDT discount value)' })
  async redeem(
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RedeemPointsDto,
  ) {
    return this.loyaltyService.redeemPoints(tenantId, userId, dto.points, dto.bookingId);
  }
}
