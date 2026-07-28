'use client';

import { Section, Container } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Clock, CheckCircle, Globe } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState } from 'react';

interface VisaService {
  id: string;
  country: string;
  name: string;
  title?: string;
  processingTime: string;
  price: number;
  requirements: string[];
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
        setVisaServices(data.items ?? data ?? []);
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
      <Section background="brand" className="pt-32 pb-24">
        <Container>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white text-center">Visa Services</h1>
          <p className="mt-4 text-lg text-brand-100 text-center max-w-2xl mx-auto">
            Hassle-free visa processing with expert guidance every step of the way
          </p>
        </Container>
      </Section>
      <Section background="white">
        <Container>
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-500">Loading visa services...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500">{error}</p>
            </div>
          ) : visaServices.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No visa services available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visaServices.map((visa) => (
                <Card key={visa.id} className="group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold">{visa.title || visa.name}</h3>
                      <p className="text-sm text-gray-500">{visa.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{visa.processingTime}</span>
                  </div>
                  {(visa.requirements?.length > 0) && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Requirements:</p>
                      <ul className="space-y-1">
                        {visa.requirements.map((req) => (
                          <li key={req} className="flex items-center gap-2 text-sm text-gray-500">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xl font-bold text-brand-600 dark:text-brand-400">{formatCurrency(visa.price)}</p>
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
