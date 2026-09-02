import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gateway credentials. These must never leave the server in readable form —
   * `GET /tenant/settings` is public, and even the admin view only ever sees a
   * mask, because there is no reason for a browser to hold a live secret key.
   */
  private static readonly SECRET_FIELDS = [
    'stripeSecretKey',
    'bkashApiKey',
    'nagadMerchantId',
    'sslcStoreId',
  ] as const;

  /** Anything a browser is allowed to read. Everything else is opt-in, not opt-out. */
  private static readonly PUBLIC_SELECT = {
    id: true,
    tenantId: true,
    logoUrl: true,
    faviconUrl: true,
    primaryColor: true,
    secondaryColor: true,
    companyName: true,
    companyEmail: true,
    companyPhone: true,
    companyAddress: true,
    defaultCurrency: true,
    defaultLanguage: true,
    timezone: true,
    // Publishable by design — it ships in the client bundle anyway.
    stripePublicKey: true,
    ga4Id: true,
    gtmId: true,
    metaPixelId: true,
    facebookUrl: true,
    instagramUrl: true,
    twitterUrl: true,
    youtubeUrl: true,
    bkashWalletNumber: true,
    bkashMerchantName: true,
    paymentInstructions: true,
  } as const;

  /** Used by the admin form to show "configured / not configured" without the value. */
  private static readonly MASK = '••••••••';

  async getSettings(tenantId: string) {
    return this.prisma.tenantSettings.findUnique({
      where: { tenantId },
      select: TenantService.PUBLIC_SELECT,
    });
  }

  /**
   * Admin view: same public fields, plus a masked placeholder for each secret so
   * staff can tell which gateways are configured. Sending the mask back
   * unchanged on save is a no-op (see updateSettings).
   */
  async getAdminSettings(tenantId: string) {
    const row = await this.prisma.tenantSettings.findUnique({ where: { tenantId } });
    if (!row) return null;
    const masked: Record<string, unknown> = await this.getSettings(tenantId) ?? {};
    for (const field of TenantService.SECRET_FIELDS) {
      masked[field] = row[field] ? TenantService.MASK : '';
      masked[`${field}Configured`] = Boolean(row[field]);
    }
    return masked;
  }

  async updateSettings(tenantId: string, data: any) {
    const payload = this.sanitizeSettingsInput(data);
    const existing = await this.prisma.tenantSettings.findUnique({ where: { tenantId } });
    if (!existing) {
      return this.getAdminSettings(
        (await this.prisma.tenantSettings.create({ data: { tenantId, ...payload } })).tenantId,
      );
    }
    await this.prisma.tenantSettings.update({ where: { tenantId }, data: payload });
    return this.getAdminSettings(tenantId);
  }

  /**
   * Only accept known columns (the old spread allowed mass assignment), and
   * treat an empty or still-masked secret as "leave it alone" so opening the
   * settings form and hitting Save cannot silently wipe live gateway keys.
   */
  private sanitizeSettingsInput(data: any): Record<string, unknown> {
    if (!data || typeof data !== 'object') return {};
    const allowed = [
      ...Object.keys(TenantService.PUBLIC_SELECT).filter((k) => k !== 'id' && k !== 'tenantId'),
      ...TenantService.SECRET_FIELDS,
    ];
    const out: Record<string, unknown> = {};
    for (const key of allowed) {
      if (!(key in data)) continue;
      const value = data[key];
      if ((TenantService.SECRET_FIELDS as readonly string[]).includes(key)) {
        if (value === undefined || value === null || value === '' || value === TenantService.MASK) continue;
      }
      out[key] = value;
    }
    return out;
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
