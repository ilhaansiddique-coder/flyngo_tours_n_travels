'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Award, BadgeCheck, ShieldCheck, CreditCard,
  MessageCircle, Zap, Users, Repeat, BookOpen, Compass, Heart,
  Plane, Ship, FileBadge, Hotel, Car, Map, Languages, MountainSnow,
  Briefcase, Building2, Coffee, Tent, TrendingUp, Sparkles,
  Mail, Phone, MapPin, Clock, ArrowUpRight, Quote, ChevronRight,
} from 'lucide-react';
import { Section, Container } from '@/components/ui/section';
import { PageHero } from '@/components/ui/page-hero';
import { useLocale } from '@/contexts/locale-context';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

type SectionType =
  | 'STORY' | 'VISION' | 'MISSION' | 'SERVICE' | 'SERVICES'
  | 'VALUES' | 'STATS' | 'ACHIEVEMENTS' | 'TEAM' | 'TRIPS'
  | 'STRATEGIES' | 'CONTACT' | 'CUSTOM';

interface AboutSection {
  id: string;
  type: SectionType;
  order: number;
  titleEn?: string | null;
  titleBn?: string | null;
  subtitleEn?: string | null;
  subtitleBn?: string | null;
  bodyEn?: string | null;
  bodyBn?: string | null;
  payload?: any;
  isActive: boolean;
}

interface AboutMeta {
  heroEyebrowEn?: string | null;
  heroEyebrowBn?: string | null;
  heroTitleEn?: string | null;
  heroTitleBn?: string | null;
  heroSubtitleEn?: string | null;
  heroSubtitleBn?: string | null;
  heroImageUrl?: string | null;
  ctaLabelEn?: string | null;
  ctaLabelBn?: string | null;
  ctaHref?: string | null;
  officeAddress?: string | null;
  officePhone?: string | null;
  officeEmail?: string | null;
  sloganEn?: string | null;
  sloganBn?: string | null;
}

interface AboutPageData {
  meta: AboutMeta;
  sections: AboutSection[];
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Award, BadgeCheck, ShieldCheck, CreditCard,
  MessageCircle, Zap, Users, Repeat, BookOpen, Compass, Heart,
  Plane, Ship, FileBadge, Hotel, Car, Map, Languages, MountainSnow,
  Briefcase, Building2, Coffee, Tent, TrendingUp, Sparkles,
};

function pickLocale<T>(locale: 'en' | 'bn', enVal?: T | null, bnVal?: T | null, fallback?: T): T | undefined {
  if (locale === 'bn') return bnVal ?? enVal ?? fallback;
  return enVal ?? bnVal ?? fallback;
}

function pickLabel(item: any, locale: 'en' | 'bn', enKey: string, bnKey: string, fallback = ''): string {
  return pickLocale(locale, item?.[enKey], item?.[bnKey], fallback) ?? fallback;
}

function splitParagraphs(text?: string | null): string[] {
  if (!text) return [];
  return text.split(/\n{2,}|\r\n{2,}/).map((p) => p.trim()).filter(Boolean);
}

