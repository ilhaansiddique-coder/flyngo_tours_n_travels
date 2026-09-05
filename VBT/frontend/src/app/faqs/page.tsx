import { PageHero } from '@/components/page-hero';
import { getFaqs } from '@/lib/get-site';
import { pickField } from '@/lib/lang';
import { getServerLang } from '@/lib/server-lang';

export default async function FaqsPage() {
  const lang = await getServerLang();
  const faqs = await getFaqs();

  return (
    <>
      <PageHero
        title={lang === 'bn' ? 'প্রশ্নোত্তর' : 'Frequently Asked Questions'}
        subtitle={
          lang === 'bn'
            ? 'দান, স্বেচ্ছাসেবা ও কার্যক্রম নিয়ে সাধারণ প্রশ্নের উত্তর।'
            : 'Answers about donations, volunteering and our programmes.'
        }
      />
      <section className="section-pad">
        <div className="container-site max-w-3xl space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.id}
              className="group rounded-2xl border border-black/5 bg-white p-5 shadow-[var(--shadow-card)]"
            >
              <summary className="cursor-pointer list-none text-base font-bold text-[var(--color-ink)]">
                <span className="flex items-center justify-between gap-4">
                  {pickField(lang, faq.questionEn, faq.questionBn)}
                  <span className="text-[var(--color-primary)] transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                {pickField(lang, faq.answerEn, faq.answerBn)}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
