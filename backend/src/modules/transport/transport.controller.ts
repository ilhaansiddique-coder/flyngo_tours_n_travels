import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransportService } from './transport.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Transport')
@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List transport options' })
  async findAll(@CurrentTenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.transportService.findAll(tenantId, pagination.page, pagination.limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get transport by ID' })
  async findById(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.transportService.findById(id, tenantId);
  }

  @Post()
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a transport option' })
  async create(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.transportService.create(tenantId, body);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update a transport option' })
  async update(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.transportService.update(id, tenantId, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Soft delete a transport option' })
  async remove(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.transportService.remove(id, tenantId);
  }
}
