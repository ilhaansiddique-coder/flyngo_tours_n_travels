'use client';

import { useApi } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, FormField, FormInput, FormSelect, ConfirmDialog } from '@/components/admin/ui';
import { useEffect, useState } from 'react';
import { Percent, Plus, Pencil, Trash2, Search } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  maxUses?: number;
  usedCount?: number;
  startDate: string;
  endDate: string;
  applicableTo?: string[];
  isActive?: boolean;
}

interface FormData {
  code: string;
  type: string;
  value: string;
  minPurchase: string;
  maxDiscount: string;
  maxUses: string;
  startDate: string;
  endDate: string;
  applicableTo: string[];
  isActive: boolean;
}

const APPLICABLE_OPTIONS = [
  { label: 'Tour', value: 'tour' },
  { label: 'Hotel', value: 'hotel' },
  { label: 'Flight', value: 'flight' },
  { label: 'Visa', value: 'visa' },
];

const initialForm: FormData = {
  code: '',
  type: 'percentage',
  value: '',
  minPurchase: '',
  maxDiscount: '',
  maxUses: '0',
  startDate: '',
  endDate: '',
  applicableTo: [],
  isActive: true,
};

export default function CouponsPage() {
  const { getCoupons, createCoupon, updateCoupon, deleteCoupon } = useApi();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ page: number; total: number; totalPages: number }>({
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const fetchCoupons = async (page?: number) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(page ?? meta.page) };
      if (search) params.search = search;
      const res = await getCoupons(params);
      const data = res as any;
      setCoupons(Array.isArray(data) ? data : data?.data ?? []);
      setMeta(data?.meta ?? { page: 1, total: 0, totalPages: 1 });
    } catch (err: any) {
      setError(err.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code || '',
      type: coupon.type || 'percentage',
      value: String(coupon.value ?? ''),
      minPurchase: String(coupon.minPurchase ?? ''),
      maxDiscount: String(coupon.maxDiscount ?? ''),
      maxUses: String(coupon.maxUses ?? 0),
      startDate: coupon.startDate ? coupon.startDate.slice(0, 10) : '',
      endDate: coupon.endDate ? coupon.endDate.slice(0, 10) : '',
      applicableTo: coupon.applicableTo ?? [],
      isActive: coupon.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minPurchase: form.minPurchase ? Number(form.minPurchase) : undefined,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        maxUses: Number(form.maxUses),
        startDate: form.startDate,
        endDate: form.endDate,
        applicableTo: form.applicableTo.length > 0 ? form.applicableTo : undefined,
        isActive: form.isActive,
      };
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, body);
      } else {
        await createCoupon(body);
      }
      setModalOpen(false);
      fetchCoupons(1);
    } catch {
      // error handled silently
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      await deleteCoupon(confirmDelete.id);
      setConfirmDelete({ open: false, id: null });
      fetchCoupons();
    } catch {
      // error handled silently
    }
  };

  const handleSearch = () => {
    fetchCoupons(1);
  };

  const goToPage = (page: number) => {
    const params: Record<string, string> = { page: String(page) };
    if (search) params.search = search;
    setLoading(true);
    setError(null);
    getCoupons(params)
      .then((res: any) => {
        setCoupons(Array.isArray(res) ? res : res?.data ?? []);
        setMeta((res?.meta as typeof meta) ?? { page: 1, total: 0, totalPages: 1 });
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load coupons');
      })
      .finally(() => setLoading(false));
  };

  const toggleApplicable = (value: string) => {
    setForm((prev) => ({
      ...prev,
      applicableTo: prev.applicableTo.includes(value)
        ? prev.applicableTo.filter((v) => v !== value)
        : [...prev.applicableTo, value],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search coupons..."
            className="pl-9 w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
        </div>
        <Button size="md" className="gap-2" onClick={openCreateModal}>
          <Plus className="w-4 h-4" /> Add Coupon
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
            <Button variant="outline" onClick={() => fetchCoupons()}>
              Retry
            </Button>
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
                    <th className="p-4 font-medium">Code</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Value</th>
                    <th className="p-4 font-medium">Min Purchase</th>
                    <th className="p-4 font-medium">Usage</th>
                    <th className="p-4 font-medium">Start Date</th>
                    <th className="p-4 font-medium">End Date</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-12 text-center text-gray-500">
                        <Percent className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No coupons found</p>
                      </td>
                    </tr>
                  ) : (
                    coupons.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                      >
                        <td className="p-4 font-mono font-bold text-brand-600">{c.code}</td>
                        <td className="p-4">
                          <Badge variant={c.type === 'percentage' ? 'info' : 'warning'}>
                            {c.type === 'percentage' ? 'Percentage' : 'Fixed'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {c.type === 'percentage' ? `${c.value}%` : formatCurrency(c.value)}
                        </td>
                        <td className="p-4">
                          {c.minPurchase ? formatCurrency(c.minPurchase) : '\u2014'}
                        </td>
                        <td className="p-4">
                          {c.usedCount ?? 0}/{c.maxUses && c.maxUses > 0 ? c.maxUses : '\u221E'}
                        </td>
                        <td className="p-4 text-xs text-gray-500">
                          {c.startDate ? c.startDate.slice(0, 10) : '\u2014'}
                        </td>
                        <td className="p-4 text-xs text-gray-500">
                          {c.endDate ? c.endDate.slice(0, 10) : '\u2014'}
                        </td>
                        <td className="p-4">
                          <Badge variant={c.isActive ? 'success' : 'default'}>
                            {c.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <button
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"
                              title="Edit"
                              onClick={() => openEditModal(c)}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"
                              title="Delete"
                              onClick={() => setConfirmDelete({ open: true, id: c.id })}
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

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                Showing {coupons.length} of {meta.total} coupons
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page <= 1}
                  onClick={() => goToPage(meta.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => goToPage(meta.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCoupon ? 'Edit Coupon' : 'Add Coupon'}
      >
        <form onSubmit={handleSubmit}>
          <FormField label="Code" required>
            <FormInput
              value={form.code}
              onChange={(v) => setForm({ ...form, code: v.toUpperCase() })}
              placeholder="e.g. SUMMER25"
              required
            />
          </FormField>

          <FormField label="Type" required>
            <FormSelect
              value={form.type}
              onChange={(v) => setForm({ ...form, type: v })}
              options={[
                { label: 'Percentage', value: 'percentage' },
                { label: 'Fixed Amount', value: 'fixed' },
              ]}
            />
          </FormField>

          <FormField label="Value" required>
            <FormInput
              type="number"
              value={form.value}
              onChange={(v) => setForm({ ...form, value: v })}
              placeholder={form.type === 'percentage' ? 'e.g. 25' : 'e.g. 50'}
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Min Purchase">
              <FormInput
                type="number"
                value={form.minPurchase}
                onChange={(v) => setForm({ ...form, minPurchase: v })}
                placeholder="0"
              />
            </FormField>
            <FormField label="Max Discount">
              <FormInput
                type="number"
                value={form.maxDiscount}
                onChange={(v) => setForm({ ...form, maxDiscount: v })}
                placeholder="Optional"
              />
            </FormField>
          </div>

          <FormField label="Max Uses (0 = unlimited)">
            <FormInput
              type="number"
              value={form.maxUses}
              onChange={(v) => setForm({ ...form, maxUses: v })}
              placeholder="0"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" required>
              <FormInput
                type="date"
                value={form.startDate}
                onChange={(v) => setForm({ ...form, startDate: v })}
                required
              />
            </FormField>
            <FormField label="End Date" required>
              <FormInput
                type="date"
                value={form.endDate}
                onChange={(v) => setForm({ ...form, endDate: v })}
                required
              />
            </FormField>
          </div>

          <FormField label="Applicable To">
            <div className="flex flex-wrap gap-3 mt-1">
              {APPLICABLE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.applicableTo.includes(opt.value)}
                    onChange={() => toggleApplicable(opt.value)}
                    className="rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
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
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingCoupon ? 'Update' : 'Create'} Coupon
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? This action cannot be undone."
      />
    </div>
  );
}
