import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Get audit logs (supports filters: action, entity, userId, startDate, endDate)' })
  async getAuditLogs(
    @CurrentTenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getAuditLogs(tenantId, pagination.page, pagination.limit, {
      action, entity, userId, startDate, endDate,
    });
  }

  @Get('roles')
  @ApiOperation({ summary: 'Get all roles with permissions' })
  async getRoles(@CurrentTenantId() tenantId: string) {
    return this.adminService.getRoles(tenantId);
  }

  @Post('roles')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create a role' })
  async createRole(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.adminService.createRole(tenantId, body);
  }

  @Patch('roles/:id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update a role' })
  async updateRole(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.adminService.updateRole(id, tenantId, body);
  }

  @Delete('roles/:id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Delete a role' })
  async removeRole(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.adminService.removeRole(id, tenantId);
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Get all permissions' })
  async getPermissions() {
    return this.adminService.getPermissions();
  }

  @Post('permissions')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create a permission' })
  async createPermission(@Body() body: any) {
    return this.adminService.createPermission(body);
  }

  @Patch('permissions/:id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update a permission' })
  async updatePermission(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updatePermission(id, body);
  }

  @Delete('permissions/:id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Delete a permission' })
  async removePermission(@Param('id') id: string) {
    return this.adminService.removePermission(id);
  }
}
