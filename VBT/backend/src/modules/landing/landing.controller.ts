import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../admin/admin.guard';
import { LandingPageUpsertDto } from './landing.dto';
import { LandingService } from './landing.service';

@ApiTags('landing')
@Controller()
export class LandingController {
  constructor(private readonly landingService: LandingService) {}

  @Get('public/landing-pages')
  published() {
    return this.landingService.getPublished();
  }

  @Get('public/landing-pages/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.landingService.getBySlug(slug);
  }

  @Get('admin/landing-pages')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  list() {
    return this.landingService.adminList();
  }

  @Post('admin/landing-pages')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  create(@Body() dto: LandingPageUpsertDto) {
    return this.landingService.adminCreate(dto);
  }

  @Put('admin/landing-pages/:id')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() dto: LandingPageUpsertDto) {
    return this.landingService.adminUpdate(id, dto);
  }

  @Delete('admin/landing-pages/:id')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.landingService.adminRemove(id);
  }
}