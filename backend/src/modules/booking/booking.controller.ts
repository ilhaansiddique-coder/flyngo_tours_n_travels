import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { type: 'tour' | 'hotel' | 'flight' | 'visa' | 'package'; itemId: string; startDate: Date; endDate?: Date; guests?: number; notes?: string },
  ) {
    return this.bookingService.createBooking(tenantId, userId, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user bookings' })
  async getUserBookings(@CurrentTenantId() tenantId: string, @CurrentUser('id') userId: string) {
    return this.bookingService.getUserBookings(tenantId, userId);
  }

  @Get('admin/all')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all bookings (admin)' })
  async listAllBookings(@CurrentTenantId() tenantId: string, @Query('page') page?: string) {
    return this.bookingService.listAllBookings(tenantId, parseInt(page || '1', 10));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  async getById(@Param('id') id: string, @CurrentTenantId() tenantId: string, @CurrentUser('id') userId: string) {
    return this.bookingService.getBookingById(id, tenantId, userId);
  }

  @Patch('admin/:id/status')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update booking status (admin)' })
  async updateStatus(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body('status') status: string) {
    return this.bookingService.updateStatus(id, tenantId, status);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  async cancel(@Param('id') id: string, @CurrentTenantId() tenantId: string, @CurrentUser('id') userId: string) {
    return this.bookingService.cancelBooking(id, tenantId, userId);
  }
}
