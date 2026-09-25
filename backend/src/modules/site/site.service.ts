import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface FooterColumnLink {
  id: string;
  labelEn: string;
  labelBn?: string | null;
  translationKey?: string | null;
  href: string;
  linkType?: 'INTERNAL' | 'EXTERNAL' | 'SECTION';
  openInNewTab?: boolean;
}

export interface FooterColumn {
  id: string;
  headingEn: string;
  headingBn?: string | null;
  translationKey?: string | null;
  order: number;
  isVisible?: boolean;
  links: FooterColumnLink[];
}

export interface FooterSocialLink {
  id: string;
  platform: string;
  label: string;
  href: string;
  isVisible?: boolean;
  openInNewTab?: boolean;
}

const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
  {
    id: 'col-services',
    headingEn: 'Services',
    headingBn: 'সেবা',
    order: 0,
    isVisible: true,
    links: [
      { id: 'l-tours', labelEn: 'Tours', href: '/tours' },
      { id: 'l-hotels', labelEn: 'Hotels', href: '/hotels' },
      { id: 'l-flights', labelEn: 'Flights', href: '/flights' },
      { id: 'l-visa', labelEn: 'Visa', href: '/visa' },
      { id: 'l-hajj', labelEn: 'Hajj & Umrah', href: '/hajj' },
      { id: 'l-transport', labelEn: 'Transport', href: '/transport' },
    ],
  },
  {
    id: 'col-company',
    headingEn: 'Company',
    headingBn: 'কোম্পানি',
    order: 1,
    isVisible: true,
    links: [
      { id: 'l-privacy', labelEn: 'Privacy Policy', href: '/privacy' },
      { id: 'l-terms', labelEn: 'Terms of Service', href: '/terms' },
      { id: 'l-contact', labelEn: 'Contact Support', href: '/contact' },
      { id: 'l-dest', labelEn: 'Global Destinations', href: '/destinations' },
    ],
  },
];

@Injectable()
export class SiteService {
  private readonly logger = new Logger(SiteService.name);

  constructor(private readonly prisma: PrismaService) {}

  private generateId(): string {
    return (
      'el-' +
      Math.random().toString(36).slice(2, 10) +
      Date.now().toString(36)
    );
  }

  getDefaultNavMenuTree() {
    return [
      { id: 'nav-home', labelEn: 'Home', labelBn: 'হোম', href: '/', order: 0, isVisible: true, children: [] },
      {
        id: 'nav-about',
        labelEn: 'About Us',
        labelBn: 'আমাদের সম্পর্কে',
        href: '#',
        order: 1,
        isVisible: true,
        children: [
          { id: 'nav-about-profile', labelEn: 'Company Profile', labelBn: 'কোম্পানি প্রোফাইল', href: '/about', order: 0, isVisible: true, children: [] },
          { id: 'nav-about-ceo', labelEn: 'Message from CEO', labelBn: 'সিইও-এর বার্তা', href: '/about/ceo', order: 1, isVisible: true, children: [] },
        ],
      },
      { id: 'nav-tours', labelEn: 'Tours', labelBn: 'ট্যুর', href: '/tours', translationKey: 'nav_tours', order: 2, isVisible: true, children: [] },
      { id: 'nav-visa', labelEn: 'Visa', labelBn: 'ভিসা', href: '/visa', translationKey: 'nav_visa', order: 3, isVisible: true, children: [] },
      { id: 'nav-hajj', labelEn: 'Hajj & Umrah', labelBn: 'হজ্জ ও ওমরাহ', href: '/hajj', translationKey: 'nav_hajj', order: 4, isVisible: true, children: [] },
      { id: 'nav-hotels', labelEn: 'Hotels', labelBn: 'হোটেল', href: '/hotels', translationKey: 'nav_hotels', order: 5, isVisible: true, children: [] },
      { id: 'nav-tickets', labelEn: 'Tickets', labelBn: 'টিকিট', href: '/flights', translationKey: 'nav_tickets', order: 6, isVisible: true, children: [] },
      { id: 'nav-blog', labelEn: 'Blog', labelBn: 'ব্লগ', href: '/blog', translationKey: 'nav_blog', order: 7, isVisible: true, children: [] },
    ];
  }

