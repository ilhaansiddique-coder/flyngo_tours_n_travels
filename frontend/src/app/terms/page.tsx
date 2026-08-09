import { Section, Container } from '@/components/ui/section';
import { PageHero } from '@/components/ui/page-hero';

export const metadata = {
  title: 'Terms of Service — Flyngo',
  description: 'Terms and conditions for using the Flyngo travel platform.',
};

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using flyngo.world and related services, you agree to be bound by these Terms of Service. If you do not agree, you must not use the platform.',
  },
  {
    title: '2. Services',
    body: 'Flyngo is an online travel agency that facilitates the booking of flights, hotels, tours, visa processing, and transport services supplied by third-party providers. We act as an intermediary between you and the supplier.',
  },
  {
    title: '3. Bookings & Payments',
    body: 'All bookings are confirmed only after full payment (or authorized deposit) is received and the supplier confirms availability. Prices are displayed in the currency shown at checkout and include applicable taxes and service fees unless stated otherwise.',
  },
  {
    title: '4. Cancellations & Refunds',
    body: 'Cancellation policies vary by supplier and are displayed before you confirm payment. Airline tickets are generally non-refundable unless the fare rules state otherwise. Hotel and tour refunds follow the supplier policy shown on the booking page.',
  },
  {
    title: '5. Travel Documents',
    body: 'You are responsible for ensuring valid passports, visas, vaccinations, and any other documents required for your trip. Flyngo provides visa assistance as a service but the final decision rests with the relevant consulate or embassy.',
  },
  {
    title: '6. User Accounts',
    body: 'You are responsible for keeping your account credentials secure and for all activity under your account. Notify us immediately at security@flyngo.world if you suspect unauthorized access.',
  },
  {
    title: '7. Prohibited Use',
    body: 'You may not use the platform for fraudulent bookings, to abuse promotional codes, to scrape data, to interfere with platform security, or for any unlawful purpose. We may suspend or terminate accounts that violate these terms.',
  },
  {
    title: '8. Limitation of Liability',
    body: 'To the maximum extent permitted by law, Flyngo is not liable for indirect, incidental, or consequential damages arising from your use of the platform or from the acts of any third-party supplier. Our total liability for any claim is limited to the fees paid to Flyngo for the affected booking.',
  },
  {
    title: '9. Changes to These Terms',
    body: 'We may update these terms from time to time. The "Last updated" date at the top reflects the most recent change. Continued use of the platform after changes constitutes acceptance of the revised terms.',
  },
  {
    title: '10. Governing Law',
    body: 'These terms are governed by the laws of Bangladesh. Any dispute will be resolved in the courts of Dhaka, unless mandatory consumer protection laws in your country provide otherwise.',
  },
  {
    title: '11. Contact',
    body: 'For questions about these terms, email legal@flyngo.world.',
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={<>Terms of <span className="gradient-text-warm">Service</span></>}
        subtitle="Last updated: January 2026"
      />

      <Section>
        <Container size="narrow">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-white/70">
              These Terms of Service govern your use of the Flyngo platform. Please read them carefully
              before making a booking.
            </p>
            {sections.map((s) => (
              <div key={s.title} className="mt-8">
                <h2 className="font-display text-2xl font-bold text-white">{s.title}</h2>
                <p className="mt-3 text-white/60 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
