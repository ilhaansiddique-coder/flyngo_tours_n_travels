import { Button } from '@/components/ui/button';
import { assetUrl } from '@/lib/api';
import { pickField } from '@/lib/lang';
import { getServerLang } from '@/lib/server-lang';
import type { Hero } from '@/types';

export async function HomeHero({ hero }: { hero: Hero | null }) {
  const lang = await getServerLang();
  if (!hero) return null;

  const title = pickField(lang, hero.titleEn, hero.titleBn);
  const description = pickField(lang, hero.descriptionEn, hero.descriptionBn);
  const tagline = pickField(lang, hero.taglineEn, hero.taglineBn);
  const highlight = pickField(lang, hero.highlightEn, hero.highlightBn);

  return (
    <section
      className="relative flex min-h-[80vh] items-end overflow-hidden lg:min-h-[560px]"
      style={{
        backgroundImage: `linear-gradient(97deg, rgba(0,0,0,.88) 28%, rgba(0,0,0,.25) 75%, rgba(0,0,0,.05) 100%), url(${assetUrl(
          hero.backgroundImage,
        )})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="container-site relative z-10 py-24 lg:py-32">
        <div className="animate-fade-in-up max-w-2xl">
          {tagline ? (
            <p className="mb-4 flex flex-wrap items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[var(--color-gold-deep)]">
              <span>{tagline}</span>
              {highlight ? <span className="font-bold">{highlight}</span> : null}
            </p>
          ) : null}
          <h1 className="text-balance text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={hero.ctaPrimaryLink} size="lg" variant="primary">
              {hero.ctaPrimaryText}
            </Button>
            <Button href={hero.ctaSecondaryLink} size="lg" variant="outline">
              {hero.ctaSecondaryText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}