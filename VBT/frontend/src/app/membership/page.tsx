import Link from 'next/link';
import { PageHero } from '@/components/page-hero';
import { MembershipForm } from '@/components/membership-form';
import { StatusTracker } from '@/components/status-tracker';
import { getServerLang } from '@/lib/server-lang';

export default async function MembershipPage() {
  const lang = await getServerLang();
  const bn = lang === 'bn';

  return (
    <>
      <PageHero
        title={bn ? 'সদস্য আবেদন' : 'Membership Application'}
        subtitle={
          bn
            ? 'দাতা সদস্য, সাধারণ সদস্য, আজীবন সদস্য অথবা স্বেচ্ছাসেবক — আপনার পছন্দের শ্রেণিতে আবেদন করুন। অনুমোদনের পর সদস্য ফি প্রদান করুন।'
            : 'Apply as a Donor, General, Lifetime Member or Volunteer. Your application is reviewed by the membership committee before approval.'
        }
      />

      <section className="section-pad bg-[var(--color-mist)]">
        <div className="container-site grid gap-8 lg:grid-cols-[1fr_360px]">
          <MembershipForm />
          <div className="space-y-6">
            <StatusTracker />
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-card)]">
              <h3 className="text-lg font-bold">{bn ? 'প্রয়োজনীয় তথ্য' : 'Good to know'}</h3>
              <ul className="mt-4 space-y-3 text-sm text-[var(--color-ink-soft)]">
                <li className="flex gap-2">
                  <span className="text-[var(--color-primary)]">•</span>
                  {bn
                    ? 'সদস্য ফি: সাধারণ ৳১,০০০/বছর, দাতা ৳৫,০০০/বছর, স্বেচ্ছাসেবক ৳৩০০/বছর, আজীবন ৳১,০০,০০০ (এককালীন)।'
                    : 'Fees: General ৳1,000/yr, Donor ৳5,000/yr, Volunteer ৳300/yr, Lifetime ৳100,000 one-time.'}
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--color-primary)]">•</span>
                  {bn
                    ? 'সদস্য ফি bKash/Nagad/ব্যাংকে জমা দিয়ে রেফারেন্স সংরক্ষণ করুন।'
                    : 'Pay your fee via bKash/Nagad/bank and keep the transaction reference.'}
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--color-primary)]">•</span>
                  {bn
                    ? 'অনুমোদনের পর আপনি অফিসিয়াল সদস্য কার্ড ও আইডি নম্বর পাবেন।'
                    : 'Once approved you receive an official member ID and certificate.'}
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--color-primary)]">•</span>
                  <Link href="/donate" className="font-semibold text-[var(--color-royal)] underline">
                    {bn ? 'সদস্য ফি বাবদ দান করুন →' : 'Pay your membership via donation →'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}