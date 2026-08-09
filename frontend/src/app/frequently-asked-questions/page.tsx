import { Section, Container } from '@/components/ui/section';
import { Card } from '@/components/ui/card';

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
      <Section background="brand" className="pt-32 pb-24">
        <Container>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white text-center">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg text-brand-100 text-center max-w-2xl mx-auto">
            Find answers to common questions about our services
          </p>
        </Container>
      </Section>
      <Section background="white">
        <Container size="narrow">
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} hover={false}>
                <h3 className="font-display text-lg font-bold mb-2">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
