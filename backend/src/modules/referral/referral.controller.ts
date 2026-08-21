import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReferralService } from './referral.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Referrals (Refer & Earn)')
@Controller('referrals')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  // ---------------------------------------------------------------------------
  // Public endpoints
  // ---------------------------------------------------------------------------

  @Get('lookup')
  @Public()
  @ApiOperation({ summary: 'Validate a referral code (public)' })
  async lookup(@Query('code') code: string) {
    if (!code) throw new BadRequestException('code is required');
    return this.referralService.lookupCode(code);
  }

  @Get('program')
  @Public()
  @ApiOperation({ summary: 'Public Refer & Earn program copy' })
  async program(@CurrentTenantId() tenantId: string) {
    return this.referralService.getPublicProgram(tenantId);
  }

  // ---------------------------------------------------------------------------
  // Authenticated user endpoints
  // ---------------------------------------------------------------------------

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my referral dashboard summary' })
  async mySummary(@CurrentTenantId() tenantId: string, @CurrentUser('id') userId: string) {
    return this.referralService.getMyReferralSummary(tenantId, userId);
  }

  @Post('me/payouts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request a referral payout' })
  async requestPayout(
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { amount: number; method: string; details?: any },
  ) {
    if (!body?.amount || !body?.method) {
      throw new BadRequestException('amount and method are required');
    }
    return this.referralService.requestPayout(tenantId, userId, body);
  }

  // ---------------------------------------------------------------------------
  // Admin endpoints
  // ---------------------------------------------------------------------------

  @Get('admin/settings')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get Refer & Earn program settings' })
  async getSettings(@CurrentTenantId() tenantId: string) {
    return this.referralService.getSettings(tenantId);
  }

  @Patch('admin/settings')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update Refer & Earn program settings' })
  async updateSettings(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.referralService.updateSettings(tenantId, body);
  }

  @Get('admin/overview')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Refer & Earn program-wide stats' })
  async overview(@CurrentTenantId() tenantId: string) {
    return this.referralService.getAdminOverview(tenantId);
  }

  @Get('admin/referrals')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all referrals (admin)' })
  async listReferrals(
    @CurrentTenantId() tenantId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.referralService.adminListReferrals(
      tenantId,
      Math.max(parseInt(page, 10) || 1, 1),
      Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200),
    );
  }

  @Get('admin/affiliates')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List referrers with affiliation type + performance (admin)' })
  async listAffiliates(
    @CurrentTenantId() tenantId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('affiliateType') affiliateType?: string,
  ) {
    return this.referralService.adminListAffiliates(
      tenantId,
      Math.max(parseInt(page, 10) || 1, 1),
      Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200),
      search || undefined,
      affiliateType || undefined,
    );
  }

  @Patch('admin/affiliates/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Set a referrer affiliation type / commission rate / active flag' })
  async updateAffiliate(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: { affiliateType?: string; commissionRate?: number; isActive?: boolean },
  ) {
    return this.referralService.adminUpdateAffiliate(tenantId, id, body);
  }

  @Get('admin/payouts')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List payout requests (admin)' })
  async listPayouts(
    @CurrentTenantId() tenantId: string,
    @Query('status') status?: string,
  ) {
    return this.referralService.listPayoutsAdmin(tenantId, status);
  }

  @Patch('admin/payouts/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Approve / reject a payout' })
  async updatePayout(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string; processedBy?: string },
  ) {
    return this.referralService.updatePayoutAdmin(tenantId, id, body);
  }
}
