import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ALL_WORLD_PLACES, searchWorldPlaces } from '../../common/data/world-places';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

@Injectable()
export class DestinationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lightweight search for the country/destination autocomplete. Returns just
   * the fields the UI needs (id, name, slug, flag, country, continent) so the
   * dropdown can render a flag + name without over-fetching.
   */
  async searchAutocomplete(tenantId: string, q?: string, limit = 25, toursOnly = false) {
    const where: any = { tenantId, deletedAt: null };
    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { country: { contains: term, mode: 'insensitive' } },
      ];
    }
    if (toursOnly) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []),
        {
          OR: [
            // Primary destination of an active tour.
            { tours: { some: { deletedAt: null, isActive: true } } },
            // Additional destination linked to an active tour.
            { tourLinks: { some: { tour: { deletedAt: null, isActive: true } } } },
          ],
        },
      ];
    }
    const dbResults = await this.prisma.destination.findMany({
      where,
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        flagUrl: true,
        country: true,
        continent: true,
      },
    });

    if (toursOnly || !q || !q.trim()) {
      return dbResults;
    }

    // Blend in any world places (countries & cities) that match the search query
    const worldMatches = searchWorldPlaces(q, limit);
    const seenNames = new Set(dbResults.map((d) => d.name.toLowerCase()));
    const seenSlugs = new Set(dbResults.map((d) => d.slug.toLowerCase()));

    const combined = [...dbResults];
    for (const p of worldMatches) {
      if (combined.length >= limit) break;
      if (!seenNames.has(p.name.toLowerCase()) && !seenSlugs.has(p.slug.toLowerCase())) {
        seenNames.add(p.name.toLowerCase());
        seenSlugs.add(p.slug.toLowerCase());
        combined.push({
          id: p.id || '',
          name: p.name,
          slug: p.slug,
          flagUrl: p.flagUrl,
          country: p.country,
          continent: p.continent,
        });
      }
    }

    return combined;
  }

  /**
   * Derive a flag for a destination from its country. Looks for a sibling
   * destination row matching the country name (seeded for every ISO country)
   * and reuses its flag so city entries like "Bangkok" get the Thai flag.
   */
  private async resolveFlagUrl(tenantId: string, country?: string | null): Promise<string | null> {
    if (!country) return null;
    const match = await this.prisma.destination.findFirst({
      where: {
        tenantId,
        deletedAt: null,
        name: { equals: country, mode: 'insensitive' },
        flagUrl: { not: null },
      },
      select: { flagUrl: true },
    });
    return match?.flagUrl ?? null;
  }

  async resolve(tenantId: string, name: string) {
    const trimmed = String(name || '').trim();
    if (!trimmed) throw new BadRequestException('A country / destination name is required');

    const slug = slugify(trimmed);
    const existing = await this.prisma.destination.findFirst({
      where: { tenantId, OR: [{ slug }, { name: { equals: trimmed, mode: 'insensitive' } }] },
      select: { id: true, name: true, slug: true, flagUrl: true, country: true, continent: true },
    });
    if (existing) return existing;

    // Check if place exists in ALL_WORLD_PLACES
    const place = ALL_WORLD_PLACES.find(
      (p) =>
        p.name.toLowerCase() === trimmed.toLowerCase() ||
        p.slug === slug ||
        (p.cityName && p.cityName.toLowerCase() === trimmed.toLowerCase()),
    );

    const destName = place ? place.name : trimmed;
    const destSlug = place ? place.slug : slug;
    const destCountry = place ? place.country : trimmed;
    const destContinent = place ? place.continent : undefined;
    const destFlag = place ? place.flagUrl : await this.resolveFlagUrl(tenantId, trimmed);

    // Guard against unique constraint on slug
    const existingBySlug = await this.prisma.destination.findFirst({
      where: { tenantId, slug: destSlug },
      select: { id: true, name: true, slug: true, flagUrl: true, country: true, continent: true },
    });
    if (existingBySlug) return existingBySlug;

    const created = await this.prisma.destination.create({
      data: {
        tenantId,
        name: destName,
        slug: destSlug,
        country: destCountry,
        continent: destContinent,
        flagUrl: destFlag,
      },
      select: { id: true, name: true, slug: true, flagUrl: true, country: true, continent: true },
    });
    return created;
  }

  async findAll(tenantId: string, page = 1, limit = 50, q?: string, toursOnly = false, featured = false) {
    const where: any = { tenantId, deletedAt: null };
    if (featured) where.isFeatured = true;
    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { country: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ];
    }
    if (toursOnly) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []),
        {
          OR: [
            { tours: { some: { deletedAt: null, isActive: true } } },
            { tourLinks: { some: { tour: { deletedAt: null, isActive: true } } } },
          ],
        },
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

  async findById(identifier: string, tenantId: string) {
    const dest = await this.prisma.destination.findFirst({
      where: { AND: [{ tenantId }, { OR: [{ id: identifier }, { slug: identifier }] }] },
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
        flagUrl: data.flagUrl ?? (await this.resolveFlagUrl(tenantId, data.country)),
        coverImageUrl: data.coverImageUrl,
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
        flagUrl: data.flagUrl,
        coverImageUrl: data.coverImageUrl,
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
