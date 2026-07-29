import { Section, Container } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Car, Bus, Plane, Ship, Clock, Shield, MapPin } from 'lucide-react';

const services = [
  {
    icon: Plane,
    title: 'Airport Transfers',
    description: 'Reliable pickups and drop-offs to and from every major airport, available 24/7.',
  },
  {
    icon: Car,
    title: 'Private Car Hire',
    description: 'Chauffeured sedans, SUVs, and luxury vehicles for point-to-point travel and hourly rentals.',
  },
  {
    icon: Bus,
    title: 'Intercity Coach',
    description: 'Comfortable long-distance buses connecting cities across the country and the region.',
  },
  {
    icon: Ship,
    title: 'Ferry & Cruise Transfers',
    description: 'Door-to-port transfers and ferry bookings for island getaways and coastal routes.',
  },
];

const features = [
  { icon: Clock, title: 'On-time guarantee', description: 'Real-time flight tracking and 60-minute free wait time on airport pickups.' },
  { icon: Shield, title: 'Vetted drivers', description: 'All drivers are licensed, insured, and trained in hospitality and safety.' },
  { icon: MapPin, title: 'Global coverage', description: 'Available in 200+ cities across 60 countries with consistent service standards.' },
];

export default function TransportPage() {
  return (
    <>
      <Section background="brand" className="pt-32 pb-24">
        <Container>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white text-center">Transport Services</h1>
          <p className="mt-4 text-lg text-brand-100 text-center max-w-2xl mx-auto">
            Seamless ground and sea transfers wherever your journey takes you
          </p>
        </Container>
      </Section>

      <Section background="white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((s) => (
              <Card key={s.title} hover={false}>
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center mb-4">
                  <s.icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{s.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="gray">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold">Why book transport with Flyngo</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Pre-booked, transparent pricing and support in your language, around the clock.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-white dark:bg-gray-950 shadow-sm flex items-center justify-center mb-4">
                  <f.icon className="w-7 h-7 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="white">
        <Container size="narrow">
          <div className="prose dark:prose-invert mx-auto text-center">
            <h2 className="font-display text-2xl font-bold">Need a custom transfer?</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Tell us where, when, and how many travelers. Our team will put together a tailored quote within 2 hours.
            </p>
            <p className="text-sm text-gray-500">Call +880 1700 000 000 or email transport@flyngo.world</p>
          </div>
        </Container>
      </Section>
    </>
  );
}
