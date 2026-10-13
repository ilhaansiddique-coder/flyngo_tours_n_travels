import type { Metadata } from 'next';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata: Metadata = { title: 'Sign up' };

export default function SignupPage() {
  return (
    <section className="section-pad pt-28 sm:pt-36 bg-[var(--color-mist)]">
      <div className="container-site max-w-md">
        <SignupForm />
      </div>
    </section>
  );
}