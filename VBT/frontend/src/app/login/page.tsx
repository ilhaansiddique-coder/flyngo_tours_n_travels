import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { getServerLang } from '@/lib/server-lang';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage() {
  const lang = await getServerLang();
  const bn = lang === 'bn';
  return (
    <section className="section-pad bg-[var(--color-mist)]">
      <div className="container-site max-w-md">
        <LoginForm />
        {bn ? null : null}
      </div>
    </section>
  );
}