import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSettings(tenantId: string) {
    return this.prisma.tenantSettings.findUnique({ where: { tenantId } });
  }

  async updateSettings(tenantId: string, data: any) {
    const existing = await this.prisma.tenantSettings.findUnique({ where: { tenantId } });
    if (!existing) {
      return this.prisma.tenantSettings.create({ data: { tenantId, ...data } });
    }
    return this.prisma.tenantSettings.update({ where: { tenantId }, data });
  }

  async getTenantById(id: string) {
    return this.prisma.tenant.findUnique({ where: { id }, include: { settings: true } });
  }

  async getTenantByDomain(domain: string) {
    return this.prisma.tenant.findFirst({ where: { domain }, include: { settings: true } });
  }

  async getAllPublicSettings() {
    const tenants = await this.prisma.tenant.findMany({
      where: { deletedAt: null, isActive: true },
      include: { settings: true },
    });
    return tenants.map((t) => ({
      id: t.id, name: t.name, domain: t.domain,
      logo: t.settings?.logoUrl, favicon: t.settings?.faviconUrl, primaryColor: t.settings?.primaryColor,
    }));
  }
}
