import { Controller, Get, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.id, user.tenantId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@CurrentUser() user: any, @Body() body: { fullName?: string; phone?: string; avatarUrl?: string }) {
    return this.usersService.updateProfile(user.id, user.tenantId, body);
  }

  @Get()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all users (admin)' })
  async listUsers(@CurrentTenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.usersService.listUsers(tenantId, pagination.page, pagination.limit);
  }

  @Get(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get user by ID (admin)' })
  async getUserById(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.usersService.findById(id, tenantId);
  }

  @Patch(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update a user (admin)' })
  async updateUser(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.usersService.updateUser(id, tenantId, body);
  }

  @Delete(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Soft delete a user (admin)' })
  async removeUser(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.usersService.removeUser(id, tenantId);
  }
}
