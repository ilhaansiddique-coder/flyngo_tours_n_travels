import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BankAccountsService, BankAccountInput } from './bank-accounts.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Bank Accounts')
@ApiBearerAuth()
@Controller('payments/admin/bank-accounts')
@Roles('admin', 'super_admin')
export class BankAccountsController {
  constructor(private readonly bankAccounts: BankAccountsService) {}

  @Get()
  @ApiOperation({ summary: 'List bank accounts (admin)' })
  list(@CurrentTenantId() tenantId: string) {
    return this.bankAccounts.listAdmin(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a bank account (admin)' })
  create(@CurrentTenantId() tenantId: string, @Body() body: BankAccountInput) {
    return this.bankAccounts.create(tenantId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a bank account (admin)' })
  update(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
    @Body() body: Partial<BankAccountInput>,
  ) {
    return this.bankAccounts.update(id, tenantId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bank account (admin)' })
  remove(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.bankAccounts.remove(id, tenantId);
  }
}
