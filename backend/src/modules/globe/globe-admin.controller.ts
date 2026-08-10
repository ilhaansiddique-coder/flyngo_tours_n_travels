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

@ApiTags('Globe Admin')
@ApiBearerAuth()
@Roles('admin', 'super_admin')
@Controller('globe/admin')
export class GlobeAdminController {
  constructor(private readonly globeService: GlobeService) {}

  @Get('cities')
  async listCities(@CurrentTenantId() tenantId: string) {
    return this.globeService.listCities(tenantId, true);
  }

  @Get('routes')
  async listRoutes(@CurrentTenantId() tenantId: string) {
    return this.globeService.listRoutes(tenantId, true);
  }

  @Post('cities')
  @ApiOperation({ summary: 'Create a globe city' })
  async createCity(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.globeService.createCity(tenantId, body);
  }

  @Patch('cities/:id')
  @ApiOperation({ summary: 'Update a globe city' })
  async updateCity(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.globeService.updateCity(id, tenantId, body);
  }

  @Delete('cities/:id')
  @ApiOperation({ summary: 'Soft delete a globe city' })
  async removeCity(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.globeService.removeCity(id, tenantId);
  }

  @Post('routes')
  @ApiOperation({ summary: 'Create a globe route' })
  async createRoute(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.globeService.createRoute(tenantId, body);
  }

  @Patch('routes/:id')
  @ApiOperation({ summary: 'Update a globe route' })
  async updateRoute(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.globeService.updateRoute(id, tenantId, body);
  }

  @Delete('routes/:id')
  @ApiOperation({ summary: 'Soft delete a globe route' })
  async removeRoute(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.globeService.removeRoute(id, tenantId);
  }
}
