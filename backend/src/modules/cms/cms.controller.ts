import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('CMS')
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('pages/:slug')
  @Public()
  @ApiOperation({ summary: 'Get CMS page by slug' })
  async getPage(@Param('slug') slug: string, @CurrentTenantId() tenantId: string) {
    return this.cmsService.getPageBySlug(slug, tenantId);
  }

  @Get('blogs')
  @Public()
  @ApiOperation({ summary: 'Get published blog posts' })
  async getBlogs(@CurrentTenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.cmsService.getBlogPosts(tenantId, pagination.page, pagination.limit);
  }

  @Get('blogs/:slug')
  @Public()
  @ApiOperation({ summary: 'Get blog post by slug' })
  async getBlogBySlug(@Param('slug') slug: string, @CurrentTenantId() tenantId: string) {
    return this.cmsService.getBlogPostBySlug(slug, tenantId);
  }

  @Get('testimonials')
  @Public()
  @ApiOperation({ summary: 'Get approved testimonials' })
  async getTestimonials(@CurrentTenantId() tenantId: string) {
    return this.cmsService.getTestimonials(tenantId);
  }

  @Get('faqs')
  @Public()
  @ApiOperation({ summary: 'Get published FAQs' })
  async getFaqs(@CurrentTenantId() tenantId: string) {
    return this.cmsService.getFaqs(tenantId);
  }
}
