import { PageHero } from '@/components/page-hero';
import { ZakatCalculator } from '@/components/zakat-calculator';
import { getZakatNisab } from '@/lib/get-site';
import { getServerLang } from '@/lib/server-lang';

export default async function ZakatCalculatorPage() {
  const lang = await getServerLang();
  const nisab = await getZakatNisab();

  return (
    <>
      <PageHero
        title={lang === 'bn' ? 'যাকাত ক্যালকুলেটর' : 'Zakat Calculator'}
        subtitle={
          lang === 'bn'
            ? 'এক হিজরি বছর ধরে থাকা সম্পদের ভিত্তিতে আপনার যাকাত হিসাব করুন।'
            : 'Work out your Zakat from the assets you hold for a Hijri year.'
        }
      />
      <section className="section-pad">
        <div className="container-site max-w-4xl">
          <ZakatCalculator nisab={nisab} />
        </div>
      </section>
    </>
  );
}
