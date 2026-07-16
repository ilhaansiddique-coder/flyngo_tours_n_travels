'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Pencil, Trash2, Shield } from 'lucide-react';

const users = [
  { id: '1', name: 'Super Admin', email: 'admin@flyngo.com', role: 'super_admin', status: 'active', lastLogin: '2026-07-16 09:30' },
  { id: '2', name: 'Manager User', email: 'manager@flyngo.com', role: 'manager', status: 'active', lastLogin: '2026-07-15 14:20' },
  { id: '3', name: 'Agent User', email: 'agent@flyngo.com', role: 'agent', status: 'active', lastLogin: '2026-07-14 11:00' },
  { id: '4', name: 'Editor User', email: 'editor@flyngo.com', role: 'admin', status: 'inactive', lastLogin: '2026-06-30 16:45' },
];

const roles = [
  { id: '1', name: 'Super Admin', code: 'super_admin', users: 1, permissions: 30 },
  { id: '2', name: 'Admin', code: 'admin', users: 3, permissions: 25 },
  { id: '3', name: 'Manager', code: 'manager', users: 2, permissions: 18 },
  { id: '4', name: 'Travel Agent', code: 'agent', users: 5, permissions: 10 },
  { id: '5', name: 'Customer', code: 'customer', users: 5000, permissions: 0 },
];

export default function UsersPage() {
  return (
    <div className="space-y-6">
      {/* Users Section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search users..." className="pl-9 w-64" />
        </div>
        <Button size="md" className="gap-2"><Plus className="w-4 h-4" /> Add User</Button>
      </div>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Last Login</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center font-bold text-brand-600">
                        {u.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><Badge variant="info">{u.role.replace('_', ' ')}</Badge></td>
                  <td className="p-4"><Badge variant={u.status === 'active' ? 'success' : 'warning'}>{u.status}</Badge></td>
                  <td className="p-4 text-gray-500 text-xs">{u.lastLogin}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"><Pencil className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Roles Section */}
      <h3 className="font-display text-lg font-bold mt-8 flex items-center gap-2">
        <Shield className="w-5 h-5 text-brand-600" /> Roles & Permissions
      </h3>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Users</th>
                <th className="p-4 font-medium">Permissions</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4 font-medium">{r.name}</td>
                  <td className="p-4 font-mono text-xs">{r.code}</td>
                  <td className="p-4">{r.users.toLocaleString()}</td>
                  <td className="p-4">{r.permissions}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"><Pencil className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
