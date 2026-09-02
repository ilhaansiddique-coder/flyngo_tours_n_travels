import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class PublicReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Public: approved reviews + summary for a product detail page.
  @Get()
  @Public()
  @ApiOperation({ summary: 'List approved reviews for an item' })
  async list(
    @CurrentTenantId() tenantId: string,
    @Query('itemType') itemType: string,
    @Query('itemId') itemId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.listPublic(
      tenantId,
      itemType,
      itemId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  // Authenticated: a logged-in customer submits a review (pending moderation).
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a review' })
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { itemType: string; itemId: string; rating: number; title?: string; content: string },
  ) {
    return this.reviewsService.create(tenantId, userId, body);
  }
}
