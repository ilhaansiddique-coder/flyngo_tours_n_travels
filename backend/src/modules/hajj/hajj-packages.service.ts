import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

@Injectable()
export class HajjPackagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 20, q?: string) {
    const where: any = { tenantId, deletedAt: null };
    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { tier: { contains: term, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.hajjPackage.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.hajjPackage.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findActive(tenantId: string) {
    return this.prisma.hajjPackage.findMany({
      where: { tenantId, deletedAt: null, isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findBySlug(slug: string, tenantId: string) {
    const pkg = await this.prisma.hajjPackage.findFirst({
      where: { slug, tenantId, deletedAt: null },
    });
    if (!pkg) throw new NotFoundException('Hajj package not found');
    return pkg;
  }

  async findById(id: string, tenantId: string) {
    const pkg = await this.prisma.hajjPackage.findFirst({ where: { id, tenantId } });
    if (!pkg) throw new NotFoundException('Hajj package not found');
    return pkg;
  }

  /** Public-facing availability summary for a package. */
  async getAvailability(id: string, tenantId: string) {
    const pkg = await this.findById(id, tenantId);
    const remaining = Math.max(0, (pkg.totalSeats ?? 0) - (pkg.seatsBooked ?? 0));
    return {
      packageId: pkg.id,
      totalSeats: pkg.totalSeats,
      seatsBooked: pkg.seatsBooked,
      seatsRemaining: remaining,
      isSoldOut: remaining === 0 && pkg.totalSeats > 0,
      isLowStock: remaining > 0 && remaining <= 10,
      departureDate: pkg.departureDate,
      returnDate: pkg.returnDate,
      departureCities: pkg.departureCities,
      depositAmount: pkg.depositAmount,
      visaAmount: pkg.visaAmount,
      finalAmount: pkg.finalAmount,
    };
  }

  /** Reserve N seats; throws when sold out. */
  async reserveSeats(id: string, tenantId: string, seats: number) {
    if (seats <= 0) return;
    const pkg = await this.findById(id, tenantId);
    if (pkg.totalSeats > 0) {
      const remaining = Math.max(0, pkg.totalSeats - pkg.seatsBooked);
      if (seats > remaining) {
        throw new BadRequestException(
          `Only ${remaining} seat(s) remaining for this Hajj package`,
        );
      }
    }
    await this.prisma.hajjPackage.update({
      where: { id },
      data: { seatsBooked: { increment: seats } },
    });
  }

  async create(tenantId: string, data: any) {
    const slug = data.slug || slugify(data.title);
    const existing = await this.prisma.hajjPackage.findFirst({ where: { tenantId, slug } });
    if (existing) throw new ConflictException('A hajj package with this slug already exists');
    return this.prisma.hajjPackage.create({
      data: {
        tenantId,
        title: data.title,
        slug,
        tier: data.tier,
        durationDays: data.durationDays,
        price: data.price,
        currency: data.currency || 'BDT',
        makkahNights: data.makkahNights ?? 0,
        madinahNights: data.madinahNights ?? 0,
        inclusions: data.inclusions ?? [],
        highlights: data.highlights ?? [],
        imageUrl: data.imageUrl,
        coverImageUrl: data.coverImageUrl,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        order: data.order ?? 0,
        totalSeats: data.totalSeats ?? 0,
        seatsBooked: 0,
        depositAmount: data.depositAmount ?? 0,
        visaAmount: data.visaAmount ?? 0,
        finalAmount: data.finalAmount ?? 0,
        departureDate: data.departureDate ? new Date(data.departureDate) : null,
        returnDate: data.returnDate ? new Date(data.returnDate) : null,
        departureCities: data.departureCities ?? [],
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaImage: data.metaImage,
      },
    });
  }

  async update(id: string, tenantId: string, data: any) {
    await this.findById(id, tenantId);
    return this.prisma.hajjPackage.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        tier: data.tier,
        durationDays: data.durationDays,
        price: data.price,
        currency: data.currency,
        makkahNights: data.makkahNights,
        madinahNights: data.madinahNights,
        inclusions: data.inclusions,
        highlights: data.highlights,
        imageUrl: data.imageUrl,
        coverImageUrl: data.coverImageUrl,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        order: data.order,
        totalSeats: data.totalSeats,
        depositAmount: data.depositAmount,
        visaAmount: data.visaAmount,
        finalAmount: data.finalAmount,
        departureDate: data.departureDate ? new Date(data.departureDate) : undefined,
        returnDate: data.returnDate ? new Date(data.returnDate) : undefined,
        departureCities: data.departureCities,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaImage: data.metaImage,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    return this.prisma.hajjPackage.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
