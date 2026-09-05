import { PageHero } from '@/components/page-hero';
import { ApplicationForm } from '@/components/application-form';
import { getServerLang } from '@/lib/server-lang';

export default async function GetInvolvedPage({
  searchParams,
}: {
  searchParams: Promise<{ active?: string }>;
}) {
  const lang = await getServerLang();
  const { active } = await searchParams;

  return (
    <>
      <PageHero
        title={lang === 'bn' ? 'যুক্ত হন' : 'Get Involved'}
        subtitle={
          lang === 'bn'
            ? 'আপনার সহায়তা — সময়, অর্থ কিংবা দক্ষতা — উম্মাহকে সুন্নাহর সাথে রাখে।'
            : 'Every bit of support — time, money or skill — keeps the Ummah moving with the Sunnah.'
        }
      />
      <section className="section-pad">
        <div className="container-site max-w-2xl">
          <ApplicationForm initialTab={active} />
        </div>
      </section>
    </>
  );
}
