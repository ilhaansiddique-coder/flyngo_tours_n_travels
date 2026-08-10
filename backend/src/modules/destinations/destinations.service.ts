import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

@Injectable()
export class DestinationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 50, q?: string) {
    const where: any = { tenantId, deletedAt: null };
    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { country: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.destination.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { tours: true, hotels: true } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.destination.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, tenantId: string) {
    const dest = await this.prisma.destination.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { tours: true, hotels: true } } },
    });
    if (!dest) throw new NotFoundException('Destination not found');
    return dest;
  }

  async create(tenantId: string, data: any) {
    const slug = slugify(data.name);
    const existing = await this.prisma.destination.findFirst({ where: { tenantId, slug } });
    if (existing) throw new ConflictException('A destination with this name already exists');

    return this.prisma.destination.create({
      data: {
        tenantId,
        name: data.name,
        slug,
        country: data.country,
        continent: data.continent,
        description: data.description,
        imageUrl: data.imageUrl,
        latitude: data.latitude,
        longitude: data.longitude,
        isFeatured: data.isFeatured ?? false,
      },
    });
  }

  async update(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.destination.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Destination not found');

    const slug = data.name ? slugify(data.name) : existing.slug;
    if (data.name && slug !== existing.slug) {
      const dupe = await this.prisma.destination.findFirst({ where: { tenantId, slug, id: { not: id } } });
      if (dupe) throw new ConflictException('A destination with this name already exists');
    }

    return this.prisma.destination.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        country: data.country,
        continent: data.continent,
        description: data.description,
        imageUrl: data.imageUrl,
        latitude: data.latitude,
        longitude: data.longitude,
        isFeatured: data.isFeatured,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    const existing = await this.prisma.destination.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Destination not found');
    return this.prisma.destination.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
