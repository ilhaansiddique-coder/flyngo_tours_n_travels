import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

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
    return this.prisma.destination.findMany({
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
  }

  /**
   * Resolve a country/destination by name. If it already exists (matched on
   * name or slug, case-insensitive) it is returned; otherwise a new Destination
   * is auto-created so the typed value is never lost. Used by the autocomplete
   * "create if not found" behaviour.
   */
  async resolve(tenantId: string, name: string) {
    const trimmed = String(name || '').trim();
    if (!trimmed) throw new BadRequestException('A country / destination name is required');

    const slug = slugify(trimmed);
    const existing = await this.prisma.destination.findFirst({
      where: { tenantId, OR: [{ slug }, { name: { equals: trimmed, mode: 'insensitive' } }] },
      select: { id: true, name: true, slug: true, flagUrl: true, country: true, continent: true },
    });
    if (existing) return existing;

    const created = await this.prisma.destination.create({
      data: { tenantId, name: trimmed, slug, country: trimmed },
      select: { id: true, name: true, slug: true, flagUrl: true, country: true, continent: true },
    });
    return created;
  }

  async findAll(tenantId: string, page = 1, limit = 50, q?: string, toursOnly = false) {
    const where: any = { tenantId, deletedAt: null };
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
        flagUrl: data.flagUrl,
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
