import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CuratedExperiencesService, CuratedExperiencesConfigInput } from './curated-experiences.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Curated Experiences')
@Controller('curated-experiences')
export class CuratedExperiencesController {
  constructor(private readonly service: CuratedExperiencesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get active curated experiences config for homepage' })
  async get(@CurrentTenantId() tenantId: string) {
    return this.service.getForTenant(tenantId);
  }

  @Get('admin')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get full curated experiences config for admin CMS' })
  async getAdmin(@CurrentTenantId() tenantId: string) {
    return this.service.getAdminForTenant(tenantId);
  }

  @Get('defaults')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get default curated experiences template' })
  async getDefaults() {
    return this.service.getDefaults();
  }

  @Post('admin')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Upsert curated experiences config' })
  async save(@CurrentTenantId() tenantId: string, @Body() body: CuratedExperiencesConfigInput) {
    return this.service.upsert(tenantId, body);
  }
}
