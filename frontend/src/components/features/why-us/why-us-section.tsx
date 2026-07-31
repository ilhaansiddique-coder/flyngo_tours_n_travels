import { Section, Container, SectionHeader } from '@/components/ui/section';
import { Shield, Headphones, Globe, Zap, Users, CreditCard } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure Booking',
    description: 'Your payments and data are protected with enterprise-grade encryption and security.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Headphones,
    title: '24/7 Concierge',
    description: 'Our travel experts are available around the clock to assist you with anything you need.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Globe,
    title: '500+ Destinations',
    description: 'From tropical beaches to snowy peaks — we cover destinations across every continent.',
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    icon: Zap,
    title: 'Instant Confirmation',
    description: 'Book now and get instant confirmation for flights, hotels, and tour packages.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: CreditCard,
    title: 'Flexible Payments',
    description: 'Pay your way with multiple options including EMI, wallet, and cryptocurrency.',
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    icon: Users,
    title: 'Trusted by 50K+',
    description: 'Join over 50,000 happy travelers who have explored the world with us.',
    gradient: 'from-indigo-500 to-blue-600',
  },
];

export function WhyUsSection() {
  return (
    <Section background="gray">
      <Container>
        <SectionHeader
          title="Why Travel with Flyngo"
          subtitle="Everything you need for a seamless, worry-free travel experience"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-white dark:bg-surface-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 hover:border-transparent hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-black/20 dark:hover:border-gray-700 transition-all duration-500 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
