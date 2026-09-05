import { PageHero } from '@/components/page-hero';
import { getServerLang } from '@/lib/server-lang';

export default async function TermsPage() {
  const lang = await getServerLang();
  const bn = lang === 'bn';

  return (
    <>
      <PageHero title={bn ? 'শর্তাবলি' : 'Terms & Conditions'} />
      <section className="section-pad">
        <article className="container-site prose-site max-w-3xl space-y-4 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          <p>
            {bn
              ? 'এই ওয়েবসাইট ব্যবহার করে আপনি ভলান্টিয়ার বাংলাদেশ ট্রাস্টের নিম্নলিখিত শর্তাবলিতে সম্মত হচ্ছেন।'
              : 'By using this website you agree to the following terms of Volunteer Bangladesh Trust.'}
          </p>
          <p>
            {bn
              ? 'দান স্বেচ্ছায় করা হয় এবং পেমেন্ট নিশ্চিত হওয়ার পর নির্দিষ্ট তহবিলে ব্যবহার করা হয়। রেফারেন্স নম্বর আপনার রসিদ।'
              : 'Donations are voluntary. Once payment is confirmed, funds are used in the designated programme. Your reference number is your receipt.'}
          </p>
          <p>
            {bn
              ? 'ওয়েবসাইটের বিষয়বস্তু শিক্ষামূলক। এটি আইনি পরামর্শ নয়। প্রয়োজনে যোগাযোগ করুন।'
              : 'Website content is educational and not legal advice. Contact us for programme-specific questions.'}
          </p>
        </article>
      </section>
    </>
  );
}
