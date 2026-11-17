'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export function NewsletterAction({ action }: { action: 'confirm' | 'unsubscribe' }) {
  const [token, setToken] = useState('');
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const value = new URLSearchParams(window.location.hash.slice(1)).get('token') || '';
    window.history.replaceState(null, '', window.location.pathname);
    const frame = requestAnimationFrame(() => setToken(value));
    return () => cancelAnimationFrame(frame);
  }, []);
  return <main className="min-h-[60vh] pt-32 pb-16 px-4"><section className="max-w-lg mx-auto rounded-2xl border border-hairline p-8 space-y-5">
    <h1 className="font-display text-3xl font-bold">{action === 'confirm' ? 'Confirm newsletter subscription' : 'Unsubscribe from the newsletter'}</h1>
    {done ? <p role="status">{action === 'confirm' ? 'Your email subscription is confirmed.' : 'You have been unsubscribed.'}</p> : <>
      <p>{action === 'confirm' ? 'Confirm that you want to receive FlynGo travel news and offers.' : 'Choose Unsubscribe to stop receiving newsletter emails.'}</p>
      <button type="button" disabled={pending || !/^[a-f0-9]{64}$/.test(token)} className="rounded-xl px-5 py-3 bg-accent text-white disabled:opacity-50" onClick={async () => {
        setPending(true); setError('');
        try { await api.post(`/newsletter/${action}`, { token }); setDone(true); setToken(''); }
        catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not process your request.'); }
        finally { setPending(false); }
      }}>{pending ? 'Processing…' : action === 'confirm' ? 'Confirm subscription' : 'Unsubscribe'}</button>
      {!token && <p className="text-sm text-muted">Open the link from your email. If it has expired, submit a new subscription request.</p>}
    </>}
    {error && <p role="alert" className="text-error">{error}</p>}
  </section></main>;
}
