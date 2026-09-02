'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Globe, Share2, Plane, Mail, Phone, Gift, Facebook, Instagram,
  Linkedin, Music2, MessageCircle, Globe2, Settings, type LucideIcon,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLocale } from '@/contexts/locale-context';
import logoImg from '@/images/flyngo_transparent.png';

interface FooterLink {
  id: string;
  labelEn: string;
  labelBn?: string | null;
  translationKey?: string | null;
  href: string;
  linkType?: 'INTERNAL' | 'EXTERNAL' | 'SECTION';
  openInNewTab?: boolean;
}

interface FooterColumn {
  id: string;
  headingEn: string;
  headingBn?: string | null;
  translationKey?: string | null;
  order: number;
  isVisible?: boolean;
  links: FooterLink[];
}

interface FooterSocialLink {
  id: string;
  platform: string;
  label: string;
  href: string;
  isVisible?: boolean;
  openInNewTab?: boolean;
}

interface FooterConfig {
  taglineEn?: string | null;
  taglineBn?: string | null;
  accentLabelEn?: string | null;
  accentLabelBn?: string | null;
  columns?: FooterColumn[];
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactNoteEn?: string | null;
  contactNoteBn?: string | null;
  copyrightTextEn?: string | null;
  copyrightTextBn?: string | null;
  socialLinks?: FooterSocialLink[];
  showLanguageToggle?: boolean;
  showShareButton?: boolean;
}

const defaultFooter: FooterConfig = {
  taglineEn:
    'High-velocity luxury travel — tours, hotels, flights, visas, and Hajj packages designed for the discerning global traveller.',
  accentLabelEn: 'High Velocity Luxury',
  columns: [
    {
      id: 'd-services',
      headingEn: 'Services',
      order: 0,
      isVisible: true,
      links: [
        { id: 'd-tours', labelEn: 'Tours', href: '/tours' },
        { id: 'd-hotels', labelEn: 'Hotels', href: '/hotels' },
        { id: 'd-flights', labelEn: 'Flights', href: '/flights' },
        { id: 'd-visa', labelEn: 'Visa', href: '/visa' },
        { id: 'd-hajj', labelEn: 'Hajj & Umrah', href: '/hajj' },
        { id: 'd-transport', labelEn: 'Transport', href: '/transport' },
      ],
    },
    {
      id: 'd-company',
      headingEn: 'Company',
      order: 1,
      isVisible: true,
      links: [
        { id: 'd-privacy', labelEn: 'Privacy Policy', href: '/privacy' },
        { id: 'd-terms', labelEn: 'Terms of Service', href: '/terms' },
        { id: 'd-contact', labelEn: 'Contact Support', href: '/contact' },
        { id: 'd-dest', labelEn: 'Global Destinations', href: '/destinations' },
        { id: 'd-refer', labelEn: 'Refer & Earn', href: '/refer' },
      ],
    },
  ],
  contactEmail: 'contact@flyngo.com',
  contactPhone: '+1-800-FLYNGO',
  contactNoteEn: '24/7 concierge · Multilingual support',
  showLanguageToggle: true,
  showShareButton: true,
};

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  admin: Settings,
  linkedin: Linkedin,
  tiktok: Music2,
  whatsapp: MessageCircle,
  website: Globe2,
};

