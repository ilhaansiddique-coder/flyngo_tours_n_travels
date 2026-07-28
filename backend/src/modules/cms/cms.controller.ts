import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
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

  @Get('pages')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all CMS pages (admin)' })
  async listPages(@CurrentTenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.cmsService.listPages(tenantId, pagination.page, pagination.limit);
  }

  @Post('pages')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a CMS page' })
  async createPage(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.cmsService.createPage(tenantId, body);
  }

  @Patch('pages/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update a CMS page' })
  async updatePage(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.cmsService.updatePage(id, tenantId, body);
  }

  @Delete('pages/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Soft delete a CMS page' })
  async removePage(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.cmsService.removePage(id, tenantId);
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

  @Get('admin/blogs')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all blogs (admin)' })
  async listBlogs(@CurrentTenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.cmsService.listAllBlogs(tenantId, pagination.page, pagination.limit);
  }

  @Post('admin/blogs')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a blog post' })
  async createBlog(@CurrentTenantId() tenantId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return this.cmsService.createBlog(tenantId, userId, body);
  }

  @Patch('admin/blogs/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update a blog post' })
  async updateBlog(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.cmsService.updateBlog(id, tenantId, body);
  }

  @Delete('admin/blogs/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Soft delete a blog post' })
  async removeBlog(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.cmsService.removeBlog(id, tenantId);
  }

  @Get('testimonials')
  @Public()
  @ApiOperation({ summary: 'Get approved testimonials' })
  async getTestimonials(@CurrentTenantId() tenantId: string) {
    return this.cmsService.getTestimonials(tenantId);
  }

  @Get('admin/testimonials')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all testimonials (admin)' })
  async listTestimonials(@CurrentTenantId() tenantId: string) {
    return this.cmsService.listAllTestimonials(tenantId);
  }

  @Post('admin/testimonials')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a testimonial' })
  async createTestimonial(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.cmsService.createTestimonial(tenantId, body);
  }

  @Patch('admin/testimonials/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update a testimonial' })
  async updateTestimonial(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.cmsService.updateTestimonial(id, tenantId, body);
  }

  @Delete('admin/testimonials/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete a testimonial' })
  async removeTestimonial(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.cmsService.removeTestimonial(id, tenantId);
  }

  @Get('faqs')
  @Public()
  @ApiOperation({ summary: 'Get published FAQs' })
  async getFaqs(@CurrentTenantId() tenantId: string) {
    return this.cmsService.getFaqs(tenantId);
  }

  @Get('admin/faqs')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all FAQs (admin)' })
  async listFaqs(@CurrentTenantId() tenantId: string) {
    return this.cmsService.listAllFaqs(tenantId);
  }

  @Post('admin/faqs')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a FAQ' })
  async createFaq(@CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.cmsService.createFaq(tenantId, body);
  }

  @Patch('admin/faqs/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update a FAQ' })
  async updateFaq(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.cmsService.updateFaq(id, tenantId, body);
  }

  @Delete('admin/faqs/:id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete a FAQ' })
  async removeFaq(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.cmsService.removeFaq(id, tenantId);
  }
}
