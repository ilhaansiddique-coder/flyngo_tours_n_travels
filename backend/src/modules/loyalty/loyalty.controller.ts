import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
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

  @Post('redeem/preview')
  @ApiOperation({ summary: 'Preview BDT value of redeeming N points' })
  async previewRedemption(
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { points: number },
  ) {
    return this.loyaltyService.previewRedemption(tenantId, userId, body.points);
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
