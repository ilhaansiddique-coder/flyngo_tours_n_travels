import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles('admin', 'super_admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  async getDashboard(@CurrentTenantId() tenantId: string) {
    return this.adminService.getDashboardStats(tenantId);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  async getAuditLogs(@CurrentTenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.adminService.getAuditLogs(tenantId, pagination.page, pagination.limit);
  }

  @Get('roles')
  @ApiOperation({ summary: 'Get all roles with permissions' })
  async getRoles(@CurrentTenantId() tenantId: string) {
    return this.adminService.getRoles(tenantId);
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Get all permissions' })
  async getPermissions() {
    return this.adminService.getPermissions();
  }
}
