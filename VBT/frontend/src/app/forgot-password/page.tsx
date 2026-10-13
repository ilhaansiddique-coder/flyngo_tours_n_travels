import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata: Metadata = { title: 'Forgot password' };

export default function ForgotPasswordPage() {
  return (
    <section className="section-pad pt-28 sm:pt-36 bg-[var(--color-mist)]">
      <div className="container-site max-w-md">
        <ForgotPasswordForm />
      </div>
    </section>
  );
}