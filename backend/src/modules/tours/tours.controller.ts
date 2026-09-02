import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ToursService } from './tours.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ListQueryDto } from '../../common/dto/list-query.dto';

@ApiTags('Tours')
@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all tours' })
  async findAll(@CurrentTenantId() tenantId: string, @Query() query: ListQueryDto) {
    // One DTO covers the whole query string. Declaring extra `@Query('x')`
    // params alongside it would 400 under forbidNonWhitelisted.
    return this.toursService.findAll(tenantId, query.page, query.limit, query.q, query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get tour by ID' })
  async findById(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.toursService.findById(id, tenantId);
  }

  @Post()
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a tour' })
  async create(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.toursService.create(tenantId, body);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update a tour' })
  async update(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.toursService.update(id, tenantId, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Soft delete a tour' })
  async remove(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.toursService.remove(id, tenantId);
  }
}