  // ----------------- NAV MENU -----------------

  async listNavMenu(tenantId: string) {
    try {
      const items = await this.prisma.navMenu.findMany({
        where: { tenantId, deletedAt: null },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      });
      return items;
    } catch (err: any) {
      this.logger.warn(`Failed to list nav menu: ${err.message}`);
      return [];
    }
  }

  async listNavMenuTree(tenantId: string) {
    try {
      const flat = await this.listNavMenu(tenantId);
      if (!flat || flat.length === 0) {
        return this.getDefaultNavMenuTree();
      }
      const byId = new Map<string, any>();
      const roots: any[] = [];
      for (const n of flat) {
        byId.set(n.id, { ...n, children: [] });
      }
      for (const n of flat) {
        const node = byId.get(n.id);
        if (n.parentId && byId.has(n.parentId)) {
          byId.get(n.parentId).children.push(node);
        } else {
          roots.push(node);
        }
      }
      return roots.length > 0 ? roots : this.getDefaultNavMenuTree();
    } catch (err: any) {
      this.logger.warn(`Failed to list nav menu tree: ${err.message}`);
      return this.getDefaultNavMenuTree();
    }
  }

  async createNavMenu(tenantId: string, data: any) {
    const parentId = data.parentId || null;
    const max = await this.prisma.navMenu.aggregate({
      where: { tenantId, parentId, deletedAt: null },
      _max: { order: true },
    });
    const order = data.order ?? (max._max.order ?? -1) + 1;
    return this.prisma.navMenu.create({
      data: {
        tenantId,
        labelEn: data.labelEn,
        labelBn: data.labelBn || null,
        translationKey: data.translationKey || null,
        href: data.href,
        linkType: data.linkType || 'INTERNAL',
        iconName: data.iconName || null,
        isVisible: data.isVisible ?? true,
        openInNewTab: data.openInNewTab ?? false,
        highlight: data.highlight ?? false,
        order,
        parentId,
      },
    });
  }

  async updateNavMenu(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.navMenu.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Menu item not found');
    return this.prisma.navMenu.update({
      where: { id },
      data: {
        labelEn: data.labelEn,
        labelBn: data.labelBn,
        translationKey: data.translationKey,
        href: data.href,
        linkType: data.linkType,
        iconName: data.iconName,
        isVisible: data.isVisible,
        openInNewTab: data.openInNewTab,
        highlight: data.highlight,
        order: data.order,
        parentId: data.parentId === undefined ? existing.parentId : data.parentId,
      },
    });
  }

  async removeNavMenu(id: string, tenantId: string) {
    const existing = await this.prisma.navMenu.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Menu item not found');
    await this.prisma.navMenu.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.prisma.navMenu.updateMany({
      where: { parentId: id, tenantId },
      data: { deletedAt: new Date() },
    });
    return { ok: true };
  }

  async reorderNavMenu(tenantId: string, items: { id: string; order: number; parentId?: string | null }[]) {
    const ops = items.map((it) =>
      this.prisma.navMenu.update({
        where: { id: it.id },
        data: {
          order: it.order,
          parentId: it.parentId === undefined ? undefined : it.parentId,
        },
      }),
    );
    await this.prisma.$transaction(ops);
    return this.listNavMenuTree(tenantId);
  }

