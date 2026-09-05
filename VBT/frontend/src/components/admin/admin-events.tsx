'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Eye, Loader2, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { adminFetch } from '@/lib/admin-api';
import { cn } from '@/lib/utils';

interface ActivityRow {
  id: string;
  slug: string;
  titleEn: string;
  titleBn: string | null;
  tagEn: string | null;
  tagBn: string | null;
  excerptEn: string | null;
  excerptBn: string | null;
  contentEn: string | null;
  contentBn: string | null;
  image: string | null;
  order: number;
  featured: boolean;
  published: boolean;
  createdAt: string;
}

interface ListResponse {
  items: ActivityRow[];
  total: number;
  page: number;
  pageSize: number;
}

interface ActivityForm {
  slug: string;
  titleEn: string;
  titleBn: string;
  tagEn: string;
  tagBn: string;
  excerptEn: string;
  excerptBn: string;
  contentEn: string;
  contentBn: string;
  image: string;
  order: number;
  featured: boolean;
  published: boolean;
}

const EMPTY: ActivityForm = {
  slug: '',
  titleEn: '',
  titleBn: '',
  tagEn: '',
  tagBn: '',
  excerptEn: '',
  excerptBn: '',
  contentEn: '',
  contentBn: '',
  image: '',
  order: 0,
  featured: false,
  published: true,
};

