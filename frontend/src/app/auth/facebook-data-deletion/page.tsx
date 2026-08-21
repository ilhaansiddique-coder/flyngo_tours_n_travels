import { Section, Container } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { PageHero } from '@/components/ui/page-hero';
import { ShieldCheck, Mail, Clock4, Trash2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Facebook Data Deletion — Flyngo',
  description:
    'How Flyngo handles Facebook user data deletion requests in compliance with Facebook Platform Policy.',
  robots: { index: true, follow: true },
};

const steps = [
  {
    icon: Mail,
    title: '1. Submit a request',
    body: 'Send us an email at privacy@flyngo.world from the address associated with your Flyngo account, or use Facebook\'s "Delete my account" flow which calls our Data Deletion Callback automatically.',
  },
  {
    icon: ShieldCheck,
    title: '2. We verify your identity',
    body: 'For email requests, we reply within 48 hours to confirm we have located the matching account. For Facebook-callback requests, identity is verified by Facebook\'s signed_request signature.',
  },
  {
    icon: Trash2,
    title: '3. We delete your data',
    body: 'Your Flyngo profile is soft-deleted, your Facebook provider link is removed, and any session tokens for Facebook Login are invalidated. We retain only the minimum records required by tax and airline-reporting law (typically 7 years for booking/payment records).',
  },
  {
    icon: Clock4,
    title: '4. Confirmation',
    body: 'You receive a confirmation code and a status URL. Facebook will display this status URL in the user\'s "Data Deletion" dashboard so they can verify completion.',
  },
];

export default function FacebookDataDeletionPage() {
  return (
    <>
      <PageHero
        eyebrow="Facebook Login"
        title={<>Data <span className="gradient-text-warm">Deletion</span></>}
        subtitle="How Flyngo handles Facebook user data deletion requests in compliance with Facebook Platform Policy."
      />

      <Section>
        <Container size="narrow">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-white/70">
              When you sign in to Flyngo with Facebook, we receive your email address, name,
              and Facebook user ID. We use this information only to authenticate you and
              create your Flyngo booking account. We do not post to Facebook, do not access
              your friend list, and do not share your data with any third party.
            </p>

            <p className="text-white/70">
              You can request deletion of this data at any time. Flyngo honours both
              self-service deletion (via Facebook&apos;s own &quot;Delete my account&quot;
              flow, which calls our Data Deletion Callback) and email requests.
            </p>

            <h2 className="font-display text-2xl font-bold text-white mt-12">
              How deletion works
            </h2>

            <div className="mt-6 grid gap-4">
              {steps.map(({ icon: Icon, title, body }) => (
                <Card key={title} hover={false} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-white">{title}</h3>
                      <p className="mt-2 text-white/60 leading-relaxed">{body}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <h2 className="font-display text-2xl font-bold text-white mt-12">
              Data we delete
            </h2>
            <ul className="text-white/60 space-y-2 mt-3">
              <li>Your Flyngo profile (if you have no other booking history)</li>
              <li>The link between your Flyngo account and your Facebook account</li>
              <li>Active sessions and access tokens linked to Facebook Login</li>
              <li>Marketing preferences tied to your Facebook-linked email</li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-white mt-12">
              Data we retain
            </h2>
            <p className="text-white/60 mt-3">
              Booking and payment records are retained for at least 7 years to comply with
              tax, accounting, and airline reporting requirements. These records are
              anonymized where possible and are not linked to your Facebook account after
              deletion.
            </p>

            <h2 className="font-display text-2xl font-bold text-white mt-12">
              Contact
            </h2>
            <p className="text-white/60 mt-3">
              For any privacy-related questions, email{' '}
              <a href="mailto:privacy@flyngo.world" className="text-orange-400 hover:underline">
                privacy@flyngo.world
              </a>
              .
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
