import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VendorService, CreateVendorSubmissionDto } from './vendor.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Admin / Vendors')
@ApiBearerAuth()
@Roles('admin', 'super_admin')
@UseGuards(RolesGuard)
@Controller('admin/vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Get()
  @ApiOperation({ summary: 'List all vendors' })
  async getVendors(@CurrentTenantId() tenantId: string) {
    return this.vendorService.listVendors(tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vendor' })
  async removeVendor(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.vendorService.deleteVendor(tenantId, id);
  }

  @Get('submissions')
  @ApiOperation({ summary: 'List vendor submissions with pagination and search' })
  async getSubmissions(
    @CurrentTenantId() tenantId: string,
    @Query('q') q?: string,
    @Query('vendorId') vendorId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.vendorService.listSubmissions(
      tenantId,
      q,
      vendorId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Post('submissions')
  @ApiOperation({ summary: 'Create vendor submission (auto-creates vendor if not exists)' })
  async createSubmission(
    @CurrentTenantId() tenantId: string,
    @Body() dto: CreateVendorSubmissionDto,
  ) {
    return this.vendorService.createSubmission(tenantId, dto);
  }

  @Patch('submissions/:id')
  @ApiOperation({ summary: 'Update vendor submission' })
  async updateSubmission(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
    @Body() dto: Partial<CreateVendorSubmissionDto>,
  ) {
    return this.vendorService.updateSubmission(tenantId, id, dto);
  }

  @Delete('submissions/:id')
  @ApiOperation({ summary: 'Delete vendor submission' })
  async removeSubmission(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.vendorService.deleteSubmission(tenantId, id);
  }
}
