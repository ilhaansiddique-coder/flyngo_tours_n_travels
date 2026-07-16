import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VisaService } from './visa.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Visa')
@Controller('visa')
export class VisaController {
  constructor(private readonly visaService: VisaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all visa services' })
  async getAll(@CurrentTenantId() tenantId: string) {
    return this.visaService.getVisaServices(tenantId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get visa service by ID' })
  async getById(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.visaService.getVisaServiceById(id, tenantId);
  }
}