  async seedDefaultNavMenu(tenantId: string) {
    try {
      const count = await this.prisma.navMenu.count({ where: { tenantId, deletedAt: null } });
      if (count > 0) return;

      const groups: { en: string; bn?: string; href: string; children: { en: string; bn?: string; href: string }[] }[] = [
        { en: 'About Us', bn: 'আমাদের সম্পর্কে', href: '#', children: [
          { en: 'Company Profile', bn: 'কোম্পানি প্রোফাইল', href: '/about' },
          { en: 'Message from CEO', bn: 'সিইও-এর বার্তা', href: '/about/ceo' },
        ]},
      ];

      const flat: { en: string; bn?: string; href: string; order: number; parentId?: string | null }[] = [];
      let order = 0;
      flat.push({ en: 'Home', bn: 'হোম', href: '/', order: order++ });
      for (const g of groups) {
        const parentOrder = order++;
        flat.push({ en: g.en, bn: g.bn, href: g.href, order: parentOrder });
      }
      const singles: { en: string; bn?: string; href: string; translationKey?: string }[] = [
        { en: 'Tours', bn: 'ট্যুর', href: '/tours', translationKey: 'nav_tours' },
        { en: 'Visa', bn: 'ভিসা', href: '/visa', translationKey: 'nav_visa' },
        { en: 'Hajj & Umrah', bn: 'হজ্জ ও ওমরাহ', href: '/hajj', translationKey: 'nav_hajj' },
        { en: 'Hotels', bn: 'হোটেল', href: '/hotels', translationKey: 'nav_hotels' },
        { en: 'Tickets', bn: 'টিকিট', href: '/flights', translationKey: 'nav_tickets' },
        { en: 'Blog', bn: 'ব্লগ', href: '/blog', translationKey: 'nav_blog' },
      ];
      for (const s of singles) flat.push({ en: s.en, bn: s.bn, href: s.href, order: order++ });

      const created: { id: string; en: string; children: { en: string; href: string }[] }[] = [];
      for (const item of flat) {
        const created_item = await this.prisma.navMenu.create({
          data: {
            tenantId,
            labelEn: item.en,
            labelBn: item.bn,
            href: item.href,
            translationKey: (item as any).translationKey ?? null,
            order: item.order,
            parentId: item.parentId ?? null,
          },
        });
        created.push({ id: created_item.id, en: item.en, children: [] });
      }
      for (const g of groups) {
        const parent = created.find((c) => c.en === g.en);
        if (!parent) continue;
        let childOrder = 0;
        for (const child of g.children) {
          await this.prisma.navMenu.create({
            data: {
              tenantId,
              labelEn: child.en,
              labelBn: child.bn,
              href: child.href,
              order: childOrder++,
              parentId: parent.id,
            },
          });
        }
      }
    } catch (err: any) {
      this.logger.warn(`Failed to seed default nav menu: ${err.message}`);
    }
  }

  // ----------------- FOOTER -----------------

  getDefaultFooterConfig(tenantId: string) {
    return {
      id: 'default-footer',
      tenantId,
      taglineEn:
        'High-velocity luxury travel — tours, hotels, flights, visas, and Hajj packages designed for the discerning global traveller.',
      taglineBn: null,
      accentLabelEn: 'High Velocity Luxury',
      accentLabelBn: null,
      columns: DEFAULT_FOOTER_COLUMNS as any,
      socialLinks: [
        { id: 'social-facebook', platform: 'facebook', label: 'Facebook', href: 'https://facebook.com/flyngo', isVisible: true, openInNewTab: true },
        { id: 'social-instagram', platform: 'instagram', label: 'Instagram', href: 'https://instagram.com/flyngo', isVisible: true, openInNewTab: true },
      ],
      contactEmail: 'visaflyngo@gmail.com',
      contactPhone: '+8801322913530',
      contactNoteEn: '24/7 concierge · Multilingual support',
      contactNoteBn: null,
      copyrightTextEn: null,
      copyrightTextBn: null,
      showLanguageToggle: true,
      showShareButton: true,
    };
  }

  async getFooter(tenantId: string) {
    try {
      let footer = await this.prisma.footerConfig.findUnique({ where: { tenantId } });
      if (!footer) {
        try {
          footer = await this.prisma.footerConfig.create({
            data: {
              tenantId,
              taglineEn:
                'High-velocity luxury travel — tours, hotels, flights, visas, and Hajj packages designed for the discerning global traveller.',
              taglineBn: null,
              accentLabelEn: 'High Velocity Luxury',
              accentLabelBn: null,
              columns: DEFAULT_FOOTER_COLUMNS as any,
              socialLinks: (await this.getDefaultSocialLinks(tenantId)) as any,
              contactEmail: 'visaflyngo@gmail.com',
              contactPhone: '+8801322913530',
              contactNoteEn: '24/7 concierge · Multilingual support',
              contactNoteBn: null,
              copyrightTextEn: null,
              copyrightTextBn: null,
            },
          });
        } catch (createErr: any) {
          this.logger.warn(`Failed to auto-create footer config in DB: ${createErr.message}`);
          return this.getDefaultFooterConfig(tenantId);
        }
      }
      return footer;
    } catch (err: any) {
      this.logger.warn(`Failed to fetch footer config: ${err.message}`);
      return this.getDefaultFooterConfig(tenantId);
    }
  }

