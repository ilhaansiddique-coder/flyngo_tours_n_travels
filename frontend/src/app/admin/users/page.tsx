'use client';

import { useApi } from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, FormField, FormSelect, ConfirmDialog } from '@/components/admin/ui';
import { useEffect, useState } from 'react';
import { Shield, Users, Search, Pencil, Trash2 } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  code: string;
  _count?: { users: number; permissions: number };
  permissions?: { permission: { id: string; code: string } }[];
}

interface User {
  id: string;
  fullName: string;
  email: string;
  role?: Role;
  isActive: boolean;
  createdAt: string;
}

interface Permission {
  id: string;
  code: string;
  name: string;
}

type Tab = 'users' | 'roles';

export default function UsersPage() {
  const { getUsers, getRoles, getPermissions, updateUser, deleteUser } = useApi();

  const [activeTab, setActiveTab] = useState<Tab>('users');

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');

  const [roles, setRoles] = useState<Role[]>([]);
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);
  const [permissionsList, setPermissionsList] = useState<Permission[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRoleId, setEditRoleId] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const fetchUsers = async (page?: number) => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const params: Record<string, string> = { page: String(page ?? meta.page) };
      if (search) params.search = search;
      const res = await getUsers(params);
      const data = res as any;
      setUsers(Array.isArray(data) ? data : data?.data ?? []);
      setMeta(data?.meta ?? { page: 1, total: 0, totalPages: 1 });
    } catch (err: any) {
      setUsersError(err.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchRolesAndPermissions = async () => {
    setRolesLoading(true);
    setRolesError(null);
    try {
      const [rolesRes, permsRes] = await Promise.all([getRoles(), getPermissions()]);
      const rolesData = rolesRes as any;
      const permsData = permsRes as any;

      const fetchedRoles: Role[] = Array.isArray(rolesData) ? rolesData : rolesData?.data ?? [];
      setRoles(fetchedRoles);
      setRoleOptions(fetchedRoles.map((r) => ({ label: r.name, value: r.id })));

      setPermissionsList(Array.isArray(permsData) ? permsData : permsData?.data ?? []);
    } catch (err: any) {
      setRolesError(err.message || 'Failed to load roles');
    } finally {
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRolesAndPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditRoleId(user.role?.id || '');
    setEditIsActive(user.isActive);
    setModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      await updateUser(editingUser.id, {
        roleId: editRoleId || undefined,
        isActive: editIsActive,
      });
      setModalOpen(false);
      fetchUsers();
    } catch {
      // silently fail
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
      // silently fail
    }
  };

  const handleSearch = () => {
    fetchUsers(1);
  };

  const goToPage = (page: number) => {
    const params: Record<string, string> = { page: String(page) };
    if (search) params.search = search;
    setUsersLoading(true);
    setUsersError(null);
    getUsers(params)
      .then((res: any) => {
        setUsers(Array.isArray(res) ? res : res?.data ?? []);
        setMeta((res?.meta as typeof meta) ?? { page: 1, total: 0, totalPages: 1 });
      })
      .catch((err: any) => {
        setUsersError(err.message || 'Failed to load users');
      })
      .finally(() => setUsersLoading(false));
  };

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  const getRolePermissions = (role: Role): string[] => {
    if (role.permissions) return role.permissions.map((p) => p.permission.code);
    const permMap = permissionsList.reduce(
      (acc, p) => ({ ...acc, [p.id]: p.code }),
      {} as Record<string, string>,
    );
    return [];
  };

  const renderTabs = () => (
    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
      <button
        onClick={() => setActiveTab('users')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'users'
            ? 'bg-white dark:bg-gray-900 text-brand-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        <Users className="w-4 h-4" />
        Users
      </button>
      <button
        onClick={() => setActiveTab('roles')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'roles'
            ? 'bg-white dark:bg-gray-900 text-brand-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        <Shield className="w-4 h-4" />
        Roles &amp; Permissions
      </button>
    </div>
  );

  const renderUsersTab = () => (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            className="pl-9 w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
        </div>
      </div>

      {usersLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
        </div>
      )}

      {usersError && !usersLoading && (
        <Card hover={false}>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{usersError}</p>
            <Button variant="outline" onClick={() => fetchUsers()}>
              Retry
            </Button>
          </div>
        </Card>
      )}

      {!usersLoading && !usersError && (
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
                        <p>No users found</p>
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
                          <Badge variant="info">{u.role?.name || '\u2014'}</Badge>
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
                Showing {users.length} of {meta.total} users
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
    </>
  );

  const renderRolesTab = () => (
    <>
      {rolesLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
        </div>
      )}

      {rolesError && !rolesLoading && (
        <Card hover={false}>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{rolesError}</p>
            <Button variant="outline" onClick={fetchRolesAndPermissions}>
              Retry
            </Button>
          </div>
        </Card>
      )}

      {!rolesLoading && !rolesError && (
        <Card hover={false} padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                  <th className="p-4 font-medium">Role Name</th>
                  <th className="p-4 font-medium">Code</th>
                  <th className="p-4 font-medium">Users</th>
                  <th className="p-4 font-medium">Permissions</th>
                  <th className="p-4 font-medium">Permission Codes</th>
                </tr>
              </thead>
              <tbody>
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500">
                      <Shield className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No roles found</p>
                    </td>
                  </tr>
                ) : (
                  roles.map((r) => {
                    const permCodes = getRolePermissions(r);
                    return (
                      <tr
                        key={r.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                      >
                        <td className="p-4 font-medium">{r.name}</td>
                        <td className="p-4 font-mono text-xs text-gray-500">{r.code}</td>
                        <td className="p-4">{r._count?.users ?? 0}</td>
                        <td className="p-4">{r._count?.permissions ?? 0}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {permCodes.length > 0 ? (
                              permCodes.map((code) => (
                                <Badge key={code} variant="default" className="text-xs">
                                  {code}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs">None</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      {renderTabs()}
      {activeTab === 'users' ? renderUsersTab() : renderRolesTab()}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Edit User"
      >
        <form onSubmit={handleUpdateUser}>
          <FormField label="Role">
            <FormSelect
              value={editRoleId}
              onChange={(v) => setEditRoleId(v)}
              placeholder="Select role"
              options={roleOptions}
            />
          </FormField>

          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
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
              Update User
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
}
