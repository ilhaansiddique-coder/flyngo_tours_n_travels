import { Section, Container, SectionHeader } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
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
      <Section background="brand" className="pt-32 pb-24">
        <Container>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white text-center">About Flyngo</h1>
          <p className="mt-4 text-lg text-brand-100 text-center max-w-2xl mx-auto">
            Your trusted partner for extraordinary journeys since 2020
          </p>
        </Container>
      </Section>

      <Section background="white">
        <Container size="narrow">
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              Flyngo is a full-service travel platform dedicated to making world exploration
              accessible, seamless, and unforgettable. Whether you&apos;re planning a solo adventure,
              family vacation, or corporate retreat, we provide end-to-end solutions for tours,
              hotels, flights, and visa processing.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Founded with a vision to simplify travel planning, Flyngo combines cutting-edge
              technology with expert human support. Our platform serves thousands of happy travelers,
              offering curated experiences in the world&apos;s most sought-after destinations.
            </p>
          </div>
        </Container>
      </Section>

      <Section background="gray">
        <Container>
          <SectionHeader title="Our Values" subtitle="What drives everything we do" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v) => (
              <Card key={v.title} hover={false}>
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center mb-4">
                  <v.icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{v.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{v.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="white">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Destinations' },
              { value: '50K+', label: 'Happy Travelers' },
              { value: '1K+', label: 'Tour Packages' },
              { value: '99%', label: 'Satisfaction Rate' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-4xl font-bold text-brand-600 dark:text-brand-400">{stat.value}</div>
                <div className="mt-1 text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
