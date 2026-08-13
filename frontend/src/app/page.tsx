'use client';

import { HeroSection } from '@/components/features/hero/hero-section';
import { WhyFlynGo } from '@/components/features/experiences/why-flyngo';
import { CuratedExperiences } from '@/components/features/experiences/curated-experiences';
import { StatsSection } from '@/components/features/experiences/stats-section';
import { PopularPackages } from '@/components/features/packages/popular-packages';
import { DestinationsShowcase } from '@/components/features/experiences/destinations-showcase';
import { ServicesGrid } from '@/components/features/experiences/services-grid';
import { HowItWorks } from '@/components/features/experiences/how-it-works';
import { Testimonials } from '@/components/features/experiences/testimonials';
import { NewsletterCTA } from '@/components/features/experiences/newsletter-cta';

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <HeroSection />
      <WhyFlynGo />
      <CuratedExperiences />
      <StatsSection />
      <DestinationsShowcase />
      <ServicesGrid />
      <PopularPackages />
      <HowItWorks />
      <Testimonials />
      <NewsletterCTA />
    </main>
  );
}
