import type { Metadata } from 'next';
import { AdminLoginForm } from '@/components/admin/admin-login-form';

export const metadata: Metadata = { title: 'Volunteer Bangladesh Trust Admin' };

export default function AdminLoginPage() {
  return (
    <section className="section-pad bg-[var(--color-mist)]">
      <div className="container-site">
        <AdminLoginForm />
      </div>
    </section>
  );
}