'use client';

import { Section, Container } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { PageHero } from '@/components/ui/page-hero';
import { ChevronRight } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState } from 'react';

interface Faq {
  id: string;
  question: string;
  answer: string;
}

export default function FAQPage() {
  const { getFaqs } = useApi();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchFaqs = async () => {
      try {
        const data: any = await getFaqs();
        const items = data.data ?? data ?? [];
        if (!cancelled) setFaqs(Array.isArray(items) ? items : []);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load FAQs');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchFaqs();
    return () => {
      cancelled = true;
    };
  }, [getFaqs]);

  return (
    <>
      <PageHero
        eyebrow="Help & Support"
        title={<>Frequently Asked <span className="gradient-text-warm">Questions</span></>}
        subtitle="Find answers to common questions about our services."
      />
      <Section>
        <Container size="narrow">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} hover={false} className="animate-pulse">
                  <div className="h-5 w-2/3 rounded bg-on-surface-soft" />
                  <div className="h-3 w-full rounded bg-on-surface-soft mt-3" />
                </Card>
              ))}
            </div>
          ) : error ? (
            <p className="text-center py-20 text-red-400">{error}</p>
          ) : faqs.length === 0 ? (
            <p className="text-center py-20 text-on-surface-variant">
              No FAQs published yet. Have a question? Reach out via our contact page.
            </p>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <Card key={faq.id} hover={false} className="hover:border-accent-soft transition-colors">
                  <details className="group">
                    <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                      <h3 className="font-display text-lg font-bold text-on-surface">{faq.question}</h3>
                      <ChevronRight className="w-5 h-5 text-accent mt-1 transition-transform group-open:rotate-90 flex-shrink-0" />
                    </summary>
                    <p className="mt-3 text-on-surface-variant leading-relaxed whitespace-pre-line">{faq.answer}</p>
                  </details>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
