import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { buildSearchOr } from '../../common/utils/search.util';
import { ListQueryDto, orderByFor, priceRange } from '../../common/dto/list-query.dto';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

@Injectable()
export class ToursService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 20, q?: string, filters: ListQueryDto = {}) {
    const where: any = { tenantId, deletedAt: null };

    // Price filtering targets `price`, the list price every tour has.
    // salePrice is nullable, so filtering on it would silently drop every tour
    // that isn't discounted.
    const price = priceRange(filters.minPrice, filters.maxPrice);
    if (price) where.price = price;

    const duration = priceRange(filters.minDuration, filters.maxDuration);
    if (duration) where.duration = duration;

    if (filters.difficulty) where.difficulty = filters.difficulty;

    // destination.country is included so "Bangkok, Thailand" still finds the
    // tour via its country when the city half doesn't match.
    const or = buildSearchOr(q, [
      (term) => ({ title: { contains: term, mode: 'insensitive' } }),
      (term) => ({ description: { contains: term, mode: 'insensitive' } }),
      (term) => ({ destination: { name: { contains: term, mode: 'insensitive' } } }),
      (term) => ({ destination: { country: { contains: term, mode: 'insensitive' } } }),
      (term) => ({ startLocation: { contains: term, mode: 'insensitive' } }),
      (term) => ({ endLocation: { contains: term, mode: 'insensitive' } }),
    ]);
    if (or) where.OR = or;
    const [items, total] = await Promise.all([
      this.prisma.tour.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { destination: true, images: true },
        orderBy: orderByFor(filters.sort, 'price'),
      }),
      this.prisma.tour.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(identifier: string, tenantId: string) {
    const tour = await this.prisma.tour.findFirst({
      where: { AND: [{ tenantId }, { deletedAt: null }, { OR: [{ id: identifier }, { slug: identifier }] }] },
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
        coverImageUrl: data.coverImageUrl,
        pointsAwarded: Number(data.pointsAwarded) || 0,
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
        coverImageUrl: data.coverImageUrl,
        pointsAwarded: data.pointsAwarded === undefined ? undefined : Number(data.pointsAwarded) || 0,
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
