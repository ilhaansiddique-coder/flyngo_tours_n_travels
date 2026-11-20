import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { StaffPermissions } from '../../common/decorators/staff-permissions.decorator';

@ApiTags('Tenant')
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('settings')
  @Public()
  @ApiOperation({ summary: 'Get current tenant public settings (never includes gateway secrets)' })
  async getSettings(@CurrentTenantId() tenantId: string) {
    return this.tenantService.getSettings(tenantId);
  }

  @StaffPermissions('settings.read')
  @Get('admin/settings')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get tenant settings for the admin form (gateway secrets masked)' })
  async getAdminSettings(@CurrentTenantId() tenantId: string) {
    return this.tenantService.getAdminSettings(tenantId);
  }

  @StaffPermissions('settings.update')
  @Patch('settings')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update tenant settings (admin)' })
  async updateSettings(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.tenantService.updateSettings(tenantId, body);
  }
}
