import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VisaService } from './visa.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Visa')
@Controller('visa')
export class VisaController {
  constructor(private readonly visaService: VisaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all visa services' })
  async getAll(@CurrentTenantId() tenantId: string, @Query('q') q?: string) {
    return this.visaService.getVisaServices(tenantId, q);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get visa service by ID' })
  async getById(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.visaService.getVisaServiceById(id, tenantId);
  }

  @Post()
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a visa service' })
  async create(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.visaService.create(tenantId, body);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update a visa service' })
  async update(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.visaService.update(id, tenantId, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Soft delete a visa service' })
  async remove(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.visaService.remove(id, tenantId);
  }
}
