import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MobileWalletsService, MobileWalletInput } from './mobile-wallets.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Mobile Wallets')
@ApiBearerAuth()
@Controller('payments/admin/mobile-wallets')
@Roles('admin', 'super_admin')
export class MobileWalletsController {
  constructor(private readonly mobileWallets: MobileWalletsService) {}

  @Get()
  @ApiOperation({ summary: 'List mobile wallets (admin)' })
  list(@CurrentTenantId() tenantId: string) {
    return this.mobileWallets.listAdmin(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a mobile wallet (admin)' })
  create(@CurrentTenantId() tenantId: string, @Body() body: MobileWalletInput) {
    return this.mobileWallets.create(tenantId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a mobile wallet (admin)' })
  update(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
    @Body() body: Partial<MobileWalletInput>,
  ) {
    return this.mobileWallets.update(id, tenantId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a mobile wallet (admin)' })
  remove(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.mobileWallets.remove(id, tenantId);
  }
}
