import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HotelsService } from './hotels.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ListQueryDto } from '../../common/dto/list-query.dto';

@ApiTags('Hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all hotels' })
  async findAll(@CurrentTenantId() tenantId: string, @Query() query: ListQueryDto) {
    return this.hotelsService.findAll(tenantId, query.page, query.limit, query.q, query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get hotel by ID' })
  async findById(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.hotelsService.findById(id, tenantId);
  }

  @Post()
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a hotel' })
  async create(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.hotelsService.create(tenantId, body);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update a hotel' })
  async update(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.hotelsService.update(id, tenantId, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Soft delete a hotel' })
  async remove(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.hotelsService.remove(id, tenantId);
  }

  // ---- Room inventory ----
  // Two-segment paths (:id/rooms) don't collide with the single-segment :id
  // routes above, so ordering is safe.
  @Get(':hotelId/rooms')
  @Public()
  @ApiOperation({ summary: 'List a hotel\'s bookable rooms' })
  async listRooms(@Param('hotelId') hotelId: string, @CurrentTenantId() tenantId: string) {
    return this.hotelsService.listRooms(hotelId, tenantId);
  }

  @Post(':hotelId/rooms')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Add a room to a hotel' })
  async createRoom(@Param('hotelId') hotelId: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.hotelsService.createRoom(hotelId, tenantId, body);
  }

  @Patch(':hotelId/rooms/:roomId')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update a hotel room' })
  async updateRoom(
    @Param('hotelId') hotelId: string,
    @Param('roomId') roomId: string,
    @CurrentTenantId() tenantId: string,
    @Body() body: any,
  ) {
    return this.hotelsService.updateRoom(hotelId, roomId, tenantId, body);
  }

  @Delete(':hotelId/rooms/:roomId')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete a hotel room' })
  async deleteRoom(
    @Param('hotelId') hotelId: string,
    @Param('roomId') roomId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.hotelsService.deleteRoom(hotelId, roomId, tenantId);
  }
}
