'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import { useFormatCurrency } from '@/lib/utils';
import { visaImage } from '@/lib/entity-image';
import { useBookingStore } from '@/stores/booking.store';
import { ReviewsSection } from '@/components/features/reviews/reviews-section';
import { ShareMenu } from '@/components/shared/share-menu';
import { LeadForm } from '@/components/marketing/lead-form';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, ArrowRight, Clock, Check, ChevronDown,
  FileCheck, Briefcase, Coins, Building2, Landmark, MapPin,
} from 'lucide-react';
import { getCountryFlagByName } from '@/lib/world-places';
import { useLocale } from '@/contexts/locale-context';

interface VisaCountry {
  id: string;
  name: string;
  slug: string;
  flagUrl?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  region?: string;
  visaTypes: string[];
  processingTime?: string;
  fee: number;
  currency: string;
  requirements: string[];
  description?: string;
  isActive: boolean;
  content?: VisaContent | null;
}

interface VisaService {
  id: string;
  title: string;
  titleBn?: string;
  price: number;
  currency: string;
  processingTime?: string;
  processingTimeBn?: string;
  requirements?: string[];
  requirementsBn?: string[];
  pointsAwarded?: number;
  description?: string;
  descriptionBn?: string;
  isActive: boolean;
  country?: { id: string; name: string; slug: string };
  destination?: { id: string; name: string; slug: string };
}

interface FeeTier {
  id: string;
  title: string;
  subtitle?: string;
  stay?: string;
  entry?: string;
  validity?: string;
  male?: number;
  female?: number;
  child?: number;
  flatFee?: number;
  processingTime?: string;
  documents?: string[];
  notes?: string[];
}

interface VisaContent {
  intro?: string;
  pricingTiers?: FeeTier[];
  processSteps?: string[];
  terms?: string[];
  facts?: Array<{ label: string; value: string }>;
  faq?: Array<{ question: string; answer: string }>;
  keyDestinations?: string[];
}

interface ParsedRequirementGroup {
  category?: string;
  items: string[];
}

function parseRequirements(raw: string[] | string | undefined): ParsedRequirementGroup[] {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  const tokens: string[] = [];

  for (const entry of list) {
    if (!entry || typeof entry !== 'string') continue;
    const normalized = entry.replace(
      /(?:^|\s*)([📄👔🏢🎓💼👥✈️🏛️]\s*(?:For\s+[A-Za-z\s]+|Required|General|Standard)[^:]*:?)/giu,
      '\n__HEADER__$1\n'
    );
    const parts = normalized
      .split(/(?:\r?\n)+|[•🔹▪▫‣⁃◆*]+|(?:\s*;\s*)|(?:\s*\|\s*)/u)
      .map((p) => p.trim())
      .filter(Boolean);
    tokens.push(...parts);
  }

  const groups: ParsedRequirementGroup[] = [];
  let currentGroup: ParsedRequirementGroup = { items: [] };

  for (let token of tokens) {
    let isHeader = false;
    if (token.startsWith('__HEADER__')) {
      isHeader = true;
      token = token.replace('__HEADER__', '').trim();
    } else if (
      /^(?:📄|👔|🏢|🎓|💼|👥|🏛️|✈️)?\s*(?:for\s+[a-z\s]+|required\s+documents|general\s+documents|optional\s+documents):?$/iu.test(
        token
      ) ||
      (token.endsWith(':') && token.length < 50)
    ) {
      isHeader = true;
    }

    if (isHeader) {
      if (currentGroup.items.length > 0 || currentGroup.category) {
        groups.push(currentGroup);
      }
      currentGroup = {
        category: token.replace(/:$/, '').trim(),
        items: [],
      };
    } else {
      const cleaned = token.replace(/^[-\s\u2022\u25aa\u25b6\u25c6\u2705\u2714\u2713]+/, '').trim();
      if (cleaned) currentGroup.items.push(cleaned);
    }
  }

  if (currentGroup.items.length > 0 || currentGroup.category) {
    groups.push(currentGroup);
  }

  return groups;
}

