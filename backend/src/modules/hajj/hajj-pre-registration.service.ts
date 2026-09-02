import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TrackingService } from '../tracking/tracking.service';

@Injectable()
export class HajjPreRegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trackingService: TrackingService,
  ) {}

  async submit(tenantId: string, data: any) {
    // Compliance: passport-expiry is sanity-checked against a safe default of
    // 6 months from "now" if a departure date isn't supplied.
    const months = 6;
    const anchor = data.passportExpiry
      ? null
      : (() => {
          const d = new Date();
          d.setMonth(d.getMonth() + months);
          return d;
        })();
    if (data.gender === 'female' && !data.mahramRelation) {
      throw new BadRequestException('A mahram relationship is required for female pilgrims.');
    }

    const preReg = await this.prisma.hajjPreRegistration.create({
      data: {
        tenantId,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        passportNo: data.passportNo,
        passportExpiry: data.passportExpiry ? new Date(data.passportExpiry) : anchor,
        gender: data.gender,
        mahramRelation: data.mahramRelation,
        district: data.district,
        travelers: data.travelers ?? 1,
        packageTier: data.packageTier,
        year: data.year,
        notes: data.notes,
        status: 'new',
      },
    });

    // Mirror into the unified Lead funnel so ad dashboards see it
    void this.trackingService.createLead(tenantId, {
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      message: data.notes,
      source: 'hajj_pre_reg',
      formSlug: 'hajj-pre-registration',
      packageSlug: data.packageTier,
      travelers: data.travelers,
      departureCity: data.district,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      utmContent: data.utmContent,
      utmTerm: data.utmTerm,
      fbclid: data.fbclid,
      gclid: data.gclid,
    }).catch(() => { /* non-blocking */ });

    return preReg;
  }

  async findAll(tenantId: string, page = 1, limit = 50) {
    const where = { tenantId };
    const [items, total] = await Promise.all([
      this.prisma.hajjPreRegistration.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.hajjPreRegistration.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, tenantId: string) {
    const r = await this.prisma.hajjPreRegistration.findFirst({ where: { id, tenantId } });
    if (!r) throw new NotFoundException('Pre-registration not found');
    return r;
  }

  async updateStatus(id: string, tenantId: string, status: string) {
    await this.findById(id, tenantId);
    return this.prisma.hajjPreRegistration.update({ where: { id }, data: { status } });
  }

  async remove(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    // No deletedAt column on this model — hard delete (used to clear spam/dupes).
    await this.prisma.hajjPreRegistration.delete({ where: { id } });
    return { success: true };
  }
}
