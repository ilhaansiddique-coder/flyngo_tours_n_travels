import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HeroService } from './hero.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Hero')
@Controller('hero')
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get the active hero section for the homepage' })
  async get(@CurrentTenantId() tenantId: string) {
    return this.heroService.getForTenant(tenantId);
  }

  @Get('defaults')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get the default hero section template' })
  async defaults() {
    return this.heroService.getDefaults();
  }

  @Post()
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Upsert the hero section for the tenant' })
  async save(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.heroService.upsert(tenantId, body);
  }
}
