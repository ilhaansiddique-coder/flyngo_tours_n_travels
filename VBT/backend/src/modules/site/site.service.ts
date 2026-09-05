import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ProductType } from '@prisma/client';

@Injectable()
export class SiteService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettingsMap(): Promise<Record<string, unknown>> {
    const rows = await this.prisma.siteSetting.findMany();
    const map: Record<string, unknown> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  }

  async getHero() {
    return this.prisma.hero.findFirst({
      where: { enabled: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getAbout() {
    return this.prisma.aboutSection.findFirst({ where: { enabled: true } });
  }

  async getFunds() {
    return this.prisma.fund.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' },
    });
  }

  async getVideos() {
    return this.prisma.homeVideo.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' },
    });
  }

  async getInstitutions() {
    return this.prisma.institution.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' },
    });
  }

  async getProducts(type?: string) {
    const where =
      type && Object.values(ProductType).includes(type as ProductType)
        ? { type: type as ProductType, published: true }
        : { published: true };
    return this.prisma.product.findMany({ where, orderBy: { order: 'asc' } });
  }

  async getFaqs() {
    return this.prisma.faq.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
    });
  }

  async getZakatNisab() {
    const settings = await this.getSettingsMap();
    return settings['zakatNisab'] ?? null;
  }

  async getSiteBag() {
    const [settings, hero, about, funds, videos, institutions, products, faqs] =
      await Promise.all([
        this.getSettingsMap(),
        this.getHero(),
        this.getAbout(),
        this.getFunds(),
        this.getVideos(),
        this.getInstitutions(),
        this.getProducts(),
        this.getFaqs(),
      ]);
    return { settings, hero, about, funds, videos, institutions, products, faqs };
  }
}