export default function AboutPage() {
  const { locale, t } = useLocale();
  const [data, setData] = useState<AboutPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    api.get<AboutPageData>('/about')
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => { if (!cancelled) setError(err?.message || 'Failed to load about page'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const meta = data?.meta;
  const sections = useMemo(() => data?.sections ?? [], [data]);

  const grouped = useMemo(() => {
    const order: SectionType[] = ['STORY', 'ACHIEVEMENTS', 'VISION', 'MISSION', 'SERVICE', 'VALUES', 'TRIPS', 'STRATEGIES', 'TEAM', 'SERVICES', 'STATS', 'CONTACT'];
    const byType: Record<string, AboutSection> = {};
    for (const s of sections) {
      if (!byType[s.type]) byType[s.type] = s;
    }
    return order.map((type) => byType[type]).filter(Boolean) as AboutSection[];
  }, [sections]);

  if (loading && !data) {
    return (
      <main className="min-h-screen flex items-center justify-center pt-32">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen pt-32">
        <Container size="narrow">
          <div className="text-center py-20">
            <p className="text-error">{error}</p>
          </div>
        </Container>
      </main>
    );
  }

  const eyebrow = pickLocale(locale, meta?.heroEyebrowEn, meta?.heroEyebrowBn) ?? t('about_hero_eyebrow');
  const title = pickLocale(locale, meta?.heroTitleEn, meta?.heroTitleBn) ?? t('about_hero_title');
  const subtitle = pickLocale(locale, meta?.heroSubtitleEn, meta?.heroSubtitleBn) ?? t('about_hero_sub');
  const slogan = pickLocale(locale, meta?.sloganEn, meta?.sloganBn) ?? t('about_slogan');
  const officeAddress = meta?.officeAddress;
  const officePhone = meta?.officePhone;
  const officeEmail = meta?.officeEmail;

  return (
    <main>
      {/* Hero */}
      <PageHero
        eyebrow={eyebrow}
        title={<span className="gradient-text-warm">{title}</span>}
        subtitle={subtitle}
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold tracking-wider text-white bg-gradient-to-r from-primary to-tertiary shadow-lg shadow-primary/20 hover:opacity-95 transition-all"
          >
            {t('about_talk_to_us')} <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold border border-outline-variant hover:border-primary hover:text-primary transition-colors"
          >
            {t('about_explore_packages')} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </PageHero>

      {/* Render grouped sections in fixed order */}
      {grouped.map((section) => (
        <AboutSectionRenderer key={section.id} section={section} locale={locale} t={t} slogan={slogan} />
      ))}

      {/* Contact + Slogan footer band */}
      <Section background="brand" className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.25), transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.18), transparent 50%)',
          }}
          aria-hidden
        />
        <Container className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-on-primary">
            <div>
              <span className="inline-block text-[10px] tracking-[0.3em] uppercase font-bold opacity-80 mb-3">
                {t('about_visit_us')}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                {t('about_office_contact')}
              </h2>
              <p className="mt-4 text-base/relaxed opacity-90 max-w-md">
                {slogan}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-white text-primary hover:bg-white/90 transition-colors"
                >
                  {t('about_talk_to_us')} <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/about/ceo"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border border-white/40 hover:bg-white/10 transition-colors"
                >
                  {t('nav_about_ceo')} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {officeAddress && (
                <ContactCard
                  icon={<MapPin className="w-5 h-5" />}
                  label={t('about_office')}
                  value={officeAddress}
                />
              )}
              {officePhone && (
                <ContactCard
                  icon={<Phone className="w-5 h-5" />}
                  label={t('about_phone')}
                  value={
                    <a href={`tel:${officePhone.replace(/[^0-9+]/g, '')}`} className="hover:underline">
                      {officePhone}
                    </a>
                  }
                />
              )}
              {officeEmail && (
                <ContactCard
                  icon={<Mail className="w-5 h-5" />}
                  label={t('about_email')}
                  value={
                    <a href={`mailto:${officeEmail}`} className="hover:underline break-all">
                      {officeEmail}
                    </a>
                  }
                />
              )}
              {meta && (meta as any).sloganEn && (
                <ContactCard
                  icon={<Clock className="w-5 h-5" />}
                  label={t('about_hours')}
                  value="Sat – Thu · 9:00 AM – 7:00 PM"
                />
              )}
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}

function ContactCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5">
      <div className="flex items-center gap-2 text-white/80 text-[10px] tracking-[0.25em] uppercase font-bold mb-2">
        <span className="opacity-90">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="font-semibold text-base leading-snug text-white">{value}</div>
    </div>
  );
}

