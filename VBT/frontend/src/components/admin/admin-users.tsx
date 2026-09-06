'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil as PencilIcon, Plus, Search, Trash2, X } from 'lucide-react';
import { PasswordInput } from '@/components/password-input';
import { adminFetch } from '@/lib/admin-api';
import { cn } from '@/lib/utils';

interface UserRow {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  createdAt: string;
}

interface ListResponse {
  items: UserRow[];
  total: number;
  page: number;
  pageSize: number;
}

interface UserForm {
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
}

const EMPTY: UserForm = { name: '', email: '', phone: '', role: 'USER', password: '' };

export function AdminUsers() {
  const [search, setSearch] = useState('');
  const [list, setList] = useState<ListResponse>({ items: [], total: 0, page: 1, pageSize: 50 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<UserForm | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    adminFetch<ListResponse>('/admin/users')
      .then(setList)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = search
    ? list.items.filter((u) =>
        [u.name, u.email, u.phone || ''].some((s) => s.toLowerCase().includes(search.toLowerCase())),
      )
    : list.items;

  const startCreate = () => {
    setEditing(EMPTY);
    setEditId(null);
  };

  const startEdit = (u: UserRow) => {
    setEditing({ name: u.name, email: u.email, phone: u.phone || '', role: u.role, password: '' });
    setEditId(u.id);
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    setError('');
    const payload = {
      name: editing.name,
      email: editing.email,
      phone: editing.phone || undefined,
      role: editing.role,
      ...(editing.password ? { password: editing.password } : {}),
    };
    try {
      if (editId) {
        await adminFetch(`/admin/users/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await adminFetch('/admin/users', { method: 'POST', body: JSON.stringify(payload) });
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

  const remove = async (u: UserRow) => {
    if (!window.confirm(`Delete user "${u.email}"?`)) return;
    setBusyId(u.id);
    try {
      await adminFetch(`/admin/users/${u.id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const set = <K extends keyof UserForm>(key: K, value: UserForm[K]) =>
    setEditing((e) => (e ? { ...e, [key]: value } : e));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            Accounts that can sign in on the website and track memberships.
          </p>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-primary-dark)]"
        >
          <Plus size={16} /> New user
        </button>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users…"
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
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-black/5 last:border-0 hover:bg-[var(--color-mist)]/60">
                    <td className="px-4 py-3 font-semibold">{u.name}</td>
                    <td className="px-4 py-3 text-[var(--color-ink-soft)]">{u.email}</td>
                    <td className="px-4 py-3 text-[var(--color-ink-soft)]">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', u.role === 'ADMIN' ? 'bg-[var(--color-royal-light)] text-[var(--color-royal)]' : 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]')}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-ink-muted)]">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => startEdit(u)} className="rounded-lg bg-[var(--color-mist)] p-2 text-[var(--color-ink-soft)] hover:text-[var(--color-royal)]" title="Edit">
                          <PencilIcon size={15} />
                        </button>
                        <button onClick={() => remove(u)} disabled={busyId === u.id} className="rounded-lg bg-[var(--color-crimson-light)] p-2 text-[var(--color-crimson)] hover:bg-[var(--color-crimson)] hover:text-white" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-[var(--color-ink-muted)]">
                      No users found.
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
          <div className="mt-6 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{editId ? 'Edit user' : 'New user'}</h2>
              <button onClick={() => setEditing(null)} className="rounded-lg bg-[var(--color-mist)] p-2 text-[var(--color-ink-soft)]">
                <X size={16} />
              </button>
            </div>
            <div className="mt-5 space-y-4">
              <Field label="Name" value={editing.name} onChange={(v) => set('name', v)} required />
              <Field label="Email (optional)" value={editing.email} onChange={(v) => set('email', v)} type="email" />
              <Field label="Phone" value={editing.phone} onChange={(v) => set('phone', v)} required />
              <label className="block text-sm font-semibold">
                Role
                <select value={editing.role} onChange={(e) => set('role', e.target.value)} className="mt-1.5 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]">
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </label>
              <Field label={editId ? 'Reset password (leave blank to keep)' : 'Password'} value={editing.password} onChange={(v) => set('password', v)} type="password" placeholder="min 6 characters" />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-xl border border-black/10 px-5 py-2.5 text-sm font-semibold text-[var(--color-ink-soft)]">
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving || !editing.name || !editing.phone || (!editId && !editing.password)}
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

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      {type === 'password' ? (
        <PasswordInput
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1.5 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
        />
      ) : (
        <input
          value={value}
          required={required}
          type={type}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1.5 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
        />
      )}
    </label>
  );
}