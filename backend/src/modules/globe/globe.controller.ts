import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GlobeService } from './globe.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Globe')
@Controller('globe')
export class GlobeController {
  constructor(private readonly globeService: GlobeService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get the active cities and routes powering the homepage globe' })
  async list(@CurrentTenantId() tenantId: string) {
    return this.globeService.listPublic(tenantId);
  }
}
