import { Section, Container } from '@/components/ui/section';
import { PageHero } from '@/components/ui/page-hero';

export const metadata = {
  title: 'Privacy Policy — Flyngo',
  description: 'How Flyngo collects, uses, and protects your personal information.',
};

const sections = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly (name, email, phone, passport details for visa processing, payment information) and information collected automatically (IP address, device type, pages visited, booking history) to operate the platform and fulfil your travel bookings.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'Your information is used to process bookings, issue tickets and visas, communicate trip updates, prevent fraud, comply with legal obligations, and improve our services. We do not sell your personal data to third parties.',
  },
  {
    title: '3. Sharing With Suppliers',
    body: 'To complete a booking we share the minimum necessary information with airlines, hotels, tour operators, payment processors, and visa service partners. These parties are contractually bound to use the data only for the service you booked.',
  },
  {
    title: '4. Payment Security',
    body: 'Card payments are processed by PCI-DSS compliant providers (Stripe, SSLCommerz, bKash, Nagad). Flyngo never stores full card numbers or CVV codes on its servers.',
  },
  {
    title: '5. Cookies & Analytics',
    body: 'We use essential cookies for authentication and analytics cookies (Google Analytics 4, Meta Pixel) to understand traffic and improve the product. You can manage cookie preferences from the consent banner shown on your first visit.',
  },
  {
    title: '6. Data Retention',
    body: 'We retain booking and payment records for at least 7 years to comply with tax, accounting, and airline reporting requirements. Marketing data is retained until you unsubscribe or delete your account.',
  },
  {
    title: '7. Your Rights',
    body: 'You can request access, correction, or deletion of your personal data at any time by emailing privacy@flyngo.world. We respond within 30 days as required by applicable data protection laws.',
  },
  {
    title: '8. International Transfers',
    body: 'Your data may be transferred to and processed in countries other than your own (including the United States and the European Economic Area). We use Standard Contractual Clauses and equivalent safeguards to protect your information in transit.',
  },
  {
    title: '9. Children',
    body: 'Flyngo is not directed at children under 16. We do not knowingly collect data from children. Parents can request deletion of any data we may have inadvertently collected.',
  },
  {
    title: '10. Contact',
    body: 'For any privacy-related questions or to exercise your rights, email privacy@flyngo.world or write to our registered office.',
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={<>Privacy <span className="gradient-text-warm">Policy</span></>}
        subtitle="Last updated: January 2026"
      />

      <Section>
        <Container size="narrow">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-on-surface-variant">
              Flyngo (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) respects your privacy and is committed to protecting your personal
              data. This policy explains what we collect, how we use it, and the rights you have over your
              information.
            </p>
            {sections.map((s) => (
              <div key={s.title} className="mt-8">
                <h2 className="font-display text-2xl font-bold text-on-surface">{s.title}</h2>
                <p className="mt-3 text-on-surface-variant leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
