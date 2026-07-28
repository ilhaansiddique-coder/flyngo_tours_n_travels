import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DestinationsService } from './destinations.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Destinations')
@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all destinations' })
  async findAll(@CurrentTenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.destinationsService.findAll(tenantId, pagination.page, pagination.limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get destination by ID' })
  async findById(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.destinationsService.findById(id, tenantId);
  }

  @Post()
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a destination' })
  async create(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.destinationsService.create(tenantId, body);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update a destination' })
  async update(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.destinationsService.update(id, tenantId, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Soft delete a destination' })
  async remove(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.destinationsService.remove(id, tenantId);
  }
}
