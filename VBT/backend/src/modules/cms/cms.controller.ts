import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CmsService } from './cms.service';

@ApiTags('cms')
@Controller('public')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('activities')
  getActivities(@Query('featured') featured?: string, @Query('limit') limit?: string) {
    return this.cmsService.getActivities({
      featured: featured === 'true',
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('activities/:slug')
  async getActivity(@Param('slug') slug: string) {
    const activity = await this.cmsService.getActivityBySlug(slug);
    if (!activity) throw new NotFoundException('Activity not found');
    return activity;
  }

  @Get('blogs')
  getBlogs(@Query('limit') limit?: string, @Query('search') search?: string) {
    return this.cmsService.getBlogs({
      limit: limit ? Number(limit) : undefined,
      search,
    });
  }

  @Get('blogs/:slug')
  async getBlog(@Param('slug') slug: string) {
    const post = await this.cmsService.getBlogBySlug(slug);
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  @Get('gallery')
  getGallery(@Query('category') category?: string) {
    return this.cmsService.getGallery(category);
  }

  @Get('notices')
  getNotices() {
    return this.cmsService.getNotices();
  }

  @Get('notices/:id')
  async getNotice(@Param('id') id: string) {
    const notice = await this.cmsService.getNotice(id);
    if (!notice) throw new NotFoundException('Notice not found');
    return notice;
  }
}