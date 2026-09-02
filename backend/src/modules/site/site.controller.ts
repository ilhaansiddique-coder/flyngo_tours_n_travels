import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SiteService } from './site.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Site')
@Controller('site')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  // ---------- NAV MENU ----------

  @Get('nav')
  @Public()
  @ApiOperation({ summary: 'Get the full public navigation tree' })
  async getNav(@CurrentTenantId() tenantId: string) {
    await this.siteService.seedDefaultNavMenu(tenantId);
    return this.siteService.listNavMenuTree(tenantId);
  }

  @Get('admin/nav')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all nav menu items (flat, admin)' })
  async listNavAdmin(@CurrentTenantId() tenantId: string) {
    await this.siteService.seedDefaultNavMenu(tenantId);
    return this.siteService.listNavMenuTree(tenantId);
  }

  @Post('admin/nav')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a nav menu item (top-level or child)' })
  async createNav(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.siteService.createNavMenu(tenantId, body);
  }

  @Patch('admin/nav/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update a nav menu item' })
  async updateNav(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
    @Body() body: any,
  ) {
    return this.siteService.updateNavMenu(id, tenantId, body);
  }

  @Delete('admin/nav/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Soft delete a nav menu item and its children' })
  async removeNav(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.siteService.removeNavMenu(id, tenantId);
  }

  @Post('admin/nav/reorder')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Bulk reorder/parent reassign for nav items' })
  async reorderNav(
    @CurrentTenantId() tenantId: string,
    @Body() body: { items: { id: string; order: number; parentId?: string | null }[] },
  ) {
    return this.siteService.reorderNavMenu(tenantId, body.items ?? []);
  }

  // ---------- FOOTER ----------

  @Get('footer')
  @Public()
  @ApiOperation({ summary: 'Get the public footer config' })
  async getFooter(@CurrentTenantId() tenantId: string) {
    return this.siteService.getFooter(tenantId);
  }

  @Get('admin/footer')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get the footer config (admin)' })
  async getFooterAdmin(@CurrentTenantId() tenantId: string) {
    return this.siteService.getFooter(tenantId);
  }

  @Patch('admin/footer')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Upsert the footer config' })
  async saveFooter(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.siteService.updateFooter(tenantId, body);
  }
}