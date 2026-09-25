'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, FormField, FormInput, FormTextarea, FormSelect, ConfirmDialog } from '@/components/admin/ui';
import { useApi } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';
import {
  Briefcase, Plus, Pencil, Trash2, Search, Calendar,
  Building2, CheckCircle2, Clock, Filter, FileText, ArrowUpDown
} from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  serviceType?: string | null;
  createdAt?: string;
  _count?: {
    submissions: number;
  };
}

interface VendorSubmission {
  id: string;
  tenantId?: string;
  vendorId: string;
  serviceName: string;
  doneDate: string;
  status: string;
  amount?: number | null;
  currency?: string | null;
  reference?: string | null;
  notes?: string | null;
  createdAt?: string;
  vendor?: Vendor;
}

interface SubmissionFormData {
  vendorName: string;
  serviceName: string;
  doneDate: string;
  status: string;
  amount: string;
  currency: string;
  reference: string;
  notes: string;
  vendorEmail: string;
  vendorPhone: string;
}

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const initialFormData: SubmissionFormData = {
  vendorName: '',
  serviceName: '',
  doneDate: getTodayDateString(),
  status: 'completed',
  amount: '',
  currency: 'BDT',
  reference: '',
  notes: '',
  vendorEmail: '',
  vendorPhone: '',
};

// Demo/fallback seed if remote is unreachable or empty
const DEMO_SUBMISSIONS: VendorSubmission[] = [
  {
    id: 'sub-1',
    vendorId: 'ven-1',
    serviceName: 'Malaysia Visa Sticker Endorsement',
    doneDate: '2026-09-24T10:00:00.000Z',
    status: 'completed',
    amount: 15500,
    currency: 'BDT',
    reference: 'MY-VISA-8821',
    notes: 'Express processing done for 2 applicants',
    vendor: { id: 'ven-1', name: 'Global Visa Logistics Ltd', serviceType: 'Visa Processing' },
  },
  {
    id: 'sub-2',
    vendorId: 'ven-2',
    serviceName: 'Airport VIP Transfer & Chauffeur',
    doneDate: '2026-09-23T14:30:00.000Z',
    status: 'completed',
    amount: 8500,
    currency: 'BDT',
    reference: 'TR-DAC-0941',
    notes: 'Mercedes E-Class from DAC terminal to Radisson',
    vendor: { id: 'ven-2', name: 'Apex Premier Transports', serviceType: 'Transport' },
  },
  {
    id: 'sub-3',
    vendorId: 'ven-3',
    serviceName: 'Makkah Clock Royal Tower 5-Night Booking',
    doneDate: '2026-09-22T09:15:00.000Z',
    status: 'completed',
    amount: 120000,
    currency: 'BDT',
    reference: 'HOT-KSA-4412',
    notes: 'Deluxe Haram View Suite accommodation confirmation',
    vendor: { id: 'ven-3', name: 'Al-Haramain Hospitality Services', serviceType: 'Hotel' },
  },
  {
    id: 'sub-4',
    vendorId: 'ven-4',
    serviceName: 'Biman Bangladesh Airlines Group Booking (10 Pax)',
    doneDate: '2026-09-20T16:00:00.000Z',
    status: 'completed',
    amount: 450000,
    currency: 'BDT',
    reference: 'FL-BG-9021',
    notes: 'Dhaka to Jeddah Umrah group departure',
    vendor: { id: 'ven-4', name: 'SkyWings Aviation GSA', serviceType: 'Aviation' },
  },
];

