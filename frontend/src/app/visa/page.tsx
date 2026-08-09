'use client';

import { Section, Container } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/ui/page-hero';
import { formatCurrency } from '@/lib/utils';
import { Clock, CheckCircle, Globe } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState } from 'react';

interface VisaService {
  id: string;
  country: string | { name?: string };
  name: string;
  title?: string;
  processingTime: string;
  price: number;
  requirements: string[];
}

function getCountryName(country: VisaService['country']): string {
  if (!country) return '—';
  if (typeof country === 'string') return country;
  return country.name ?? '—';
}

export default function VisaPage() {
  const { getVisaServices } = useApi();
  const [visaServices, setVisaServices] = useState<VisaService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data: any = await getVisaServices();
        setVisaServices(data.data ?? data ?? []);
      } catch (err: any) {
        setError(err.message || 'Failed to load visa services');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [getVisaServices]);

  return (
    <>
      <PageHero
        eyebrow="Visa & Documentation"
        title={<>Visa <span className="gradient-text-warm">Services</span></>}
        subtitle="Hassle-free visa processing with expert guidance every step of the way."
      />
      <Section>
        <Container>
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-on-surface-variant">Loading visa services...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-error">{error}</p>
            </div>
          ) : visaServices.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-on-surface-variant text-lg">No visa services available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visaServices.map((visa) => (
                <Card key={visa.id} className="group" hover={false}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-accent-soft border border-accent-soft flex items-center justify-center">
                      <Globe className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-on-surface">{visa.title || visa.name}</h3>
                      <p className="text-sm text-on-surface-variant">{getCountryName(visa.country)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-accent" />
                    <span className="text-sm text-on-surface/80">{visa.processingTime}</span>
                  </div>
                  {(visa.requirements?.length > 0) && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-on-surface/80 mb-2">Requirements</p>
                      <ul className="space-y-1">
                        {visa.requirements.map((req) => (
                          <li key={req} className="flex items-center gap-2 text-sm text-on-surface-variant">
                            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-300 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-hairline">
                    <p className="text-xl font-bold text-accent">{formatCurrency(visa.price)}</p>
                    <Button size="sm">Apply Now</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
