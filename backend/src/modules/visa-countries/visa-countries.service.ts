import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

@Injectable()
export class VisaCountriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 50, q?: string) {
    const where: any = { tenantId, deletedAt: null };
    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { region: { contains: term, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.visaCountry.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.visaCountry.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findActive(tenantId: string) {
    return this.prisma.visaCountry.findMany({
      where: { tenantId, deletedAt: null, isActive: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(id: string, tenantId: string) {
    const country = await this.prisma.visaCountry.findFirst({ where: { id, tenantId } });
    if (!country) throw new NotFoundException('Visa country not found');
    return country;
  }

  async findBySlug(slug: string, tenantId: string) {
    const country = await this.prisma.visaCountry.findFirst({ where: { tenantId, slug } });
    if (!country) throw new NotFoundException('Visa country not found');
    return country;
  }

  async create(tenantId: string, data: any) {
    const slug = slugify(data.name);
    const existing = await this.prisma.visaCountry.findFirst({ where: { tenantId, slug } });
    if (existing) throw new ConflictException('A visa country with this name already exists');
    return this.prisma.visaCountry.create({
      data: {
        tenantId,
        name: data.name,
        slug,
        flagUrl: data.flagUrl,
        imageUrl: data.imageUrl,
        coverImageUrl: data.coverImageUrl,
        region: data.region,
        visaTypes: data.visaTypes ?? [],
        processingTime: data.processingTime,
        fee: data.fee,
        currency: data.currency || 'BDT',
        requirements: data.requirements ?? [],
        description: data.description,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        order: data.order ?? 0,
      },
    });
  }

  async update(id: string, tenantId: string, data: any) {
    await this.findById(id, tenantId);
    return this.prisma.visaCountry.update({
      where: { id },
      data: {
        name: data.name,
        flagUrl: data.flagUrl,
        imageUrl: data.imageUrl,
        coverImageUrl: data.coverImageUrl,
        region: data.region,
        visaTypes: data.visaTypes,
        processingTime: data.processingTime,
        fee: data.fee,
        currency: data.currency,
        requirements: data.requirements,
        description: data.description,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        order: data.order,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    return this.prisma.visaCountry.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
