import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class VisaService {
  constructor(private readonly prisma: PrismaService) {}

  async getVisaServices(tenantId: string) {
    return this.prisma.visaService.findMany({
      where: { tenantId, deletedAt: null, isActive: true },
      include: { country: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getVisaServiceById(id: string, tenantId: string) {
    return this.prisma.visaService.findFirst({
      where: { id, tenantId },
      include: { country: true },
    });
  }
}
