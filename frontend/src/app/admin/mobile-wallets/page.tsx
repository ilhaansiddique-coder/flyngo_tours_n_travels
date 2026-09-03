'use client';

import { useApi } from '@/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, FormField, FormInput, FormTextarea, ConfirmDialog } from '@/components/admin/ui';
import { useEffect, useState } from 'react';
import { Smartphone, Plus, Pencil, Trash2 } from 'lucide-react';

const PROVIDERS = [
  { id: 'bkash', label: 'bKash' },
  { id: 'nagad', label: 'Nagad' },
  { id: 'rocket', label: 'Rocket (DBBL)' },
  { id: 'upay', label: 'Upay' },
  { id: 'tap', label: 'Tap' },
  { id: 'surecash', label: 'SureCash' },
  { id: 'mcash', label: 'mCash' },
] as const;

const ACCOUNT_TYPES = [
  { id: 'personal', label: 'Personal' },
  { id: 'merchant', label: 'Merchant' },
] as const;

const PROVIDER_LABEL: Record<string, string> = Object.fromEntries(PROVIDERS.map((p) => [p.id, p.label]));

const selectClass =
  'w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none';

interface MobileWallet {
  id: string;
  provider: string;
  accountName: string;
  walletNumber: string;
  accountType: string;
  instructions?: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface FormData {
  provider: string;
  accountName: string;
  walletNumber: string;
  accountType: string;
  instructions: string;
  isActive: boolean;
  sortOrder: string;
}

const empty: FormData = {
  provider: 'bkash',
  accountName: '',
  walletNumber: '',
  accountType: 'personal',
  instructions: '',
  isActive: true,
  sortOrder: '0',
};

export default function MobileWalletsPage() {
  const { getMobileWallets, createMobileWallet, updateMobileWallet, deleteMobileWallet } = useApi();
  const [items, setItems] = useState<MobileWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MobileWallet | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMobileWallets();
      setItems(Array.isArray(res) ? res : (res as any)?.items ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load mobile wallets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setModalOpen(true);
  };

  const openEdit = (row: MobileWallet) => {
    setEditing(row);
    setForm({
      provider: row.provider,
      accountName: row.accountName,
      walletNumber: row.walletNumber,
      accountType: row.accountType || 'personal',
      instructions: row.instructions || '',
      isActive: row.isActive,
      sortOrder: String(row.sortOrder ?? 0),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        provider: form.provider,
        accountName: form.accountName,
        walletNumber: form.walletNumber,
        accountType: form.accountType,
        instructions: form.instructions || undefined,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (editing) await updateMobileWallet(editing.id, body);
      else await createMobileWallet(body);
      setModalOpen(false);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    await deleteMobileWallet(confirmDelete.id);
    setConfirmDelete({ open: false, id: null });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">Shown to customers at checkout for bKash, Nagad, Rocket and other BD wallets.</p>
        <Button size="md" className="gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Add wallet
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
        </div>
      )}

      {error && !loading && (
        <Card hover={false}>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={load}>Retry</Button>
          </div>
        </Card>
      )}

      {!loading && !error && (
        <Card hover={false} padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 bg-gray-50 dark:bg-surface-container/50">
                  <th className="p-4 font-medium">Provider</th>
                  <th className="p-4 font-medium">Account name</th>
                  <th className="p-4 font-medium">Number</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500">
                      <Smartphone className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No mobile wallets yet</p>
                    </td>
                  </tr>
                ) : (
                  items.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="p-4 font-medium">{PROVIDER_LABEL[row.provider] || row.provider}</td>
                      <td className="p-4">{row.accountName}</td>
                      <td className="p-4 font-mono text-xs">{row.walletNumber}</td>
                      <td className="p-4 text-xs text-gray-500 capitalize">{row.accountType || '—'}</td>
                      <td className="p-4 text-xs">{row.isActive ? 'Active' : 'Hidden'}</td>
                      <td className="p-4 text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(row)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmDelete({ open: true, id: row.id })}><Trash2 className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit mobile wallet' : 'Add mobile wallet'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Provider">
              <select className={selectClass} value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}>
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Account type">
              <select className={selectClass} value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value })}>
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Account name">
            <FormInput value={form.accountName} onChange={(v) => setForm({ ...form, accountName: v })} placeholder="FlynGo Tours And Travels" />
          </FormField>
          <FormField label="Wallet number">
            <FormInput value={form.walletNumber} onChange={(v) => setForm({ ...form, walletNumber: v })} placeholder="01XXXXXXXXX" />
          </FormField>
          <FormField label="Instructions">
            <FormTextarea value={form.instructions} onChange={(v) => setForm({ ...form, instructions: v })} placeholder="Send money as Payment / Send Money" />
          </FormField>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active (shown at checkout)
          </label>
          <FormField label="Sort order">
            <Input value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editing ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete mobile wallet?"
        message="Customers will no longer see this wallet at checkout."
      />
    </div>
  );
}
