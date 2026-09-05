import { PageHero } from '@/components/page-hero';
import { getServerLang } from '@/lib/server-lang';

export default async function TaxNoticePage() {
  const lang = await getServerLang();
  const bn = lang === 'bn';

  return (
    <>
      <PageHero title={bn ? 'কর নোটিশ' : 'Tax Notice'} />
      <section className="section-pad">
        <article className="container-site max-w-3xl space-y-4 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          <p>
            {bn
              ? 'নিবন্ধিত দাতব্য প্রতিষ্ঠান ভলান্টিয়ার বাংলাদেশ ট্রাস্টে দান প্রযোজ্য ক্ষেত্রে আয়কর অধ্যাদেশের ৪৪(৪) ধারা অনুযায়ী কর-ছাড়ের জন্য যোগ্য। করের সময় স্বীকৃতিপত্রের জন্য আমাদের সাথে যোগাযোগ করুন।'
              : 'Donations to Volunteer Bangladesh Trust (registered charitable organisation) are eligible for tax credit under section 44 (4) of the Income Tax Ordinance where applicable. Please contact us for the acknowledgement certificate at tax time.'}
          </p>
        </article>
      </section>
    </>
  );
}
