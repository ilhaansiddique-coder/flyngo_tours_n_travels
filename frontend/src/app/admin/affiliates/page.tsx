'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { Modal, FormField, FormInput, FormSelect, ConfirmDialog } from '@/components/admin/ui';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState } from 'react';
import { UserPlus, Plus, Pencil, Trash2, Search } from 'lucide-react';

interface Affiliate {
  id: string;
  referralCode: string;
  userId: string;
  commissionRate: number;
  totalEarnings: number;
  isActive: boolean;
  referrals?: any[];
  commissions?: any[];
}

interface FormData {
  userId: string;
  referralCode: string;
  commissionRate: string;
  isActive: boolean;
}

const initialForm: FormData = {
  userId: '',
  referralCode: '',
  commissionRate: '5',
  isActive: true,
};

export default function AffiliatesPage() {
  const { getAffiliates, createAffiliate, updateAffiliate, deleteAffiliate, getUsers } = useApi();

  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const [userOptions, setUserOptions] = useState<{ label: string; value: string }[]>([]);

  const fetchAffiliates = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(p), limit: '20' };
      if (search) params.search = search;
      const res = await getAffiliates(params);
      const data = res as any;
      if (Array.isArray(data)) {
        setAffiliates(data);
        setTotalPages(1);
      } else {
        setAffiliates(data?.items ?? data?.data ?? []);
        setTotalPages(data?.meta?.totalPages ?? 1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load affiliates');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOptions = async () => {
    try {
      const res = await getUsers({ limit: '200' });
      const data = res as any;
      const users = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
      setUserOptions(users.map((u: any) => ({ label: `${u.fullName} (${u.email})`, value: u.id })));
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

    fetchAffiliates(1);
    fetchUserOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setEditingAffiliate(null);
    setForm({ ...initialForm, referralCode: generateCode() });
    setModalOpen(true);
  };

  const openEditModal = (a: Affiliate) => {
    setEditingAffiliate(a);
    setForm({
      userId: a.userId,
      referralCode: a.referralCode,
      commissionRate: String(a.commissionRate ?? 5),
      isActive: a.isActive,
    });
    setModalOpen(true);
  };

  const generateCode = () => {
    return 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        userId: form.userId,
        referralCode: form.referralCode.toUpperCase(),
        commissionRate: Number(form.commissionRate),
        isActive: form.isActive,
      };
      if (editingAffiliate) {
        await updateAffiliate(editingAffiliate.id, body);
      } else {
        await createAffiliate(body);
      }
      setModalOpen(false);
      fetchAffiliates(1);
    } catch {
      // error handled silently
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      await deleteAffiliate(confirmDelete.id);
      setConfirmDelete({ open: false, id: null });
      fetchAffiliates(page);
    } catch {
      // error handled silently
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search affiliates..."
            className="pl-9 w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') fetchAffiliates(1);
            }}
          />
        </div>
        <Button size="md" className="gap-2" onClick={openCreateModal}>
          <Plus className="w-4 h-4" /> Add Affiliate
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
            <Button variant="outline" onClick={() => fetchAffiliates(page)}>Retry</Button>
          </div>
        </Card>
      )}

      {!loading && !error && (
        <>
          <Card hover={false} padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                    <th className="p-4 font-medium">Referral Code</th>
                    <th className="p-4 font-medium">User ID</th>
                    <th className="p-4 font-medium">Commission</th>
                    <th className="p-4 font-medium">Earnings</th>
                    <th className="p-4 font-medium">Referrals</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-gray-500">
                        <UserPlus className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No affiliates found</p>
                      </td>
                    </tr>
                  ) : (
                    affiliates.map((a) => (
                      <tr key={a.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="p-4 font-mono font-bold text-brand-600">{a.referralCode}</td>
                        <td className="p-4 font-mono text-xs text-gray-500">{a.userId?.slice(0, 8)}...</td>
                        <td className="p-4">{a.commissionRate}%</td>
                        <td className="p-4 font-medium">{formatCurrency(Number(a.totalEarnings ?? 0))}</td>
                        <td className="p-4">{a.referrals?.length ?? 0}</td>
                        <td className="p-4">
                          <Badge variant={a.isActive ? 'success' : 'danger'}>
                            {a.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <button
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"
                              title="Edit"
                              onClick={() => openEditModal(a)}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"
                              title="Delete"
                              onClick={() => setConfirmDelete({ open: true, id: a.id })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(page - 1); fetchAffiliates(page - 1); }}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => { setPage(page + 1); fetchAffiliates(page + 1); }}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingAffiliate ? 'Edit Affiliate' : 'Add Affiliate'}>
        <form onSubmit={handleSubmit}>
          {!editingAffiliate && (
            <FormField label="User" required>
              <FormSelect
                value={form.userId}
                onChange={(v) => setForm({ ...form, userId: v })}
                placeholder="Select a user"
                options={userOptions}
              />
            </FormField>
          )}

          <FormField label="Referral Code" required>
            <div className="flex gap-2">
              <FormInput
                value={form.referralCode}
                onChange={(v) => setForm({ ...form, referralCode: v.toUpperCase() })}
                placeholder="REF-ABC123"
                required
              />
              <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, referralCode: generateCode() })}>
                Generate
              </Button>
            </div>
          </FormField>

          <FormField label="Commission Rate (%)" required>
            <FormInput
              type="number"
              value={form.commissionRate}
              onChange={(v) => setForm({ ...form, commissionRate: v })}
              placeholder="5"
              required
            />
          </FormField>

          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500"
              />
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>
              {editingAffiliate ? 'Update' : 'Create'} Affiliate
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Affiliate"
        message="Are you sure you want to delete this affiliate? This action cannot be undone."
      />
    </div>
  );
}
