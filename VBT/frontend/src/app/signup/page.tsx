import type { Metadata } from 'next';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata: Metadata = { title: 'Sign up' };

export default function SignupPage() {
  return (
    <section className="section-pad bg-[var(--color-mist)]">
      <div className="container-site max-w-md">
        <SignupForm />
      </div>
    </section>
  );
}