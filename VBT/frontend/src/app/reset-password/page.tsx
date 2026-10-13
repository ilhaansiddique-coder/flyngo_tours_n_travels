import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = { title: 'Reset password' };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const { email = '', token = '' } = await searchParams;
  return (
    <section className="section-pad pt-28 sm:pt-36 bg-[var(--color-mist)]">
      <div className="container-site max-w-md">
        <ResetPasswordForm initialEmail={email} initialToken={token} />
      </div>
    </section>
  );
}