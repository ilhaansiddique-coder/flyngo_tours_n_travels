import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  UpsertTierDto, UpsertProductRuleDto, AdjustPointsDto,
} from './dto/loyalty.dto';

@ApiTags('Loyalty / Rewards (Admin)')
@ApiBearerAuth()
@Roles('admin', 'super_admin')
@Controller('loyalty/admin')
export class LoyaltyAdminController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Loyalty program stats overview' })
  async stats(@CurrentTenantId() tenantId: string) {
    return this.loyaltyService.adminStats(tenantId);
  }

  // ---------- Tiers ----------

  @Get('tiers')
  @ApiOperation({ summary: 'List all tiers' })
  async listTiers(@CurrentTenantId() tenantId: string) {
    return this.loyaltyService.adminGetTiers(tenantId);
  }

  @Post('tiers')
  @ApiOperation({ summary: 'Create or update a tier' })
  async upsertTier(
    @CurrentTenantId() tenantId: string,
    @Body() body: UpsertTierDto,
  ) {
    return this.loyaltyService.adminUpsertTier(tenantId, null, body);
  }

  @Patch('tiers/:id')
  @ApiOperation({ summary: 'Update an existing tier' })
  async updateTier(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpsertTierDto,
  ) {
    return this.loyaltyService.adminUpsertTier(tenantId, id, body);
  }

  @Delete('tiers/:id')
  @ApiOperation({ summary: 'Delete a tier' })
  async deleteTier(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.loyaltyService.adminDeleteTier(id, tenantId);
  }

  // ---------- Product rules ----------

  @Get('product-rules')
  @ApiOperation({ summary: 'List per-product point rules' })
  async listRules(
    @CurrentTenantId() tenantId: string,
    @Query('productType') productType?: string,
  ) {
    return this.loyaltyService.adminGetProductRules(tenantId, productType);
  }

  @Post('product-rules')
  @ApiOperation({ summary: 'Create a product rule' })
  async createRule(
    @CurrentTenantId() tenantId: string,
    @Body() body: UpsertProductRuleDto,
  ) {
    return this.loyaltyService.adminUpsertProductRule(tenantId, null, body);
  }

  @Patch('product-rules/:id')
  @ApiOperation({ summary: 'Update a product rule' })
  async updateRule(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpsertProductRuleDto,
  ) {
    return this.loyaltyService.adminUpsertProductRule(tenantId, id, body);
  }

  @Delete('product-rules/:id')
  @ApiOperation({ summary: 'Delete a product rule' })
  async deleteRule(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.loyaltyService.adminDeleteProductRule(id, tenantId);
  }

  // ---------- Members / Accounts ----------

  @Get('members')
  @ApiOperation({ summary: 'List all loyalty members with stats' })
  async listMembers(
    @CurrentTenantId() tenantId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('search') search?: string,
  ) {
    return this.loyaltyService.adminListAccounts(tenantId, {
      search,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 50,
    });
  }

  // ---------- Transactions ----------

  @Get('transactions')
  @ApiOperation({ summary: 'List all loyalty transactions' })
  async listTransactions(
    @CurrentTenantId() tenantId: string,
    @Query('userId') userId?: string,
    @Query('type') type?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    return this.loyaltyService.adminListTransactions(tenantId, {
      userId,
      type,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 50,
    });
  }

  @Post('adjust/:userId')
  @ApiOperation({ summary: 'Manually credit/debit a user\'s points' })
  async adjust(
    @CurrentTenantId() tenantId: string,
    @Param('userId') userId: string,
    @Body() body: AdjustPointsDto,
  ) {
    return this.loyaltyService.adminAdjustPoints(tenantId, userId, body.points, body.reason, body.reference);
  }
}