export default function VendorManagementPage() {
  const {
    getVendors,
    getVendorSubmissions,
    createVendorSubmission,
    updateVendorSubmission,
    deleteVendorSubmission,
  } = useApi();

  const [submissions, setSubmissions] = useState<VendorSubmission[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedVendorFilter, setSelectedVendorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 20;
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<VendorSubmission | null>(null);
  const [formData, setFormData] = useState<SubmissionFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm dialog
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  // Load vendors list for suggestions and dropdowns
  const fetchVendorsList = async () => {
    try {
      const res = await getVendors();
      const list = Array.isArray(res) ? res : (res as any)?.items || [];
      if (list.length > 0) {
        setVendors(list);
      } else {
        // Build unique vendors from demo fallback
        const demoVendors: Vendor[] = Array.from(
          new Map(DEMO_SUBMISSIONS.map((s) => [s.vendor?.name, s.vendor as Vendor])).values()
        );
        setVendors(demoVendors);
      }
    } catch {
      const demoVendors: Vendor[] = Array.from(
        new Map(DEMO_SUBMISSIONS.map((s) => [s.vendor?.name, s.vendor as Vendor])).values()
      );
      setVendors(demoVendors);
    }
  };

  // Fetch submissions from API with fallback
  const fetchSubmissions = async (currentPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {
        page: String(currentPage),
        limit: String(limit),
      };
      if (search.trim()) params.q = search.trim();
      if (selectedVendorFilter) params.vendorId = selectedVendorFilter;

      const res = (await getVendorSubmissions(params)) as any;
      if (res && (Array.isArray(res.items) || Array.isArray(res))) {
        const items = Array.isArray(res.items) ? res.items : res;
        setSubmissions(items);
        setTotalPages(res?.meta?.totalPages || 1);
        setPage(currentPage);
      } else {
        // Fallback to local storage or demo data
        const local = localStorage.getItem('flyngo_vendor_submissions');
        if (local) {
          const parsed = JSON.parse(local);
          setSubmissions(parsed);
        } else {
          setSubmissions(DEMO_SUBMISSIONS);
        }
      }
    } catch (err: any) {
      console.warn('API fetch vendor submissions failed, falling back to local cache/demo:', err);
      const local = localStorage.getItem('flyngo_vendor_submissions');
      if (local) {
        try {
          setSubmissions(JSON.parse(local));
        } catch {
          setSubmissions(DEMO_SUBMISSIONS);
        }
      } else {
        setSubmissions(DEMO_SUBMISSIONS);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorsList();
    fetchSubmissions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtered submissions in-memory for immediate UI search responsiveness
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const vName = sub.vendor?.name?.toLowerCase() || '';
      const sName = sub.serviceName?.toLowerCase() || '';
      const ref = sub.reference?.toLowerCase() || '';
      const notes = sub.notes?.toLowerCase() || '';
      const q = search.toLowerCase().trim();

      const matchesSearch = !q || vName.includes(q) || sName.includes(q) || ref.includes(q) || notes.includes(q);
      const matchesVendor = !selectedVendorFilter || sub.vendorId === selectedVendorFilter;
      const matchesStatus = !statusFilter || sub.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesVendor && matchesStatus;
    });
  }, [submissions, search, selectedVendorFilter, statusFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalSubmissions = submissions.length;
    const uniqueVendors = new Set(submissions.map((s) => s.vendor?.name || s.vendorId)).size;
    const totalAmount = submissions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const completedCount = submissions.filter((s) => s.status === 'completed').length;
    return { totalSubmissions, uniqueVendors, totalAmount, completedCount };
  }, [submissions]);

  // Modal open handlers
  const openCreateModal = () => {
    setEditingSubmission(null);
    setFormData(initialFormData);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (sub: VendorSubmission) => {
    setEditingSubmission(sub);
    setFormData({
      vendorName: sub.vendor?.name || '',
      serviceName: sub.serviceName || '',
      doneDate: sub.doneDate ? sub.doneDate.substring(0, 10) : getTodayDateString(),
      status: sub.status || 'completed',
      amount: sub.amount != null ? String(sub.amount) : '',
      currency: sub.currency || 'BDT',
      reference: sub.reference || '',
      notes: sub.notes || '',
      vendorEmail: sub.vendor?.email || '',
      vendorPhone: sub.vendor?.phone || '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendorName.trim()) {
      setFormError('Please enter a vendor name.');
      return;
    }
    if (!formData.serviceName.trim()) {
      setFormError('Please enter the service name performed by the vendor.');
      return;
    }
    if (!formData.doneDate) {
      setFormError('Please specify the date when the service was done.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      vendorName: formData.vendorName.trim(),
      serviceName: formData.serviceName.trim(),
      doneDate: formData.doneDate,
      status: formData.status,
      amount: formData.amount ? Number(formData.amount) : undefined,
      currency: formData.currency,
      reference: formData.reference.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      vendorEmail: formData.vendorEmail.trim() || undefined,
      vendorPhone: formData.vendorPhone.trim() || undefined,
    };

    try {
      if (editingSubmission) {
        // Update submission
        const res = (await updateVendorSubmission(editingSubmission.id, payload)) as any;
        setSubmissions((prev) =>
          prev.map((item) =>
            item.id === editingSubmission.id
              ? {
                  ...item,
                  ...payload,
                  vendor: res?.vendor || {
                    id: item.vendorId,
                    name: payload.vendorName,
                  },
                }
              : item
          )
        );
      } else {
        // Create submission (auto-creates vendor if new)
        try {
          const res = (await createVendorSubmission(payload)) as any;
          if (res && res.id) {
            setSubmissions((prev) => [res, ...prev]);
          } else {
            throw new Error('Fallback to local creation');
          }
        } catch {
          // Local fallback creation
          const newId = `sub-${Date.now()}`;
          const existingVendor = vendors.find(
            (v) => v.name.toLowerCase() === payload.vendorName.toLowerCase()
          );
          const vendorId = existingVendor?.id || `ven-${Date.now()}`;
          const newVendorObj: Vendor = existingVendor || {
            id: vendorId,
            name: payload.vendorName,
            email: payload.vendorEmail,
            phone: payload.vendorPhone,
            serviceType: payload.serviceName,
          };

          const newSub: VendorSubmission = {
            id: newId,
            vendorId,
            serviceName: payload.serviceName,
            doneDate: payload.doneDate,
            status: payload.status,
            amount: payload.amount,
            currency: payload.currency,
            reference: payload.reference,
            notes: payload.notes,
            vendor: newVendorObj,
          };

          setSubmissions((prev) => [newSub, ...prev]);
        }
      }

      // Sync to localStorage as client-side resilience
      setTimeout(() => {
        setSubmissions((current) => {
          try {
            localStorage.setItem('flyngo_vendor_submissions', JSON.stringify(current));
          } catch {
            // ignore
          }
          return current;
        });
      }, 50);

      // Refresh vendors list
      await fetchVendorsList();
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save submission. Please verify input.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      await deleteVendorSubmission(confirmDelete.id);
      setSubmissions((prev) => {
        const next = prev.filter((s) => s.id !== confirmDelete.id);
        try {
          localStorage.setItem('flyngo_vendor_submissions', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
      setConfirmDelete({ open: false, id: null });
    } catch {
      // Even if API fails, delete locally
      setSubmissions((prev) => {
        const next = prev.filter((s) => s.id !== confirmDelete.id);
        try {
          localStorage.setItem('flyngo_vendor_submissions', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
      setConfirmDelete({ open: false, id: null });
    }
  };

  // Format date helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Briefcase className="w-6 h-6" />
            </span>
            Vendor Management
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Track vendor records, completed service submissions, and manage partner relations.
          </p>
        </div>

        {/* Submission creation button */}
        <div className="flex items-center gap-3">
          <Button size="md" className="gap-2 shadow-sm" onClick={openCreateModal}>
            <Plus className="w-4 h-4" />
            + New Submission
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover={false} className="p-4 bg-surface-container-low border border-outline-variant/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Total Submissions
            </span>
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-on-surface">{stats.totalSubmissions}</span>
            <span className="text-xs text-on-surface-variant">records</span>
          </div>
        </Card>

        <Card hover={false} className="p-4 bg-surface-container-low border border-outline-variant/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Active Vendors
            </span>
            <Building2 className="w-4 h-4 text-secondary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-on-surface">{stats.uniqueVendors}</span>
            <span className="text-xs text-on-surface-variant">partners</span>
          </div>
        </Card>

        <Card hover={false} className="p-4 bg-surface-container-low border border-outline-variant/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Completed Services
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-on-surface">{stats.completedCount}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400">fulfilled</span>
          </div>
        </Card>

        <Card hover={false} className="p-4 bg-surface-container-low border border-outline-variant/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Total Billed
            </span>
            <span className="text-xs font-bold text-primary">BDT</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-on-surface">
              {formatCurrency(stats.totalAmount, 'BDT')}
            </span>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <Input
              placeholder="Search vendor, service name, reference..."
              className="pl-9 w-full bg-surface-container"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Vendor Filter */}
          <div className="w-full sm:w-56">
            <select
              aria-label="Filter by vendor"
              value={selectedVendorFilter}
              onChange={(e) => setSelectedVendorFilter(e.target.value)}
              className="w-full border border-outline-variant rounded-xl px-3 py-2 text-sm bg-surface-container text-on-surface focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
            >
              <option value="">All Vendors</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-44">
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-outline-variant rounded-xl px-3 py-2 text-sm bg-surface-container text-on-surface focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <Card hover={false}>
          <div className="text-center py-12">
            <p className="text-error mb-4">{error}</p>
            <Button variant="outline" onClick={() => fetchSubmissions(page)}>
              Retry
            </Button>
          </div>
        </Card>
      ) : (
        <Card hover={false} padding="none" className="overflow-hidden border border-outline-variant/70 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-on-surface-variant bg-surface-container-low border-b border-outline-variant/60">
                  <th className="p-4 font-semibold text-xs uppercase tracking-wider w-16 text-center">
                    #
                  </th>
                  <th className="p-4 font-semibold text-xs uppercase tracking-wider">
                    Vendor Name
                  </th>
                  <th className="p-4 font-semibold text-xs uppercase tracking-wider">
                    Service Name Done
                  </th>
                  <th className="p-4 font-semibold text-xs uppercase tracking-wider">
                    Done Date
                  </th>
                  <th className="p-4 font-semibold text-xs uppercase tracking-wider">
                    Amount & Ref
                  </th>
                  <th className="p-4 font-semibold text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="p-4 font-semibold text-xs uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-on-surface-variant">
                      <Briefcase className="w-10 h-10 mx-auto mb-3 text-on-surface-variant/40" />
                      <p className="font-medium text-base text-on-surface">No vendor submissions found</p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Click the &quot;+ New Submission&quot; button above to record your first completed vendor service.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub, index) => {
                    const serialNumber = (page - 1) * limit + index + 1;
                    const vendorDisplayName = sub.vendor?.name || 'Unknown Vendor';
                    return (
                      <tr
                        key={sub.id}
                        className="hover:bg-surface-container-high/60 transition-colors"
                      >
                        {/* 1. Serial Number */}
                        <td className="p-4 text-center font-mono text-xs text-on-surface-variant font-medium">
                          {serialNumber}
                        </td>

                        {/* 2. Vendor Name */}
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {vendorDisplayName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-on-surface">
                                {vendorDisplayName}
                              </div>
                              {sub.vendor?.serviceType && (
                                <div className="text-xs text-on-surface-variant">
                                  {sub.vendor.serviceType}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 3. Service Name which were done by them */}
                        <td className="p-4">
                          <div className="font-medium text-on-surface flex items-center gap-1.5">
                            <span>{sub.serviceName}</span>
                          </div>
                          {sub.notes && (
                            <div className="text-xs text-on-surface-variant/80 truncate max-w-xs mt-0.5">
                              {sub.notes}
                            </div>
                          )}
                        </td>

                        {/* 4. Done Date */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-on-surface text-xs font-medium">
                            <Calendar className="w-3.5 h-3.5 text-on-surface-variant" />
                            {formatDate(sub.doneDate)}
                          </div>
                        </td>

                        {/* Amount & Reference */}
                        <td className="p-4 whitespace-nowrap">
                          {sub.amount != null ? (
                            <div className="font-semibold text-on-surface text-xs">
                              {formatCurrency(Number(sub.amount), sub.currency || 'BDT')}
                            </div>
                          ) : (
                            <span className="text-xs text-on-surface-variant">—</span>
                          )}
                          {sub.reference && (
                            <div className="text-[11px] font-mono text-on-surface-variant mt-0.5">
                              Ref: {sub.reference}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          <Badge
                            variant={
                              sub.status === 'completed'
                                ? 'success'
                                : sub.status === 'in_progress'
                                ? 'warning'
                                : 'default'
                            }
                            className="capitalize text-xs font-medium"
                          >
                            {sub.status.replace('_', ' ')}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-on-surface-variant hover:text-on-surface"
                              onClick={() => openEditModal(sub)}
                              title="Edit Submission"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-error hover:text-error hover:bg-error/10"
                              onClick={() => setConfirmDelete({ open: true, id: sub.id })}
                              title="Delete Submission"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer info */}
          <div className="px-6 py-3 border-t border-outline-variant/60 flex items-center justify-between text-xs text-on-surface-variant bg-surface-container-low">
            <div>
              Showing <span className="font-medium text-on-surface">{filteredSubmissions.length}</span> submission
              {filteredSubmissions.length === 1 ? '' : 's'}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => fetchSubmissions(page - 1)}
                >
                  Previous
                </Button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => fetchSubmissions(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Submission Creation / Editing Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSubmission ? 'Edit Vendor Submission' : 'Create Vendor Submission'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Automatic vendor creation hint banner */}
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-start gap-2">
            <Building2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Automatic Vendor Synchronization:</span> If you type a new vendor name that
              does not exist in the database, the vendor profile will be automatically created upon saving this submission.
            </div>
          </div>

          {formError && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-xs text-error">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vendor Name with datalist */}
            <FormField label="Vendor Name" required>
              <div className="relative">
                <input
                  type="text"
                  list="vendor-names-list"
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  placeholder="e.g. Apex Travel Logistics Ltd"
                  required
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container text-on-surface placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-colors"
                />
                <datalist id="vendor-names-list">
                  {vendors.map((v) => (
                    <option key={v.id} value={v.name} />
                  ))}
                </datalist>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Select existing vendor or type a new vendor name to register them.
              </p>
            </FormField>

            {/* Service Name which were done by them */}
            <FormField label="Service Name Done" required>
              <FormInput
                value={formData.serviceName}
                onChange={(v) => setFormData({ ...formData, serviceName: v })}
                placeholder="e.g. Malaysia Visa Endorsement, Hotel Booking, Bus Fleet..."
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Done Date */}
            <FormField label="Done Date" required>
              <FormInput
                type="date"
                value={formData.doneDate}
                onChange={(v) => setFormData({ ...formData, doneDate: v })}
                required
              />
            </FormField>

            {/* Status */}
            <FormField label="Status" required>
              <FormSelect
                value={formData.status}
                onChange={(v) => setFormData({ ...formData, status: v })}
                options={[
                  { label: 'Completed', value: 'completed' },
                  { label: 'In Progress', value: 'in_progress' },
                  { label: 'Pending', value: 'pending' },
                ]}
              />
            </FormField>

            {/* Reference / Voucher # */}
            <FormField label="Reference / Invoice #">
              <FormInput
                value={formData.reference}
                onChange={(v) => setFormData({ ...formData, reference: v })}
                placeholder="e.g. VEND-INV-9921"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <FormField label="Amount Paid / Payable">
              <FormInput
                type="number"
                value={formData.amount}
                onChange={(v) => setFormData({ ...formData, amount: v })}
                placeholder="e.g. 15000"
              />
            </FormField>

            {/* Currency */}
            <FormField label="Currency">
              <FormSelect
                value={formData.currency}
                onChange={(v) => setFormData({ ...formData, currency: v })}
                options={[
                  { label: 'BDT (৳)', value: 'BDT' },
                  { label: 'USD ($)', value: 'USD' },
                  { label: 'SAR (﷼)', value: 'SAR' },
                  { label: 'EUR (€)', value: 'EUR' },
                ]}
              />
            </FormField>
          </div>

          {/* Optional Vendor Details if registering new vendor */}
          <div className="pt-2 border-t border-outline-variant/60">
            <span className="text-xs font-semibold text-on-surface-variant block mb-3">
              Optional Vendor Contact (applied when creating new vendor)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Vendor Email">
                <FormInput
                  type="email"
                  value={formData.vendorEmail}
                  onChange={(v) => setFormData({ ...formData, vendorEmail: v })}
                  placeholder="vendor@example.com"
                />
              </FormField>

              <FormField label="Vendor Phone">
                <FormInput
                  type="tel"
                  value={formData.vendorPhone}
                  onChange={(v) => setFormData({ ...formData, vendorPhone: v })}
                  placeholder="+880 1700 000000"
                />
              </FormField>
            </div>
          </div>

          {/* Notes */}
          <FormField label="Notes & Specifications">
            <FormTextarea
              value={formData.notes}
              onChange={(v) => setFormData({ ...formData, notes: v })}
              placeholder="Any details, service breakdown, booking identifiers, or remarks..."
              rows={3}
            />
          </FormField>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingSubmission ? 'Update Submission' : 'Create Submission'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Vendor Submission"
        message="Are you sure you want to remove this vendor submission record? This action cannot be undone."
      />
    </div>
  );
}