function RequirementsDisplay({ requirements, isBn }: { requirements: string[] | string | undefined; isBn?: boolean }) {
  const groups = parseRequirements(requirements);
  if (!groups.length) return null;

  return (
    <div className="mt-4 pt-4 border-t border-hairline/60">
      <div className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
        <FileCheck className="w-4 h-4 text-accent" /> {isBn ? 'প্রয়োজনীয় নথিপত্র এবং শর্তাবলী:' : 'Required Documents & Prerequisites:'}
      </div>

      <div className="space-y-3">
        {groups.map((group, gIdx) => (
          <div
            key={gIdx}
            className="rounded-xl p-3.5 border"
            style={{
              borderColor: 'var(--color-outline-variant)',
              backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
            }}
          >
            {group.category && (
              <div className="text-xs font-semibold text-accent mb-2 pb-1.5 border-b border-hairline flex items-center gap-1.5">
                <span>{group.category}</span>
              </div>
            )}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.items.map((item, iIdx) => (
                <li key={iIdx} className="flex items-start gap-2 text-xs sm:text-[13px] text-on-surface-variant leading-snug">
                  <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChevronToggle({ open }: { open: boolean }) {
  return <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />;
}

export default function VisaCountryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { locale } = useLocale();
  const isBn = locale === 'bn';
  const { getVisaCountries, getVisaServices } = useApi();
  const setSelectedItem = useBookingStore((s) => s.setSelectedItem);
  const fmt = useFormatCurrency();
  const [country, setCountry] = useState<VisaCountry | null>(null);
  const [services, setServices] = useState<VisaService[]>([]);
  const [allCountries, setAllCountries] = useState<VisaCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [countriesRes, servicesRes] = await Promise.all([
          getVisaCountries({ limit: '100' }),
          getVisaServices(),
        ]);
        const rawCountries = Array.isArray(countriesRes)
          ? (countriesRes as VisaCountry[])
          : (((countriesRes as any)?.items ?? (countriesRes as any)?.data ?? []) as VisaCountry[]);
        const all = rawCountries.filter((c) => c.isActive !== false);
        setAllCountries(all);

        const rawServices: VisaService[] = Array.isArray(servicesRes)
          ? (servicesRes as VisaService[])
          : ((servicesRes as any)?.items ?? (servicesRes as any)?.data ?? []);
        const activeServices = rawServices.filter((s) => s.isActive !== false);
        setServices(activeServices);

        const slugLower = (slug || '').toLowerCase().trim();
        let foundCountry = all.find((c) => (c.slug || '').toLowerCase() === slugLower || (c.name || '').toLowerCase() === slugLower) ?? null;
        if (!foundCountry) {
          // If not in VisaCountry list, look inside active services (primary or additional destination)
          const matchService = activeServices.find((s: any) => {
            const sn = (s.country?.name || '').toLowerCase();
            const ss = (s.country?.slug || '').toLowerCase();
            const dn = (s.destination?.name || '').toLowerCase();
            const ds = (s.destination?.slug || '').toLowerCase();
            const st = (s.title || '').toLowerCase();
            const hasAddl = (s.additionalDestinations || []).some((ad: any) => {
              const an = (ad.destination?.name || '').toLowerCase();
              const as_ = (ad.destination?.slug || '').toLowerCase();
              return an === slugLower || as_ === slugLower;
            });
            return sn === slugLower || ss === slugLower || dn === slugLower || ds === slugLower || st.includes(slugLower) || hasAddl;
          });
          if (matchService) {
            const c = matchService.country || matchService.destination;
            const countryName = c?.name || slug;
            foundCountry = {
              id: c?.id || slug,
              name: countryName,
              slug,
              flagUrl: (matchService.country as any)?.flagUrl || getCountryFlagByName(countryName),
              fee: Number(matchService.price) || 0,
              currency: matchService.currency || 'BDT',
              isActive: true,
              visaTypes: [],
              requirements: matchService.requirements || [],
            };
          }
        }
        setCountry(foundCountry);
      } catch {
        // bubble up nothing — the empty state handles it
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, getVisaCountries, getVisaServices]);

  const content = useMemo<VisaContent>(() => country?.content ?? {}, [country]);

  const facts = useMemo(() => content.facts ?? [], [content]);
  const tiers = useMemo(() => content.pricingTiers ?? [], [content]);
  const faq = useMemo(() => content.faq ?? [], [content]);
  const keyDestinations = useMemo(() => content.keyDestinations ?? [], [content]);
  const processSteps = useMemo(
    () =>
      content.processSteps ?? [
        'Submit your details and we email a checklist.',
        'Send us the documents (we can collect or you can drop off).',
        'We review and submit to the embassy / consulate.',
        'You receive the visa and we deliver the passport.',
      ],
    [content],
  );

  // Sidebar quick-nav: other active visa countries (only those with active services)
  const otherCountries = useMemo(() => {
    const knownSlugs = new Set<string>();
    for (const s of services) {
      const c = s.country || s.destination;
      if (c?.slug) knownSlugs.add(c.slug.toLowerCase());
      for (const ad of (s as any).additionalDestinations || []) {
        if (ad.destination?.slug) knownSlugs.add(ad.destination.slug.toLowerCase());
      }
    }
    return allCountries.filter(
      (c) => c.slug !== slug && c.isActive !== false && knownSlugs.has(c.slug.toLowerCase())
    );
  }, [allCountries, slug, services]);

  // Bookable services belonging to this country only
  const countryServices = useMemo(() => {
    if (!country) return [];
    const cName = country.name.toLowerCase();
    const cSlug = country.slug.toLowerCase();
    return services.filter((s: any) => {
      const sName = s.country?.name?.toLowerCase() || '';
      const sSlug = s.country?.slug?.toLowerCase() || '';
      const dName = s.destination?.name?.toLowerCase() || '';
      const dSlug = s.destination?.slug?.toLowerCase() || '';
      const sTitle = s.title?.toLowerCase() || '';
      const hasAddl = (s.additionalDestinations || []).some((ad: any) => {
        const an = ad.destination?.name?.toLowerCase() || '';
        const as_ = ad.destination?.slug?.toLowerCase() || '';
        return an === cName || as_ === cSlug;
      });
      return sName === cName || sSlug === cSlug || dName === cName || dSlug === cSlug || sTitle.includes(cName) || hasAddl;
    });
  }, [services, country]);

  // Universal general requirements from country content
  const countryRequirements = useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(country?.requirements)) {
      for (const r of country.requirements) {
        if (!r) continue;
        const trimmed = r.trim();
        // Skip giant pasted emoji blobs from countryRequirements flat display
        if (trimmed.length > 100 && /[🔹•📄]/.test(trimmed)) continue;
        if (!list.includes(trimmed)) list.push(trimmed);
      }
    }
    return list;
  }, [country]);

  // Check if any active package already displays document requirements
  const hasPackageRequirements = useMemo(() => {
    return countryServices.some((s) => Array.isArray(s.requirements) && s.requirements.length > 0);
  }, [countryServices]);

  // Minimum starting price from active bookable services or country fee
  const startingFee = useMemo(() => {
    if (countryServices.length > 0) {
      const prices = countryServices.map((s) => Number(s.price)).filter((p) => !isNaN(p) && p > 0);
      if (prices.length > 0) return Math.min(...prices);
    }
    return country?.fee || 0;
  }, [countryServices, country?.fee]);

  const bookService = (id: string) => {
    setSelectedItem(id);
    router.push(`/booking?type=visa&id=${id}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen pt-32 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-on-surface-variant">Loading visa details…</p>
        </div>
      </main>
    );
  }

  if (!country) {
    return (
      <main className="min-h-screen pt-32 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
        <Link href="/visa" className="inline-flex items-center gap-2 text-sm mb-6 hover:underline text-accent">
          <ArrowLeft className="w-4 h-4" /> Back to visa services
        </Link>
        <div className="glass-deep rounded-2xl p-10 text-center">
          <h1 className="text-2xl font-display font-bold text-on-surface mb-2">Visa country not found</h1>
          <p className="text-on-surface-variant mb-6">The visa page you are looking for does not exist.</p>
          <Link href="/visa" className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)' }}>
            Browse all visa services
          </Link>
        </div>
      </main>
    );
  }

  const currency = country.currency || 'BDT';
  const say = (n: number | undefined) => (n == null ? null : fmt(n, currency));

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <Link href="/visa" className="inline-flex items-center gap-2 text-sm hover:underline text-accent">
          <ArrowLeft className="w-4 h-4" /> Back to visa services
        </Link>
        <ShareMenu path={`/visa/${slug}`} title={`${country.name} Visa`} />
      </div>

      {/* ── Hero banner ─────────────────────────────────────────────── */}
      <div className="relative mb-8 h-56 sm:h-72 rounded-2xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={visaImage(country, 1400, 560)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3">
          {(country.flagUrl || getCountryFlagByName(country.name)) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={country.flagUrl || getCountryFlagByName(country.name)} alt="" className="w-14 h-10 object-cover rounded-md shadow ring-1 ring-white/40" />
          )}
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-white/70 mb-1">
              Visa from Bangladesh
            </div>
            <h1 className="text-white text-3xl sm:text-4xl font-display font-bold drop-shadow">
              {country.name.replace(/\s*visa\s*$/i, '')} Visa
            </h1>
            {country.region && (
              <p className="text-white/80 text-sm capitalize mt-0.5">{country.region.replace('_', ' ')}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* ── Main column ───────────────────────────────────────────── */}
        <div className="min-w-0">
          {/* Intro */}
          {(country.description || content.intro) && (
            <p className="text-on-surface-variant leading-relaxed mb-8 text-[15px]">
              {content.intro || country.description}
            </p>
          )}

          {/* ── Visa options & fees (Live Services or Tier fallback) ── */}
          {countryServices.length > 0 ? (
            <section className="mb-10">
              <h2 className="text-xl font-display font-semibold text-on-surface mb-1">Available Visa Packages</h2>
              <p className="text-sm text-on-surface-variant mb-5">
                All-inclusive processing fees with dedicated visa officer assistance.
              </p>
              <div className="space-y-5">
                {countryServices.map((s) => {
                  const rawTitle = isBn ? (s.titleBn || s.title) : s.title;
                  const displayTitle =
                    rawTitle.trim().toLowerCase() === country.name.trim().toLowerCase()
                      ? `${country.name} Tourist Visa`
                      : rawTitle;
                  const displayTime = isBn ? (s.processingTimeBn || s.processingTime) : s.processingTime;
                  const displayDesc = isBn ? (s.descriptionBn || s.description) : s.description;
                  const displayReqs = (isBn && s.requirementsBn && s.requirementsBn.length > 0) ? s.requirementsBn : s.requirements;

                  return (
                    <article
                      key={s.id}
                      className="rounded-2xl border glass card-elevated p-5 sm:p-6 transition-all hover:border-accent/40"
                      style={{ borderColor: 'var(--color-outline-variant)' }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-lg sm:text-xl font-bold text-on-surface">{displayTitle}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {displayTime && (
                              <Badge variant="cyan" className="gap-1">
                                <Clock className="w-3 h-3" />
                                {/days|hours|weeks|months|দিন|ঘণ্টা|সপ্তাহ|মাস/i.test(displayTime)
                                  ? displayTime
                                  : `${displayTime} working days`}
                              </Badge>
                            )}
                            {s.pointsAwarded ? (
                              <Badge variant="amber" className="gap-1 font-bold">
                                <Coins className="w-3 h-3" /> +{s.pointsAwarded.toLocaleString()} pts
                              </Badge>
                            ) : null}
                          </div>
                          {displayDesc && (
                            <p className="text-sm text-on-surface-variant mt-3 leading-relaxed whitespace-pre-line">
                              {displayDesc}
                            </p>
                          )}
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-hairline">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] uppercase tracking-wider text-muted font-semibold block">{isBn ? 'মোট ফি' : 'Total fee'}</span>
                            <span className="text-2xl sm:text-3xl font-display font-extrabold text-accent">
                              {fmt(s.price, s.currency)}
                            </span>
                          </div>
                          <button
                            onClick={() => bookService(s.id)}
                            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 hover:scale-[1.02] active:scale-[0.98]"
                            style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)' }}
                          >
                            {isBn ? 'বুক করুন' : 'Book now'} <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <RequirementsDisplay requirements={displayReqs} isBn={isBn} />
                    </article>
                  );
                })}
              </div>
            </section>
          ) : (
            <div className="rounded-2xl border glass p-8 text-center mb-10" style={{ borderColor: 'var(--color-outline-variant)' }}>
              <FileCheck className="w-10 h-10 mx-auto mb-3 opacity-40 text-muted" />
              <p className="text-base font-semibold text-on-surface">
                {isBn ? 'এই দেশের জন্য বর্তমানে কোনো সক্রিয় ভিসা প্যাকেজ নেই' : 'No visa packages currently listed for this country'}
              </p>
              <p className="text-xs text-on-surface-variant mt-1 mb-4">
                {isBn ? 'ভিসা তথ্য ও সহায়তার জন্য আমাদের টিমের সাথে সরাসরি যোগাযোগ করুন।' : 'Contact our visa assistance desk for personalized requirements and guidance.'}
              </p>
              <Link
                href="/visa"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)' }}
              >
                {isBn ? 'সব ভিসা প্যাকেজ ব্রাউজ করুন' : 'Browse all visa services'}
              </Link>
            </div>
          )}

          {/* ── How it works ────────────────────────────────────────── */}
          {processSteps.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-display font-semibold text-on-surface mb-4">How it works</h2>
              <ol className="space-y-3">
                {processSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full inline-flex items-center justify-center shrink-0 text-xs font-bold text-white" style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)' }}>
                      {i + 1}
                    </span>
                    <span className="text-on-surface pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* ── Key destinations ────────────────────────────────────── */}
          {keyDestinations.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-display font-semibold text-on-surface flex items-center gap-2 mb-4">
                <Landmark className="w-5 h-5 text-accent" /> Top places to visit
              </h2>
              <div className="flex flex-wrap gap-2">
                {keyDestinations.map((d, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border" style={{ borderColor: 'var(--color-outline-variant)', backgroundColor: 'color-mix(in oklab, var(--color-primary) 6%, transparent)' }}>
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    {d}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* ── General Embassy Guidelines (only if packages lack document requirements) ── */}
          {!hasPackageRequirements && countryRequirements.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-display font-semibold text-on-surface flex items-center gap-2 mb-4">
                <FileCheck className="w-5 h-5 text-accent" /> General Embassy Guidelines
              </h2>
              <div className="rounded-2xl border glass p-5" style={{ borderColor: 'var(--color-outline-variant)' }}>
                <ul className="space-y-2.5">
                  {countryRequirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-on-surface-variant">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* ── Visa types (flat) ───────────────────────────────────── */}
          {country.visaTypes.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-display font-semibold text-on-surface mb-4">Visa types</h2>
              <div className="flex flex-wrap gap-2">
                {country.visaTypes.map((t) => (
                  <span key={t} className="px-3 py-1.5 rounded-full text-sm font-semibold capitalize" style={{ backgroundColor: 'color-mix(in oklab, var(--color-primary) 12%, transparent)', color: 'var(--color-nav-active)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* ── Terms & conditions ──────────────────────────────────── */}
          {content.terms && content.terms.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-display font-semibold text-on-surface mb-4">Terms &amp; conditions</h2>
              <div className="rounded-2xl border glass p-5" style={{ borderColor: 'var(--color-outline-variant)' }}>
                <ul className="space-y-2">
                  {content.terms.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
                      <span className="text-accent font-bold mt-px">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* ── FAQ ─────────────────────────────────────────────────── */}
          {faq.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-display font-semibold text-on-surface mb-4">Frequently asked questions</h2>
              <div className="space-y-3">
                {faq.map((f, i) => {
                  const key = f.question || String(i);
                  const open = openFaq === key;
                  return (
                    <div key={key} className="rounded-2xl border glass overflow-hidden" style={{ borderColor: 'var(--color-outline-variant)' }}>
                      <button
                        type="button"
                        onClick={() => setOpenFaq(open ? null : key)}
                        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-on-surface"
                      >
                        {f.question}
                        <ChevronToggle open={open} />
                      </button>
                      {open && <p className="px-5 pb-4 text-sm text-on-surface-variant leading-relaxed">{f.answer}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <ReviewsSection itemType="visa" itemId={country.id} />
        </div>

        {/* ── Sidebar ───────────────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-24 self-start space-y-6">
          {/* Lead / enquiry form */}
          <div className="rounded-2xl border glass p-6" style={{ borderColor: 'var(--color-outline-variant)' }}>
            <LeadForm
              formSlug={`visa-${country.slug}`}
              packageSlug={country.name}
              title="Start your visa application"
              subtitle="Request a callback — a visa specialist will guide you."
              compact
              cta={`Apply for ${country.name} visa`}
            />
          </div>

          {/* Country facts */}
          {facts.length > 0 && (
            <div className="rounded-2xl border glass p-6" style={{ borderColor: 'var(--color-outline-variant)' }}>
              <h2 className="font-display text-lg font-semibold text-on-surface flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-accent" /> About {country.name}
              </h2>
              <dl className="space-y-3 text-sm">
                {facts.map((f, i) => (
                  <div key={i}>
                    <dt className="text-xs uppercase tracking-wider text-on-surface-variant">{f.label}</dt>
                    <dd className="text-on-surface font-medium mt-0.5">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Quick fee summary */}
          <div className="rounded-2xl border glass p-6" style={{ borderColor: 'var(--color-outline-variant)' }}>
            <div className="text-[10px] uppercase tracking-widest font-bold text-muted">Starting visa fee</div>
            <div className="text-3xl font-display font-bold my-1 text-on-surface">{fmt(startingFee, country.currency)}</div>
            <div className="text-xs text-muted mb-4">per applicant, service charges included</div>
            {country.processingTime && (
              <div className="flex items-center gap-2 text-sm mb-3">
                <Clock className="w-4 h-4 text-muted" />
                <span>{country.processingTime}</span>
              </div>
            )}
            {country.visaTypes.length > 0 && (
              <div className="flex items-center gap-2 text-sm mb-3">
                <Briefcase className="w-4 h-4 text-muted" />
                <span className="capitalize">{country.visaTypes.join(', ')}</span>
              </div>
            )}
            <button
              onClick={() =>
                countryServices[0]
                  ? bookService(countryServices[0].id)
                  : router.push(`/contact?subject=${encodeURIComponent(`Visa enquiry — ${country.name}`)}`)
              }
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
              style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)' }}
            >
              {countryServices.length ? 'Book a visa' : 'Enquire now'}
            </button>
          </div>

          {/* Other visa countries */}
          {otherCountries.length > 0 && (
            <div className="rounded-2xl border glass p-6" style={{ borderColor: 'var(--color-outline-variant)' }}>
              <h2 className="font-display text-lg font-semibold text-on-surface mb-4">Other visa countries</h2>
              <div className="space-y-2">
                {otherCountries.slice(0, 8).map((c) => (
                  <Link
                    key={c.id}
                    href={`/visa/${c.slug}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-surface-container/60 transition-colors"
                  >
                    {c.flagUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.flagUrl} alt="" className="w-7 h-5 object-cover rounded shadow ring-1 ring-outline-variant" />
                    )}
                    <span className="text-on-surface font-medium flex-1">{c.name}</span>
                    <ArrowRight className="w-4 h-4 text-muted" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
