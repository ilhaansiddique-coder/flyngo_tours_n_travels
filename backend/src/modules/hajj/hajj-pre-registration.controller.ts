import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HajjPreRegistrationService } from './hajj-pre-registration.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Hajj Pre-Registration')
@Controller('hajj-pre-registration')
export class HajjPreRegistrationController {
  constructor(private readonly service: HajjPreRegistrationService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Submit hajj pre-registration (public form)' })
  async submit(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.service.submit(tenantId, body);
  }

  @Get()
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  async findAll(@CurrentTenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.service.findAll(tenantId, pagination.page, pagination.limit);
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  async findById(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.service.findById(id, tenantId);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  async updateStatus(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body('status') status: string) {
    return this.service.updateStatus(id, tenantId, status);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete a pre-registration (admin — remove spam/duplicates)' })
  async remove(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.service.remove(id, tenantId);
  }
}
