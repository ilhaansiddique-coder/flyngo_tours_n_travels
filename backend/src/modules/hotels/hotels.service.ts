import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { buildSearchOr } from '../../common/utils/search.util';
import { ListQueryDto, orderByFor, priceRange } from '../../common/dto/list-query.dto';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

@Injectable()
export class HotelsService {
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

    const price = priceRange(filters.minPrice, filters.maxPrice);
    if (price) where.pricePerNight = price;
    if (filters.minStars) where.starRating = { gte: filters.minStars };

    const or = buildSearchOr(q, [
      (term) => ({ name: { contains: term, mode: 'insensitive' } }),
      (term) => ({ description: { contains: term, mode: 'insensitive' } }),
      (term) => ({ address: { contains: term, mode: 'insensitive' } }),
      (term) => ({ destination: { name: { contains: term, mode: 'insensitive' } } }),
      (term) => ({ destination: { country: { contains: term, mode: 'insensitive' } } }),
      (term) => ({
        additionalDestinations: {
          some: { destination: { name: { contains: term, mode: 'insensitive' } } },
        },
      }),
    ]);
    if (or) where.OR = or;
    const [items, total] = await Promise.all([
      this.prisma.hotel.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          destination: true,
          images: true,
          rooms: true,
          additionalDestinations: { include: { destination: true } },
        },
        orderBy: orderByFor(filters.sort, 'pricePerNight'),
      }),
      this.prisma.hotel.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(identifier: string, tenantId: string) {
    const hotel = await this.prisma.hotel.findFirst({
      where: { AND: [{ tenantId }, { deletedAt: null }, { OR: [{ id: identifier }, { slug: identifier }] }] },
      include: {
        destination: true,
        images: true,
        rooms: true,
        additionalDestinations: { include: { destination: true }, orderBy: { position: 'asc' } },
      },
    });
    if (!hotel) throw new NotFoundException('Hotel not found');
    return hotel;
  }

  async create(tenantId: string, data: any) {
    const slug = slugify(data.name);
    const existing = await this.prisma.hotel.findFirst({ where: { tenantId, slug } });
    if (existing) throw new ConflictException('A hotel with this name already exists');

    const additionalIds = await this.resolveAdditionalIds(tenantId, data.additionalDestinationIds, data.destinationId);

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
        pointsAwarded: Number(data.pointsAwarded) || 0,
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
        additionalDestinations: {
          create: additionalIds.map((destinationId, i) => ({ tenantId, destinationId, position: i })),
        },
      },
      include: { destination: true, images: true, rooms: true, additionalDestinations: { include: { destination: true } } },
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

    let additionalUpdate: any = undefined;
    if (data.additionalDestinationIds !== undefined) {
      const primaryId = data.destinationId ?? existing.destinationId;
      const ids = (await this.resolveAdditionalIds(tenantId, data.additionalDestinationIds, primaryId))
        .filter((did) => did !== primaryId)
        .map((did, i) => ({ tenantId, destinationId: did, position: i }));
      additionalUpdate = { deleteMany: {}, create: ids };
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
        pointsAwarded: data.pointsAwarded === undefined ? undefined : Number(data.pointsAwarded) || 0,
        coverImageUrl: data.coverImageUrl,
        ...(additionalUpdate ? { additionalDestinations: additionalUpdate } : {}),
      },
      include: { destination: true, images: true, rooms: true, additionalDestinations: { include: { destination: true } } },
    });
  }

  async remove(id: string, tenantId: string) {
    const existing = await this.prisma.hotel.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Hotel not found');
    return this.prisma.hotel.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // ---- Room inventory (bookable units) --------------------------------------
  // Rooms are scoped to a hotel (no tenantId column); we authorize by verifying
  // the parent hotel belongs to the tenant. createHotelBooking requires a real
  // Room row, so without this CRUD hotel bookings can't be fulfilled.
  private async assertHotel(hotelId: string, tenantId: string) {
    const hotel = await this.prisma.hotel.findFirst({ where: { id: hotelId, tenantId, deletedAt: null } });
    if (!hotel) throw new NotFoundException('Hotel not found');
    return hotel;
  }

  async listRooms(hotelId: string, tenantId: string) {
    await this.assertHotel(hotelId, tenantId);
    const items = await this.prisma.room.findMany({
      where: { hotelId },
      orderBy: { pricePerNight: 'asc' },
    });
    return { items, meta: { total: items.length } };
  }

  async createRoom(hotelId: string, tenantId: string, data: any) {
    const hotel = await this.assertHotel(hotelId, tenantId);
    if (!data.name || data.pricePerNight == null) {
      throw new ConflictException('Room name and pricePerNight are required');
    }
    return this.prisma.room.create({
      data: {
        hotelId,
        name: data.name,
        description: data.description ?? null,
        pricePerNight: Number(data.pricePerNight) || 0,
        currency: data.currency || hotel.currency || 'USD',
        capacity: Number(data.capacity) || 2,
        available: Number(data.available) || 1,
        amenities: Array.isArray(data.amenities) ? data.amenities : [],
      },
    });
  }

  async updateRoom(hotelId: string, roomId: string, tenantId: string, data: any) {
    await this.assertHotel(hotelId, tenantId);
    const room = await this.prisma.room.findFirst({ where: { id: roomId, hotelId } });
    if (!room) throw new NotFoundException('Room not found');
    return this.prisma.room.update({
      where: { id: roomId },
      data: {
        name: data.name,
        description: data.description,
        pricePerNight: data.pricePerNight == null ? undefined : Number(data.pricePerNight) || 0,
        currency: data.currency,
        capacity: data.capacity == null ? undefined : Number(data.capacity) || 1,
        available: data.available == null ? undefined : Number(data.available) || 0,
        amenities: Array.isArray(data.amenities) ? data.amenities : undefined,
      },
    });
  }

  async deleteRoom(hotelId: string, roomId: string, tenantId: string) {
    await this.assertHotel(hotelId, tenantId);
    const room = await this.prisma.room.findFirst({ where: { id: roomId, hotelId } });
    if (!room) throw new NotFoundException('Room not found');
    await this.prisma.room.delete({ where: { id: roomId } });
    return { success: true };
  }
}