  async updateFooter(tenantId: string, data: any) {
    const existing = await this.prisma.footerConfig.findUnique({ where: { tenantId } });
    const columns = (data.columns ?? existing?.columns ?? []) as FooterColumn[];
    const sanitized = this.sanitizeColumns(columns);

    const payload: any = {
      taglineEn: data.taglineEn,
      taglineBn: data.taglineBn,
      accentLabelEn: data.accentLabelEn,
      accentLabelBn: data.accentLabelBn,
      columns: sanitized as any,
      socialLinks: this.sanitizeSocialLinks(data.socialLinks ?? existing?.socialLinks ?? []),
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      contactNoteEn: data.contactNoteEn,
      contactNoteBn: data.contactNoteBn,
      copyrightTextEn: data.copyrightTextEn,
      copyrightTextBn: data.copyrightTextBn,
      showLanguageToggle: data.showLanguageToggle,
      showShareButton: data.showShareButton,
    };

    if (existing) {
      return this.prisma.footerConfig.update({ where: { tenantId }, data: payload });
    }
    return this.prisma.footerConfig.create({ data: { tenantId, ...payload } });
  }

  private sanitizeColumns(columns: FooterColumn[]): FooterColumn[] {
    if (!Array.isArray(columns)) return [];
    return columns.map((col, idx) => ({
      id: col.id || this.generateId(),
      headingEn: (col.headingEn || '').trim(),
      headingBn: col.headingBn?.trim() || null,
      translationKey: col.translationKey?.trim() || null,
      order: typeof col.order === 'number' ? col.order : idx,
      isVisible: col.isVisible !== false,
      links: Array.isArray(col.links)
        ? col.links.map((l) => ({
            id: l.id || this.generateId(),
            labelEn: (l.labelEn || '').trim(),
            labelBn: l.labelBn?.trim() || null,
            translationKey: l.translationKey?.trim() || null,
            href: l.href || '#',
            linkType: l.linkType || 'INTERNAL',
            openInNewTab: !!l.openInNewTab,
          }))
        : [],
    }));
  }

  private sanitizeSocialLinks(links: unknown): FooterSocialLink[] {
    if (!Array.isArray(links)) return [];
    return links
      .map((link: Partial<FooterSocialLink>, index) => ({
        id: link.id || `social-${index + 1}`,
        platform: (link.platform || 'website').trim().toLowerCase(),
        label: (link.label || link.platform || 'Social link').trim(),
        href: (link.href || '').trim(),
        isVisible: link.isVisible !== false,
        openInNewTab: link.openInNewTab !== false,
      }))
      .filter((link) => /^https?:\/\//i.test(link.href));
  }

  private async getDefaultSocialLinks(tenantId: string): Promise<FooterSocialLink[]> {
    try {
      const settings = await this.prisma.tenantSettings.findUnique({
        where: { tenantId },
        select: { facebookUrl: true, instagramUrl: true, twitterUrl: true, youtubeUrl: true },
      });
      if (!settings) return [];
      return this.sanitizeSocialLinks([
        { id: 'social-facebook', platform: 'facebook', label: 'Facebook', href: settings.facebookUrl },
        { id: 'social-instagram', platform: 'instagram', label: 'Instagram', href: settings.instagramUrl },
        { id: 'social-twitter', platform: 'twitter', label: 'Twitter', href: settings.twitterUrl },
        { id: 'social-youtube', platform: 'youtube', label: 'YouTube', href: settings.youtubeUrl },
      ]);
    } catch {
      return [];
    }
  }
}
