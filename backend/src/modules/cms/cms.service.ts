import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPageBySlug(slug: string, tenantId: string) {
    return this.prisma.cmsPage.findFirst({
      where: { slug, tenantId, deletedAt: null, status: 'published' },
      include: { sections: { orderBy: { order: 'asc' } } },
    });
  }

  async listPages(tenantId: string, page = 1, limit = 20) {
    const where = { tenantId, deletedAt: null };
    const [items, total] = await Promise.all([
      this.prisma.cmsPage.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { updatedAt: 'desc' } }),
      this.prisma.cmsPage.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async createPage(tenantId: string, data: any) {
    const slug = slugify(data.title);
    const existing = await this.prisma.cmsPage.findFirst({ where: { tenantId, slug } });
    if (existing) throw new ConflictException('A page with this title already exists');

    return this.prisma.cmsPage.create({
      data: {
        tenantId,
        title: data.title,
        slug,
        content: data.content || {},
        status: data.status || 'draft',
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        publishedAt: data.status === 'published' ? new Date() : null,
      },
    });
  }

  async updatePage(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.cmsPage.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Page not found');

    const slug = data.title ? slugify(data.title) : existing.slug;
    if (data.title && slug !== existing.slug) {
      const dupe = await this.prisma.cmsPage.findFirst({ where: { tenantId, slug, id: { not: id } } });
      if (dupe) throw new ConflictException('A page with this title already exists');
    }

    return this.prisma.cmsPage.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        content: data.content,
        status: data.status,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        publishedAt: data.status === 'published' && existing.status !== 'published' ? new Date() : existing.publishedAt,
      },
    });
  }

  async removePage(id: string, tenantId: string) {
    const existing = await this.prisma.cmsPage.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Page not found');
    return this.prisma.cmsPage.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getBlogPosts(tenantId: string, page = 1, limit = 10) {
    const where = { tenantId, deletedAt: null, status: 'published' };
    const [items, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: { author: { select: { id: true, fullName: true, avatarUrl: true } }, categories: { include: { category: true } } },
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.blogPost.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getBlogPostBySlug(slug: string, tenantId: string) {
    return this.prisma.blogPost.findFirst({
      where: { slug, tenantId, deletedAt: null, status: 'published' },
      include: { author: { select: { id: true, fullName: true, avatarUrl: true } }, categories: { include: { category: true } } },
    });
  }

  async listAllBlogs(tenantId: string, page = 1, limit = 20) {
    const where = { tenantId, deletedAt: null };
    const [items, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: { author: { select: { id: true, fullName: true } }, categories: { include: { category: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.blogPost.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async createBlog(tenantId: string, authorId: string, data: any) {
    const slug = slugify(data.title);
    return this.prisma.blogPost.create({
      data: {
        tenantId, authorId, title: data.title, slug,
        excerpt: data.excerpt, content: data.content || '',
        featuredImage: data.featuredImage, status: data.status || 'draft',
        metaTitle: data.metaTitle, metaDescription: data.metaDescription,
        tags: data.tags || [], isPinned: data.isPinned ?? false,
        publishedAt: data.status === 'published' ? new Date() : null,
      },
      include: { author: { select: { id: true, fullName: true } } },
    });
  }

  async updateBlog(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.blogPost.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Blog post not found');

    const slug = data.title ? slugify(data.title) : existing.slug;
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        title: data.title, slug, excerpt: data.excerpt, content: data.content,
        featuredImage: data.featuredImage, status: data.status,
        metaTitle: data.metaTitle, metaDescription: data.metaDescription,
        tags: data.tags, isPinned: data.isPinned,
        publishedAt: data.status === 'published' && existing.status !== 'published' ? new Date() : existing.publishedAt,
      },
      include: { author: { select: { id: true, fullName: true } } },
    });
  }

  async removeBlog(id: string, tenantId: string) {
    const existing = await this.prisma.blogPost.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Blog post not found');
    return this.prisma.blogPost.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getTestimonials(tenantId: string) {
    return this.prisma.testimonial.findMany({
      where: { tenantId, deletedAt: null, isApproved: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAllTestimonials(tenantId: string) {
    return this.prisma.testimonial.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTestimonial(tenantId: string, data: any) {
    return this.prisma.testimonial.create({
      data: {
        tenantId, customerName: data.customerName, customerTitle: data.customerTitle,
        customerImage: data.customerImage, content: data.content, rating: data.rating || 5,
        isApproved: data.isApproved ?? false,
      },
    });
  }

  async updateTestimonial(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.testimonial.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Testimonial not found');
    return this.prisma.testimonial.update({ where: { id }, data });
  }

  async removeTestimonial(id: string, tenantId: string) {
    const existing = await this.prisma.testimonial.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Testimonial not found');
    return this.prisma.testimonial.delete({ where: { id } });
  }

  async getFaqs(tenantId: string) {
    return this.prisma.faq.findMany({
      where: { tenantId, deletedAt: null, isPublished: true },
      orderBy: { order: 'asc' },
    });
  }

  async listAllFaqs(tenantId: string) {
    return this.prisma.faq.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { order: 'asc' },
    });
  }

  async createFaq(tenantId: string, data: any) {
    return this.prisma.faq.create({
      data: {
        tenantId, question: data.question, answer: data.answer,
        category: data.category, order: data.order || 0, isPublished: data.isPublished ?? false,
      },
    });
  }

  async updateFaq(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.faq.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('FAQ not found');
    return this.prisma.faq.update({ where: { id }, data });
  }

  async removeFaq(id: string, tenantId: string) {
    const existing = await this.prisma.faq.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('FAQ not found');
    return this.prisma.faq.delete({ where: { id } });
  }
}
