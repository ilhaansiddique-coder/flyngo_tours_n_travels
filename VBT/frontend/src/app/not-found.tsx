import { Button } from '@/components/ui/button';
import { getServerLang } from '@/lib/server-lang';

export default async function NotFound() {
  const lang = await getServerLang();
  return (
    <section className="section-pad">
      <div className="container-site max-w-lg py-16 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-primary)]">404</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          {lang === 'bn' ? 'পৃষ্ঠাটি পাওয়া যায়নি' : 'Page not found'}
        </h1>
        <p className="mt-3 text-[var(--color-ink-soft)]">
          {lang === 'bn'
            ? 'আপনি যে পৃষ্ঠাটি খুঁজছেন তা নেই বা স্থানান্তরিত হয়েছে।'
            : 'The page you are looking for does not exist or has moved.'}
        </p>
        <div className="mt-8">
          <Button href="/">{lang === 'bn' ? 'হোমে ফিরে যান' : 'Back to Home'}</Button>
        </div>
      </div>
    </section>
  );
}
