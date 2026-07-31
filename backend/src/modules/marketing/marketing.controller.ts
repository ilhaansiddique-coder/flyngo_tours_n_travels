import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

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
  async validateCoupon(@CurrentTenantId() tenantId: string, @Body('code') code: string) {
    return this.marketingService.validateCoupon(code, tenantId);
  }

  @Get('admin/coupons')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all coupons (admin)' })
  async listCoupons(@CurrentTenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.marketingService.listAllCoupons(tenantId, pagination.page, pagination.limit);
  }

  @Post('admin/coupons')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a coupon' })
  async createCoupon(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.marketingService.createCoupon(tenantId, body);
  }

  @Patch('admin/coupons/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update a coupon' })
  async updateCoupon(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.marketingService.updateCoupon(id, tenantId, body);
  }

  @Delete('admin/coupons/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete a coupon' })
  async removeCoupon(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.marketingService.removeCoupon(id, tenantId);
  }

  @Get('admin/affiliates')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all affiliates (admin)' })
  async listAffiliates(
    @CurrentTenantId() tenantId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.marketingService.listAllAffiliates(tenantId, pagination.page, pagination.limit);
  }

  @Post('admin/affiliates')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create an affiliate (admin)' })
  async createAffiliate(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.marketingService.createAffiliate(tenantId, body);
  }

  @Patch('admin/affiliates/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update an affiliate (admin)' })
  async updateAffiliate(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.marketingService.updateAffiliate(id, tenantId, body);
  }

  @Delete('admin/affiliates/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete an affiliate (admin)' })
  async removeAffiliate(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.marketingService.removeAffiliate(id, tenantId);
  }
}
