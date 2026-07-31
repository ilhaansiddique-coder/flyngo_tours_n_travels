import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  async getNotifications(
    @CurrentUser('id') userId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.notificationsService.getNotifications(userId, tenantId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(
    @CurrentUser('id') userId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.notificationsService.markAllAsRead(userId, tenantId);
  }

  @Get('admin/all')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all notifications (admin)' })
  async listAll(
    @CurrentTenantId() tenantId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.notificationsService.listAllNotifications(tenantId, pagination.page, pagination.limit);
  }

  @Post('admin/send')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Send a notification to one or all users (admin)' })
  async send(
    @CurrentTenantId() tenantId: string,
    @Body() body: { userId?: string; userIds?: string[]; type: string; title: string; body: string; data?: any },
  ) {
    return this.notificationsService.createNotification(tenantId, body);
  }

  @Delete('admin/:id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete a notification (admin)' })
  async remove(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.notificationsService.removeNotification(id, tenantId);
  }
}
