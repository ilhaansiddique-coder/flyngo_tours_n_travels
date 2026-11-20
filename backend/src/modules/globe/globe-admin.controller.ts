import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GlobeService } from './globe.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { StaffPermissions } from '../../common/decorators/staff-permissions.decorator';

@ApiTags('Globe Admin')
@ApiBearerAuth()
@Roles('admin', 'super_admin')
@Controller('globe/admin')
export class GlobeAdminController {
  constructor(private readonly globeService: GlobeService) {}

  @StaffPermissions('cms.read')
  @Get('cities')
  async listCities(@CurrentTenantId() tenantId: string) {
    return this.globeService.listCities(tenantId, true);
  }

  @StaffPermissions('cms.read')
  @Get('routes')
  async listRoutes(@CurrentTenantId() tenantId: string) {
    return this.globeService.listRoutes(tenantId, true);
  }

  @StaffPermissions('cms.create')
  @Post('cities')
  @ApiOperation({ summary: 'Create a globe city' })
  async createCity(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.globeService.createCity(tenantId, body);
  }

  @StaffPermissions('cms.update')
  @Patch('cities/:id')
  @ApiOperation({ summary: 'Update a globe city' })
  async updateCity(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.globeService.updateCity(id, tenantId, body);
  }

  @StaffPermissions('cms.delete')
  @Delete('cities/:id')
  @ApiOperation({ summary: 'Soft delete a globe city' })
  async removeCity(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.globeService.removeCity(id, tenantId);
  }

  @StaffPermissions('cms.create')
  @Post('routes')
  @ApiOperation({ summary: 'Create a globe route' })
  async createRoute(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.globeService.createRoute(tenantId, body);
  }

  @StaffPermissions('cms.update')
  @Patch('routes/:id')
  @ApiOperation({ summary: 'Update a globe route' })
  async updateRoute(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.globeService.updateRoute(id, tenantId, body);
  }

  @StaffPermissions('cms.delete')
  @Delete('routes/:id')
  @ApiOperation({ summary: 'Soft delete a globe route' })
  async removeRoute(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.globeService.removeRoute(id, tenantId);
  }
}
