import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPageBySlug(slug: string, tenantId: string) {
    return this.prisma.cmsPage.findFirst({
      where: { slug, tenantId, deletedAt: null, status: 'published' },
      include: { sections: { orderBy: { order: 'asc' } } },
    });
  }

  async getBlogPosts(tenantId: string, page = 1, limit = 10) {
    const [items, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where: { tenantId, deletedAt: null, status: 'published' },
        skip: (page - 1) * limit,
        take: limit,
        include: { author: { select: { id: true, fullName: true, avatarUrl: true } }, categories: true },
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.blogPost.count({ where: { tenantId, deletedAt: null, status: 'published' } }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getBlogPostBySlug(slug: string, tenantId: string) {
    return this.prisma.blogPost.findFirst({
      where: { slug, tenantId, deletedAt: null, status: 'published' },
      include: { author: { select: { id: true, fullName: true, avatarUrl: true } }, categories: true },
    });
  }

  async getTestimonials(tenantId: string) {
    return this.prisma.testimonial.findMany({
      where: { tenantId, deletedAt: null, isApproved: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFaqs(tenantId: string) {
    return this.prisma.faq.findMany({
      where: { tenantId, deletedAt: null, isPublished: true },
      orderBy: { order: 'asc' },
    });
  }
}
