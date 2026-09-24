import { Injectable, NotFoundException, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { buildSearchOr } from '../../common/utils/search.util';

function normalizeRequirements(input: any): string[] {
  if (!input) return [];
  const list = Array.isArray(input) ? input : [input];
  const items: string[] = [];
  for (const entry of list) {
    if (typeof entry !== 'string' || !entry.trim()) continue;
    const parts = entry
      .split(/(?:\r?\n)+|[•🔹▪▫‣⁃◆*]+|(?:\s*;\s*)|(?:\s*\|\s*)/u)
      .map((s) => s.replace(/^[-\s\u2022\u25aa\u25b6\u25c6\u2705\u2714\u2713]+/, '').trim())
      .filter(Boolean);
    items.push(...parts);
  }
  return Array.from(new Set(items));
}

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

  async getVisaServices(tenantId: string, q?: string, countrySlug?: string, all = false) {
    const where: any = { tenantId, deletedAt: null };
    if (!all) {
      where.isActive = true;
    }
    const or = buildSearchOr(q, [
      (term) => ({ title: { contains: term, mode: 'insensitive' } }),
      (term) => ({ titleBn: { contains: term, mode: 'insensitive' } }),
      (term) => ({ description: { contains: term, mode: 'insensitive' } }),
      (term) => ({ descriptionBn: { contains: term, mode: 'insensitive' } }),
      (term) => ({ country: { name: { contains: term, mode: 'insensitive' } } }),
      (term) => ({
        additionalDestinations: {
          some: { destination: { name: { contains: term, mode: 'insensitive' } } },
        },
      }),
    ]);
    if (or) where.OR = or;
    if (countrySlug && countrySlug.trim()) {
      where.OR = [
        ...(where.OR ? where.OR : []),
        { country: { slug: countrySlug.trim() } },
        { additionalDestinations: { some: { destination: { slug: countrySlug.trim() } } } },
      ];
    }
    return this.prisma.visaService.findMany({
      where,
      include: { country: true, additionalDestinations: { include: { destination: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getVisaServiceById(id: string, tenantId: string) {
    const service = await this.prisma.visaService.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        country: true,
        additionalDestinations: { include: { destination: true }, orderBy: { position: 'asc' } },
      },
    });
    if (!service) throw new NotFoundException('Visa service not found');
    return service;
  }

  async create(tenantId: string, data: any) {
    const { destinationId } = await this.resolveCountry(tenantId, data);
    if (!destinationId) {
      throw new BadRequestException('A country / destination name is required');
    }

    const requirements = normalizeRequirements(data.requirements);

    // Ensure a VisaCountry exists so the product is visible on the public /visa
    // landing page and its country page can list this service.
    const destination = await this.prisma.destination.findUnique({ where: { id: destinationId } });
    if (destination) {
      const countryName = destination.country || destination.name;
      await this.ensureVisaCountry(tenantId, countryName, data.price, data.currency, data.isActive, destination.flagUrl, requirements);
    }

    const additionalIds = await this.resolveAdditionalIds(tenantId, data.additionalDestinationIds, destinationId, data);
    const requirementsBn = data.requirementsBn !== undefined ? normalizeRequirements(data.requirementsBn) : [];

    return this.prisma.visaService.create({
      data: {
        tenantId,
        destinationId,
        title: data.title,
        titleBn: data.titleBn || null,
        description: data.description || '',
        descriptionBn: data.descriptionBn || null,
        processingTime: data.processingTime || null,
        processingTimeBn: data.processingTimeBn || null,
        price: data.price,
        currency: data.currency || 'USD',
        requirements,
        requirementsBn,
        pointsAwarded: Number(data.pointsAwarded) || 0,
        isActive: data.isActive ?? true,
        coverImageUrl: data.coverImageUrl || null,
        additionalDestinations: {
          create: additionalIds.map((did, i) => ({ tenantId, destinationId: did, position: i })),
        },
      },
      include: { country: true, additionalDestinations: { include: { destination: true } } },
    });
  }

  async update(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.visaService.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Visa service not found');

    const requirements = data.requirements !== undefined
      ? normalizeRequirements(data.requirements)
      : undefined;
    const requirementsBn = data.requirementsBn !== undefined
      ? normalizeRequirements(data.requirementsBn)
      : undefined;

    const { destinationId } = await this.resolveCountry(tenantId, data);

    const destination = destinationId
      ? await this.prisma.destination.findUnique({ where: { id: destinationId } })
      : null;
    if (destination) {
      const countryName = destination.country || destination.name;
      await this.ensureVisaCountry(tenantId, countryName, data.price, data.currency, data.isActive, destination.flagUrl, requirements);
    }

    const finalPrimary = destinationId ?? existing.destinationId;
    const additionalIds = await this.resolveAdditionalIds(tenantId, data.additionalDestinationIds, finalPrimary, data);

    return this.prisma.visaService.update({
      where: { id },
      data: {
        destinationId: finalPrimary,
        title: data.title,
        titleBn: data.titleBn !== undefined ? data.titleBn : undefined,
        description: data.description,
        descriptionBn: data.descriptionBn !== undefined ? data.descriptionBn : undefined,
        processingTime: data.processingTime,
        processingTimeBn: data.processingTimeBn !== undefined ? data.processingTimeBn : undefined,
        price: data.price,
        currency: data.currency,
        requirements,
        requirementsBn,
        pointsAwarded: data.pointsAwarded === undefined ? undefined : Number(data.pointsAwarded) || 0,
        isActive: data.isActive,
        coverImageUrl: data.coverImageUrl !== undefined ? data.coverImageUrl : undefined,
        ...(data.additionalDestinationIds !== undefined
          ? {
              additionalDestinations: {
                deleteMany: {},
                create: additionalIds.map((did, i) => ({ tenantId, destinationId: did, position: i })),
              },
            }
          : {}),
      },
      include: { country: true, additionalDestinations: { include: { destination: true } } },
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

  /** Resolve the additional (non-primary) destination ids. Each entry may be a
   *  destination id/object, or a raw country name that gets auto-created, and is
   *  uniqued against the primary destination. Also ensures a VisaCountry card. */
  private async resolveAdditionalIds(
    tenantId: string,
    addl: any[] | undefined,
    primaryId: string | undefined,
    data: any,
  ): Promise<string[]> {
    const ids: string[] = [];
    for (const entry of Array.isArray(addl) ? addl : []) {
      const id = typeof entry === 'string' ? entry : entry?.id || entry?.destinationId;
      if (typeof id === 'string' && id && id !== primaryId && !ids.includes(id)) {
        ids.push(id);
        continue;
      }
      if (id) continue; // exists but is the primary or a duplicate
      const name = String(entry?.name || entry?.countryName || '').trim();
      if (!name) continue;
      const { destinationId } = await this.resolveCountry(tenantId, { countryName: name });
      if (destinationId && destinationId !== primaryId && !ids.includes(destinationId)) {
        const dest = await this.prisma.destination.findUnique({ where: { id: destinationId } });
        if (dest) {
          const countryName = dest.country || dest.name;
          await this.ensureVisaCountry(tenantId, countryName, data.price, data.currency, data.isActive, dest.flagUrl);
        }
        ids.push(destinationId);
      }
    }
    return ids;
  }

  /** Auto-create a VisaCountry (public landing card) for a service's country if
   *  it doesn't exist yet, so services always surface on the public site. */
  private async ensureVisaCountry(
    tenantId: string,
    name: string,
    price: number,
    currency: string,
    isActive: boolean,
    flagUrl?: string | null,
    requirements?: string[],
  ) {
    if (!name) return;
    const slug = this.slugify(name);
    const existing = await this.prisma.visaCountry.findFirst({
      where: { tenantId, OR: [{ slug }, { name: { equals: name, mode: 'insensitive' } }] },
    });
    if (existing) {
      const updateData: any = {};
      if (!existing.flagUrl && flagUrl) updateData.flagUrl = flagUrl;
      if (Array.isArray(requirements) && requirements.length > 0) {
        const existingReqs = Array.isArray(existing.requirements) ? existing.requirements : [];
        const merged = Array.from(new Set([...existingReqs, ...requirements]));
        if (merged.length !== existingReqs.length) {
          updateData.requirements = merged;
        }
      }
      if (Object.keys(updateData).length > 0) {
        await this.prisma.visaCountry.update({ where: { id: existing.id }, data: updateData });
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
        requirements: Array.isArray(requirements) ? requirements : [],
      },
    });
  }
}
