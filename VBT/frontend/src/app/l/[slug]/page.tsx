import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FloatingRegister } from '@/components/floating-register';
import { LandingFormSection } from '@/components/landing/landing-form-section';
import { getLandingPage } from '@/lib/get-site';
import { pickField } from '@/lib/lang';
import { getServerLang } from '@/lib/server-lang';
import { assetUrl } from '@/lib/api';
import type { LandingSection } from '@/types';

function stringVal(item: Record<string, unknown> | undefined, key: string): string {
  const v = item?.[key];
  return typeof v === 'string' ? v : '';
}

export default async function LandingSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const lang = await getServerLang();
  const { slug } = await params;
  const page = await getLandingPage(slug);
  if (!page) notFound();

  const title = pickField(lang, page.titleEn, page.titleBn);
  const subtitle = pickField(lang, page.subtitleEn, page.subtitleBn);

  const renderSection = (s: LandingSection, index: number) => {
    const heading = pickField(lang, s.headingEn, s.headingBn);
    const body = pickField(lang, s.bodyEn, s.bodyBn);
    switch (s.type) {
      case 'text':
        return (
          <section key={index} className="section-pad-sm">
            <div className="container-site max-w-3xl">
              {heading ? <h2 className="text-2xl font-bold">{heading}</h2> : null}
              {body ? <p className="mt-4 whitespace-pre-line leading-relaxed text-[var(--color-ink-soft)]">{body}</p> : null}
            </div>
          </section>
        );
      case 'split':
        return (
          <section key={index} className="section-pad-sm bg-[var(--color-mist)]">
            <div className="container-site max-w-3xl">
              {heading ? <h2 className="text-2xl font-bold">{heading}</h2> : null}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {(s.items || []).map((item, i) => (
                  <div key={i} className="rounded-2xl border border-black/5 bg-white p-5 shadow-[var(--shadow-card)]">
                    <p className="text-sm text-[var(--color-ink-soft)]">{pickField(lang, stringVal(item, 'labelEn'), stringVal(item, 'labelBn'))}</p>
                    <p className="mt-1 text-xl font-bold text-[var(--color-primary-dark)]">{stringVal(item, 'value')}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      case 'cards':
        return (
          <section key={index} className="section-pad-sm">
            <div className="container-site">
              {heading ? <h2 className="text-2xl font-bold">{heading}</h2> : null}
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {(s.items || []).map((item, i) => (
                  <div key={i} className="rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-card)]">
                    {stringVal(item, 'titleEn') || stringVal(item, 'titleBn') ? (
                      <h3 className="text-base font-bold">{pickField(lang, stringVal(item, 'titleEn'), stringVal(item, 'titleBn'))}</h3>
                    ) : null}
                    {stringVal(item, 'bodyEn') || stringVal(item, 'bodyBn') ? (
                      <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                        {pickField(lang, stringVal(item, 'bodyEn'), stringVal(item, 'bodyBn'))}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      case 'cta':
        return (
          <section key={index} className="section-pad-sm bg-[var(--color-primary-darker)] text-white">
            <div className="container-site text-center">
              {heading ? <h2 className="text-2xl font-bold">{heading}</h2> : null}
              {body ? <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">{body}</p> : null}
              <div className="mt-6">
                <Button
                  href={s.link || '/contact'}
                  className="bg-[var(--color-gold)] text-[#4a3008] hover:bg-[var(--color-gold-deep)]"
                >
                  {pickField(lang, s.buttonLabelEn, s.buttonLabelBn) || (lang === 'bn' ? 'অধিক জানুন' : 'Learn more')}
                </Button>
              </div>
            </div>
          </section>
        );
      case 'form':
        return (
          <LandingFormSection
            key={index}
            headingEn={s.headingEn}
            headingBn={s.headingBn}
            bodyEn={s.bodyEn}
            bodyBn={s.bodyBn}
            responseUrl={s.googleFormResponseUrl}
            formUrl={s.googleFormUrl}
            fbzx={s.fbzx}
          />
        );
      default:
        return null;
    }
  };

  const coverSrc = (() => {
    if (!page.coverPhoto) return '';
    return /^data:image/.test(page.coverPhoto) ? page.coverPhoto : assetUrl(page.coverPhoto);
  })();

  const heroSrc =
    slug === 'saint-martin-trip-2026' ? assetUrl('/images/landing/saint-martin-hero.jpg') : coverSrc;

  const hasForm = (page.sections || []).some((s) => s.type === 'form');

  const renderSections = (() => {
    const out = (page.sections || []).filter((s) => s.type !== 'hero');
    const formIdx = out.findIndex((s) => s.type === 'form');
    const costIdx = out.findIndex(
      (s) => s.type === 'text' && (s.headingEn === 'Trip cost' || s.headingBn === 'ভ্রমণ খরচ'),
    );
    if (formIdx !== -1 && costIdx !== -1 && formIdx < costIdx) {
      const [form] = out.splice(formIdx, 1);
      out.splice(costIdx, 0, form);
    }
    return out;
  })();

  return (
    <>
      <section className="relative overflow-hidden border-b border-black/5 bg-[var(--color-primary-darker)] text-white">
        {heroSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroSrc} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-darker)]/70 via-transparent to-transparent" />
        <div className="container-site relative z-10 px-6 py-20 text-center sm:py-28">
          <span className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-bold uppercase tracking-widest">
            {lang === 'bn' ? 'ল্যান্ডিং পেজ' : 'Campaign'}
          </span>
        </div>
      </section>
      <section className="section-pad-sm">
        <div className="container-site max-w-4xl text-center">
          <h1 className="mx-auto w-full text-balance text-center text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          {subtitle ? (
            <p className="mx-auto mt-4 w-full max-w-3xl text-center text-base leading-relaxed text-[var(--color-ink-soft)] sm:text-lg">{subtitle}</p>
          ) : null}
        </div>
      </section>
      <div className="divide-y divide-black/5">
        {renderSections.map(renderSection)}
      </div>
      {hasForm ? <FloatingRegister /> : null}
    </>
  );
}