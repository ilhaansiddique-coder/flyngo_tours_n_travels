'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { LeadForm } from '@/components/marketing/lead-form';
import { TrustBadges } from '@/components/marketing/trust-badges';
import { FloatingWhatsApp } from '@/components/marketing/floating-whatsapp';
import { api } from '@/lib/api';
import { captureUtmFromUrl, trackEvent } from '@/lib/tracking-client';
import { CheckCircle2, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface LandingPage {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  heroImage: string | null;
  body: any;
  ctaLabel: string | null;
  ctaHref: string | null;
  formSlug: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaImage: string | null;
  campaign: string | null;
}

export default function LandingPageView() {
  const params = useParams<{ slug: string }>();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    captureUtmFromUrl();
    if (!params?.slug) return;
    let mounted = true;
    (async () => {
      try {
        const res = (await api.get(`/lp/${params.slug}`)) as LandingPage;
        if (mounted) {
          setPage(res);
          // Update document title for the page
          if (res.metaTitle) document.title = res.metaTitle;
          await trackEvent('view_item', {
            contentName: res.slug,
            value: 0,
          });
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Landing page not found');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <p className="text-rose-500 text-sm mb-4">{error || 'Page not found'}</p>
          <Link href="/" className="text-accent underline">Back to home</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-tertiary/10 to-primary/15" />
        {page.heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={page.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        )}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-tertiary/20 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-20 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            {page.campaign && (
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full text-[10px] tracking-widest uppercase font-bold text-accent border border-accent/30 bg-accent/5">
                <Sparkles className="w-3 h-3" />
                {page.campaign.replace(/-/g, ' ')}
              </div>
            )}
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-on-surface mb-4 leading-tight">
              {page.title}
            </h1>
            {page.subtitle && (
              <p className="text-base sm:text-lg text-on-surface-variant mb-6 max-w-xl">
                {page.subtitle}
              </p>
            )}
            {Array.isArray(page.body?.bullets) && (
              <ul className="space-y-2 mb-6">
                {page.body.bullets.map((b: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm text-on-surface">{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {page.ctaLabel && page.ctaHref && (
              <a
                href={page.ctaHref}
                className="inline-flex items-center gap-2 bg-accent text-on-primary font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
                onClick={() => trackEvent('lead', { contentName: `${page.slug}:cta_click` })}
              >
                {page.ctaLabel} <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>

          <div>
            <Card className="!p-6 bg-surface-container-high/90 backdrop-blur">
              {page.formSlug ? (
                <LeadForm
                  formSlug={page.formSlug}
                  packageSlug={page.body?.packageSlug}
                  title={page.body?.formTitle ?? 'Get a free quote'}
                  subtitle={page.body?.formSubtitle}
                  cta={page.body?.formCta ?? 'Get my quote'}
                />
              ) : (
                <div className="text-center py-8 text-on-surface-variant">
                  Contact form coming soon.
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      <TrustBadges />
      <FloatingWhatsApp />

      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <Link href="/" className="text-xs text-on-surface-variant hover:text-on-surface">
          Powered by FlynGo
        </Link>
      </div>
    </div>
  );
}
