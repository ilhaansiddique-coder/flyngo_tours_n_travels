import { Controller, Get, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Reviews')
@ApiBearerAuth()
@Roles('admin', 'super_admin')
@Controller('admin/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'List reviews (admin)' })
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('itemType') itemType?: string,
    @Query('isApproved') isApproved?: string,
  ) {
    return this.reviewsService.findAll(tenantId, pagination.page, pagination.limit, { itemType, isApproved });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  async findById(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.reviewsService.findById(id, tenantId);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve or unapprove a review' })
  async approve(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body('isApproved') isApproved: boolean) {
    return this.reviewsService.approve(id, tenantId, isApproved);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a review' })
  async remove(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.reviewsService.remove(id, tenantId);
  }
}
