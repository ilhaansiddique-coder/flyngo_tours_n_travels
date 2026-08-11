import { Section, Container, SectionHeader } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { PageHero } from '@/components/ui/page-hero';
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
      <PageHero
        eyebrow="Ground & Sea"
        title={<>Transport <span className="gradient-text-warm">Services</span></>}
        subtitle="Seamless ground and sea transfers wherever your journey takes you."
      />

      <Section>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => (
              <Card key={s.title} hover={false}>
                <div className="w-12 h-12 rounded-xl bg-accent-soft border border-accent-soft flex items-center justify-center mb-4">
                  <s.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2 text-on-surface">{s.title}</h3>
                <p className="text-on-surface-variant text-sm">{s.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="subtle">
        <Container>
          <SectionHeader eyebrow="Why Us" title="Why book transport with FlynGo" subtitle="Pre-booked, transparent pricing and support in your language, around the clock." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="text-center rounded-2xl glass p-8 border-hairline">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-accent-soft border border-accent-soft flex items-center justify-center mb-4">
                  <f.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2 text-on-surface">{f.title}</h3>
                <p className="text-on-surface-variant text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="narrow">
          <div className="prose mx-auto text-center rounded-2xl glass p-10 border-hairline">
            <h2 className="font-display text-2xl font-bold text-on-surface">Need a custom transfer?</h2>
            <p className="text-on-surface-variant">
              Tell us where, when, and how many travelers. Our team will put together a tailored quote within 2 hours.
            </p>
            <p className="text-sm text-accent">Call +880 1700 000 000 or email transport@flyngo.world</p>
          </div>
        </Container>
      </Section>
    </>
  );
}
