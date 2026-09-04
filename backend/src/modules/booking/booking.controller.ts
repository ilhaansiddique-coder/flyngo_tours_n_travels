import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CreateHotelBookingDto } from './dto/create-hotel-booking.dto';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Create a new booking (public — guests may book, signed-in users are linked to their account)' })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string | undefined,
    // `meta` carries the flow-specific answers (visa application, custom-quote
    // brief). It was missing here, so the visa wizard's entire payload was
    // dropped before it ever reached the service.
    @Body() body: { type: 'tour' | 'hotel' | 'flight' | 'visa' | 'package' | 'transport' | 'hajj' | 'umrah'; itemId: string; startDate: Date; endDate?: Date; guests?: number; notes?: string; couponCode?: string; firstName?: string; lastName?: string; email?: string; phone?: string; meta?: Record<string, unknown> },
  ) {
    return this.bookingService.createBooking(tenantId, userId ?? null, body);
  }

  @Post('hotel')
  @ApiOperation({ summary: 'Create a hotel booking with guest details' })
  async createHotelBooking(
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: CreateHotelBookingDto,
  ) {
    return this.bookingService.createHotelBooking(tenantId, userId, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user bookings' })
  async getUserBookings(@CurrentTenantId() tenantId: string, @CurrentUser('id') userId: string) {
    return this.bookingService.getUserBookings(tenantId, userId);
  }

  @Get('admin/all')
  @Roles('admin', 'super_admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'List all bookings (admin)' })
  async listAllBookings(
    @CurrentTenantId() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('per_page') perPage?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || perPage || '20', 10);
    return this.bookingService.listAllBookings(tenantId, pageNum, limitNum, status, type);
  }

  // Trash — declared before @Get(':id') so 'admin/trash' isn't captured as an id.
  @Get('admin/trash')
  @Roles('admin', 'super_admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'List trashed (soft-deleted) bookings (admin)' })
  async listTrashed(
    @CurrentTenantId() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.bookingService.listTrashedBookings(
      tenantId,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  // Public tracking by the FLY-XXXX code. Declared before @Get(':id') so the
  // two-segment 'track/:code' isn't shadowed. Returns masked fields only.
  @Get('track/:code')
  @Public()
  @ApiOperation({ summary: 'Track a booking by its code (public)' })
  async track(@Param('code') code: string, @CurrentTenantId() tenantId: string) {
    return this.bookingService.trackByCode(tenantId, code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  async getById(@Param('id') id: string, @CurrentTenantId() tenantId: string, @CurrentUser('id') userId: string) {
    return this.bookingService.getBookingById(id, tenantId, userId);
  }

  @Patch('admin/:id/status')
  @Roles('admin', 'super_admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Update booking status (admin)' })
  async updateStatus(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body('status') status: string) {
    return this.bookingService.updateStatus(id, tenantId, status);
  }

  @Delete('admin/:id')
  @Roles('admin', 'super_admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Move a booking to the trash (admin, reversible)' })
  async softDelete(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.bookingService.softDeleteBooking(id, tenantId);
  }

  @Post('admin/:id/restore')
  @Roles('admin', 'super_admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Restore a trashed booking (admin)' })
  async restore(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.bookingService.restoreBooking(id, tenantId);
  }

  @Delete('admin/:id/purge')
  @Roles('admin', 'super_admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Permanently delete a trashed booking (admin, irreversible)' })
  async purge(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.bookingService.purgeBooking(id, tenantId);
  }

  @Post('admin')
  @Roles('admin', 'super_admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Create a booking on behalf of a user (admin)' })
  async adminCreate(
    @CurrentTenantId() tenantId: string,
    @Body() body: { userId: string; type: 'tour' | 'hotel' | 'flight' | 'visa' | 'package'; itemId: string; startDate: string; endDate?: string; guests?: number; notes?: string; totalAmount?: number },
  ) {
    return this.bookingService.adminCreateBooking(tenantId, body);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  async cancel(@Param('id') id: string, @CurrentTenantId() tenantId: string, @CurrentUser('id') userId: string) {
    return this.bookingService.cancelBooking(id, tenantId, userId);
  }
}
