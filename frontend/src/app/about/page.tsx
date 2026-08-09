import { Section, Container, SectionHeader } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { PageHero } from '@/components/ui/page-hero';
import { Globe, Users, Heart, Award } from 'lucide-react';

const values = [
  { icon: Globe, title: 'Global Reach', description: 'Connecting travelers to over 500 destinations worldwide with local expertise.' },
  { icon: Users, title: 'Customer First', description: 'Every decision we make starts with what is best for our travelers.' },
  { icon: Heart, title: 'Passion', description: 'We are passionate about travel and committed to creating unforgettable experiences.' },
  { icon: Award, title: 'Excellence', description: 'Award-winning service recognized by the travel industry for quality and innovation.' },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Story"
        title={<>About <span className="gradient-text-warm">Fly&Go</span></>}
        subtitle="Your trusted partner for extraordinary journeys since 2020."
      />

      <Section>
        <Container size="narrow">
          <div className="prose prose-lg mx-auto">
            <p className="text-xl text-on-surface leading-relaxed">
              Fly&Go is a full-service travel platform dedicated to making world exploration
              accessible, seamless, and unforgettable. Whether you&apos;re planning a solo adventure,
              family vacation, or corporate retreat, we provide end-to-end solutions for tours,
              hotels, flights, and visa processing.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              Founded with a vision to simplify travel planning, Fly&Go combines cutting-edge
              technology with expert human support. Our platform serves thousands of happy travelers,
              offering curated experiences in the world&apos;s most sought-after destinations.
            </p>
          </div>
        </Container>
      </Section>

      <Section background="subtle">
        <Container>
          <SectionHeader eyebrow="Why Us" title="Our Values" subtitle="What drives everything we do" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <Card key={v.title} hover={false}>
                <div className="w-12 h-12 rounded-xl bg-accent-soft border border-accent-soft flex items-center justify-center mb-4">
                  <v.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2 text-on-surface">{v.title}</h3>
                <p className="text-on-surface-variant text-sm">{v.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader title="By the Numbers" subtitle="A trusted name in luxury travel." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Destinations', accent: true },
              { value: '50K+', label: 'Happy Travelers', accent: false },
              { value: '1K+', label: 'Tour Packages', accent: true },
              { value: '99%', label: 'Satisfaction Rate', accent: false },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl glass p-6 border-hairline">
                <div className={`font-display text-4xl sm:text-5xl font-bold ${stat.accent ? 'text-accent' : 'text-on-surface'}`}>
                  {stat.value}
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.12em] font-semibold text-on-surface-variant">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
