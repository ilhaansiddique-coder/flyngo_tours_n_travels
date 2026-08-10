import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class VisaService {
  constructor(private readonly prisma: PrismaService) {}

  async getVisaServices(tenantId: string, q?: string) {
    const where: any = { tenantId, deletedAt: null, isActive: true };
    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { country: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }
    return this.prisma.visaService.findMany({
      where,
      include: { country: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getVisaServiceById(id: string, tenantId: string) {
    const service = await this.prisma.visaService.findFirst({
      where: { id, tenantId },
      include: { country: true },
    });
    if (!service) throw new NotFoundException('Visa service not found');
    return service;
  }

  async create(tenantId: string, data: any) {
    return this.prisma.visaService.create({
      data: {
        tenantId,
        destinationId: data.destinationId,
        title: data.title,
        description: data.description || '',
        processingTime: data.processingTime,
        price: data.price,
        currency: data.currency || 'USD',
        requirements: data.requirements || [],
        isActive: data.isActive ?? true,
      },
      include: { country: true },
    });
  }

  async update(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.visaService.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Visa service not found');

    return this.prisma.visaService.update({
      where: { id },
      data: {
        destinationId: data.destinationId,
        title: data.title,
        description: data.description,
        processingTime: data.processingTime,
        price: data.price,
        currency: data.currency,
        requirements: data.requirements,
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
}
