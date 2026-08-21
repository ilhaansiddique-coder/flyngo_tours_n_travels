'use client';

import { Section, Container } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { PageHero } from '@/components/ui/page-hero';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { DEFAULT_COUNTRY_CODE } from '@/lib/country-dial-codes';
import { submitLead } from '@/lib/tracking-client';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<string>(DEFAULT_COUNTRY_CODE);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name.');
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number so we can reach you.');
      return;
    }
    if (!message.trim()) {
      setError('Please write us a short message.');
      return;
    }

    setSubmitting(true);
    try {
      await submitLead({
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        phone: `${phoneCountry}${phoneNumber.trim()}`,
        message: message.trim(),
        source: 'contact-page',
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while sending your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Get in Touch"
        title={<>Contact <span className="gradient-text-warm">Us</span></>}
        subtitle="We&apos;re here to help you plan your perfect trip. Reach out any time — our concierge team responds within 24 hours."
      />

      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="font-display text-2xl font-bold mb-6 text-on-surface">Send Us a Message</h2>
              {submitted ? (
                <Card className="p-12 text-center" hover={false}>
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2 text-on-surface">Message Sent!</h3>
                  <p className="text-on-surface-variant">We&apos;ll get back to you within 24 hours.</p>
                </Card>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="First Name"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <Input
                      label="Last Name"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <PhoneInput
                    label="Phone"
                    required
                    countryCode={phoneCountry}
                    number={phoneNumber}
                    onCountryCodeChange={setPhoneCountry}
                    onNumberChange={setPhoneNumber}
                  />
                  <div className="w-full">
                    <label className="block text-sm font-medium text-on-surface mb-1.5">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container/60 backdrop-blur-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
                    />
                  </div>
                  {error && (
                    <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm">
                      {error}
                    </div>
                  )}
                  <Button type="submit" size="lg" className="gap-2" loading={submitting}>
                    <Send className="w-5 h-5" />
                    {submitting ? 'Sending…' : 'Send Message'}
                  </Button>
                </form>
              )}
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold mb-6 text-on-surface">Reach the Team</h2>
              {[
                { icon: Mail, label: 'Email', value: 'contact@flyngo.com' },
                { icon: Phone, label: 'Phone', value: '+1-800-FLYNGO' },
                { icon: MapPin, label: 'Office', value: '123 Travel Street, New York, NY 10001' },
                { icon: MessageSquare, label: '24/7 Concierge', value: 'Live chat available worldwide' },
              ].map(({ icon: Icon, label, value }) => (
                <Card key={label} hover={false}>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-soft border border-accent-soft flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-on-surface">{label}</p>
                      <p className="text-sm text-on-surface-variant">{value}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