export function Footer() {
  const pathname = usePathname();
  const { t, locale } = useLocale();
  const [config, setConfig] = useState<FooterConfig | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<FooterConfig>('/site/footer')
      .then((data) => {
        if (cancelled) return;
        if (data && typeof data === 'object') setConfig(data);
      })
      .catch(() => {
        // Keep the default footer on failure.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (pathname.startsWith('/admin')) return null;

  const footer: FooterConfig = config ?? defaultFooter;
  const columns = (footer.columns ?? []).filter((c) => c.isVisible !== false);
  const socialLinks = (footer.socialLinks ?? []).filter(
    (link) => link.isVisible !== false && (link.platform.toLowerCase() === 'admin' || /^https?:\/\//i.test(link.href)),
  );

  const pickText = (en?: string | null, bn?: string | null): string => {
    if (locale === 'bn' && bn) return bn;
    return en || bn || '';
  };
  const pickTranslation = (key?: string | null, fallback?: string | null): string => {
    if (!key) return fallback || '';
    try {
      return t(key as any) || fallback || '';
    } catch {
      return fallback || '';
    }
  };

  const tagline = pickTranslation(undefined as any, footer.taglineEn || footer.taglineBn || '');
  const accentLabel = footer.accentLabelEn || footer.accentLabelBn || '';

  const copyrightDefault = `© ${new Date().getFullYear()} FlynGo Travel. All rights reserved.`;
  const copyrightEn = footer.copyrightTextEn || copyrightDefault;
  const copyrightBn = footer.copyrightTextBn || '';
  const copyrightText = locale === 'bn' && copyrightBn ? copyrightBn : copyrightEn;

  return (
    <footer
      className="relative w-full pt-20 pb-10 border-t overflow-hidden"
      style={{
        backgroundColor: 'var(--color-footer-bg)',
        borderColor: 'var(--color-footer-border)',
        color: 'var(--color-footer-text)',
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 50% 40% at 50% 0%, color-mix(in oklab, var(--color-primary) 18%, transparent), transparent 70%)',
          }}
        />
      </div>

      <div className="relative px-4 sm:px-6 lg:px-16 max-w-[1600px] mx-auto">
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12"
          style={{ borderBottom: '1px solid var(--color-footer-border)' }}
        >
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src={logoImg}
                alt="FlynGo"
                width={140}
                height={44}
                className="rounded-lg object-cover w-auto h-auto"
              />
            </Link>
            {tagline && (
              <p
                className="mt-4 text-sm max-w-xs leading-relaxed"
                style={{ color: 'var(--color-footer-text-muted)' }}
              >
                {tagline}
              </p>
            )}
            {accentLabel && (
              <div
                className="mt-5 flex items-center gap-2"
                style={{ color: 'var(--color-footer-heading)' }}
              >
                <Plane className="w-4 h-4" />
                <span className="text-xs font-semibold tracking-widest uppercase">{accentLabel}</span>
              </div>
            )}
            {socialLinks.length > 0 && (
              <div className="mt-6 flex items-center gap-2" aria-label="Social media links">
                {socialLinks.map((link) => {
                  const Icon = SOCIAL_ICONS[link.platform.toLowerCase()] || Globe2;
                  const isAdmin = link.platform.toLowerCase() === 'admin';
                  const target = isAdmin ? undefined : link.openInNewTab !== false ? '_blank' : undefined;
                  const href = isAdmin ? '/admin' : link.href;
                  return (
                    <a
                      key={link.id}
                      href={href}
                      target={target}
                      rel={target ? 'noopener noreferrer' : undefined}
                      aria-label={isAdmin ? 'Admin Panel' : link.label}
                      title={isAdmin ? 'Admin Panel' : link.label}
                      className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors hover:bg-white/10"
                      style={{
                        borderColor: 'var(--color-footer-border)',
                        color: 'var(--color-footer-text-muted)',
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {columns
            .sort((a, b) => a.order - b.order)
            .map((col) => {
              const heading = pickTranslation(col.translationKey, pickText(col.headingEn, col.headingBn));
              return (
                <div key={col.id}>
                  <h4
                    className="text-[10px] tracking-[0.25em] uppercase font-bold mb-4"
                    style={{ color: 'var(--color-footer-heading)' }}
                  >
                    {heading}
                  </h4>
                  <nav className="flex flex-col gap-3">
                    {col.links.map((link) => {
                      const label = pickTranslation(link.translationKey, pickText(link.labelEn, link.labelBn));
                      const target = link.openInNewTab || link.linkType === 'EXTERNAL' ? '_blank' : undefined;
                      return (
                        <Link
                          key={link.id}
                          href={link.href}
                          target={target}
                          rel={target ? 'noopener noreferrer' : undefined}
                          className="text-sm transition-colors"
                          style={{ color: 'var(--color-footer-text-muted)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-footer-text)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-footer-text-muted)')}
                        >
                          {label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              );
            })}

          <div>
            <h4
              className="text-[10px] tracking-[0.25em] uppercase font-bold mb-4"
              style={{ color: 'var(--color-footer-heading)' }}
            >
              {locale === 'bn' ? 'যোগাযোগ করুন' : 'Get in touch'}
            </h4>
            <div className="flex flex-col gap-3 text-sm" style={{ color: 'var(--color-footer-text-muted)' }}>
              {footer.contactEmail && (
                <a href={`mailto:${footer.contactEmail}`} className="inline-flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" style={{ color: 'var(--color-footer-heading)' }} />
                  {footer.contactEmail}
                </a>
              )}
              {footer.contactPhone && (
                <a
                  href={`tel:${footer.contactPhone.replace(/[^+\d]/g, '')}`}
                  className="inline-flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" style={{ color: 'var(--color-footer-heading)' }} />
                  {footer.contactPhone}
                </a>
              )}
              {(footer.contactNoteEn || footer.contactNoteBn) && (
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-footer-text-muted)' }}>
                  {pickText(footer.contactNoteEn, footer.contactNoteBn)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Refer & Earn CTA — always visible, independent of CMS footer config */}
        <div
          className="mt-8 mb-8 p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border"
          style={{
            backgroundColor: 'color-mix(in oklab, var(--color-primary) 14%, transparent)',
            borderColor: 'color-mix(in oklab, var(--color-primary) 30%, transparent)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
            >
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--color-footer-text)' }}>
                Refer friends, earn travel rewards
              </p>
              <p className="text-xs" style={{ color: 'var(--color-footer-text-muted)' }}>
                Share your link. Friends get a discount. You earn on every booking they make.
              </p>
            </div>
          </div>
          <Link
            href="/refer"
            className="px-5 py-2.5 rounded-full text-xs font-bold tracking-wider transition-all shadow-lg whitespace-nowrap"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
            }}
          >
            Earn now →
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4">
          <p className="text-xs" style={{ color: 'var(--color-footer-text-muted)' }}>
            {copyrightText} · It Is Working
          </p>
          <div className="flex items-center gap-4">
            {footer.showLanguageToggle !== false && (
              <button
                className="w-9 h-9 rounded-full border flex items-center justify-center transition-all"
                style={{
                  borderColor: 'var(--color-footer-border)',
                  color: 'var(--color-footer-text-muted)',
                  backgroundColor: 'transparent',
                }}
                aria-label="Language"
              >
                <Globe className="w-4 h-4" />
              </button>
            )}
            {footer.showShareButton !== false && (
              <button
                className="w-9 h-9 rounded-full border flex items-center justify-center transition-all"
                style={{
                  borderColor: 'var(--color-footer-border)',
                  color: 'var(--color-footer-text-muted)',
                  backgroundColor: 'transparent',
                }}
                aria-label="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
