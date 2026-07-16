import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Tenant')
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('settings')
  @Public()
  @ApiOperation({ summary: 'Get current tenant public settings' })
  async getSettings(@CurrentTenantId() tenantId: string) {
    return this.tenantService.getSettings(tenantId);
  }
}
