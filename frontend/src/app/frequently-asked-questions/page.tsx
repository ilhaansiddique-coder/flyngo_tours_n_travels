import { Section, Container, SectionHeader } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { PageHero } from '@/components/ui/page-hero';
import { ChevronRight } from 'lucide-react';

const faqs = [
  { question: 'How do I book a tour?', answer: 'Browse our tours page, select your preferred package, choose your dates and number of guests, and complete the secure checkout. Our team will confirm your booking within 24 hours.' },
  { question: 'What payment methods do you accept?', answer: 'We accept all major credit/debit cards (Visa, MasterCard, AmEx), PayPal, bKash, Nagad, and SSLCommerz for local payments.' },
  { question: 'Can I cancel or modify my booking?', answer: 'Yes, cancellations and modifications are possible subject to the specific package terms. Please check the cancellation policy on the tour/hotel page or contact our support team.' },
  { question: 'Do you provide visa assistance?', answer: 'Yes, we offer comprehensive visa processing services for multiple destinations. Visit our Visa page to check requirements and apply.' },
  { question: 'Is travel insurance included?', answer: 'Travel insurance is optional and can be added during the booking process. We recommend purchasing insurance for international trips.' },
  { question: 'How do I track my booking?', answer: 'Log into your account and visit My Bookings to see your booking status, download invoices, and get real-time updates.' },
  { question: 'What if I need special assistance?', answer: 'We accommodate special needs — please mention your requirements during booking or contact our support team in advance.' },
  { question: 'Are there group discounts?', answer: 'Yes, we offer group discounts for bookings of 5+ people. Contact our team for a custom quote.' },
  { question: 'How far in advance should I book?', answer: 'We recommend booking at least 2-4 weeks in advance for tours and hotels, and 6-8 weeks for international flights during peak season.' },
  { question: 'What documents do I need to travel?', answer: 'You typically need a valid passport (6+ months validity), visa (if required), travel insurance, and booking confirmation. Check your destination\'s specific requirements.' },
];

export default function FAQPage() {
  return (
    <>
      <PageHero
        eyebrow="Help & Support"
        title={<>Frequently Asked <span className="gradient-text-warm">Questions</span></>}
        subtitle="Find answers to common questions about our services."
      />
      <Section>
        <Container size="narrow">
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} hover={false} className="hover:border-accent-soft transition-colors">
                <details className="group">
                  <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                    <h3 className="font-display text-lg font-bold text-on-surface">{faq.question}</h3>
                    <ChevronRight className="w-5 h-5 text-accent mt-1 transition-transform group-open:rotate-90 flex-shrink-0" />
                  </summary>
                  <p className="mt-3 text-on-surface-variant leading-relaxed">{faq.answer}</p>
                </details>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
