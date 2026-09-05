import { PageHero } from '@/components/page-hero';
import { GalleryGrid } from '@/components/gallery-grid';
import { getGallery } from '@/lib/get-site';
import { getServerLang } from '@/lib/server-lang';

export default async function GalleryPage() {
  const lang = await getServerLang();
  const gallery = await getGallery();

  return (
    <>
      <PageHero
        title={lang === 'bn' ? 'গ্যালারি' : 'Gallery'}
        subtitle={
          lang === 'bn'
            ? 'মাঠ পর্যায়ের কার্যক্রম থেকে কিছু মুহূর্ত।'
            : 'Moments from programmes across the country.'
        }
      />
      <section className="section-pad">
        <div className="container-site">
          <GalleryGrid images={gallery.images} categories={gallery.categories} lang={lang} />
        </div>
      </section>
    </>
  );
}
