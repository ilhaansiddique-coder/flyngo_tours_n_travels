'use client';

import { useApi } from '@/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, FormField, FormInput, FormTextarea, ConfirmDialog } from '@/components/admin/ui';
import { useEffect, useState } from 'react';
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react';

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string | null;
  routingNumber?: string | null;
  swiftCode?: string | null;
  instructions?: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface FormData {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  routingNumber: string;
  swiftCode: string;
  instructions: string;
  isActive: boolean;
  sortOrder: string;
}

const empty: FormData = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  branch: '',
  routingNumber: '',
  swiftCode: '',
  instructions: '',
  isActive: true,
  sortOrder: '0',
};

export default function BankAccountsPage() {
  const { getBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount } = useApi();
  const [items, setItems] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBankAccounts();
      setItems(Array.isArray(res) ? res : (res as any)?.items ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load bank accounts');
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

  const openEdit = (row: BankAccount) => {
    setEditing(row);
    setForm({
      bankName: row.bankName,
      accountName: row.accountName,
      accountNumber: row.accountNumber,
      branch: row.branch || '',
      routingNumber: row.routingNumber || '',
      swiftCode: row.swiftCode || '',
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
        bankName: form.bankName,
        accountName: form.accountName,
        accountNumber: form.accountNumber,
        branch: form.branch || undefined,
        routingNumber: form.routingNumber || undefined,
        swiftCode: form.swiftCode || undefined,
        instructions: form.instructions || undefined,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (editing) await updateBankAccount(editing.id, body);
      else await createBankAccount(body);
      setModalOpen(false);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    await deleteBankAccount(confirmDelete.id);
    setConfirmDelete({ open: false, id: null });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">Shown to customers at checkout for bank transfer.</p>
        <Button size="md" className="gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Add account
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
                  <th className="p-4 font-medium">Bank</th>
                  <th className="p-4 font-medium">Account name</th>
                  <th className="p-4 font-medium">Number</th>
                  <th className="p-4 font-medium">Branch</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500">
                      <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No bank accounts yet</p>
                    </td>
                  </tr>
                ) : (
                  items.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="p-4 font-medium">{row.bankName}</td>
                      <td className="p-4">{row.accountName}</td>
                      <td className="p-4 font-mono text-xs">{row.accountNumber}</td>
                      <td className="p-4 text-xs text-gray-500">{row.branch || '—'}</td>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit bank account' : 'Add bank account'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Bank name">
            <FormInput value={form.bankName} onChange={(v) => setForm({ ...form, bankName: v })} placeholder="e.g. Dutch-Bangla Bank" />
          </FormField>
          <FormField label="Account name">
            <FormInput value={form.accountName} onChange={(v) => setForm({ ...form, accountName: v })} placeholder="Flyngo Tours & Travels" />
          </FormField>
          <FormField label="Account number">
            <FormInput value={form.accountNumber} onChange={(v) => setForm({ ...form, accountNumber: v })} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Branch">
              <FormInput value={form.branch} onChange={(v) => setForm({ ...form, branch: v })} />
            </FormField>
            <FormField label="Routing no.">
              <FormInput value={form.routingNumber} onChange={(v) => setForm({ ...form, routingNumber: v })} />
            </FormField>
          </div>
          <FormField label="SWIFT">
            <FormInput value={form.swiftCode} onChange={(v) => setForm({ ...form, swiftCode: v })} />
          </FormField>
          <FormField label="Instructions">
            <FormTextarea value={form.instructions} onChange={(v) => setForm({ ...form, instructions: v })} placeholder="Use booking code as reference" />
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
        title="Delete bank account?"
        message="Customers will no longer see this account at checkout."
      />
    </div>
  );
}
