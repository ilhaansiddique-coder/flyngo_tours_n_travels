import { PageHero } from '@/components/page-hero';
import { getServerLang } from '@/lib/server-lang';

export default async function PrivacyPage() {
  const lang = await getServerLang();
  const bn = lang === 'bn';

  return (
    <>
      <PageHero title={bn ? 'গোপনীয়তা নীতি' : 'Privacy Policy'} />
      <section className="section-pad">
        <article className="container-site max-w-3xl space-y-4 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          <p>
            {bn
              ? 'আমরা আপনার নাম, ইমেইল, ফোন ও দানের তথ্য শুধু সেবা প্রদান, রসিদ পাঠানো এবং যোগাযোগের জন্য সংগ্রহ করি।'
              : 'We collect your name, email, phone and donation details only to deliver services, send receipts and stay in touch.'}
          </p>
          <p>
            {bn
              ? 'তথ্য তৃতীয় পক্ষের কাছে বিক্রি করা হয় না। আইনগত বাধ্যবাধকতা ছাড়া শেয়ার করা হয় না।'
              : 'We do not sell personal data. Sharing happens only when required by law or to process a payment.'}
          </p>
          <p>
            {bn
              ? 'নিউজলেটার থেকে সরে যেতে যেকোনো সময় আমাদের ইমেইল করুন।'
              : 'You may unsubscribe from the newsletter at any time by emailing us.'}
          </p>
        </article>
      </section>
    </>
  );
}
