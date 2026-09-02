'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Quote, Mail, Phone, MapPin, ArrowUpRight, Sparkles, MessageCircle,
} from 'lucide-react';
import { Section, Container } from '@/components/ui/section';
import { PageHero } from '@/components/ui/page-hero';
import { useLocale } from '@/contexts/locale-context';
import { api } from '@/lib/api';

interface CeoMessage {
  id: string;
  name: string;
  title: string;
  imageUrl?: string | null;
  bodyEn: string;
  bodyBn?: string | null;
  signatureEn?: string | null;
  signatureBn?: string | null;
}

function pickLocale<T>(locale: 'en' | 'bn', enVal?: T | null, bnVal?: T | null, fallback?: T): T | undefined {
  if (locale === 'bn') return bnVal ?? enVal ?? fallback;
  return enVal ?? bnVal ?? fallback;
}

function splitParagraphs(text?: string | null): string[] {
  if (!text) return [];
  return text.split(/\n{2,}|\r\n{2,}/).map((p) => p.trim()).filter(Boolean);
}

export default function CeoMessagePage() {
  const { locale, t } = useLocale();
  const [data, setData] = useState<CeoMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    api.get<CeoMessage>('/about/ceo')
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => { if (!cancelled) setError(err?.message || 'Failed to load'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

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

  const body = pickLocale(locale, data?.bodyEn, data?.bodyBn) ?? '';
  const signature = pickLocale(locale, data?.signatureEn, data?.signatureBn) ?? data?.name ?? '';

  return (
    <main>
      <PageHero
        eyebrow={t('about_ceo_hero_badge')}
        title={<span className="gradient-text-warm">{t('about_ceo_hero_title')}</span>}
        subtitle={t('about_ceo_hero_sub')}
      />

      <Section>
        <Container size="wide">
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-10 lg:gap-16 items-start">
            {/* CEO card */}
            <aside className="lg:sticky lg:top-28">
              <div className="rounded-3xl overflow-hidden bg-surface-container border border-hairline shadow-xl">
                <div className="relative aspect-[4/5] bg-gradient-to-br from-primary/20 via-tertiary/20 to-surface-container-low">
                  {data?.imageUrl ? (
                    <Image
                      src={data.imageUrl}
                      alt={data.name}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 340px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-tertiary flex items-center justify-center text-on-primary font-display text-5xl font-bold shadow-2xl">
                        {(data?.name ?? 'C').charAt(0)}
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] tracking-[0.25em] uppercase font-bold bg-white/95 text-primary backdrop-blur-md flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Founder
                  </div>
                </div>
                <div className="p-6 sm:p-7">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface leading-tight">
                    {data?.name ?? 'FlynGo CEO'}
                  </h2>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                    {data?.title ?? t('about_ceo_signature_role')}
                  </p>
                  <div className="my-5 h-px bg-outline-variant" />
                  <Link
                    href="/contact"
                    className="group inline-flex items-center justify-between w-full px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-tertiary text-on-primary text-sm font-bold hover:opacity-95 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      {t('about_talk_to_us')}
                    </span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>

              {/* Quick contact */}
              <div className="mt-5 rounded-2xl border border-hairline bg-surface-container-low p-5 space-y-3">
                <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-on-surface-variant mb-2">
                  {t('about_office_contact')}
                </p>
                <ContactLine icon={<MapPin className="w-4 h-4" />} value="HM Plaza (11th Floor), Rajlaxmi, Uttara, Dhaka" />
                <ContactLine
                  icon={<Phone className="w-4 h-4" />}
                  value={
                    <a href="tel:01322913530" className="hover:text-primary transition-colors">
                      01322913530
                    </a>
                  }
                />
                <ContactLine
                  icon={<Mail className="w-4 h-4" />}
                  value={
                    <a href="mailto:visaflyngo@gmail.com" className="hover:text-primary transition-colors break-all">
                      visaflyngo@gmail.com
                    </a>
                  }
                />
              </div>
            </aside>

            {/* Letter */}
            <article>
              <div className="relative rounded-3xl border border-hairline bg-surface-container overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-tertiary to-primary" />
                <Quote className="absolute top-8 left-8 w-20 h-20 text-primary/15" aria-hidden />
                <div className="relative p-8 sm:p-12 lg:p-14 space-y-6">
                  {splitParagraphs(body).map((p, i) => (
                    <p
                      key={i}
                      className={
                        i === 0
                          ? 'text-on-surface text-xl sm:text-2xl font-display font-medium leading-snug'
                          : 'text-on-surface-variant leading-relaxed text-base sm:text-lg'
                      }
                    >
                      {p}
                    </p>
                  ))}
                  <div className="pt-6 border-t border-outline-variant/60">
                    <p className="text-on-surface-variant text-sm mb-3">
                      {t('about_ceo_signature_label')}
                    </p>
                    <SignatureMark name={signature} />
                  </div>
                </div>
              </div>

              {/* CTA row */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/tours"
                  className="group rounded-2xl p-6 border border-hairline bg-surface-container hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-lg font-bold text-on-surface">
                        {t('about_explore_packages')}
                      </p>
                      <p className="text-sm text-on-surface-variant mt-1">tours, visas, Hajj & Umrah</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </Link>
                <Link
                  href="/about"
                  className="group rounded-2xl p-6 border border-hairline bg-surface-container hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-lg font-bold text-on-surface">
                        {t('nav_about_company')}
                      </p>
                      <p className="text-sm text-on-surface-variant mt-1">FlynGo Company Profile</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </Link>
              </div>
            </article>
          </div>
        </Container>
      </Section>
    </main>
  );
}

function ContactLine({ icon, value }: { icon: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="mt-0.5 text-primary">{icon}</span>
      <span className="text-on-surface leading-snug">{value}</span>
    </div>
  );
}

function SignatureMark({ name }: { name: string }) {
  return (
    <div>
      <p
        className="font-display italic text-3xl sm:text-4xl text-on-surface leading-none"
        style={{ fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive' }}
      >
        {name}
      </p>
      <p className="mt-2 text-[10px] tracking-[0.3em] uppercase font-bold text-primary">
        Founder & CEO, FlynGo
      </p>
    </div>
  );
}
