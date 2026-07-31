import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

@Injectable()
export class ToursService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 20) {
    const where = { tenantId, deletedAt: null };
    const [items, total] = await Promise.all([
      this.prisma.tour.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { destination: true, images: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tour.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, tenantId: string) {
    const tour = await this.prisma.tour.findFirst({
      where: { id, tenantId },
      include: { destination: true, images: true, itinerary: { orderBy: { day: 'asc' } } },
    });
    if (!tour) throw new NotFoundException('Tour not found');
    return tour;
  }

  async create(tenantId: string, data: any) {
    const slug = slugify(data.title);
    const existing = await this.prisma.tour.findFirst({ where: { tenantId, slug } });
    if (existing) throw new ConflictException('A tour with this title already exists');

    return this.prisma.tour.create({
      data: {
        tenantId,
        destinationId: data.destinationId,
        title: data.title,
        slug,
        description: data.description || '',
        highlights: data.highlights || [],
        inclusions: data.inclusions || [],
        exclusions: data.exclusions || [],
        price: data.price,
        salePrice: data.salePrice,
        currency: data.currency || 'USD',
        duration: data.duration,
        maxGuests: data.maxGuests || 10,
        difficulty: data.difficulty,
        tourType: data.tourType,
        startLocation: data.startLocation,
        endLocation: data.endLocation,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
      },
      include: { destination: true, images: true },
    });
  }

  async update(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.tour.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Tour not found');

    const slug = data.title ? slugify(data.title) : existing.slug;
    if (data.title && slug !== existing.slug) {
      const dupe = await this.prisma.tour.findFirst({ where: { tenantId, slug, id: { not: id } } });
      if (dupe) throw new ConflictException('A tour with this title already exists');
    }

    return this.prisma.tour.update({
      where: { id },
      data: {
        destinationId: data.destinationId,
        title: data.title,
        slug,
        description: data.description,
        highlights: data.highlights,
        inclusions: data.inclusions,
        exclusions: data.exclusions,
        price: data.price,
        salePrice: data.salePrice,
        currency: data.currency,
        duration: data.duration,
        maxGuests: data.maxGuests,
        difficulty: data.difficulty,
        tourType: data.tourType,
        startLocation: data.startLocation,
        endLocation: data.endLocation,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
      },
      include: { destination: true, images: true },
    });
  }

  async remove(id: string, tenantId: string) {
    const existing = await this.prisma.tour.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Tour not found');
    return this.prisma.tour.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
