import { PageHero } from '@/components/page-hero';
import { DonationForm } from '@/components/home/donation-form';
import { getSiteBag } from '@/lib/get-site';
import { getServerLang } from '@/lib/server-lang';

export default async function DonatePage() {
  const lang = await getServerLang();
  const bag = await getSiteBag();

  return (
    <>
      <PageHero
        title={lang === 'bn' ? 'দান করুন' : 'Donate'}
        subtitle={
          lang === 'bn'
            ? 'আপনার দান শিক্ষা, ত্রাণ ও দাওয়াহকে শক্তিশালী করে।'
            : 'Your gift powers education, relief and Dawah across Bangladesh.'
        }
      />
      <section className="pb-20 pt-4">
        <DonationForm products={bag.products} settings={bag.settings} />
      </section>
    </>
  );
}
