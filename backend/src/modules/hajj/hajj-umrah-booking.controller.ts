import { Controller, Get, Post, Patch, Query, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HajjUmrahBookingService } from './hajj-umrah-booking.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@ApiTags('Hajj & Umrah Bookings')
@ApiBearerAuth()
@Controller('hajj-umrah-bookings')
export class HajjUmrahBookingController {
  constructor(private readonly service: HajjUmrahBookingService) {}

  @Post()
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary:
      'Create a Hajj/Umrah booking (public — guests may book, signed-in users are linked; validates passport + mahram)',
  })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string | undefined,
    @Body() body: any,
  ) {
    return this.service.create(tenantId, userId ?? null, body);
  }

  @Get('my')
  @ApiOperation({ summary: 'List my Hajj/Umrah bookings' })
  async my(
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string,
    @Query('kind') kind?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listForUser(tenantId, userId, kind, Number(page) || 1, Number(limit) || 20);
  }

  @Get('admin/all')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all Hajj/Umrah bookings (admin)' })
  async adminAll(
    @CurrentTenantId() tenantId: string,
    @Query('kind') kind?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listAdmin(tenantId, kind, status, Number(page) || 1, Number(limit) || 20);
  }

  @Patch('admin/:id/status')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update booking status (admin)' })
  async status(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
    @Body() body: { status: string; paymentStatus?: string },
  ) {
    return this.service.changeStatus(id, tenantId, body.status, body.paymentStatus);
  }
}
