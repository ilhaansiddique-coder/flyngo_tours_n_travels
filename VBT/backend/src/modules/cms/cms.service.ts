import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

interface ListOptions {
  featured?: boolean;
  limit?: number;
  search?: string;
}

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  async getActivities(options: ListOptions = {}) {
    return this.prisma.activity.findMany({
      where: {
        published: true,
        ...(options.featured ? { featured: true } : {}),
      },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
      take: options.limit,
    });
  }

  async getActivityBySlug(slug: string) {
    return this.prisma.activity.findFirst({
      where: { slug, published: true },
    });
  }

  async getBlogs(options: ListOptions = {}) {
    return this.prisma.blogPost.findMany({
      where: {
        published: true,
        ...(options.search
          ? {
              OR: [
                { titleEn: { contains: options.search, mode: 'insensitive' } },
                { excerptEn: { contains: options.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take: options.limit,
    });
  }

  async getBlogBySlug(slug: string) {
    return this.prisma.blogPost.findFirst({
      where: { slug, published: true },
    });
  }

  async getGallery(category?: string) {
    const categories = await this.prisma.galleryImage.findMany({
      where: { published: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    const images = await this.prisma.galleryImage.findMany({
      where: { published: true, ...(category ? { category } : {}) },
      orderBy: { order: 'asc' },
    });
    return { categories: categories.map((c) => c.category), images };
  }

  async getNotices() {
    return this.prisma.notice.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async getNotice(id: string) {
    return this.prisma.notice.findFirst({
      where: { id, published: true },
    });
  }
}