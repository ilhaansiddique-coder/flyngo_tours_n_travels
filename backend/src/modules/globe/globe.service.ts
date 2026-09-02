import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface GlobeCityInput {
  nameEn: string;
  nameBn?: string;
  lat: number;
  lon: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface GlobeRouteInput {
  fromCityId: string;
  toCityId: string;
  isActive?: boolean;
  sortOrder?: number;
}

export const DEFAULT_CITIES: GlobeCityInput[] = [
  { nameEn: 'New York',     nameBn: 'নিউ ইয়র্ক',     lat: 40.71,  lon: -74.01,  sortOrder: 0 },
  { nameEn: 'London',       nameBn: 'লন্ডন',          lat: 51.51,  lon: -0.13,   sortOrder: 1 },
  { nameEn: 'Dubai',        nameBn: 'দুবাই',          lat: 25.20,  lon: 55.27,   sortOrder: 2 },
  { nameEn: 'Singapore',    nameBn: 'সিঙ্গাপুর',      lat: 1.35,   lon: 103.82,  sortOrder: 3 },
  { nameEn: 'Tokyo',        nameBn: 'টোকিও',          lat: 35.68,  lon: 139.69,  sortOrder: 4 },
  { nameEn: 'São Paulo',    nameBn: 'সাও পাওলো',     lat: -23.55, lon: -46.63,  sortOrder: 5 },
  { nameEn: 'Lagos',        nameBn: 'লাগোস',          lat: 6.52,   lon: 3.38,    sortOrder: 6 },
  { nameEn: 'Sydney',       nameBn: 'সিডনি',          lat: -33.87, lon: 151.21,  sortOrder: 7 },
  { nameEn: 'Mumbai',       nameBn: 'মুম্বাই',         lat: 19.08,  lon: 72.88,   sortOrder: 8 },
  { nameEn: 'Frankfurt',    nameBn: 'ফ্রাঙ্কফুর্ট',    lat: 50.11,  lon: 8.68,    sortOrder: 9 },
  { nameEn: 'San Francisco',nameBn: 'সান ফ্রান্সিসকো', lat: 37.77, lon: -122.42, sortOrder: 10 },
  { nameEn: 'Nairobi',      nameBn: 'নাইরোবি',        lat: -1.29,  lon: 36.82,   sortOrder: 11 },
];

export const DEFAULT_ROUTES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 10], [10, 4],
  [1, 6], [6, 11], [2, 8], [8, 3], [5, 1], [3, 7], [9, 2], [0, 5],
];

@Injectable()
export class GlobeService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(tenantId: string) {
    const [cities, routes] = await Promise.all([
      this.prisma.globeCity.findMany({
        where: { tenantId, deletedAt: null, isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.globeRoute.findMany({
        where: { tenantId, deletedAt: null, isActive: true },
        include: { fromCity: true, toCity: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      }),
    ]);

    if (cities.length === 0) {
      await this.seedDefaults(tenantId);
      return this.listPublic(tenantId);
    }

    return { cities, routes };
  }

  async listCities(tenantId: string, includeDeleted = false) {
    return this.prisma.globeCity.findMany({
      where: { tenantId, ...(includeDeleted ? {} : { deletedAt: null }) },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async listRoutes(tenantId: string, includeDeleted = false) {
    return this.prisma.globeRoute.findMany({
      where: { tenantId, ...(includeDeleted ? {} : { deletedAt: null }) },
      include: { fromCity: true, toCity: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async createCity(tenantId: string, data: GlobeCityInput) {
    if (!data.nameEn?.trim()) throw new BadRequestException('nameEn is required');
    if (typeof data.lat !== 'number' || typeof data.lon !== 'number') {
      throw new BadRequestException('lat and lon must be numbers');
    }
    const dupe = await this.prisma.globeCity.findFirst({
      where: { tenantId, nameEn: data.nameEn, deletedAt: null },
    });
    if (dupe) throw new ConflictException(`City "${data.nameEn}" already exists`);
    return this.prisma.globeCity.create({
      data: {
        tenantId,
        nameEn: data.nameEn.trim(),
        nameBn: data.nameBn?.trim() || null,
        lat: data.lat,
        lon: data.lon,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async updateCity(id: string, tenantId: string, data: Partial<GlobeCityInput>) {
    const existing = await this.prisma.globeCity.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('City not found');
    return this.prisma.globeCity.update({
      where: { id },
      data: {
        nameEn: data.nameEn?.trim() ?? undefined,
        nameBn: data.nameBn?.trim() ?? undefined,
        lat: data.lat,
        lon: data.lon,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });
  }

  async removeCity(id: string, tenantId: string) {
    const existing = await this.prisma.globeCity.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('City not found');
    return this.prisma.globeCity.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async createRoute(tenantId: string, data: GlobeRouteInput) {
    if (!data.fromCityId || !data.toCityId) {
      throw new BadRequestException('fromCityId and toCityId are required');
    }
    if (data.fromCityId === data.toCityId) {
      throw new BadRequestException('A route cannot connect a city to itself');
    }
    const [from, to] = await Promise.all([
      this.prisma.globeCity.findFirst({ where: { id: data.fromCityId, tenantId } }),
      this.prisma.globeCity.findFirst({ where: { id: data.toCityId, tenantId } }),
    ]);
    if (!from || !to) throw new NotFoundException('One or both cities not found');
    const dupe = await this.prisma.globeRoute.findFirst({
      where: {
        tenantId,
        fromCityId: data.fromCityId,
        toCityId: data.toCityId,
        deletedAt: null,
      },
    });
    if (dupe) throw new ConflictException('This route already exists');
    return this.prisma.globeRoute.create({
      data: {
        tenantId,
        fromCityId: data.fromCityId,
        toCityId: data.toCityId,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
      include: { fromCity: true, toCity: true },
    });
  }

  async updateRoute(id: string, tenantId: string, data: Partial<GlobeRouteInput>) {
    const existing = await this.prisma.globeRoute.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Route not found');
    return this.prisma.globeRoute.update({
      where: { id },
      data: {
        fromCityId: data.fromCityId,
        toCityId: data.toCityId,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
      include: { fromCity: true, toCity: true },
    });
  }

  async removeRoute(id: string, tenantId: string) {
    const existing = await this.prisma.globeRoute.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Route not found');
    return this.prisma.globeRoute.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async seedDefaults(tenantId: string) {
    const existing = await this.prisma.globeCity.count({ where: { tenantId, deletedAt: null } });
    if (existing > 0) return;
    const created = await Promise.all(
      DEFAULT_CITIES.map((c) =>
        this.prisma.globeCity.create({
          data: {
            tenantId,
            nameEn: c.nameEn,
            nameBn: c.nameBn,
            lat: c.lat,
            lon: c.lon,
            sortOrder: c.sortOrder,
            isActive: true,
          },
        }),
      ),
    );
    await Promise.all(
      DEFAULT_ROUTES.map(([a, b]) =>
        this.prisma.globeRoute.create({
          data: {
            tenantId,
            fromCityId: created[a].id,
            toCityId: created[b].id,
            isActive: true,
          },
        }),
      ),
    );
  }
}
