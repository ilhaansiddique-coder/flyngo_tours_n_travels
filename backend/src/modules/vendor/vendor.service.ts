import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CreateVendorSubmissionDto {
  vendorName: string;
  serviceName: string;
  doneDate: string | Date;
  amount?: number | null;
  currency?: string;
  reference?: string;
  notes?: string;
  status?: string;
  vendorEmail?: string;
  vendorPhone?: string;
}

@Injectable()
export class VendorService {
  private readonly logger = new Logger(VendorService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listVendors(tenantId: string) {
    try {
      const vendors = await (this.prisma as any).vendor.findMany({
        where: { tenantId, deletedAt: null },
        include: {
          _count: {
            select: { submissions: true },
          },
        },
        orderBy: { name: 'asc' },
      });
      return vendors;
    } catch (err: any) {
      this.logger.warn(`Failed to list vendors from DB: ${err.message}`);
      return [];
    }
  }

  async listSubmissions(tenantId: string, q?: string, vendorId?: string, page = 1, limit = 50) {
    try {
      const where: any = { tenantId, deletedAt: null };
      if (vendorId) {
        where.vendorId = vendorId;
      }
      if (q) {
        const needle = q.trim();
        where.OR = [
          { serviceName: { contains: needle, mode: 'insensitive' } },
          { reference: { contains: needle, mode: 'insensitive' } },
          { notes: { contains: needle, mode: 'insensitive' } },
          { vendor: { name: { contains: needle, mode: 'insensitive' } } },
        ];
      }

      const [items, total] = await Promise.all([
        (this.prisma as any).vendorSubmission.findMany({
          where,
          include: { vendor: true },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { doneDate: 'desc' },
        }),
        (this.prisma as any).vendorSubmission.count({ where }),
      ]);

      return {
        items,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    } catch (err: any) {
      this.logger.warn(`Failed to list vendor submissions: ${err.message}`);
      return {
        items: [],
        meta: { page, limit, total: 0, totalPages: 0 },
      };
    }
  }

  async createSubmission(tenantId: string, dto: CreateVendorSubmissionDto) {
    try {
      const rawVendorName = dto.vendorName?.trim();
      if (!rawVendorName) {
        throw new Error('Vendor name is required');
      }
      if (!dto.serviceName?.trim()) {
        throw new Error('Service name is required');
      }

      // Check if vendor already exists (case-insensitive name match)
      let vendor = await (this.prisma as any).vendor.findFirst({
        where: {
          tenantId,
          name: { equals: rawVendorName, mode: 'insensitive' },
          deletedAt: null,
        },
      });

      // If vendor is new, create the vendor at the same time
      if (!vendor) {
        this.logger.log(`Auto-creating new vendor "${rawVendorName}" for tenant "${tenantId}"`);
        vendor = await (this.prisma as any).vendor.create({
          data: {
            tenantId,
            name: rawVendorName,
            email: dto.vendorEmail?.trim() || null,
            phone: dto.vendorPhone?.trim() || null,
            serviceType: dto.serviceName?.trim() || null,
          },
        });
      }

      const doneDate = dto.doneDate ? new Date(dto.doneDate) : new Date();

      const submission = await (this.prisma as any).vendorSubmission.create({
        data: {
          tenantId,
          vendorId: vendor.id,
          serviceName: dto.serviceName.trim(),
          doneDate,
          status: dto.status || 'completed',
          amount: dto.amount != null && !isNaN(Number(dto.amount)) ? Number(dto.amount) : null,
          currency: dto.currency || 'BDT',
          reference: dto.reference?.trim() || null,
          notes: dto.notes?.trim() || null,
        },
        include: {
          vendor: true,
        },
      });

      return submission;
    } catch (err: any) {
      this.logger.error(`Error creating vendor submission: ${err.message}`);
      throw err;
    }
  }

  async updateSubmission(tenantId: string, id: string, dto: Partial<CreateVendorSubmissionDto>) {
    try {
      const existing = await (this.prisma as any).vendorSubmission.findFirst({
        where: { id, tenantId, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException('Submission not found');
      }

      let vendorId = existing.vendorId;
      if (dto.vendorName && dto.vendorName.trim() !== '') {
        let v = await (this.prisma as any).vendor.findFirst({
          where: {
            tenantId,
            name: { equals: dto.vendorName.trim(), mode: 'insensitive' },
            deletedAt: null,
          },
        });
        if (!v) {
          v = await (this.prisma as any).vendor.create({
            data: {
              tenantId,
              name: dto.vendorName.trim(),
            },
          });
        }
        vendorId = v.id;
      }

      const updated = await (this.prisma as any).vendorSubmission.update({
        where: { id },
        data: {
          vendorId,
          serviceName: dto.serviceName ? dto.serviceName.trim() : undefined,
          doneDate: dto.doneDate ? new Date(dto.doneDate) : undefined,
          status: dto.status || undefined,
          amount: dto.amount !== undefined ? (dto.amount != null ? Number(dto.amount) : null) : undefined,
          currency: dto.currency || undefined,
          reference: dto.reference !== undefined ? dto.reference?.trim() || null : undefined,
          notes: dto.notes !== undefined ? dto.notes?.trim() || null : undefined,
        },
        include: {
          vendor: true,
        },
      });

      return updated;
    } catch (err: any) {
      this.logger.error(`Error updating vendor submission: ${err.message}`);
      throw err;
    }
  }

  async deleteSubmission(tenantId: string, id: string) {
    try {
      const existing = await (this.prisma as any).vendorSubmission.findFirst({
        where: { id, tenantId },
      });
      if (!existing) {
        throw new NotFoundException('Submission not found');
      }

      await (this.prisma as any).vendorSubmission.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return { success: true };
    } catch (err: any) {
      this.logger.error(`Error deleting vendor submission: ${err.message}`);
      throw err;
    }
  }

  async deleteVendor(tenantId: string, id: string) {
    try {
      const existing = await (this.prisma as any).vendor.findFirst({
        where: { id, tenantId },
      });
      if (!existing) {
        throw new NotFoundException('Vendor not found');
      }

      await (this.prisma as any).vendor.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return { success: true };
    } catch (err: any) {
      this.logger.error(`Error deleting vendor: ${err.message}`);
      throw err;
    }
  }
}
