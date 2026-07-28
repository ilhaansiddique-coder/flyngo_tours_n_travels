import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HotelsService } from './hotels.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all hotels' })
  async findAll(@CurrentTenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.hotelsService.findAll(tenantId, pagination.page, pagination.limit);
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
}
