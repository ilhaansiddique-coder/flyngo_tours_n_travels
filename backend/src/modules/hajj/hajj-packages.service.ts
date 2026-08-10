import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

@Injectable()
export class HajjPackagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 20, q?: string) {
    const where: any = { tenantId, deletedAt: null };
    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { tier: { contains: term, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.hajjPackage.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.hajjPackage.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findActive(tenantId: string) {
    return this.prisma.hajjPackage.findMany({
      where: { tenantId, deletedAt: null, isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findById(id: string, tenantId: string) {
    const pkg = await this.prisma.hajjPackage.findFirst({ where: { id, tenantId } });
    if (!pkg) throw new NotFoundException('Hajj package not found');
    return pkg;
  }

  async create(tenantId: string, data: any) {
    const slug = slugify(data.title);
    const existing = await this.prisma.hajjPackage.findFirst({ where: { tenantId, slug } });
    if (existing) throw new ConflictException('A hajj package with this title already exists');
    return this.prisma.hajjPackage.create({
      data: {
        tenantId,
        title: data.title,
        slug,
        tier: data.tier,
        durationDays: data.durationDays,
        price: data.price,
        currency: data.currency || 'BDT',
        makkahNights: data.makkahNights ?? 0,
        madinahNights: data.madinahNights ?? 0,
        inclusions: data.inclusions ?? [],
        highlights: data.highlights ?? [],
        imageUrl: data.imageUrl,
        coverImageUrl: data.coverImageUrl,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        order: data.order ?? 0,
      },
    });
  }

  async update(id: string, tenantId: string, data: any) {
    await this.findById(id, tenantId);
    return this.prisma.hajjPackage.update({
      where: { id },
      data: {
        title: data.title,
        tier: data.tier,
        durationDays: data.durationDays,
        price: data.price,
        currency: data.currency,
        makkahNights: data.makkahNights,
        madinahNights: data.madinahNights,
        inclusions: data.inclusions,
        highlights: data.highlights,
        imageUrl: data.imageUrl,
        coverImageUrl: data.coverImageUrl,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        order: data.order,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    return this.prisma.hajjPackage.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
