import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Marketing')
@Controller('marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get('coupons')
  @Public()
  @ApiOperation({ summary: 'Get active coupons' })
  async getCoupons(@CurrentTenantId() tenantId: string) {
    return this.marketingService.getActiveCoupons(tenantId);
  }

  @Post('coupons/validate')
  @Public()
  @ApiOperation({ summary: 'Validate a coupon code' })
  async validateCoupon(
    @CurrentTenantId() tenantId: string,
    @Body('code') code: string,
  ) {
    return this.marketingService.validateCoupon(code, tenantId);
  }
}
