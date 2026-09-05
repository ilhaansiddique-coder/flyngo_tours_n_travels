'use client';

import { useMemo, useState } from 'react';
import { assetUrl } from '@/lib/api';
import { pickField } from '@/lib/lang';
import { cn } from '@/lib/utils';
import type { GalleryImage, Lang } from '@/types';

export function GalleryGrid({
  images,
  categories,
  lang,
}: {
  images: GalleryImage[];
  categories: string[];
  lang: Lang;
}) {
  const [active, setActive] = useState<string>('all');
  const filtered = useMemo(
    () => (active === 'all' ? images : images.filter((img) => img.category === active)),
    [active, images],
  );

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setActive('all')}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
            active === 'all'
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-[var(--color-mist)] text-[var(--color-ink-soft)] hover:bg-[var(--color-primary-light)]',
          )}
        >
          {lang === 'bn' ? 'সব' : 'All'}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              active === cat
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-mist)] text-[var(--color-ink-soft)] hover:bg-[var(--color-primary-light)]',
            )}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((img) => {
          const title = pickField(lang, img.titleEn, img.titleBn);
          return (
            <figure key={img.id} className="group relative overflow-hidden rounded-xl">
              <img
                src={assetUrl(img.image)}
                alt={title}
                className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-52"
              />
              {title ? (
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-xs font-semibold text-white">
                  {title}
                </figcaption>
              ) : null}
            </figure>
          );
        })}
      </div>
    </div>
  );
}
