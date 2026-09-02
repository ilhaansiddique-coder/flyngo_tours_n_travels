import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VisaCountriesService } from './visa-countries.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Visa Countries')
@Controller('visa-countries')
export class VisaCountriesController {
  constructor(private readonly service: VisaCountriesService) {}

  @Get()
  @Public()
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('q') q?: string,
  ) {
    return this.service.findAll(tenantId, pagination.page, pagination.limit, q);
  }

  @Get('active')
  @Public()
  async findActive(@CurrentTenantId() tenantId: string) {
    return this.service.findActive(tenantId);
  }

  @Get('slug/:slug')
  @Public()
  async findBySlug(@Param('slug') slug: string, @CurrentTenantId() tenantId: string) {
    return this.service.findBySlug(slug, tenantId);
  }

  @Get(':id')
  @Public()
  async findById(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.service.findById(id, tenantId);
  }

  @Post()
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  async create(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.service.create(tenantId, body);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  async update(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.service.update(id, tenantId, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  async remove(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.service.remove(id, tenantId);
  }
}
