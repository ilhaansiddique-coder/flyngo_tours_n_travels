import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

@Injectable()
export class HotelsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 20, q?: string) {
    const where: any = { tenantId, deletedAt: null };
    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { address: { contains: term, mode: 'insensitive' } },
        { destination: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.hotel.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { destination: true, images: true, rooms: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.hotel.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(identifier: string, tenantId: string) {
    const hotel = await this.prisma.hotel.findFirst({
      where: { AND: [{ tenantId }, { OR: [{ id: identifier }, { slug: identifier }] }] },
      include: { destination: true, images: true, rooms: true },
    });
    if (!hotel) throw new NotFoundException('Hotel not found');
    return hotel;
  }

  async create(tenantId: string, data: any) {
    const slug = slugify(data.name);
    const existing = await this.prisma.hotel.findFirst({ where: { tenantId, slug } });
    if (existing) throw new ConflictException('A hotel with this name already exists');

    return this.prisma.hotel.create({
      data: {
        tenantId,
        destinationId: data.destinationId,
        name: data.name,
        slug,
        description: data.description || '',
        starRating: data.starRating || 3,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        pricePerNight: data.pricePerNight,
        currency: data.currency || 'USD',
        amenities: data.amenities || [],
        checkInTime: data.checkInTime || '14:00',
        checkOutTime: data.checkOutTime || '12:00',
        isActive: data.isActive ?? true,
        coverImageUrl: data.coverImageUrl,
        rooms: data.rooms ? {
          create: data.rooms.map((r: any) => ({
            name: r.name,
            description: r.description,
            pricePerNight: r.pricePerNight,
            currency: r.currency || 'USD',
            capacity: r.capacity || 2,
            available: r.available || 1,
            amenities: r.amenities || [],
          })),
        } : undefined,
      },
      include: { destination: true, images: true, rooms: true },
    });
  }

  async update(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.hotel.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Hotel not found');

    const slug = data.name ? slugify(data.name) : existing.slug;
    if (data.name && slug !== existing.slug) {
      const dupe = await this.prisma.hotel.findFirst({ where: { tenantId, slug, id: { not: id } } });
      if (dupe) throw new ConflictException('A hotel with this name already exists');
    }

    return this.prisma.hotel.update({
      where: { id },
      data: {
        destinationId: data.destinationId,
        name: data.name,
        slug,
        description: data.description,
        starRating: data.starRating,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        pricePerNight: data.pricePerNight,
        currency: data.currency,
        amenities: data.amenities,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        isActive: data.isActive,
        coverImageUrl: data.coverImageUrl,
      },
      include: { destination: true, images: true, rooms: true },
    });
  }

  async remove(id: string, tenantId: string) {
    const existing = await this.prisma.hotel.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Hotel not found');
    return this.prisma.hotel.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