export function AdminEvents() {
  const [search, setSearch] = useState('');
  const [list, setList] = useState<ListResponse>({ items: [], total: 0, page: 1, pageSize: 50 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<ActivityForm | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    adminFetch<ListResponse>('/admin/Activity')
      .then((res) => setList(res))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = search
    ? list.items.filter((a) =>
        [a.titleEn, a.titleBn || '', a.slug, a.tagEn || ''].some((s) => s.toLowerCase().includes(search.toLowerCase())),
      )
    : list.items;

  const startEdit = (row?: ActivityRow) => {
    if (!row) {
      setEditing(EMPTY);
      setEditId(null);
      return;
    }
    setEditId(row.id);
    setEditing({
      slug: row.slug,
      titleEn: row.titleEn,
      titleBn: row.titleBn || '',
      tagEn: row.tagEn || '',
      tagBn: row.tagBn || '',
      excerptEn: row.excerptEn || '',
      excerptBn: row.excerptBn || '',
      contentEn: row.contentEn || '',
      contentBn: row.contentBn || '',
      image: row.image || '',
      order: row.order,
      featured: row.featured,
      published: row.published,
    });
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    setError('');
    const payload = { ...editing, order: Number(editing.order) || 0 };
    try {
      if (editId) {
        await adminFetch(`/admin/Activity/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await adminFetch('/admin/Activity', { method: 'POST', body: JSON.stringify(payload) });
      }
      setEditing(null);
      setEditId(null);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: ActivityRow) => {
    if (!window.confirm(`Delete event "${row.titleEn}"?`)) return;
    setBusyId(row.id);
    try {
      await adminFetch(`/admin/Activity/${row.id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const onImageFile = (file: File | undefined) => {
    if (!file || !editing) return;
    if (file.size > 3_000_000) {
      setError('Image must be under ~2.2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setEditing({ ...editing, image: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const set = <K extends keyof ActivityForm>(key: K, value: ActivityForm[K]) =>
    setEditing((e) => (e ? { ...e, [key]: value } : e));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Events & Activities</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Create and manage news / events shown on the site.</p>
        </div>
        <button
          onClick={() => startEdit()}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-primary-dark)]"
        >
          <Plus size={16} /> New event
        </button>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events…"
          className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
        />
      </div>

      {error ? <p className="mt-3 text-sm text-[var(--color-crimson)]">{error}</p> : null}

      {loading ? (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-black/5 bg-white p-16 text-[var(--color-ink-soft)] shadow-[var(--shadow-card)]">
          <Loader2 size={18} className="animate-spin" /> Loading…
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[var(--shadow-card)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs font-bold uppercase tracking-wide text-[var(--color-ink-muted)]">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Tag</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-black/5 last:border-0 hover:bg-[var(--color-mist)]/60">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{a.titleEn}</p>
                      {a.titleBn ? <p className="text-xs text-[var(--color-ink-muted)]">{a.titleBn}</p> : null}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--color-ink-muted)]">{a.slug}</td>
                    <td className="px-4 py-3 text-[var(--color-ink-soft)]">{a.tagEn || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', a.published ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]' : 'bg-[var(--color-mist)] text-[var(--color-ink-muted)]')}>
                        {a.published ? (a.featured ? 'Featured' : 'Published') : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-ink-soft)]">{a.order}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => startEdit(a)} className="rounded-lg bg-[var(--color-mist)] p-2 text-[var(--color-ink-soft)] hover:text-[var(--color-royal)]" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => remove(a)} disabled={busyId === a.id} className="rounded-lg bg-[var(--color-crimson-light)] p-2 text-[var(--color-crimson)] hover:bg-[var(--color-crimson)] hover:text-white" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-[var(--color-ink-muted)]">
                      No events found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <div className="border-t border-black/5 px-4 py-3 text-xs text-[var(--color-ink-muted)]">{list.total} total</div>
        </div>
      )}

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="mt-6 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{editId ? 'Edit event' : 'New event'}</h2>
              <button onClick={() => setEditing(null)} className="rounded-lg bg-[var(--color-mist)] p-2 text-[var(--color-ink-soft)]">
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Slug" value={editing.slug} onChange={(v) => set('slug', v)} placeholder="e.g. eid-reunion-2026" />
              <Field label="Order" value={String(editing.order)} onChange={(v) => set('order', Number(v) || 0)} />
              <Field label="Title (EN)" value={editing.titleEn} onChange={(v) => set('titleEn', v)} required />
              <Field label="Title (BN)" value={editing.titleBn} onChange={(v) => set('titleBn', v)} />
              <Field label="Tag (EN)" value={editing.tagEn} onChange={(v) => set('tagEn', v)} />
              <Field label="Tag (BN)" value={editing.tagBn} onChange={(v) => set('tagBn', v)} />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onImageFile(e.target.files?.[0])}
                  className="mt-1.5 w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--color-mist)] file:px-3 file:py-2 file:text-sm file:font-semibold"
                />
                {editing.image ? (
                  <span className="mt-1 flex items-center gap-2 text-xs text-[var(--color-ink-muted)]">
                    <CheckCircle2 size={13} className="text-[var(--color-primary)]" /> attached
                    <button onClick={() => set('image', '')} className="font-semibold text-[var(--color-crimson)]">remove</button>
                  </span>
                ) : null}
              </label>
              <div className="flex items-end gap-4 pb-1">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={editing.published} onChange={(e) => set('published', e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
                  Published
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={editing.featured} onChange={(e) => set('featured', e.target.checked)} className="h-4 w-4 accent-[var(--color-gold-deep)]" />
                  Featured
                </label>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                Excerpt (EN)
                <textarea value={editing.excerptEn} onChange={(e) => set('excerptEn', e.target.value)} rows={3} className="mt-1.5 w-full rounded-xl border border-black/10 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]" />
              </label>
              <label className="block text-sm font-semibold">
                Excerpt (BN)
                <textarea value={editing.excerptBn} onChange={(e) => set('excerptBn', e.target.value)} rows={3} className="mt-1.5 w-full rounded-xl border border-black/10 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]" />
              </label>
            </div>

            <div className="mt-4 grid gap-4">
              <label className="block text-sm font-semibold">
                Body (EN)
                <textarea value={editing.contentEn} onChange={(e) => set('contentEn', e.target.value)} rows={5} className="mt-1.5 w-full rounded-xl border border-black/10 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]" />
              </label>
              <label className="block text-sm font-semibold">
                Body (BN)
                <textarea value={editing.contentBn} onChange={(e) => set('contentBn', e.target.value)} rows={5} className="mt-1.5 w-full rounded-xl border border-black/10 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]" />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-xl border border-black/10 px-5 py-2.5 text-sm font-semibold text-[var(--color-ink-soft)]">
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving || !editing.slug || !editing.titleEn}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : null} Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
      />
    </label>
  );
}