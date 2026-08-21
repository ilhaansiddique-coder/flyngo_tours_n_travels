import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '../../config/config.service';
import * as crypto from 'crypto';

interface TrackPayload {
  eventName: string;
  eventId?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  value?: number;
  currency?: string;
  items?: any[];
  contentName?: string;
  contentIds?: string[];
  email?: string;
  phone?: string;
  fullName?: string;
  externalId?: string;
}

interface LeadPayload {
  fullName: string;
  phone: string;
  email?: string;
  message?: string;
  source?: string;
  campaign?: string;
  formSlug?: string;
  packageSlug?: string;
  travelers?: number;
  departureCity?: string;
  budget?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  fbclid?: string;
  gclid?: string;
}

const ALLOWED_EVENTS = new Set([
  'page_view',
  'view_item',
  'view_item_list',
  'search',
  'add_to_cart',
  'add_to_wishlist',
  'initiate_checkout',
  'add_payment_info',
  'purchase',
  'lead',
  'complete_registration',
  'contact',
  'submit_application',
  'subscribe',
]);

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // ===========================================================================
  // Settings (per-tenant credentials)
  // ===========================================================================

  async getSettings(tenantId: string) {
    let s = await this.prisma.trackingSettings.findUnique({ where: { tenantId } });
    if (!s) s = await this.prisma.trackingSettings.create({ data: { tenantId } });
    // Strip secrets before returning to admin UI (write-only on frontend)
    return {
      ...s,
      metaCapiToken: s.metaCapiToken ? '••••••••' + s.metaCapiToken.slice(-4) : null,
      ga4ApiSecret: s.ga4ApiSecret ? '••••••••' + s.ga4ApiSecret.slice(-4) : null,
    };
  }

  async getRawSettings(tenantId: string) {
    let s = await this.prisma.trackingSettings.findUnique({ where: { tenantId } });
    if (!s) s = await this.prisma.trackingSettings.create({ data: { tenantId } });
    return s;
  }

  async updateSettings(tenantId: string, body: any) {
    const data: any = { ...body };
    // Strip masked secrets so blank input doesn't overwrite real ones
    if (typeof data.metaCapiToken === 'string' && data.metaCapiToken.startsWith('••••••••')) {
      delete data.metaCapiToken;
    }
    if (typeof data.ga4ApiSecret === 'string' && data.ga4ApiSecret.startsWith('••••••••')) {
      delete data.ga4ApiSecret;
    }
    if (data.trustBadges && typeof data.trustBadges === 'string') {
      try { data.trustBadges = JSON.parse(data.trustBadges); } catch { data.trustBadges = []; }
    }

    return this.prisma.trackingSettings.upsert({
      where: { tenantId },
      update: data,
      create: { tenantId, ...data },
    });
  }

  // ===========================================================================
  // Public — settings required for client-side scripts to load
  // ===========================================================================

  async getPublicSettings(tenantId: string) {
    const s = await this.getRawSettings(tenantId);
    return {
      metaPixelId: s.metaPixelId,
      ga4MeasurementId: s.ga4MeasurementId,
      gtmContainerId: s.gtmContainerId,
      googleAdsConversionId: s.googleAdsConversionId,
      googleAdsConversionLabel: s.googleAdsConversionLabel,
      tiktokPixelId: s.tiktokPixelId,
      snapchatPixelId: s.snapchatPixelId,
      xPixelId: s.xPixelId,
      whatsappNumber: s.whatsappNumber,
      whatsappGreeting: s.whatsappGreeting,
      trustBadges: s.trustBadges ?? [],
      customerCount: s.customerCount,
      yearsInBusiness: s.yearsInBusiness,
    };
  }

  // ===========================================================================
  // Event ingest — used both by the client (browser) and server-side hooks
  // ===========================================================================

  async ingestEvent(tenantId: string, payload: TrackPayload) {
    if (!payload?.eventName) throw new BadRequestException('eventName required');
    if (!ALLOWED_EVENTS.has(payload.eventName)) {
      throw new BadRequestException(`Unsupported event: ${payload.eventName}`);
    }

    const eventId =
      payload.eventId || `${payload.eventName}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const stored = await this.prisma.trackingEvent.create({
      data: {
        tenantId,
        eventName: payload.eventName,
        source: 'web',
        eventId,
        userId: payload.userId,
        sessionId: payload.sessionId,
        url: payload.url,
        referrer: payload.referrer,
        utmSource: payload.utmSource,
        utmMedium: payload.utmMedium,
        utmCampaign: payload.utmCampaign,
        utmContent: payload.utmContent,
        utmTerm: payload.utmTerm,
        gclid: payload.gclid,
        fbclid: payload.fbclid,
        msclkid: payload.msclkid,
        value: payload.value,
        currency: payload.currency,
        items: payload.items ?? undefined,
        contentName: payload.contentName,
        contentIds: payload.contentIds ?? [],
      },
    });

    // Forward to Meta CAPI + GA4 Measurement Protocol (fire-and-forget)
    void this.forwardEvent(tenantId, stored.id);

    return { ok: true, eventId };
  }

  /** Server-side emit — called from BookingService etc. */
  async emitServerEvent(
    tenantId: string,
    eventName: string,
    payload: Partial<TrackPayload>,
  ) {
    if (!ALLOWED_EVENTS.has(eventName)) return;
    const eventId = payload.eventId || `${eventName}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    try {
      const stored = await this.prisma.trackingEvent.create({
        data: {
          tenantId,
          eventName,
          source: 'server',
          eventId,
          userId: payload.userId,
          sessionId: payload.sessionId,
          url: payload.url,
          utmSource: payload.utmSource,
          utmMedium: payload.utmMedium,
          utmCampaign: payload.utmCampaign,
          utmContent: payload.utmContent,
          utmTerm: payload.utmTerm,
          gclid: payload.gclid,
          fbclid: payload.fbclid,
          msclkid: payload.msclkid,
          value: payload.value,
          currency: payload.currency,
          contentName: payload.contentName,
          contentIds: payload.contentIds ?? [],
        },
      });
      void this.forwardEvent(tenantId, stored.id);
    } catch (err: any) {
      this.logger.warn(`Server event emit failed: ${err.message}`);
    }
  }

  /** Forward a stored event to Meta CAPI and GA4. */
  private async forwardEvent(tenantId: string, eventDbId: string) {
    const evt = await this.prisma.trackingEvent.findUnique({ where: { id: eventDbId } });
    if (!evt) return;
    const settings = await this.getRawSettings(tenantId);

    const errors: string[] = [];
    if (settings.metaCapiEnabled && settings.metaPixelId && settings.metaCapiToken) {
      try {
        await this.forwardToMetaCapi(evt, settings);
      } catch (err: any) {
        errors.push(`meta: ${err.message}`);
      }
    }
    if (settings.ga4MeasurementId && settings.ga4ApiSecret) {
      try {
        await this.forwardToGA4(evt, settings);
      } catch (err: any) {
        errors.push(`ga4: ${err.message}`);
      }
    }

    if (errors.length === 0) {
      await this.prisma.trackingEvent.update({
        where: { id: eventDbId },
        data: { forwardedAt: new Date(), failedAt: null, errorMsg: null },
      });
    } else {
      await this.prisma.trackingEvent.update({
        where: { id: eventDbId },
        data: { failedAt: new Date(), errorMsg: errors.join(' | ') },
      });
    }
  }

  private async forwardToMetaCapi(evt: any, settings: any) {
    const url = `https://graph.facebook.com/v18.0/${settings.metaPixelId}/events`;
    const payload = {
      data: [
        {
          event_name: evt.eventName,
          event_time: Math.floor(new Date(evt.createdAt).getTime() / 1000),
          event_id: evt.eventId,
          event_source_url: evt.url ?? undefined,
          action_source: 'website',
          user_data: {
            client_ip_address: undefined,
            client_user_agent: evt.userAgent ?? undefined,
            fbc: evt.fbclid ? `fb.1.${Date.now()}.${evt.fbclid}` : undefined,
            fbp: undefined,
          },
          custom_data: {
            currency: evt.currency ?? 'USD',
            value: evt.value ? Number(evt.value) : undefined,
            content_name: evt.contentName ?? undefined,
            content_ids: evt.contentIds?.length ? evt.contentIds : undefined,
          },
        },
      ],
      ...(settings.metaCapiTestCode ? { test_event_code: settings.metaCapiTestCode } : {}),
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.metaCapiToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Meta CAPI ${res.status}: ${text.slice(0, 200)}`);
    }
  }

  private async forwardToGA4(evt: any, settings: any) {
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${settings.ga4MeasurementId}&api_secret=${settings.ga4ApiSecret}`;
    const payload = {
      client_id: evt.sessionId ?? evt.eventId,
      events: [
        {
          name: evt.eventName,
          params: {
            currency: evt.currency ?? 'USD',
            value: evt.value ? Number(evt.value) : undefined,
            campaign: evt.utmCampaign ?? undefined,
            source: evt.utmSource ?? undefined,
            medium: evt.utmMedium ?? undefined,
            content_name: evt.contentName ?? undefined,
            engagement_time_msec: 1,
          },
        },
      ],
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    // GA4 returns 204 on success; non-2xx is an error
    if (res.status >= 400) {
      const text = await res.text();
      throw new Error(`GA4 ${res.status}: ${text.slice(0, 200)}`);
    }
  }

  // ===========================================================================
  // Leads
  // ===========================================================================

  async createLead(tenantId: string, payload: LeadPayload) {
    if (!payload.fullName || !payload.phone) {
      throw new BadRequestException('fullName and phone are required');
    }

    // Resolve campaign from utmCampaign or explicit `campaign`
    const campaign = payload.campaign || payload.utmCampaign || null;

    const lead = await this.prisma.lead.create({
      data: {
        tenantId,
        fullName: payload.fullName,
        phone: payload.phone,
        email: payload.email,
        message: payload.message,
        source: payload.source ?? 'website',
        campaign,
        formSlug: payload.formSlug,
        packageSlug: payload.packageSlug,
        travelers: payload.travelers,
        departureCity: payload.departureCity,
        budget: payload.budget,
        utmSource: payload.utmSource,
        utmMedium: payload.utmMedium,
        utmCampaign: payload.utmCampaign,
        utmContent: payload.utmContent,
        utmTerm: payload.utmTerm,
        fbclid: payload.fbclid,
        gclid: payload.gclid,
      },
    });

    // Bump landing-page counter if applicable
    if (payload.formSlug) {
      await this.prisma.landingPage.updateMany({
        where: { tenantId, slug: payload.formSlug },
        data: { leads: { increment: 1 } },
      });
    }

    // Emit a "lead" server event so CAPI picks it up immediately (best EMQ)
    await this.emitServerEvent(tenantId, 'lead', {
      value: 0,
      contentName: payload.formSlug || 'lead_form',
      sessionId: lead.id,
    });

    return lead;
  }

  async listLeads(tenantId: string, status?: string) {
    return this.prisma.lead.findMany({
      where: { tenantId, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateLead(tenantId: string, id: string, body: { status?: string; assignedTo?: string; notes?: string }) {
    const lead = await this.prisma.lead.findFirst({ where: { id, tenantId } });
    if (!lead) throw new NotFoundException('Lead not found');
    return this.prisma.lead.update({
      where: { id },
      data: {
        status: body.status ?? lead.status,
        assignedTo: body.assignedTo ?? lead.assignedTo,
        notes: body.notes ?? lead.notes,
      },
    });
  }

  // ===========================================================================
  // Landing pages
  // ===========================================================================

  async listLandingPages(tenantId: string) {
    return this.prisma.landingPage.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLandingPage(tenantId: string, slug: string) {
    const page = await this.prisma.landingPage.findFirst({ where: { tenantId, slug, isActive: true } });
    if (!page) throw new NotFoundException('Landing page not found');
    // Bump visit counter (best-effort)
    await this.prisma.landingPage.update({ where: { id: page.id }, data: { visits: { increment: 1 } } });
    return page;
  }

  async getLandingPageAdmin(tenantId: string, slug: string) {
    const page = await this.prisma.landingPage.findFirst({ where: { tenantId, slug } });
    if (!page) throw new NotFoundException('Landing page not found');
    return page;
  }

  async createLandingPage(tenantId: string, body: any) {
    return this.prisma.landingPage.create({
      data: {
        tenantId,
        slug: body.slug,
        title: body.title,
        subtitle: body.subtitle,
        heroImage: body.heroImage,
        body: body.body,
        ctaLabel: body.ctaLabel,
        ctaHref: body.ctaHref,
        formSlug: body.formSlug,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        metaImage: body.metaImage,
        campaign: body.campaign,
        utmSource: body.utmSource,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
        isActive: body.isActive ?? true,
      },
    });
  }

  async updateLandingPage(tenantId: string, id: string, body: any) {
    const page = await this.prisma.landingPage.findFirst({ where: { id, tenantId } });
    if (!page) throw new NotFoundException('Landing page not found');
    return this.prisma.landingPage.update({
      where: { id },
      data: {
        slug: body.slug,
        title: body.title,
        subtitle: body.subtitle,
        heroImage: body.heroImage,
        body: body.body,
        ctaLabel: body.ctaLabel,
        ctaHref: body.ctaHref,
        formSlug: body.formSlug,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        metaImage: body.metaImage,
        campaign: body.campaign,
        utmSource: body.utmSource,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
        isActive: body.isActive,
      },
    });
  }

  async deleteLandingPage(tenantId: string, id: string) {
    const page = await this.prisma.landingPage.findFirst({ where: { id, tenantId } });
    if (!page) throw new NotFoundException('Landing page not found');
    return this.prisma.landingPage.delete({ where: { id } });
  }

  // ===========================================================================
  // Stats / dashboard
  // ===========================================================================

  async getEventStats(tenantId: string, days = 30) {
    const since = new Date(Date.now() - days * 86_400_000);
    const events = await this.prisma.trackingEvent.groupBy({
      by: ['eventName'],
      where: { tenantId, createdAt: { gte: since } },
      _count: { _all: true },
    });

    const campaigns = await this.prisma.trackingEvent.groupBy({
      by: ['utmCampaign'],
      where: { tenantId, createdAt: { gte: since }, utmCampaign: { not: null } },
      _count: { _all: true },
      _sum: { value: true },
    });

    const forwardStatus = await this.prisma.trackingEvent.groupBy({
      by: ['source'],
      where: { tenantId, createdAt: { gte: since } },
      _count: { _all: true },
    });

    return {
      byEvent: events.map((e) => ({ name: e.eventName, count: e._count._all })),
      byCampaign: campaigns
        .map((c) => ({ campaign: c.utmCampaign, count: c._count._all, revenue: c._sum.value ? Number(c._sum.value) : 0 }))
        .sort((a, b) => b.count - a.count),
      bySource: forwardStatus.map((f) => ({ source: f.source, count: f._count._all })),
    };
  }

  // ===========================================================================
  // UTM extraction helper
  // ===========================================================================

  extractUtmFromQuery(q: Record<string, any>) {
    const get = (k: string) => (q[k] ? String(q[k]).slice(0, 200) : undefined);
    return {
      utmSource: get('utm_source'),
      utmMedium: get('utm_medium'),
      utmCampaign: get('utm_campaign'),
      utmContent: get('utm_content'),
      utmTerm: get('utm_term'),
      gclid: get('gclid'),
      fbclid: get('fbclid'),
      msclkid: get('msclkid'),
    };
  }
}
