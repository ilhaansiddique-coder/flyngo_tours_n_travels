import { Mail, MapPin, Phone } from 'lucide-react';
import { PageHero } from '@/components/page-hero';
import { ContactForm } from '@/components/contact-form';
import { getSiteSettings } from '@/lib/get-site';
import { getServerLang } from '@/lib/server-lang';

export default async function ContactPage() {
  const lang = await getServerLang();
  const settings = await getSiteSettings();

  return (
    <>
      <PageHero
        title={lang === 'bn' ? 'যোগাযোগ' : 'Contact Us'}
        subtitle={
          lang === 'bn'
            ? 'প্রশ্ন, অংশীদারিত্ব বা সহায়তা — লিখুন, আমরা দ্রুত উত্তর দেব।'
            : 'Questions, partnerships or help — write to us and we will reply.'
        }
      />
      <section className="section-pad">
        <div className="container-site grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5 rounded-2xl bg-[var(--color-mist)] p-7">
            <h2 className="text-xl font-bold">{lang === 'bn' ? 'অফিস' : 'Office'}</h2>
            <p className="flex items-start gap-3 text-sm text-[var(--color-ink-soft)]">
              <Mail size={16} className="mt-0.5 text-[var(--color-primary)]" />
              {settings.email || 'info@volunteerbdtrust.org'}
            </p>
            <p className="flex items-start gap-3 text-sm text-[var(--color-ink-soft)]">
              <Phone size={16} className="mt-0.5 text-[var(--color-primary)]" />
              {settings.phone || '01970534363'}
            </p>
            <p className="flex items-start gap-3 text-sm text-[var(--color-ink-soft)]">
              <MapPin size={16} className="mt-0.5 text-[var(--color-primary)]" />
              <span>
                {settings.addressLine1}
                <br />
                {settings.addressLine2}
              </span>
            </p>
          </div>
          <div className="rounded-2xl border border-black/5 bg-white p-7 shadow-[var(--shadow-card)]">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
