'use client';

import { useApi } from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Modal, FormField, FormInput, FormSelect, ConfirmDialog } from '@/components/admin/ui';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Users, Search, Pencil, Trash2, Plus, MessageCircle, Copy, KeyRound, Upload, FileText, Eye } from 'lucide-react';
import {
  COUNTRY_DIALS,
  DEFAULT_COUNTRY_CODE,
  findDialByCode,
} from '@/lib/country-dial-codes';

interface Role {
  id: string;
  name: string;
  code: string;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role?: Role;
  isActive: boolean;
  createdAt: string;
  accountStatus?: string;
  credentialsSentAt?: string | null;
  nationalId?: string;
  nationalIdFrontUrl?: string;
  nationalIdBackUrl?: string;
  passportNumber?: string;
  passportUrl?: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  phoneCountry: string;
  password: string;
  roleId: string;
  isActive: boolean;
  nationalId: string;
  passportNumber: string;
}

const initialForm: FormData = {
  fullName: '',
  email: '',
  phone: '',
  phoneCountry: DEFAULT_COUNTRY_CODE,
  password: '',
  roleId: '',
  isActive: true,
  nationalId: '',
  passportNumber: '',
};

export default function CustomersPage() {
  const {
    getUsers, getUserById, createUser, updateUser, deleteUser, getRoles, issueCustomerCredentials,
    uploadCustomerNationalIdFront, uploadCustomerNationalIdBack, uploadCustomerPassport,
  } = useApi();

  const searchParams = useSearchParams();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ page: number; total: number; totalPages: number }>({
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [actionError, setActionError] = useState<string | null>(null);

  const [credentials, setCredentials] = useState<{
    user: User;
    tempPassword: string;
    expiresAt: string;
  } | null>(null);
  const [issuing, setIssuing] = useState<string | null>(null);

  const [roles, setRoles] = useState<Role[]>([]);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Document upload state (only for editing existing customers)
  const [nidFrontFile, setNidFrontFile] = useState<File | null>(null);
  const [nidBackFile, setNidBackFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  // Preview state for document images
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchUsers = async (page?: number) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(page ?? meta.page) };
      if (search) params.q = search;
      const res = await getUsers(params);
      const data = res as any;
      setUsers(Array.isArray(data) ? data : data?.data ?? []);
      setMeta(data?.meta ?? { page: 1, total: 0, totalPages: 1 });
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await getRoles();
      const data = res as any;
      setRoles(Array.isArray(data) ? data : data?.data ?? []);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open a specific customer's edit modal when arriving via the global search
  // (/admin/customers?edit=<id>).
  useEffect(() => {
    const id = searchParams.get('edit');
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = (await getUserById(id)) as any;
        const user = res?.data ?? res;
        if (cancelled || !user?.id) return;
        const stored = user.phone || '';
        const matched = COUNTRY_DIALS.find(
          (c) => stored.startsWith(c.dial + ' ') || stored.startsWith(c.dial),
        );
        setEditingUser(user);
        setForm({
          fullName: user.fullName || '',
          email: user.email || '',
          phone: stored,
          phoneCountry: matched?.code || DEFAULT_COUNTRY_CODE,
          password: '',
          roleId: user.role?.id || '',
          isActive: user.isActive,
          nationalId: user.nationalId || '',
          passportNumber: user.passportNumber || '',
        });
        setNidFrontFile(null);
        setNidBackFile(null);
        setPassportFile(null);
        setModalOpen(true);
      } catch {
        // user not found — ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, getUserById]);

  // Close autocomplete dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const debouncedSearch = useCallback((term: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!term || term.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await getUsers({ q: term, limit: '8' });
        const data = res as any;
        const items = Array.isArray(data) ? data : data?.data ?? [];
        setSuggestions(items);
        setShowSuggestions(items.length > 0);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }, [getUsers]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    debouncedSearch(value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      fetchUsers(1);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (user: User) => {
    setShowSuggestions(false);
    setSearch('');
    setEditingUser(user);
    const stored = user.phone || '';
    const matched = COUNTRY_DIALS.find((c) => stored.startsWith(c.dial + ' ') || stored.startsWith(c.dial));
    setForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: stored,
      phoneCountry: matched?.code || DEFAULT_COUNTRY_CODE,
      password: '',
      roleId: user.role?.id || '',
      isActive: user.isActive,
      nationalId: (user as any).nationalId || '',
      passportNumber: (user as any).passportNumber || '',
    });
    setNidFrontFile(null);
    setNidBackFile(null);
    setPassportFile(null);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setForm({ ...initialForm, roleId: roles[0]?.id || '' });
    setNidFrontFile(null);
    setNidBackFile(null);
    setPassportFile(null);
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    const stored = user.phone || '';
    const matched = COUNTRY_DIALS.find((c) => stored.startsWith(c.dial + ' ') || stored.startsWith(c.dial));
    setForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: stored,
      phoneCountry: matched?.code || DEFAULT_COUNTRY_CODE,
      password: '',
      roleId: user.role?.id || '',
      isActive: user.isActive,
      nationalId: (user as any).nationalId || '',
      passportNumber: (user as any).passportNumber || '',
    });
    setNidFrontFile(null);
    setNidBackFile(null);
    setPassportFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let savedUser: any;
      if (editingUser) {
        savedUser = await updateUser(editingUser.id, {
          fullName: form.fullName,
          phone: form.phone,
          roleId: form.roleId,
          isActive: form.isActive,
          nationalId: form.nationalId || undefined,
          passportNumber: form.passportNumber || undefined,
          ...(form.password ? { password: form.password } : {}),
        });
      } else {
        const body: any = {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone || undefined,
          roleId: form.roleId,
          isActive: form.isActive,
          nationalId: form.nationalId || undefined,
          passportNumber: form.passportNumber || undefined,
        };
        if (form.password) body.password = form.password;
        savedUser = await createUser(body);
      }
      const userId = savedUser?.id || editingUser?.id;

      // Upload any pending document files (requires a saved user ID)
      if (userId) {
        if (nidFrontFile) {
          setUploadingDoc('nid-front');
          await uploadCustomerNationalIdFront(userId, nidFrontFile);
        }
        if (nidBackFile) {
          setUploadingDoc('nid-back');
          await uploadCustomerNationalIdBack(userId, nidBackFile);
        }
        if (passportFile) {
          setUploadingDoc('passport');
          await uploadCustomerPassport(userId, passportFile);
        }
        setUploadingDoc(null);
      }

      setModalOpen(false);
      fetchUsers(1);
    } catch {
      // error handled silently
    } finally {
      setSubmitting(false);
      setUploadingDoc(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    setActionError(null);
    try {
      await deleteUser(confirmDelete.id);
      setConfirmDelete({ open: false, id: null });
      fetchUsers();
    } catch (err: any) {
      setConfirmDelete({ open: false, id: null });
      setActionError(err?.message || 'Could not delete this customer. Please try again.');
    }
  };

  const handleIssueCredentials = async (user: User) => {
    setActionError(null);
    setIssuing(user.id);
    try {
      const res = (await issueCustomerCredentials(user.id)) as {
        tempPassword: string;
        expiresAt: string;
      };
      setCredentials({ user, tempPassword: res.tempPassword, expiresAt: res.expiresAt });
      fetchUsers();
    } catch (err: any) {
      setActionError(err?.message || 'Could not issue credentials. Please try again.');
    } finally {
      setIssuing(null);
    }
  };

  const whatsappMessage = (user: User, tempPassword: string) =>
    `Assalamu alaikum ${user.fullName},\n\n` +
    `Your Flyngo account is ready. Sign in with this phone number and the temporary password below, then set your own password.\n\n` +
    `Temporary password: ${tempPassword}\n\n` +
    `Sign in: ${typeof window !== 'undefined' ? window.location.origin : ''}/auth/login\n\n` +
    `This password expires in 7 days. Please don't share it with anyone.`;

  const whatsappHref = (user: User, tempPassword: string) => {
    const digits = (user.phone || '').replace(/\D/g, '');
    return `https://wa.me/${digits}?text=${encodeURIComponent(whatsappMessage(user, tempPassword))}`;
  };

  const handleSearch = () => {
    setShowSuggestions(false);
    fetchUsers(1);
  };

  const goToPage = (page: number) => {
    setLoading(true);
    setError(null);
    const params: Record<string, string> = { page: String(page) };
    if (search) params.q = search;
    getUsers(params)
      .then((res: any) => {
        setUsers(Array.isArray(res) ? res : res?.data ?? []);
        setMeta((res?.meta as typeof meta) ?? { page: 1, total: 0, totalPages: 1 });
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load users');
      })
      .finally(() => setLoading(false));
  };

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, phone, NID, passport..."
            className="pl-9 w-72"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors"
                  onClick={() => selectSuggestion(s)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center font-bold text-brand-600 dark:text-brand-400 text-xs shrink-0">
                      {initials(s.fullName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{s.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {[s.phone, (s as any).nationalId ? `NID: ${(s as any).nationalId}` : '', (s as any).passportNumber ? `Passport: ${(s as any).passportNumber}` : ''].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <Badge variant={s.isActive ? 'success' : 'warning'} className="shrink-0">
                      {s.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <Button size="md" className="gap-2" onClick={openCreateModal}>
          <Plus className="w-4 h-4" /> Add Customer
        </Button>
      </div>

      {actionError && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
          <span>{actionError}</span>
          <button className="shrink-0 font-medium hover:underline" onClick={() => setActionError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
        </div>
      )}

      {error && !loading && (
        <Card hover={false}>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={() => fetchUsers()}>
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
                  <tr className="text-left text-gray-500 bg-gray-50 dark:bg-surface-container/50">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Phone</th>
                    <th className="p-4 font-medium">NID Number</th>
                    <th className="p-4 font-medium">NID Copy</th>
                    <th className="p-4 font-medium">Passport No.</th>
                    <th className="p-4 font-medium">Passport Copy</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-gray-500">
                        <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No customers found</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center font-bold text-brand-600 dark:text-brand-400">
                              {initials(u.fullName)}
                            </div>
                            <div>
                              <span className="font-medium block">{u.fullName}</span>
                              <span className="text-xs text-gray-400 block">{u.email || '\u2014'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-500 tabular-nums">{u.phone || '\u2014'}</td>
                        <td className="p-4 text-gray-500 tabular-nums font-mono text-xs">{(u as any).nationalId || '\u2014'}</td>
                        <td className="p-4">
                          {(u as any).nationalIdFrontUrl || (u as any).nationalIdBackUrl ? (
                            <div className="flex gap-1">
                              {(u as any).nationalIdFrontUrl && (
                                <button
                                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-green-600"
                                  title="View NID front"
                                  onClick={() => setPreviewUrl((u as any).nationalIdFrontUrl)}
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              {(u as any).nationalIdBackUrl && (
                                <button
                                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-green-600"
                                  title="View NID back"
                                  onClick={() => setPreviewUrl((u as any).nationalIdBackUrl)}
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300">{'\u2014'}</span>
                          )}
                        </td>
                        <td className="p-4 text-gray-500 font-mono text-xs">{(u as any).passportNumber || '\u2014'}</td>
                        <td className="p-4">
                          {(u as any).passportUrl ? (
                            <button
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-green-600"
                              title="View passport copy"
                              onClick={() => setPreviewUrl((u as any).passportUrl)}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-gray-300">{'\u2014'}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant={u.isActive ? 'success' : 'warning'}>
                              {u.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {u.accountStatus === 'provisional' && (
                              <Badge variant="warning">No login yet</Badge>
                            )}
                            {u.accountStatus === 'invited' && (
                              <Badge variant="info">Credentials sent</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {(u.accountStatus === 'provisional' || u.accountStatus === 'invited') && u.phone && (
                              <button
                                className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900 text-gray-500 hover:text-emerald-600 disabled:opacity-50"
                                title={
                                  u.accountStatus === 'invited'
                                    ? 'Re-issue credentials (invalidates the previous password)'
                                    : 'Send login credentials via WhatsApp'
                                }
                                disabled={issuing === u.id}
                                onClick={() => handleIssueCredentials(u)}
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-container-high text-gray-500 hover:text-brand-600"
                              title="Edit"
                              onClick={() => openEditModal(u)}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"
                              title="Delete"
                              onClick={() => setConfirmDelete({ open: true, id: u.id })}
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
                Showing {users.length} of {meta.total} customers
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
        title={editingUser ? 'Edit Customer' : 'Add Customer'}
      >
        <form onSubmit={handleSubmit}>
          <FormField label="Full Name" required>
            <FormInput
              value={form.fullName}
              onChange={(v) => setForm({ ...form, fullName: v })}
              placeholder="Full name"
              required
            />
          </FormField>

          {!editingUser && (
            <FormField label="Email (optional)">
              <FormInput
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                placeholder="customer@example.com"
              />
            </FormField>
          )}

          <FormField label="Phone">
            <PhoneInput
              countryCode={form.phoneCountry}
              number={(() => {
                const m = COUNTRY_DIALS.find(
                  (c) =>
                    form.phone.startsWith(c.dial + ' ') || form.phone.startsWith(c.dial),
                );
                if (!m) return form.phone;
                return form.phone.startsWith(m.dial + ' ')
                  ? form.phone.slice(m.dial.length + 1)
                  : form.phone.slice(m.dial.length);
              })()}
              onCountryCodeChange={(c) => {
                const dial = findDialByCode(c)?.dial ?? '';
                const rest = form.phone.replace(/^\+\d+\s*/, '');
                setForm({ ...form, phoneCountry: c, phone: rest ? `${dial} ${rest}` : '' });
              }}
              onNumberChange={(v) => {
                const dial = findDialByCode(form.phoneCountry)?.dial ?? '';
                setForm({ ...form, phone: v ? `${dial} ${v}` : '' });
              }}
              placeholder="1XXX XXX XXX"
            />
          </FormField>

          <FormField label="NID Number (optional)">
            <FormInput
              value={form.nationalId}
              onChange={(v) => setForm({ ...form, nationalId: v })}
              placeholder="National ID number"
            />
          </FormField>

          <FormField label="Passport Number (optional)">
            <FormInput
              value={form.passportNumber}
              onChange={(v) => setForm({ ...form, passportNumber: v })}
              placeholder="Passport number"
            />
          </FormField>

          {/* Document uploads — only shown when editing an existing customer */}
          {editingUser && (
            <div className="mb-4 space-y-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Document Copies</p>

              {/* NID Front */}
              <div className="flex items-center gap-3">
                <label className="flex-1">
                  <span className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-500 transition-colors">
                    <Upload className="w-4 h-4" />
                    {nidFrontFile ? nidFrontFile.name : ((editingUser as any).nationalIdFrontUrl ? 'Replace NID Front' : 'Upload NID Front')}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => setNidFrontFile(e.target.files?.[0] || null)}
                  />
                </label>
                {(editingUser as any).nationalIdFrontUrl && !nidFrontFile && (
                  <button type="button" className="text-green-600 hover:text-green-700" onClick={() => setPreviewUrl((editingUser as any).nationalIdFrontUrl)}>
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* NID Back */}
              <div className="flex items-center gap-3">
                <label className="flex-1">
                  <span className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-500 transition-colors">
                    <Upload className="w-4 h-4" />
                    {nidBackFile ? nidBackFile.name : ((editingUser as any).nationalIdBackUrl ? 'Replace NID Back' : 'Upload NID Back')}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => setNidBackFile(e.target.files?.[0] || null)}
                  />
                </label>
                {(editingUser as any).nationalIdBackUrl && !nidBackFile && (
                  <button type="button" className="text-green-600 hover:text-green-700" onClick={() => setPreviewUrl((editingUser as any).nationalIdBackUrl)}>
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Passport Copy */}
              <div className="flex items-center gap-3">
                <label className="flex-1">
                  <span className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-500 transition-colors">
                    <Upload className="w-4 h-4" />
                    {passportFile ? passportFile.name : ((editingUser as any).passportUrl ? 'Replace Passport Copy' : 'Upload Passport Copy')}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => setPassportFile(e.target.files?.[0] || null)}
                  />
                </label>
                {(editingUser as any).passportUrl && !passportFile && (
                  <button type="button" className="text-green-600 hover:text-green-700" onClick={() => setPreviewUrl((editingUser as any).passportUrl)}>
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>

              {uploadingDoc && (
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full" />
                  Uploading {uploadingDoc === 'nid-front' ? 'NID front' : uploadingDoc === 'nid-back' ? 'NID back' : 'passport'}...
                </div>
              )}
            </div>
          )}

          <FormField label={editingUser ? 'New password' : 'Password'}>
            <FormInput
              type="password"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              placeholder={editingUser ? 'Leave blank to keep current password' : 'Leave empty to auto-generate'}
            />
          </FormField>

          <FormField label="Role">
            <FormSelect
              value={form.roleId}
              onChange={(v) => setForm({ ...form, roleId: v })}
              placeholder="Select role"
              options={roles.map((r) => ({ label: r.name, value: r.id }))}
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
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingUser ? 'Update' : 'Create'} Customer
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
      />

      {/* Credentials modal */}
      <Modal
        open={!!credentials}
        onClose={() => setCredentials(null)}
        title="Send login credentials"
      >
        {credentials && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Temporary password for <span className="font-medium">{credentials.user.fullName}</span>
              {credentials.user.phone ? ` (${credentials.user.phone})` : ''}. They&apos;ll be asked to
              choose their own password the first time they sign in.
            </p>

            <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-surface-container p-3">
              <KeyRound className="w-4 h-4 shrink-0 text-gray-400" />
              <code className="flex-1 font-mono text-base tracking-wider">{credentials.tempPassword}</code>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-surface-container-high"
                onClick={() => navigator.clipboard?.writeText(credentials.tempPassword)}
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>

            <p className="text-xs text-amber-600 dark:text-amber-400">
              This is the only time it will be shown. Expires{' '}
              {formatDate(credentials.expiresAt)}.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              {credentials.user.phone && (
                <a
                  href={whatsappHref(credentials.user, credentials.tempPassword)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" /> Open WhatsApp
                  </Button>
                </a>
              )}
              <Button variant="ghost" className="flex-1" onClick={() => setCredentials(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Document preview modal */}
      <Modal open={!!previewUrl} onClose={() => setPreviewUrl(null)} title="Document Preview">
        {previewUrl && (
          <div className="flex justify-center">
            {previewUrl.endsWith('.pdf') ? (
              <iframe src={previewUrl} className="w-full h-[60vh] border rounded-lg" title="Document preview" />
            ) : (
              <img src={previewUrl} alt="Document preview" className="max-w-full max-h-[60vh] object-contain rounded-lg" />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
