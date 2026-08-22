import { Controller, Get, Post, Delete, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReferEarnService } from './refer-earn.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Refer & Earn')
@Controller('refer-earn')
export class ReferEarnController {
  constructor(private readonly referEarnService: ReferEarnService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get the active Refer & Earn popover config (public)' })
  async get(@CurrentTenantId() tenantId: string) {
    return this.referEarnService.getForTenant(tenantId);
  }

  @Get('admin')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get the Refer & Earn popover config (admin)' })
  async getAdmin(@CurrentTenantId() tenantId: string) {
    return this.referEarnService.getForTenant(tenantId);
  }

  @Get('admin/defaults')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get the default Refer & Earn popover template' })
  async getDefaults() {
    return this.referEarnService.getDefaults();
  }

  @Post('admin')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create or update the Refer & Earn popover (singleton)' })
  async save(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.referEarnService.upsert(tenantId, body);
  }

  @Delete('admin')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete the Refer & Earn popover (resets to defaults)' })
  async remove(@CurrentTenantId() tenantId: string) {
    return this.referEarnService.remove(tenantId);
  }
}
