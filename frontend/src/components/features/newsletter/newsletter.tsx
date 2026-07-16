'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Section, Container } from '@/components/ui/section';
import { Send } from 'lucide-react';
import { useState } from 'react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Section background="brand">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Get Exclusive Travel Deals
          </h2>
          <p className="mt-4 text-lg text-brand-100">
            Subscribe to our newsletter and be the first to know about amazing offers and new destinations.
          </p>
          {submitted ? (
            <div className="mt-8 p-4 rounded-xl bg-white/10 text-white text-lg">
              Thank you for subscribing! Check your inbox soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-white"
                required
              />
              <Button type="submit" variant="secondary" size="lg" className="gap-2 whitespace-nowrap">
                <Send className="w-4 h-4" />
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </Container>
    </Section>
  );
}
