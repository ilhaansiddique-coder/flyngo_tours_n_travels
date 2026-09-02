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

  private async resolveAdditionalIds(tenantId: string, addl: any[] | undefined, primaryId?: string): Promise<string[]> {
    const ids: string[] = [];
    for (const entry of Array.isArray(addl) ? addl : []) {
      const rawId = typeof entry === 'string' ? entry : entry?.id || entry?.destinationId;
      if (typeof rawId === 'string' && rawId && rawId !== primaryId && !ids.includes(rawId)) {
        ids.push(rawId);
        continue;
      }
      if (rawId) continue;
      const name = String(entry?.name || entry?.countryName || '').trim();
      if (!name) continue;
      const slug = slugify(name);
      const existing = await this.prisma.destination.findFirst({
        where: { tenantId, OR: [{ slug }, { name: { equals: name, mode: 'insensitive' } }] },
        select: { id: true },
      });
      const destId = existing?.id || (
        await this.prisma.destination.create({
          data: { tenantId, name, slug, country: name },
          select: { id: true },
        })
      ).id;
      if (destId !== primaryId && !ids.includes(destId)) ids.push(destId);
    }
    return ids;
  }

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
      (term) => ({
        additionalDestinations: {
          some: { destination: { name: { contains: term, mode: 'insensitive' } } },
        },
      }),
      (term) => ({ startLocation: { contains: term, mode: 'insensitive' } }),
      (term) => ({ endLocation: { contains: term, mode: 'insensitive' } }),
    ]);
    if (or) where.OR = or;
    const [items, total] = await Promise.all([
      this.prisma.tour.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { destination: true, images: true, additionalDestinations: { include: { destination: true } } },
        orderBy: orderByFor(filters.sort, 'price'),
      }),
      this.prisma.tour.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(identifier: string, tenantId: string) {
    const tour = await this.prisma.tour.findFirst({
      where: { AND: [{ tenantId }, { deletedAt: null }, { OR: [{ id: identifier }, { slug: identifier }] }] },
      include: {
        destination: true,
        images: true,
        itinerary: { orderBy: { day: 'asc' } },
        additionalDestinations: { include: { destination: true }, orderBy: { position: 'asc' } },
      },
    });
    if (!tour) throw new NotFoundException('Tour not found');
    return tour;
  }

  async create(tenantId: string, data: any) {
    const slug = slugify(data.title);
    const existing = await this.prisma.tour.findFirst({ where: { tenantId, slug } });
    if (existing) throw new ConflictException('A tour with this title already exists');

    const additionalIds = await this.resolveAdditionalIds(tenantId, data.additionalDestinationIds, data.destinationId);
    const primaryId = data.destinationId;
    const additionalIdsFiltered = additionalIds.filter((id) => id !== primaryId);

    return this.prisma.tour.create({
      data: {
        tenantId,
        destinationId: primaryId,
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
        additionalDestinations: {
          create: additionalIdsFiltered.map((destinationId, i) => ({
            tenantId,
            destinationId,
            position: i,
          })),
        },
      },
      include: { destination: true, images: true, additionalDestinations: { include: { destination: true } } },
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

    // Replace the set of additional destinations (fresh create, delete removed).
    let additionalUpdate: any = undefined;
    if (data.additionalDestinationIds !== undefined) {
      const primaryId = data.destinationId ?? existing.destinationId;
      const additionalIds = await this.resolveAdditionalIds(tenantId, data.additionalDestinationIds, primaryId);
      const ids = additionalIds
        .filter((did) => did !== primaryId)
        .map((did, i) => ({ tenantId, destinationId: did, position: i }));
      additionalUpdate = {
        deleteMany: {},
        create: ids,
      };
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
        ...(additionalUpdate ? { additionalDestinations: additionalUpdate } : {}),
      },
      include: { destination: true, images: true, additionalDestinations: { include: { destination: true } } },
    });
  }

  async remove(id: string, tenantId: string) {
    const existing = await this.prisma.tour.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Tour not found');
    return this.prisma.tour.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
