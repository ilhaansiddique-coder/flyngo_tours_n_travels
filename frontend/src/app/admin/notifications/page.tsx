'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, FormField, FormInput, FormSelect, FormTextarea, ConfirmDialog } from '@/components/admin/ui';
import { formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState } from 'react';
import { Bell, Plus, Send, Trash2, Search } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt?: string;
  sentAt?: string;
  createdAt: string;
  user?: { id: string; fullName: string; email: string };
}

interface User {
  id: string;
  fullName: string;
  email: string;
}

interface FormData {
  type: string;
  title: string;
  body: string;
  audience: 'all' | 'specific';
  userIds: string[];
}

const initialForm: FormData = {
  type: 'in_app',
  title: '',
  body: '',
  audience: 'all',
  userIds: [],
};

export default function NotificationsPage() {
  const { getNotifications, sendNotification, deleteNotification, getUsers } = useApi();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const [userOptions, setUserOptions] = useState<{ label: string; value: string }[]>([]);

  const fetchNotifications = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(p), limit: '20' };
      if (search) params.search = search;
      const res = await getNotifications(params);
      const data = res as any;
      if (Array.isArray(data)) {
        setNotifications(data);
        setTotalPages(1);
      } else {
        setNotifications(data?.items ?? data?.data ?? []);
        setTotalPages(data?.meta?.totalPages ?? 1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOptions = async () => {
    try {
      const res = await getUsers({ limit: '200' });
      const data = res as any;
      const users: User[] = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
      setUserOptions(users.map((u) => ({ label: `${u.fullName} (${u.email})`, value: u.id })));
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

    fetchNotifications(1);
    fetchUserOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setForm(initialForm);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body: any = {
        type: form.type,
        title: form.title,
        body: form.body,
      };
      if (form.audience === 'specific' && form.userIds.length > 0) {
        body.userIds = form.userIds;
      }
      await sendNotification(body);
      setModalOpen(false);
      fetchNotifications(1);
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      await deleteNotification(confirmDelete.id);
      setConfirmDelete({ open: false, id: null });
      fetchNotifications(page);
    } catch {
      // silently fail
    }
  };

  const toggleUserId = (id: string) => {
    setForm((prev) => ({
      ...prev,
      userIds: prev.userIds.includes(id)
        ? prev.userIds.filter((u) => u !== id)
        : [...prev.userIds, id],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <Input
            placeholder="Search notifications..."
            className="pl-9 w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') fetchNotifications(1); }}
          />
        </div>
        <Button size="md" className="gap-2" onClick={openCreateModal}>
          <Plus className="w-4 h-4" /> Send Notification
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {error && !loading && (
        <Card hover={false}>
          <div className="text-center py-12">
            <p className="text-error mb-4">{error}</p>
            <Button variant="outline" onClick={() => fetchNotifications(page)}>Retry</Button>
          </div>
        </Card>
      )}

      {!loading && !error && (
        <>
          <Card hover={false} padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-on-surface-variant bg-surface-container-low">
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Title</th>
                    <th className="p-4 font-medium">Body</th>
                    <th className="p-4 font-medium">Recipient</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Sent</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-on-surface-variant">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-on-surface-variant/40" />
                        <p>No notifications yet</p>
                      </td>
                    </tr>
                  ) : (
                    notifications.map((n) => (
                      <tr key={n.id} className="border-b border-outline-variant hover:bg-surface-container-high">
                        <td className="p-4">
                          <Badge variant="info">{n.type}</Badge>
                        </td>
                        <td className="p-4 font-medium">{n.title}</td>
                        <td className="p-4 max-w-xs">
                          <p className="truncate text-on-surface-variant">{n.body}</p>
                        </td>
                        <td className="p-4 text-xs">
                          {n.user ? `${n.user.fullName}` : <span className="text-on-surface-variant/40">Broadcast</span>}
                        </td>
                        <td className="p-4">
                          <Badge variant={n.readAt ? 'default' : 'warning'}>
                            {n.readAt ? 'Read' : 'Unread'}
                          </Badge>
                        </td>
                        <td className="p-4 text-xs text-on-surface-variant">
                          {n.sentAt ? formatDate(n.sentAt) : formatDate(n.createdAt)}
                        </td>
                        <td className="p-4">
                          <button
                            className="p-1.5 rounded-lg hover:bg-danger-soft text-on-surface-variant hover:text-error"
                            title="Delete"
                            onClick={() => setConfirmDelete({ open: true, id: n.id })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-on-surface-variant">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(page - 1); fetchNotifications(page - 1); }}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => { setPage(page + 1); fetchNotifications(page + 1); }}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Send Notification">
        <form onSubmit={handleSubmit}>
          <FormField label="Type" required>
            <FormSelect
              value={form.type}
              onChange={(v) => setForm({ ...form, type: v })}
              options={[
                { label: 'In-App', value: 'in_app' },
                { label: 'Email', value: 'email' },
                { label: 'SMS', value: 'sms' },
                { label: 'Push', value: 'push' },
              ]}
            />
          </FormField>

          <FormField label="Title" required>
            <FormInput
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              placeholder="Notification title"
              required
            />
          </FormField>

          <FormField label="Message" required>
            <FormTextarea
              value={form.body}
              onChange={(v) => setForm({ ...form, body: v })}
              placeholder="Notification body"
              rows={4}
            />
          </FormField>

          <FormField label="Audience" required>
            <div className="flex gap-3 mt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  checked={form.audience === 'all'}
                  onChange={() => setForm({ ...form, audience: 'all', userIds: [] })}
                  className="text-primary focus:ring-primary/50"
                />
                All Users (broadcast)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  checked={form.audience === 'specific'}
                  onChange={() => setForm({ ...form, audience: 'specific' })}
                  className="text-primary focus:ring-primary/50"
                />
                Specific Users
              </label>
            </div>
          </FormField>

          {form.audience === 'specific' && (
            <FormField label={`Select Recipients (${form.userIds.length} selected)`}>
                <div className="border border-outline-variant rounded-lg p-2 max-h-48 overflow-y-auto space-y-1">
                {userOptions.length === 0 ? (
                  <p className="text-xs text-on-surface-variant p-2">Loading users...</p>
                ) : (
                  userOptions.map((u) => (
                    <label key={u.value} className="flex items-center gap-2 text-sm cursor-pointer p-1 hover:bg-surface-container-high rounded">
                      <input
                        type="checkbox"
                        checked={form.userIds.includes(u.value)}
                        onChange={() => toggleUserId(u.value)}
                        className="rounded border-outline-variant text-primary focus:ring-primary/50"
                      />
                      {u.label}
                    </label>
                  ))
                )}
              </div>
            </FormField>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting} className="gap-2">
              <Send className="w-4 h-4" /> Send
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Notification"
        message="Are you sure you want to delete this notification?"
      />
    </div>
  );
}
