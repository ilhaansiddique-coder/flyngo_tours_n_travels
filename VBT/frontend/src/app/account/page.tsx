import type { Metadata } from 'next';
import { AccountPanel } from '@/components/auth/account-panel';

export const metadata: Metadata = { title: 'My account' };

export default function AccountPage() {
  return (
    <section className="section-pad bg-[var(--color-mist)]">
      <div className="container-site max-w-3xl">
        <AccountPanel />
      </div>
    </section>
  );
}