function AboutSectionRenderer({
  section,
  locale,
  t,
  slogan,
}: {
  section: AboutSection;
  locale: 'en' | 'bn';
  t: (k: any) => string;
  slogan: string;
}) {
  const title = pickLocale(locale, section.titleEn, section.titleBn) ?? defaultTitle(section.type, t);
  const subtitle = pickLocale(locale, section.subtitleEn, section.subtitleBn);
  const body = pickLocale(locale, section.bodyEn, section.bodyBn);
  const items: any[] = Array.isArray(section.payload?.items) ? section.payload.items : [];
  const stats: any[] = Array.isArray(section.payload?.items) ? section.payload.items : [];

  switch (section.type) {
    case 'STORY':
      return (
        <Section>
          <Container size="narrow">
            <SectionHeading eyebrow={t('about_our_story')} title={title} subtitle={t('about_company_lead')} />
            <div className="prose prose-lg max-w-none">
              {splitParagraphs(body).map((p, i) => (
                <p key={i} className="text-on-surface-variant leading-relaxed text-base">{p}</p>
              ))}
            </div>
          </Container>
        </Section>
      );

    case 'ACHIEVEMENTS':
      return (
        <Section background="subtle">
          <Container>
            <SectionHeading
              eyebrow={t('about_achievements')}
              title={title}
              subtitle={t('about_achievements_lead')}
              align="center"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {items.map((it, i) => {
                const Icon = ICONS[it.icon as string] ?? Award;
                const itTitle = pickLabel(it, locale, 'titleEn', 'titleBn');
                const itDesc = pickLabel(it, locale, 'descriptionEn', 'descriptionBn');
                return (
                  <div
                    key={i}
                    className="group rounded-2xl p-6 bg-surface-container border border-hairline hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-on-surface mb-2">{itTitle}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{itDesc}</p>
                  </div>
                );
              })}
            </div>
          </Container>
        </Section>
      );

    case 'VISION':
    case 'MISSION':
    case 'SERVICE':
    case 'TRIPS':
      return (
        <Section background={section.type === 'VISION' ? 'subtle' : 'default'}>
          <Container size="narrow">
            <SectionHeading eyebrow={t(defaultEyebrow(section.type))} title={title} />
            <div className="rounded-3xl p-8 sm:p-10 border border-hairline bg-gradient-to-br from-surface-container to-surface-container-low relative overflow-hidden">
              <Quote className="absolute -top-4 -left-2 w-20 h-20 text-primary/10" aria-hidden />
              <div className="relative prose prose-lg max-w-none">
                {splitParagraphs(body).map((p, i) => (
                  <p key={i} className="text-on-surface leading-relaxed text-base sm:text-lg">{p}</p>
                ))}
              </div>
            </div>
          </Container>
        </Section>
      );

    case 'VALUES':
      return (
        <Section>
          <Container>
            <SectionHeading eyebrow={t('about_values')} title={title} align="center" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {items.map((it, i) => {
                const Icon = ICONS[it.icon as string] ?? Heart;
                const itTitle = pickLabel(it, locale, 'titleEn', 'titleBn');
                const itDesc = pickLabel(it, locale, 'descriptionEn', 'descriptionBn');
                return (
                  <div
                    key={i}
                    className="group rounded-2xl p-6 bg-surface-container-low border border-hairline hover:border-tertiary/40 hover:shadow-lg transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-tertiary/15 text-tertiary mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-base font-bold text-on-surface mb-1.5">{itTitle}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{itDesc}</p>
                  </div>
                );
              })}
            </div>
          </Container>
        </Section>
      );

    case 'STRATEGIES':
      return (
        <Section background="subtle">
          <Container>
            <SectionHeading eyebrow={t('about_strategies')} title={title} align="center" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {items.map((it, i) => {
                const Icon = ICONS[it.icon as string] ?? TrendingUp;
                const itTitle = pickLabel(it, locale, 'titleEn', 'titleBn');
                const itDesc = pickLabel(it, locale, 'descriptionEn', 'descriptionBn');
                return (
                  <div key={i} className="relative rounded-3xl p-7 bg-surface-container border border-hairline overflow-hidden">
                    <span className="absolute -top-3 -right-3 font-display text-7xl font-black text-primary/10">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary text-on-primary mb-4">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-display text-lg font-bold text-on-surface mb-2">{itTitle}</h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{itDesc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Container>
        </Section>
      );

    case 'TEAM':
      return (
        <Section>
          <Container size="narrow">
            <SectionHeading eyebrow={t('about_team')} title={title} align="center" />
            <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-primary/5 via-tertiary/5 to-transparent border border-primary/10 relative overflow-hidden">
              <Quote className="absolute top-6 right-6 w-16 h-16 text-primary/15" aria-hidden />
              <div className="relative prose prose-lg max-w-none">
                {splitParagraphs(body).map((p, i) => (
                  <p key={i} className="text-on-surface leading-relaxed text-base sm:text-lg">{p}</p>
                ))}
              </div>
            </div>
          </Container>
        </Section>
      );

    case 'SERVICES':
      return (
        <Section background="subtle">
          <Container>
            <SectionHeading eyebrow={t('about_what_we_do')} title={title} align="center" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((it, i) => {
                const Icon = ICONS[it.icon as string] ?? Plane;
                const itTitle = pickLabel(it, locale, 'titleEn', 'titleBn');
                const itDesc = pickLabel(it, locale, 'descriptionEn', 'descriptionBn');
                return (
                  <div
                    key={i}
                    className="group flex items-start gap-4 rounded-2xl p-5 bg-surface-container border border-hairline hover:border-primary/40 hover:shadow-lg transition-all"
                  >
                    <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/15 to-tertiary/15 text-primary group-hover:from-primary group-hover:to-tertiary group-hover:text-on-primary transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-bold text-on-surface mb-1">{itTitle}</h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{itDesc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Container>
        </Section>
      );

    case 'STATS':
      return (
        <Section>
          <Container>
            <SectionHeading eyebrow={t('about_by_the_numbers')} title={title || slogan} align="center" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {stats.map((s, i) => {
                const value = s.value ?? '';
                const label = pickLabel(s, locale, 'labelEn', 'labelBn');
                const accent = i % 2 === 0;
                return (
                  <div
                    key={i}
                    className="rounded-2xl p-6 text-center bg-surface-container-low border border-hairline hover:shadow-xl transition-shadow"
                  >
                    <div className={cn('font-display text-4xl sm:text-5xl font-extrabold', accent ? 'text-primary' : 'text-on-surface')}>
                      {value}
                    </div>
                    <div className="mt-2 text-xs uppercase tracking-[0.15em] font-semibold text-on-surface-variant">
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </Container>
        </Section>
      );

    case 'CONTACT':
      return (
        <Section background="subtle">
          <Container>
            <SectionHeading eyebrow={t('about_office_contact')} title={title} align="center" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {section.payload?.address && (
                <DetailCard
                  icon={<MapPin className="w-5 h-5" />}
                  label={t('about_office')}
                  value={section.payload.address}
                />
              )}
              {section.payload?.phone && (
                <DetailCard
                  icon={<Phone className="w-5 h-5" />}
                  label={t('about_phone')}
                  value={
                    <a href={`tel:${String(section.payload.phone).replace(/[^0-9+]/g, '')}`} className="hover:text-primary transition-colors">
                      {section.payload.phone}
                    </a>
                  }
                />
              )}
              {section.payload?.email && (
                <DetailCard
                  icon={<Mail className="w-5 h-5" />}
                  label={t('about_email')}
                  value={
                    <a href={`mailto:${section.payload.email}`} className="hover:text-primary transition-colors break-all">
                      {section.payload.email}
                    </a>
                  }
                />
              )}
              {section.payload?.hours && (
                <DetailCard
                  icon={<Clock className="w-5 h-5" />}
                  label={t('about_hours')}
                  value={section.payload.hours}
                />
              )}
            </div>
          </Container>
        </Section>
      );

    default:
      return (
        <Section>
          <Container size="narrow">
            {title && <SectionHeading title={title} subtitle={subtitle} />}
            {body && (
              <div className="prose prose-lg max-w-none">
                {splitParagraphs(body).map((p, i) => (
                  <p key={i} className="text-on-surface-variant leading-relaxed">{p}</p>
                ))}
              </div>
            )}
          </Container>
        </Section>
      );
  }
}

function DetailCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6 bg-surface-container border border-hairline hover:border-primary/40 transition-colors">
      <div className="flex items-center gap-2 text-on-surface-variant text-[10px] tracking-[0.25em] uppercase font-bold mb-3">
        <span className="text-primary">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="font-display text-base sm:text-lg font-semibold text-on-surface leading-snug">{value}</div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'left' | 'center';
}) {
  return (
    <div className={cn('mb-12', align === 'center' ? 'text-center max-w-3xl mx-auto' : 'max-w-3xl')}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 mb-3">
          <span className="h-px w-6 bg-primary" />
          <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-primary">{eyebrow}</span>
        </span>
      )}
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface tracking-[-0.02em] leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base sm:text-lg text-on-surface-variant leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function defaultTitle(type: SectionType, t: (k: any) => string): string {
  switch (type) {
    case 'STORY': return t('about_our_story');
    case 'ACHIEVEMENTS': return t('about_achievements');
    case 'VISION': return t('about_vision');
    case 'MISSION': return t('about_mission');
    case 'SERVICE': return t('about_service');
    case 'VALUES': return t('about_values');
    case 'TRIPS': return t('about_trips');
    case 'STRATEGIES': return t('about_strategies');
    case 'TEAM': return t('about_team');
    case 'SERVICES': return t('about_what_we_do');
    case 'CONTACT': return t('about_office_contact');
    default: return '';
  }
}

function defaultEyebrow(type: SectionType): string {
  switch (type) {
    case 'VISION': return 'about_vision';
    case 'MISSION': return 'about_mission';
    case 'SERVICE': return 'about_service';
    case 'TRIPS': return 'about_trips';
    default: return 'about_our_story';
  }
}
