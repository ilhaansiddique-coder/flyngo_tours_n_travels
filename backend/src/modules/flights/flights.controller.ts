import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FlightsService } from './flights.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ListQueryDto } from '../../common/dto/list-query.dto';

@ApiTags('Flights')
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Search flights' })
  async search(@CurrentTenantId() tenantId: string, @Query() query: ListQueryDto) {
    // origin/destination/date now live on the DTO. As separate @Query() params
    // they were unknown properties, so forbidNonWhitelisted rejected every
    // filtered flight search with a 400.
    return this.flightsService.search(tenantId, query, query.page, query.limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get flight by ID' })
  async findById(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.flightsService.findById(id, tenantId);
  }

  @Post()
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a flight' })
  async create(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.flightsService.create(tenantId, body);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update a flight' })
  async update(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.flightsService.update(id, tenantId, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Soft delete a flight' })
  async remove(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.flightsService.remove(id, tenantId);
  }
}
