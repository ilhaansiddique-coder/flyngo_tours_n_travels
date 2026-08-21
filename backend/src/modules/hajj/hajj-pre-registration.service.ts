import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TrackingService } from '../tracking/tracking.service';

@Injectable()
export class HajjPreRegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trackingService: TrackingService,
  ) {}

  async submit(tenantId: string, data: any) {
    const preReg = await this.prisma.hajjPreRegistration.create({
      data: {
        tenantId,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        passportNo: data.passportNo,
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
}
