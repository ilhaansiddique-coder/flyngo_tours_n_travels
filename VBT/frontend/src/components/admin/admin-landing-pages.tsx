'use client';

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { adminFetch } from '@/lib/admin-api';
import { BASE_PATH } from '@/lib/api';
import { cn } from '@/lib/utils';

interface LandingRow {
  id: string;
  slug: string;
  titleEn: string;
  titleBn: string | null;
  published: boolean;
  order: number;
  updatedAt: string;
}

const SECTION_TYPES = ['hero', 'text', 'split', 'cards', 'cta', 'gallery'];

interface LandingForm {
  slug: string;
  titleEn: string;
  titleBn: string;
  subtitleEn: string;
  subtitleBn: string;
  coverPhoto: string;
  published: boolean;
  order: number;
  sections: string;
}

const EMPTY: LandingForm = {
  slug: '',
  titleEn: '',
  titleBn: '',
  subtitleEn: '',
  subtitleBn: '',
  coverPhoto: '',
  published: true,
  order: 0,
  sections: '[]',
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function AdminLandingPages() {
  const [list, setList] = useState<LandingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<LandingForm | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [sectionsError, setSectionsError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    adminFetch<LandingRow[]>('/admin/landing-pages')
      .then(setList)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = async (row?: LandingRow) => {
    if (!row) {
      setEditing(EMPTY);
      setEditId(null);
      setSectionsError('');
      return;
    }
    setLoading(true);
    try {
      const page = await adminFetch<LandingForm & { id: string; subtitleBn?: string | null }>(`/admin/landing-pages/${row.id}`);
      setEditId(row.id);
      setEditing({
        slug: page.slug,
        titleEn: page.titleEn,
        titleBn: page.titleBn || '',
        subtitleEn: page.subtitleEn || '',
        subtitleBn: page.subtitleBn || '',
        coverPhoto: page.coverPhoto || '',
        published: page.published,
        order: page.order ?? 0,
        sections: page.sections ? JSON.stringify(page.sections, null, 2) : '[]',
      });
      setSectionsError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const validateSections = (text: string): unknown[] | null => {
    if (!text.trim()) return [];
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setSectionsError('Sections is not valid JSON.');
      return null;
    }
    if (!Array.isArray(parsed)) {
      setSectionsError('Sections must be a JSON array.');
      return null;
    }
    for (const s of parsed) {
      if (!s || typeof s !== 'object') {
        setSectionsError('Each section must be an object.');
        return null;
      }
      const sec = s as { type?: unknown };
      if (!sec.type || !SECTION_TYPES.includes(String(sec.type))) {
        setSectionsError(`Each section needs a valid "type": ${SECTION_TYPES.join(', ')}.`);
        return null;
      }
    }
    setSectionsError('');
    return parsed;
  };

  const save = async () => {
    if (!editing) return;
    const sections = validateSections(editing.sections);
    if (sections === null) return;
    setSaving(true);
    setError('');
    const payload = {
      slug: editing.slug,
      titleEn: editing.titleEn,
      titleBn: editing.titleBn || undefined,
      subtitleEn: editing.subtitleEn || undefined,
      subtitleBn: editing.subtitleBn || undefined,
      coverPhoto: editing.coverPhoto || undefined,
      published: editing.published,
      order: Number(editing.order) || 0,
      sections,
    };
    try {
      if (editId) {
        await adminFetch(`/admin/landing-pages/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await adminFetch('/admin/landing-pages', { method: 'POST', body: JSON.stringify(payload) });
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

  const remove = async (row: LandingRow) => {
    if (!window.confirm(`Delete landing page "${row.titleEn}"?`)) return;
    setBusyId(row.id);
    try {
      await adminFetch(`/admin/landing-pages/${row.id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const onCoverFile = (file: File | undefined) => {
    if (!file || !editing) return;
    if (file.size > 3_000_000) {
      setError('Cover image must be under ~2.2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setEditing({ ...editing, coverPhoto: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const set = <K extends keyof LandingForm>(key: K, value: LandingForm[K]) =>
    setEditing((e) => (e ? { ...e, [key]: value } : e));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Landing Pages</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Build campaign pages with sections; published pages appear at /l/slug.</p>
        </div>
        <button
          onClick={() => startEdit()}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-primary-dark)]"
        >
          <Plus size={16} /> New page
        </button>
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
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...list].sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug)).map((p) => (
                  <tr key={p.id} className="border-b border-black/5 last:border-0 hover:bg-[var(--color-mist)]/60">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{p.titleEn}</p>
                      {p.titleBn ? <p className="text-xs text-[var(--color-ink-muted)]">{p.titleBn}</p> : null}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--color-royal)]">/l/{p.slug}</td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', p.published ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]' : 'bg-[var(--color-mist)] text-[var(--color-ink-muted)]')}>
                        {p.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-ink-soft)]">{p.order}</td>
                    <td className="px-4 py-3 text-xs text-[var(--color-ink-muted)]">{new Date(p.updatedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {p.published ? (
                          <a
                            href={`${BASE_PATH}/l/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg bg-[var(--color-mist)] p-2 text-[var(--color-ink-soft)] hover:text-[var(--color-royal)]"
                            title="View live"
                          >
                            <ExternalLink size={15} />
                          </a>
                        ) : null}
                        <button onClick={() => startEdit(p)} className="rounded-lg bg-[var(--color-mist)] p-2 text-[var(--color-ink-soft)] hover:text-[var(--color-royal)]" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => remove(p)} disabled={busyId === p.id} className="rounded-lg bg-[var(--color-crimson-light)] p-2 text-[var(--color-crimson)] hover:bg-[var(--color-crimson)] hover:text-white" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-[var(--color-ink-muted)]">
                      No landing pages yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="mt-6 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{editId ? 'Edit page' : 'New page'}</h2>
              <button onClick={() => setEditing(null)} className="rounded-lg bg-[var(--color-mist)] p-2 text-[var(--color-ink-soft)]">
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Slug" value={editing.slug} onChange={(v) => set('slug', slugify(v))} placeholder="saint-martin-trip-2026" required />
              <Field label="Order" value={String(editing.order)} onChange={(v) => set('order', Number(v) || 0)} />
              <Field label="Title (EN)" value={editing.titleEn} onChange={(v) => set('titleEn', v)} required />
              <Field label="Title (BN)" value={editing.titleBn} onChange={(v) => set('titleBn', v)} />
              <Field label="Subtitle (EN)" value={editing.subtitleEn} onChange={(v) => set('subtitleEn', v)} />
              <Field label="Subtitle (BN)" value={editing.subtitleBn} onChange={(v) => set('subtitleBn', v)} />
            </div>

            <div className="mt-4 flex items-end justify-between gap-4">
              <label className="block text-sm font-semibold">
                Cover photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onCoverFile(e.target.files?.[0])}
                  className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--color-mist)] file:px-3 file:py-2 file:text-sm file:font-semibold"
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={editing.published} onChange={(e) => set('published', e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
                Published
              </label>
            </div>
            {editing.coverPhoto ? (
              <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                Cover attached ({Math.round(editing.coverPhoto.length / 1024)} KB)
              </p>
            ) : null}

            <div className="mt-4">
              <label className="block text-sm font-semibold">
                Sections (JSON array)
                <textarea
                  value={editing.sections}
                  onChange={(e) => set('sections', e.target.value)}
                  rows={9}
                  spellCheck={false}
                  placeholder='[{ "type": "text", "headingEn": "About", "bodyEn": "..." }]'
                  className="mt-1.5 w-full rounded-xl border border-black/10 px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
                />
              </label>
              {sectionsError ? <p className="mt-1 text-sm text-[var(--color-crimson)]">{sectionsError}</p> : null}
              <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                Types: {SECTION_TYPES.join(', ')}. Fields per section: headingEn/Bn, bodyEn/Bn, items[] (split/cards),
                buttonLabelEn/Bn + link (cta), image (gallery).
              </p>
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