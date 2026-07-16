'use client';

import { Section, Container } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Section background="brand" className="pt-32 pb-24">
        <Container>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white text-center">Contact Us</h1>
          <p className="mt-4 text-lg text-brand-100 text-center max-w-2xl mx-auto">
            We&apos;re here to help you plan your perfect trip
          </p>
        </Container>
      </Section>

      <Section background="white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="font-display text-2xl font-bold mb-6">Send Us a Message</h2>
              {submitted ? (
                <Card className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-gray-600 dark:text-gray-400">We&apos;ll get back to you within 24 hours.</p>
                </Card>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input label="First Name" required />
                    <Input label="Last Name" required />
                  </div>
                  <Input label="Email" type="email" required />
                  <Input label="Phone" type="tel" />
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
                    <textarea
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                  <Button type="submit" size="lg" className="gap-2">
                    <Send className="w-5 h-5" />
                    Send Message
                  </Button>
                </form>
              )}
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold mb-6">Get in Touch</h2>
              <Card hover={false}>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-gray-500">contact@flyngo.com</p>
                  </div>
                </div>
              </Card>
              <Card hover={false}>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-gray-500">+1-800-FLYNGO</p>
                  </div>
                </div>
              </Card>
              <Card hover={false}>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-medium">Office</p>
                    <p className="text-sm text-gray-500">123 Travel Street, New York, NY 10001</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
