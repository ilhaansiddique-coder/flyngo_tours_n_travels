'use client';

import { useApi } from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Modal, FormField, FormInput, FormSelect, FormTextarea, ConfirmDialog } from '@/components/admin/ui';
import { useEffect, useState } from 'react';
import { Shield, Users, Search, Pencil, Trash2, Plus, Key } from 'lucide-react';
import {
  COUNTRY_DIALS,
  DEFAULT_COUNTRY_CODE,
  findDialByCode,
} from '@/lib/country-dial-codes';

interface Role {
  id: string;
  name: string;
  code: string;
  isSystem?: boolean;
  _count?: { users: number; permissions: number };
  permissions?: { permission: { id: string; code: string; name: string; group?: string } }[];
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

interface Permission {
  id: string;
  code: string;
  name: string;
  group?: string;
}

type Tab = 'users' | 'roles' | 'permissions';

export default function UsersPage() {
  const api = useApi();
  const {
    getUsers, createUser, updateUser, deleteUser,
    getRoles, createRole, updateRole, deleteRole,
    getPermissions, createPermission, updatePermission, deletePermission,
  } = api;

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

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ fullName: '', email: '', phone: '', phoneCountry: DEFAULT_COUNTRY_CODE, password: '', roleId: '', isActive: true });
  const [userSubmitting, setUserSubmitting] = useState(false);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({ name: '', code: '', permissionIds: [] as string[], isSystem: false });
  const [roleSubmitting, setRoleSubmitting] = useState(false);

  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [permissionForm, setPermissionForm] = useState({ name: '', code: '', description: '', group: '' });
  const [permissionSubmitting, setPermissionSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; kind: 'user' | 'role' | 'permission' | null; id: string | null }>({
    open: false,
    kind: null,
    id: null,
  });

  const fetchUsers = async (page = 1) => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (search) params.search = search;
      const res = await getUsers(params);
      const data = res as any;
      const items = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
      setUsers(items);
      setMeta(data?.meta ?? { page: 1, total: items.length, totalPages: 1 });
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
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

    fetchUsers(1);
    fetchRolesAndPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateUserModal = () => {
    setEditingUser(null);
    setUserForm({ fullName: '', email: '', phone: '', phoneCountry: DEFAULT_COUNTRY_CODE, password: '', roleId: roleOptions[0]?.value || '', isActive: true });
    setUserModalOpen(true);
  };

  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    const stored = user.phone || '';
    const matched = COUNTRY_DIALS.find((c) => stored.startsWith(c.dial + ' ') || stored.startsWith(c.dial));
    setUserForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: stored,
      phoneCountry: matched?.code || DEFAULT_COUNTRY_CODE,
      password: '',
      roleId: user.role?.id || '',
      isActive: user.isActive,
    });
    setUserModalOpen(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Email is optional site-wide, but a staff account still needs some way to
    // sign in — so require an email OR a phone, not specifically an email.
    if (!editingUser && !userForm.email.trim() && !userForm.phone.trim()) {
      setUsersError('Give the user an email or a phone number so they can sign in.');
      return;
    }
    setUserSubmitting(true);
    try {
      if (editingUser) {
        const body: any = { fullName: userForm.fullName, phone: userForm.phone, roleId: userForm.roleId, isActive: userForm.isActive };
        await updateUser(editingUser.id, body);
      } else {
        const body: any = {
          fullName: userForm.fullName,
          email: userForm.email.trim() || undefined,
          phone: userForm.phone || undefined,
          roleId: userForm.roleId,
          isActive: userForm.isActive,
        };
        if (userForm.password) body.password = userForm.password;
        await createUser(body);
      }
      setUserModalOpen(false);
      fetchUsers(1);
    } catch {
      // silently fail
    } finally {
      setUserSubmitting(false);
    }
  };

  const openCreateRoleModal = () => {
    setEditingRole(null);
    setRoleForm({ name: '', code: '', permissionIds: [], isSystem: false });
    setRoleModalOpen(true);
  };

  const openEditRoleModal = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      code: role.code,
      permissionIds: role.permissions?.map((p) => p.permission.id) ?? [],
      isSystem: role.isSystem ?? false,
    });
    setRoleModalOpen(true);
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoleSubmitting(true);
    try {
      if (editingRole) {
        await updateRole(editingRole.id, {
          name: roleForm.name,
          permissionIds: roleForm.permissionIds,
          isSystem: roleForm.isSystem,
        });
      } else {
        await createRole({
          name: roleForm.name,
          code: roleForm.code,
          permissionIds: roleForm.permissionIds,
          isSystem: roleForm.isSystem,
        });
      }
      setRoleModalOpen(false);
      fetchRolesAndPermissions();
    } catch {
      // silently fail
    } finally {
      setRoleSubmitting(false);
    }
  };

  const togglePermission = (id: string) => {
    setRoleForm((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(id)
        ? prev.permissionIds.filter((p) => p !== id)
        : [...prev.permissionIds, id],
    }));
  };

  const openCreatePermissionModal = () => {
    setEditingPermission(null);
    setPermissionForm({ name: '', code: '', description: '', group: '' });
    setPermissionModalOpen(true);
  };

  const openEditPermissionModal = (perm: Permission) => {
    setEditingPermission(perm);
    setPermissionForm({
      name: perm.name,
      code: perm.code,
      description: '',
      group: perm.group || '',
    });
    setPermissionModalOpen(true);
  };

  const handlePermissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPermissionSubmitting(true);
    try {
      if (editingPermission) {
        await updatePermission(editingPermission.id, {
          name: permissionForm.name,
          description: permissionForm.description || undefined,
          group: permissionForm.group || undefined,
        });
      } else {
        await createPermission({
          name: permissionForm.name,
          code: permissionForm.code,
          description: permissionForm.description || undefined,
          group: permissionForm.group || undefined,
        });
      }
      setPermissionModalOpen(false);
      fetchRolesAndPermissions();
    } catch {
      // silently fail
    } finally {
      setPermissionSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id || !confirmDelete.kind) return;
    try {
      if (confirmDelete.kind === 'user') await deleteUser(confirmDelete.id);
      if (confirmDelete.kind === 'role') await deleteRole(confirmDelete.id);
      if (confirmDelete.kind === 'permission') await deletePermission(confirmDelete.id);
      setConfirmDelete({ open: false, kind: null, id: null });
      if (confirmDelete.kind === 'user') fetchUsers(1);
      else fetchRolesAndPermissions();
    } catch {
      // silently fail
    }
  };

  const initials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase();

  const groupedPermissions = permissionsList.reduce<Record<string, Permission[]>>((acc, p) => {
    const g = p.group || 'general';
    if (!acc[g]) acc[g] = [];
    acc[g].push(p);
    return acc;
  }, {});

  const renderTabs = () => (
    <div className="flex gap-1 bg-gray-100 dark:bg-surface-container rounded-xl p-1 w-fit">
      {[
        { id: 'users', label: 'Users', icon: Users },
        { id: 'roles', label: 'Roles', icon: Shield },
        { id: 'permissions', label: 'Permissions', icon: Key },
      ].map((t) => (
        <button
          key={t.id}
          onClick={() => setActiveTab(t.id as Tab)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === t.id
              ? 'bg-white dark:bg-surface-container-low text-brand-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <t.icon className="w-4 h-4" />
          {t.label}
        </button>
      ))}
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
            onKeyDown={(e) => { if (e.key === 'Enter') fetchUsers(1); }}
          />
        </div>
        <Button size="md" className="gap-2" onClick={openCreateUserModal}>
          <Plus className="w-4 h-4" /> Add User
        </Button>
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
            <Button variant="outline" onClick={() => fetchUsers(1)}>Retry</Button>
          </div>
        </Card>
      )}

      {!usersLoading && !usersError && (
        <Card hover={false} padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 bg-gray-50 dark:bg-surface-container/50">
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
                    <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
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
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-container-high text-gray-500 hover:text-brand-600"
                            title="Edit"
                            onClick={() => openEditUserModal(u)}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"
                            title="Delete"
                            onClick={() => setConfirmDelete({ open: true, kind: 'user', id: u.id })}
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
      )}
    </>
  );

  const renderRolesTab = () => (
    <>
      <div className="flex justify-end">
        <Button size="md" className="gap-2" onClick={openCreateRoleModal}>
          <Plus className="w-4 h-4" /> Add Role
        </Button>
      </div>

      {rolesLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
        </div>
      )}

      {!rolesLoading && (
        <Card hover={false} padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 bg-gray-50 dark:bg-surface-container/50">
                  <th className="p-4 font-medium">Role Name</th>
                  <th className="p-4 font-medium">Code</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Users</th>
                  <th className="p-4 font-medium">Permissions</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500">
                      <Shield className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No roles found</p>
                    </td>
                  </tr>
                ) : (
                  roles.map((r) => {
                    const permCodes = r.permissions?.map((p) => p.permission.code) ?? [];
                    return (
                      <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="p-4 font-medium">{r.name}</td>
                        <td className="p-4 font-mono text-xs text-gray-500">{r.code}</td>
                        <td className="p-4">
                          <Badge variant={r.isSystem ? 'info' : 'default'}>
                            {r.isSystem ? 'System' : 'Custom'}
                          </Badge>
                        </td>
                        <td className="p-4">{r._count?.users ?? 0}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1 max-w-md">
                            {permCodes.length > 0 ? (
                              permCodes.slice(0, 5).map((code) => (
                                <Badge key={code} variant="default" className="text-xs">{code}</Badge>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs">None</span>
                            )}
                            {permCodes.length > 5 && (
                              <Badge variant="default" className="text-xs">+{permCodes.length - 5} more</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <button
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-container-high text-gray-500 hover:text-brand-600"
                              title="Edit"
                              onClick={() => openEditRoleModal(r)}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Delete"
                              disabled={r.isSystem}
                              onClick={() => setConfirmDelete({ open: true, kind: 'role', id: r.id })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

  const renderPermissionsTab = () => (
    <>
      <div className="flex justify-end">
        <Button size="md" className="gap-2" onClick={openCreatePermissionModal}>
          <Plus className="w-4 h-4" /> Add Permission
        </Button>
      </div>

      {rolesLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
        </div>
      )}

      {!rolesLoading && (
        <div className="space-y-4">
          {Object.entries(groupedPermissions).map(([group, perms]) => (
            <Card key={group} hover={false} padding="none">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold capitalize">{group}</h3>
                <p className="text-xs text-gray-500">{perms.length} permission(s)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 bg-gray-50 dark:bg-surface-container/50">
                      <th className="p-4 font-medium">Name</th>
                      <th className="p-4 font-medium">Code</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perms.map((p) => (
                      <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="p-4 font-medium">{p.name}</td>
                        <td className="p-4 font-mono text-xs text-gray-500">{p.code}</td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <button
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-container-high text-gray-500 hover:text-brand-600"
                              title="Edit"
                              onClick={() => openEditPermissionModal(p)}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"
                              title="Delete"
                              onClick={() => setConfirmDelete({ open: true, kind: 'permission', id: p.id })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      {renderTabs()}
      {activeTab === 'users' ? renderUsersTab() : activeTab === 'roles' ? renderRolesTab() : renderPermissionsTab()}

      {/* USER MODAL */}
      <Modal open={userModalOpen} onClose={() => setUserModalOpen(false)} title={editingUser ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleUserSubmit}>
          <FormField label="Full Name" required>
            <FormInput
              value={userForm.fullName}
              onChange={(v) => setUserForm({ ...userForm, fullName: v })}
              placeholder="Full name"
              required
            />
          </FormField>
          <FormField label="Email (optional if a phone is given)">
            <FormInput
              type="email"
              value={userForm.email}
              onChange={(v) => setUserForm({ ...userForm, email: v })}
              placeholder="user@example.com"
              disabled={!!editingUser}
            />
          </FormField>
          <FormField label="Phone">
            <PhoneInput
              countryCode={userForm.phoneCountry}
              number={(() => {
                const m = COUNTRY_DIALS.find(
                  (c) =>
                    userForm.phone.startsWith(c.dial + ' ') ||
                    userForm.phone.startsWith(c.dial),
                );
                if (!m) return userForm.phone;
                return userForm.phone.startsWith(m.dial + ' ')
                  ? userForm.phone.slice(m.dial.length + 1)
                  : userForm.phone.slice(m.dial.length);
              })()}
              onCountryCodeChange={(c) => {
                const dial = findDialByCode(c)?.dial ?? '';
                const rest = userForm.phone.replace(/^\+\d+\s*/, '');
                setUserForm({ ...userForm, phoneCountry: c, phone: rest ? `${dial} ${rest}` : '' });
              }}
              onNumberChange={(v) => {
                const dial = findDialByCode(userForm.phoneCountry)?.dial ?? '';
                setUserForm({ ...userForm, phone: v ? `${dial} ${v}` : '' });
              }}
              placeholder="1XXX XXX XXX"
            />
          </FormField>
          <FormField label="Role" required>
            <FormSelect
              value={userForm.roleId}
              onChange={(v) => setUserForm({ ...userForm, roleId: v })}
              placeholder="Select role"
              options={roleOptions}
            />
          </FormField>
          {!editingUser && (
            <FormField label="Password">
              <FormInput
                type="password"
                value={userForm.password}
                onChange={(v) => setUserForm({ ...userForm, password: v })}
                placeholder="Leave empty to auto-generate"
              />
            </FormField>
          )}
          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={userForm.isActive}
                onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500"
              />
              Active
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" type="button" onClick={() => setUserModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={userSubmitting}>
              {editingUser ? 'Update' : 'Create'} User
            </Button>
          </div>
        </form>
      </Modal>

      {/* ROLE MODAL */}
      <Modal open={roleModalOpen} onClose={() => setRoleModalOpen(false)} title={editingRole ? 'Edit Role' : 'Add Role'}>
        <form onSubmit={handleRoleSubmit}>
          <FormField label="Role Name" required>
            <FormInput
              value={roleForm.name}
              onChange={(v) => setRoleForm({ ...roleForm, name: v })}
              placeholder="e.g. Content Manager"
              required
            />
          </FormField>
          <FormField label="Code" required>
            <FormInput
              value={roleForm.code}
              onChange={(v) => setRoleForm({ ...roleForm, code: v.toLowerCase() })}
              placeholder="e.g. content_manager"
              required
              disabled={!!editingRole}
            />
          </FormField>
          <FormField label="Permissions">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-h-64 overflow-y-auto space-y-3">
              {Object.entries(groupedPermissions).map(([group, perms]) => (
                <div key={group}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{group}</p>
                  <div className="space-y-1">
                    {perms.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={roleForm.permissionIds.includes(p.id)}
                          onChange={() => togglePermission(p.id)}
                          className="rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500"
                        />
                        <span>{p.name}</span>
                        <span className="text-xs text-gray-400 font-mono">({p.code})</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FormField>
          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={roleForm.isSystem}
                onChange={(e) => setRoleForm({ ...roleForm, isSystem: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500"
              />
              System role (cannot be deleted)
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" type="button" onClick={() => setRoleModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={roleSubmitting}>
              {editingRole ? 'Update' : 'Create'} Role
            </Button>
          </div>
        </form>
      </Modal>

      {/* PERMISSION MODAL */}
      <Modal open={permissionModalOpen} onClose={() => setPermissionModalOpen(false)} title={editingPermission ? 'Edit Permission' : 'Add Permission'}>
        <form onSubmit={handlePermissionSubmit}>
          <FormField label="Name" required>
            <FormInput
              value={permissionForm.name}
              onChange={(v) => setPermissionForm({ ...permissionForm, name: v })}
              placeholder="e.g. Manage Tours"
              required
            />
          </FormField>
          <FormField label="Code" required>
            <FormInput
              value={permissionForm.code}
              onChange={(v) => setPermissionForm({ ...permissionForm, code: v })}
              placeholder="e.g. tours.manage"
              required
              disabled={!!editingPermission}
            />
          </FormField>
          <FormField label="Group">
            <FormInput
              value={permissionForm.group}
              onChange={(v) => setPermissionForm({ ...permissionForm, group: v })}
              placeholder="e.g. tours, hotels, billing"
            />
          </FormField>
          <FormField label="Description">
            <FormTextarea
              value={permissionForm.description}
              onChange={(v) => setPermissionForm({ ...permissionForm, description: v })}
              placeholder="What this permission allows"
              rows={2}
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" type="button" onClick={() => setPermissionModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={permissionSubmitting}>
              {editingPermission ? 'Update' : 'Create'} Permission
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, kind: null, id: null })}
        onConfirm={handleDelete}
        title={`Delete ${confirmDelete.kind}`}
        message="Are you sure you want to delete this item? This action cannot be undone."
      />
    </div>
  );
}
