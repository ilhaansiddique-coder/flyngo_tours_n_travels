import { Section, Container } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Clock, CheckCircle, Globe } from 'lucide-react';

const visaServices = [
  { id: '1', country: 'Indonesia', title: 'Indonesia Tourist Visa', processingTime: '3-5 days', price: 150, requirements: ['Valid passport', 'Return ticket', 'Passport photos'] },
  { id: '2', country: 'UAE', title: 'UAE Tourist Visa', processingTime: '2-4 days', price: 200, requirements: ['Valid passport', 'Hotel booking', 'Bank statement'] },
  { id: '3', country: 'France', title: 'France Schengen Visa', processingTime: '10-15 days', price: 350, requirements: ['Valid passport', 'Travel insurance', 'Proof of funds'] },
  { id: '4', country: 'Thailand', title: 'Thailand Tourist Visa', processingTime: '3-5 days', price: 100, requirements: ['Valid passport', 'Passport photos', 'Flight booking'] },
  { id: '5', country: 'Japan', title: 'Japan Tourist Visa', processingTime: '7-10 days', price: 250, requirements: ['Valid passport', 'Itinerary', 'Bank statement'] },
  { id: '6', country: 'Turkey', title: 'Turkey E-Visa', processingTime: '1-2 days', price: 80, requirements: ['Valid passport', 'Hotel booking'] },
];

export default function VisaPage() {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visaServices.map((visa) => (
              <Card key={visa.id} className="group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold">{visa.title}</h3>
                    <p className="text-sm text-gray-500">{visa.country}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{visa.processingTime}</span>
                </div>
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
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xl font-bold text-brand-600 dark:text-brand-400">{formatCurrency(visa.price)}</p>
                  <Button size="sm">Apply Now</Button>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
