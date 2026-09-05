import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SiteService } from './site.service';

@ApiTags('site')
@Controller('public')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Get('site')
  getSite() {
    return this.siteService.getSiteBag();
  }

  @Get('hero')
  getHero() {
    return this.siteService.getHero();
  }

  @Get('about')
  getAbout() {
    return this.siteService.getAbout();
  }

  @Get('funds')
  getFunds() {
    return this.siteService.getFunds();
  }

  @Get('videos')
  getVideos() {
    return this.siteService.getVideos();
  }

  @Get('institutions')
  getInstitutions() {
    return this.siteService.getInstitutions();
  }

  @Get('products')
  getProducts(@Query('type') type?: string) {
    return this.siteService.getProducts(type);
  }

  @Get('faqs')
  getFaqs() {
    return this.siteService.getFaqs();
  }

  @Get('zakat-nisab')
  getZakatNisab() {
    return this.siteService.getZakatNisab();
  }

  @Get('settings/:key')
  async getSetting(@Param('key') key: string) {
    const map = await this.siteService.getSettingsMap();
    return map[key] ?? null;
  }
}