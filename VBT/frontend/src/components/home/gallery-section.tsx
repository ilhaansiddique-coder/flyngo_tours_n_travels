import Link from 'next/link';
import { Button, SectionHeader } from '@/components/ui/button';
import { assetUrl } from '@/lib/api';
import { pickField } from '@/lib/lang';
import { getServerLang } from '@/lib/server-lang';
import type { GalleryImage } from '@/types';

export async function GallerySection({ images }: { images: GalleryImage[] }) {
  const lang = await getServerLang();
  if (!images?.length) return null;
  const preview = images.slice(0, 8);

  return (
    <section className="section-pad bg-[var(--color-mist)]">
      <div className="container-site">
        <SectionHeader title="Gallery" />
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {preview.map((img) => {
            const title = pickField(lang, img.titleEn, img.titleBn);
            return (
              <Link
                key={img.id}
                href="/gallery"
                className="group relative overflow-hidden rounded-xl"
              >
                <img
                  src={assetUrl(img.image)}
                  alt={title}
                  className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-48"
                />
                {title ? (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {title}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
        <div className="mt-8 flex justify-center">
          <Button href="/gallery" variant="outline" className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)]">
            See More
          </Button>
        </div>
      </div>
    </section>
  );
}