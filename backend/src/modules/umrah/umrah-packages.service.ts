import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { buildSearchOr } from '../../common/utils/search.util';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

@Injectable()
export class UmrahPackagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 20, q?: string) {
    const where: any = { tenantId, deletedAt: null };
    const or = buildSearchOr(q, [
      (term) => ({ title: { contains: term, mode: 'insensitive' } }),
      (term) => ({ addOnCity: { contains: term, mode: 'insensitive' } }),
    ]);
    if (or) where.OR = or;
    const [items, total] = await Promise.all([
      this.prisma.umrahPackage.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.umrahPackage.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findActive(tenantId: string) {
    return this.prisma.umrahPackage.findMany({
      where: { tenantId, deletedAt: null, isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findById(id: string, tenantId: string) {
    const pkg = await this.prisma.umrahPackage.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!pkg) throw new NotFoundException('Umrah package not found');
    return pkg;
  }

  async create(tenantId: string, data: any) {
    const slug = slugify(data.title);
    const existing = await this.prisma.umrahPackage.findFirst({ where: { tenantId, slug } });
    if (existing) throw new ConflictException('An umrah package with this title already exists');
    return this.prisma.umrahPackage.create({
      data: {
        tenantId,
        title: data.title,
        slug,
        durationDays: data.durationDays,
        price: data.price,
        currency: data.currency || 'BDT',
        makkahNights: data.makkahNights ?? 0,
        madinahNights: data.madinahNights ?? 0,
        addOnCity: data.addOnCity,
        inclusions: data.inclusions ?? [],
        highlights: data.highlights ?? [],
        imageUrl: data.imageUrl,
        coverImageUrl: data.coverImageUrl,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        order: data.order ?? 0,
        pointsAwarded: Number(data.pointsAwarded) || 0,
        // Seat inventory — 0 = unlimited (bookable without a cap).
        totalSeats: Number(data.totalSeats) || 0,
        seatsBooked: 0,
      },
    });
  }

  async update(id: string, tenantId: string, data: any) {
    await this.findById(id, tenantId);
    return this.prisma.umrahPackage.update({
      where: { id },
      data: {
        title: data.title,
        durationDays: data.durationDays,
        price: data.price,
        currency: data.currency,
        makkahNights: data.makkahNights,
        madinahNights: data.madinahNights,
        addOnCity: data.addOnCity,
        inclusions: data.inclusions,
        highlights: data.highlights,
        imageUrl: data.imageUrl,
        coverImageUrl: data.coverImageUrl,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        order: data.order,
        pointsAwarded: data.pointsAwarded === undefined ? undefined : Number(data.pointsAwarded) || 0,
        totalSeats: data.totalSeats === undefined ? undefined : Number(data.totalSeats) || 0,
        seatsBooked: data.seatsBooked === undefined ? undefined : Number(data.seatsBooked) || 0,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    return this.prisma.umrahPackage.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
