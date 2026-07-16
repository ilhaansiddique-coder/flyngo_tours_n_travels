import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSettings(tenantId: string) {
    return this.prisma.tenantSettings.findUnique({
      where: { tenantId },
    });
  }

  async getTenantById(id: string) {
    return this.prisma.tenant.findUnique({
      where: { id },
      include: { settings: true },
    });
  }

  async getTenantByDomain(domain: string) {
    return this.prisma.tenant.findFirst({
      where: { domain },
      include: { settings: true },
    });
  }

  async getAllPublicSettings() {
    const tenants = await this.prisma.tenant.findMany({
      where: { deletedAt: null, isActive: true },
      include: { settings: true },
    });

    return tenants.map((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      domain: tenant.domain,
      logo: tenant.settings?.logoUrl,
      favicon: tenant.settings?.faviconUrl,
      primaryColor: tenant.settings?.primaryColor,
    }));
  }
}
