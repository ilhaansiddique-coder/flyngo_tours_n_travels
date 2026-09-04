import {
  Controller, Get, Post, Patch, Delete, Body, Query, Param, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Tracking & Ads')
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  // ---------------------------------------------------------------------------
  // Public
  // ---------------------------------------------------------------------------

  @Get('settings/public')
  @Public()
  @ApiOperation({ summary: 'Public tracking settings (Pixel/GA4 IDs etc.)' })
  async publicSettings(@CurrentTenantId() tenantId: string) {
    return this.trackingService.getPublicSettings(tenantId);
  }

  @Post('event')
  @Public()
  @ApiOperation({ summary: 'Ingest a tracking event from the browser' })
  async event(@CurrentTenantId() tenantId: string, @Body() body: any, @Req() req: any) {
    return this.trackingService.ingestEvent(tenantId, {
      ...body,
      userAgent: body?.userAgent || req?.headers?.['user-agent'],
      referrer: body?.referrer || req?.headers?.referer,
    });
  }

  @Post('lead')
  @Public()
  @ApiOperation({ summary: 'Submit a lead from any form on the site' })
  async lead(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.trackingService.createLead(tenantId, body);
  }

  // ---------------------------------------------------------------------------
  // Admin
  // ---------------------------------------------------------------------------

  @Get('admin/settings')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get tracking credentials (secrets masked)' })
  async adminSettings(@CurrentTenantId() tenantId: string) {
    return this.trackingService.getSettings(tenantId);
  }

  @Patch('admin/settings')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update tracking credentials + trust badges' })
  async updateAdminSettings(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.trackingService.updateSettings(tenantId, body);
  }

  @Get('admin/stats')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Event analytics over the last N days' })
  async stats(@CurrentTenantId() tenantId: string, @Query('days') days?: string) {
    return this.trackingService.getEventStats(tenantId, Number(days) || 30);
  }

  // Admin leads -----------------------------------------------------------

  @Get('admin/leads/unread-count')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Count leads with status new' })
  async unreadLeadCount(@CurrentTenantId() tenantId: string) {
    return { count: await this.trackingService.countUnreadLeads(tenantId) };
  }

  @Get('admin/leads')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  async listLeads(@CurrentTenantId() tenantId: string, @Query('status') status?: string) {
    return this.trackingService.listLeads(tenantId, status);
  }

  @Patch('admin/leads/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  async updateLead(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.trackingService.updateLead(tenantId, id, body);
  }

  // Admin landing pages ---------------------------------------------------

  @Get('admin/landing-pages')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  async listLandingPages(@CurrentTenantId() tenantId: string) {
    return this.trackingService.listLandingPages(tenantId);
  }

  @Post('admin/landing-pages')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  async createLandingPage(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.trackingService.createLandingPage(tenantId, body);
  }

  @Patch('admin/landing-pages/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  async updateLandingPage(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.trackingService.updateLandingPage(tenantId, id, body);
  }

  @Delete('admin/landing-pages/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  async deleteLandingPage(@CurrentTenantId() tenantId: string, @Param('id') id: string) {
    return this.trackingService.deleteLandingPage(tenantId, id);
  }
}

// ===========================================================================
// Public landing page controller (separate prefix so it lives at /lp/.../page)
// ===========================================================================

@ApiTags('Landing Pages (Public)')
@Controller('lp')
export class LandingPagePublicController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Resolve a public landing page by slug' })
  async get(@CurrentTenantId() tenantId: string, @Param('slug') slug: string) {
    return this.trackingService.getLandingPage(tenantId, slug);
  }
}
