import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { LandingPageUpsertDto } from './landing.dto';

function isDataUrl(value: string): boolean {
  return /^data:image\/(png|jpeg|jpg|webp);base64,/.test(value);
}

@Injectable()
export class LandingService {
  constructor(private readonly prisma: PrismaService) {}

  getPublished() {
    return this.prisma.landingPage.findMany({
      where: { published: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getBySlug(slug: string) {
    const page = await this.prisma.landingPage.findFirst({
      where: { slug, published: true },
    });
    if (!page) throw new NotFoundException('Landing page not found');
    return page;
  }

  adminList() {
    return this.prisma.landingPage.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleBn: true,
        coverPhoto: true,
        published: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async adminCreate(dto: LandingPageUpsertDto) {
    if (dto.coverPhoto && !isDataUrl(dto.coverPhoto)) {
      throw new ConflictException('coverPhoto must be a PNG/JPEG/WebP data URL');
    }
    try {
      const page = await this.prisma.landingPage.create({
        data: {
          slug: dto.slug,
          titleEn: dto.titleEn,
          titleBn: dto.titleBn,
          subtitleEn: dto.subtitleEn,
          subtitleBn: dto.subtitleBn,
          coverPhoto: dto.coverPhoto,
          sections: dto.sections as Prisma.InputJsonValue | undefined,
          published: dto.published ?? true,
          order: dto.order ?? 0,
        },
      });
      return { success: true, id: page.id, slug: page.slug };
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException('A landing page with this slug already exists');
      }
      throw error;
    }
  }

  async adminUpdate(id: string, dto: LandingPageUpsertDto) {
    const existing = await this.prisma.landingPage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Landing page not found');
    if (dto.coverPhoto && !isDataUrl(dto.coverPhoto)) {
      throw new ConflictException('coverPhoto must be a PNG/JPEG/WebP data URL');
    }
    try {
      const page = await this.prisma.landingPage.update({
        where: { id },
        data: {
          slug: dto.slug,
          titleEn: dto.titleEn,
          titleBn: dto.titleBn,
          subtitleEn: dto.subtitleEn,
          subtitleBn: dto.subtitleBn,
          coverPhoto: dto.coverPhoto,
          sections: dto.sections as Prisma.InputJsonValue | undefined,
          published: dto.published ?? existing.published,
          order: dto.order ?? existing.order,
        },
      });
      return { success: true, id: page.id, slug: page.slug };
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException('A landing page with this slug already exists');
      }
      throw error;
    }
  }

  async adminRemove(id: string) {
    const existing = await this.prisma.landingPage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Landing page not found');
    await this.prisma.landingPage.delete({ where: { id } });
    return { success: true };
  }
}