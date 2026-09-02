'use client';

import { useCallback, useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { useAuthStore } from '@/stores/auth.store';
import { formatDate } from '@/lib/utils';
import { Star, BadgeCheck, Loader2, MessageSquare } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  title?: string | null;
  content: string;
  isVerified: boolean;
  createdAt: string;
  user?: { fullName?: string } | null;
}

function Stars({ value, size = 'sm', onChange }: { value: number; size?: 'sm' | 'lg'; onChange?: (v: number) => void }) {
  const sz = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
        >
          <Star className={`${sz} ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-outline-variant'}`} />
        </button>
      ))}
    </div>
  );
}

/**
 * Public reviews for a product: summary (avg + count), the approved list, and a
 * submit form for signed-in users. New reviews are held for moderation, so the
 * form shows a "pending" confirmation rather than optimistically inserting.
 */
export function ReviewsSection({ itemType, itemId }: { itemType: string; itemId: string }) {
  const { getPublicReviews, submitReview } = useApi();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<{ count: number; averageRating: number }>({ count: 0, averageRating: 0 });
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await getPublicReviews(itemType, itemId);
      setReviews(res?.items ?? []);
      if (res?.summary) setSummary(res.summary);
    } catch {
      /* empty state handles it */
    } finally {
      setLoading(false);
    }
  }, [getPublicReviews, itemType, itemId]);

  useEffect(() => { if (itemId) load(); }, [itemId, load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) { setError('Please write a few words about your experience.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await submitReview({ itemType, itemId, rating, title: title.trim() || undefined, content: content.trim() });
      setDone(true);
      setTitle(''); setContent(''); setRating(5);
    } catch (err: any) {
      setError(err?.message || 'Could not submit your review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-10">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-on-surface flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" /> Reviews
        </h2>
        {summary.count > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Stars value={Math.round(summary.averageRating)} />
            <span className="font-semibold text-on-surface">{summary.averageRating.toFixed(1)}</span>
            <span className="text-muted">({summary.count})</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted mb-6">No reviews yet — be the first to share your experience.</p>
      ) : (
        <ul className="space-y-4 mb-8">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl border border-outline-variant glass p-5">
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2">
                  <Stars value={r.rating} />
                  {r.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <BadgeCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted">{formatDate(r.createdAt)}</span>
              </div>
              {r.title && <div className="font-semibold text-on-surface">{r.title}</div>}
              <p className="text-sm text-on-surface-variant mt-0.5">{r.content}</p>
              <div className="text-xs text-muted mt-2">— {r.user?.fullName || 'Traveller'}</div>
            </li>
          ))}
        </ul>
      )}

      {/* Submit form */}
      {done ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-700 dark:text-emerald-300">
          Thanks! Your review was submitted and will appear once approved.
        </div>
      ) : accessToken ? (
        <form onSubmit={submit} className="rounded-2xl border border-outline-variant glass p-5">
          <div className="font-semibold text-on-surface mb-3">Write a review</div>
          <div className="mb-3"><Stars value={rating} size="lg" onChange={setRating} /></div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full mb-3 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container/60 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share what your trip was like…"
            rows={3}
            className="w-full mb-3 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container/60 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          {error && <div className="text-sm text-error mb-3">{error}</div>}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-tertiary))' }}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit review'}
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted">
          <a href="/auth/login" className="font-semibold text-primary hover:underline">Sign in</a> to write a review.
        </p>
      )}
    </section>
  );
}
