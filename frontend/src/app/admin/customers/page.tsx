'use client';

import { useApi } from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, FormField, FormInput, FormSelect, ConfirmDialog } from '@/components/admin/ui';
import { useEffect, useState } from 'react';
import { Users, Search, Pencil, Trash2, Plus } from 'lucide-react';

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
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  roleId: string;
  isActive: boolean;
}

const initialForm: FormData = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  roleId: '',
  isActive: true,
};

export default function CustomersPage() {
  const { getUsers, createUser, updateUser, deleteUser, getRoles } = useApi();

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

  const [roles, setRoles] = useState<Role[]>([]);

  const fetchUsers = async (page?: number) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(page ?? meta.page) };
      if (search) params.search = search;
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

  const openCreateModal = () => {
    setEditingUser(null);
    setForm({ ...initialForm, roleId: roles[0]?.id || '' });
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      roleId: user.role?.id || '',
      isActive: user.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          fullName: form.fullName,
          phone: form.phone,
          roleId: form.roleId,
          isActive: form.isActive,
        });
      } else {
        const body: any = {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone || undefined,
          roleId: form.roleId,
          isActive: form.isActive,
        };
        if (form.password) body.password = form.password;
        await createUser(body);
      }
      setModalOpen(false);
      fetchUsers(1);
    } catch {
      // error handled silently
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      await deleteUser(confirmDelete.id);
      setConfirmDelete({ open: false, id: null });
      fetchUsers();
    } catch {
      // error handled silently
    }
  };

  const handleSearch = () => {
    fetchUsers(1);
  };

  const goToPage = (page: number) => {
    const params: Record<string, string> = { page: String(page) };
    if (search) params.search = search;
    setLoading(true);
    setError(null);
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search customers..."
            className="pl-9 w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
        </div>
        <Button size="md" className="gap-2" onClick={openCreateModal}>
          <Plus className="w-4 h-4" /> Add Customer
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
                  <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Join Date</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-gray-500">
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
                            <span className="font-medium">{u.fullName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-500">{u.email}</td>
                        <td className="p-4">
                          <Badge variant="info">{u.role?.name || u.role?.code || '\u2014'}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={u.isActive ? 'success' : 'warning'}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-4 text-gray-500">{formatDate(u.createdAt)}</td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <button
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"
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
            <FormField label="Email" required>
              <FormInput
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                placeholder="customer@example.com"
                required
              />
            </FormField>
          )}

          <FormField label="Phone">
            <FormInput
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              placeholder="+880 1XXX XXX XXX"
            />
          </FormField>

          {!editingUser && (
            <FormField label="Password">
              <FormInput
                type="password"
                value={form.password}
                onChange={(v) => setForm({ ...form, password: v })}
                placeholder="Leave empty to auto-generate"
              />
            </FormField>
          )}

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
    </div>
  );
}
