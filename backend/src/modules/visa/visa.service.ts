import { Injectable, NotFoundException, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { buildSearchOr } from '../../common/utils/search.util';

@Injectable()
export class VisaService implements OnModuleInit {
  private readonly logger = new Logger(VisaService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Reconciliation: every backend start ensures each active visa service's
   * country has a VisaCountry card so it shows up on the public /visa page.
   * This backfills services created before auto-create existed.
   */
  async onModuleInit() {
    try {
      const services = await this.prisma.visaService.findMany({
        where: { deletedAt: null },
        include: { country: true },
      });
      for (const s of services) {
        if (!s.country) continue;
        await this.ensureVisaCountry(s.tenantId, s.country.name, Number(s.price), s.currency, s.isActive);
      }
    } catch (err: any) {
      this.logger.warn(`Visa country reconciliation skipped: ${err.message}`);
    }
  }

  async getVisaServices(tenantId: string, q?: string, countrySlug?: string) {
    const where: any = { tenantId, deletedAt: null, isActive: true };
    const or = buildSearchOr(q, [
      (term) => ({ title: { contains: term, mode: 'insensitive' } }),
      (term) => ({ description: { contains: term, mode: 'insensitive' } }),
      (term) => ({ country: { name: { contains: term, mode: 'insensitive' } } }),
    ]);
    if (or) where.OR = or;
    if (countrySlug && countrySlug.trim()) {
      where.country = { slug: countrySlug.trim() };
    }
    return this.prisma.visaService.findMany({
      where,
      include: { country: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getVisaServiceById(id: string, tenantId: string) {
    const service = await this.prisma.visaService.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { country: true },
    });
    if (!service) throw new NotFoundException('Visa service not found');
    return service;
  }

  async create(tenantId: string, data: any) {
    const { destinationId } = await this.resolveCountry(tenantId, data);
    if (!destinationId) {
      throw new BadRequestException('A country / destination name is required');
    }

    // Ensure a VisaCountry exists so the product is visible on the public /visa
    // landing page and its country page can list this service.
    const destination = await this.prisma.destination.findUnique({ where: { id: destinationId } });
    if (destination) {
      await this.ensureVisaCountry(tenantId, destination.name, data.price, data.currency, data.isActive, destination.flagUrl);
    }

    return this.prisma.visaService.create({
      data: {
        tenantId,
        destinationId,
        title: data.title,
        description: data.description || '',
        processingTime: data.processingTime,
        price: data.price,
        currency: data.currency || 'USD',
        requirements: data.requirements || [],
        pointsAwarded: Number(data.pointsAwarded) || 0,
        isActive: data.isActive ?? true,
      },
      include: { country: true },
    });
  }

  async update(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.visaService.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Visa service not found');

    const { destinationId } = await this.resolveCountry(tenantId, data);

    const destination = destinationId
      ? await this.prisma.destination.findUnique({ where: { id: destinationId } })
      : null;
    if (destination) {
      await this.ensureVisaCountry(tenantId, destination.name, data.price, data.currency, data.isActive, destination.flagUrl);
    }

    return this.prisma.visaService.update({
      where: { id },
      data: {
        destinationId: destinationId ?? existing.destinationId,
        title: data.title,
        description: data.description,
        processingTime: data.processingTime,
        price: data.price,
        currency: data.currency,
        requirements: data.requirements,
        pointsAwarded: data.pointsAwarded === undefined ? undefined : Number(data.pointsAwarded) || 0,
        isActive: data.isActive,
      },
      include: { country: true },
    });
  }

  async remove(id: string, tenantId: string) {
    const existing = await this.prisma.visaService.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Visa service not found');
    return this.prisma.visaService.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private slugify(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /** Resolve destinationId from an explicit id or a typed-in country name
   *  (auto-creating the Destination when the country isn't in the system). */
  private async resolveCountry(tenantId: string, data: any): Promise<{ destinationId?: string }> {
    if (data.destinationId) return { destinationId: data.destinationId };
    const name = String(data.countryName || '').trim();
    if (!name) return {};

    const slug = this.slugify(name);
    const existing = await this.prisma.destination.findFirst({
      where: { tenantId, OR: [{ slug }, { name: { equals: name, mode: 'insensitive' } }] },
    });
    if (existing) return { destinationId: existing.id };

    const created = await this.prisma.destination.create({
      data: { tenantId, name, slug, country: name, continent: undefined, imageUrl: undefined, isFeatured: false },
    });
    return { destinationId: created.id };
  }

  /** Auto-create a VisaCountry (public landing card) for a service's country if
   *  it doesn't exist yet, so services always surface on the public site. */
  private async ensureVisaCountry(tenantId: string, name: string, price: number, currency: string, isActive: boolean, flagUrl?: string | null) {
    if (!name) return;
    const slug = this.slugify(name);
    const existing = await this.prisma.visaCountry.findFirst({
      where: { tenantId, OR: [{ slug }, { name: { equals: name, mode: 'insensitive' } }] },
    });
    if (existing) {
      // Backfill a missing flag so the public country card can show it.
      if (!existing.flagUrl && flagUrl) {
        await this.prisma.visaCountry.update({ where: { id: existing.id }, data: { flagUrl } });
      }
      return;
    }

    await this.prisma.visaCountry.create({
      data: {
        tenantId,
        name,
        slug,
        flagUrl: flagUrl || null,
        fee: Number(price) || 0,
        currency: currency || 'BDT',
        isActive: isActive !== false,
        visaTypes: [],
        requirements: [],
      },
    });
  }
}
