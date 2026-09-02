import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AboutService } from './about.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('About')
@Controller('about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  // -------- COMBINED PUBLIC PAGE --------

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get the complete about page (public)' })
  async getFullPage(@CurrentTenantId() tenantId: string) {
    return this.aboutService.getFullAboutPage(tenantId);
  }

  // -------- META --------

  @Get('meta')
  @Public()
  @ApiOperation({ summary: 'Get the about page hero/meta' })
  async getMeta(@CurrentTenantId() tenantId: string) {
    return this.aboutService.getMeta(tenantId);
  }

  @Post('meta')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Upsert the about page hero/meta' })
  async saveMeta(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.aboutService.upsertMeta(tenantId, body);
  }

  // -------- SECTIONS --------

  @Get('sections')
  @Public()
  @ApiOperation({ summary: 'List all about page sections (public)' })
  async listSections(@CurrentTenantId() tenantId: string) {
    await this.aboutService.seedDefaultsIfEmpty(tenantId);
    return this.aboutService.listSections(tenantId);
  }

  @Get('admin/sections')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all about page sections (admin)' })
  async listSectionsAdmin(@CurrentTenantId() tenantId: string) {
    await this.aboutService.seedDefaultsIfEmpty(tenantId);
    return this.aboutService.listSections(tenantId);
  }

  @Post('admin/sections')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create an about page section' })
  async createSection(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.aboutService.createSection(tenantId, body);
  }

  @Patch('admin/sections/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update an about page section' })
  async updateSection(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
    @Body() body: any,
  ) {
    return this.aboutService.updateSection(id, tenantId, body);
  }

  @Delete('admin/sections/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Soft delete an about page section' })
  async removeSection(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.aboutService.removeSection(id, tenantId);
  }

  @Post('admin/sections/reorder')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Reorder about page sections' })
  async reorderSections(
    @CurrentTenantId() tenantId: string,
    @Body() body: { ids: string[] },
  ) {
    return this.aboutService.reorderSections(tenantId, body.ids ?? []);
  }

  // -------- CEO MESSAGE --------

  @Get('ceo')
  @Public()
  @ApiOperation({ summary: 'Get the active CEO message (public)' })
  async getCeo(@CurrentTenantId() tenantId: string) {
    return this.aboutService.getActiveCeoMessage(tenantId);
  }

  @Get('admin/ceo')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all CEO messages (admin)' })
  async listCeo(@CurrentTenantId() tenantId: string) {
    await this.aboutService.getActiveCeoMessage(tenantId);
    return this.aboutService.listCeoMessages(tenantId);
  }

  @Post('admin/ceo')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Upsert the active CEO message' })
  async saveCeo(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.aboutService.upsertCeoMessage(tenantId, body);
  }

  @Delete('admin/ceo/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Soft delete a CEO message' })
  async removeCeo(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.aboutService.removeCeoMessage(id, tenantId);
  }

  // -------- DEFAULTS --------

  @Get('admin/defaults')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get defaults for the about page (admin)' })
  async defaults() {
    return this.aboutService.getDefaultsAll();
  }
}
