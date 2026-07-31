'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState, useCallback } from 'react';
import { FileText, Search, Download, Filter as FilterIcon } from 'lucide-react';

interface AuditUser {
  id: string;
  fullName: string;
  email: string;
}

interface AuditLog {
  id: string;
  createdAt: string;
  user?: AuditUser;
  action: string;
  entity: string;
  entityId: string;
  ipAddress: string;
  userAgent?: string;
  oldValue?: any;
  newValue?: any;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function getActionBadgeVariant(action: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  const lower = action.toLowerCase();
  if (lower.includes('fail') || lower.includes('delete') || lower.includes('remove')) return 'danger';
  if (lower.includes('create') || lower.includes('confirm') || lower.includes('success')) return 'success';
  if (lower.includes('update') || lower.includes('edit') || lower.includes('change')) return 'warning';
  if (lower.includes('login') || lower.includes('logout') || lower.includes('auth')) return 'info';
  return 'default';
}

const LIMIT = 50;

export default function AuditLogsPage() {
  const { getAuditLogs, getUsers } = useApi();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    action: '',
    entity: '',
    userId: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [userOptions, setUserOptions] = useState<{ label: string; value: string }[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = useCallback(async (p: number, f = filters) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(p), limit: String(LIMIT) };
      if (f.action) params.action = f.action;
      if (f.entity) params.entity = f.entity;
      if (f.userId) params.userId = f.userId;
      if (f.startDate) params.startDate = f.startDate;
      if (f.endDate) params.endDate = f.endDate;

      const result: any = await getAuditLogs(params);

      let items: AuditLog[] = [];
      let m: PaginationMeta | null = null;
      if (Array.isArray(result)) {
        items = result;
      } else if (result && typeof result === 'object') {
        if (result.items && Array.isArray(result.items)) {
          items = result.items;
          m = result.meta as PaginationMeta;
        } else if (result.data && Array.isArray(result.data)) {
          items = result.data;
        }
      }
      setLogs(items);
      setMeta(m);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [getAuditLogs, filters]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await getUsers({ limit: '200' });
        const data = res as any;
        const users = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
        setUserOptions(users.map((u: any) => ({ label: `${u.fullName} (${u.email})`, value: u.id })));
      } catch {
        // silently fail
      }
    };
    loadUsers();
    fetchLogs(page);
  }, []);

  const applyFilters = () => {
    setPage(1);
    fetchLogs(1, filters);
  };

  const clearFilters = () => {
    setFilters({ action: '', entity: '', userId: '', startDate: '', endDate: '' });
    setPage(1);
    fetchLogs(1, { action: '', entity: '', userId: '', startDate: '', endDate: '' });
  };

  const exportCsv = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Entity', 'Entity ID', 'IP Address', 'User Agent'];
    const rows = logs.map((l) => [
      new Date(l.createdAt).toISOString(),
      l.user?.fullName || 'System',
      l.action,
      l.entity,
      l.entityId,
      l.ipAddress || '',
      l.userAgent || '',
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-500">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-600" /> Audit Logs
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="md" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
            <FilterIcon className="w-4 h-4" /> {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
          <Button variant="outline" size="md" className="gap-2" onClick={exportCsv}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card hover={false}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Action</label>
              <Input
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                placeholder="e.g. create, update, login"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Entity</label>
              <Input
                value={filters.entity}
                onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
                placeholder="e.g. User, Tour, Booking"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">User</label>
              <select
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
              >
                <option value="">All users</option>
                {userOptions.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">From</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">To</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={applyFilters} size="md" className="flex-1">Apply</Button>
              <Button onClick={clearFilters} size="md" variant="outline">Clear</Button>
            </div>
          </div>
        </Card>
      )}

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Action</th>
                <th className="p-4 font-medium">Entity</th>
                <th className="p-4 font-medium">Entity ID</th>
                <th className="p-4 font-medium">IP</th>
                <th className="p-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4 text-xs text-gray-500 font-mono">{formatDate(l.createdAt)}</td>
                  <td className="p-4 text-sm">{l.user?.fullName || 'System'}</td>
                  <td className="p-4">
                    <Badge variant={getActionBadgeVariant(l.action)}>
                      {l.action}
                    </Badge>
                  </td>
                  <td className="p-4">{l.entity}</td>
                  <td className="p-4 font-mono text-xs">{l.entityId?.slice(0, 8) || '—'}</td>
                  <td className="p-4 font-mono text-xs text-gray-500">{l.ipAddress || '—'}</td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedLog(l)}
                      className="text-xs text-brand-600 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">No audit logs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500">
            {meta ? `${meta.total} total entries` : `${logs.length} entries shown`}
          </p>
          <div className="flex gap-1">
            <button
              className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page <= 1}
              onClick={() => { setPage(page - 1); fetchLogs(page - 1); }}
            >
              Prev
            </button>
            <span className="px-3 py-1 rounded-lg text-sm bg-brand-600 text-white">{page}</span>
            <button
              className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page >= totalPages}
              onClick={() => { setPage(page + 1); fetchLogs(page + 1); }}
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedLog(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Audit Log Details</h3>
              <button onClick={() => setSelectedLog(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Timestamp:</span>
                <span className="font-mono text-xs">{new Date(selectedLog.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">User:</span>
                <span>{selectedLog.user?.fullName || 'System'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Action:</span>
                <Badge variant={getActionBadgeVariant(selectedLog.action)}>{selectedLog.action}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Entity:</span>
                <span>{selectedLog.entity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Entity ID:</span>
                <span className="font-mono text-xs">{selectedLog.entityId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">IP Address:</span>
                <span className="font-mono text-xs">{selectedLog.ipAddress || '—'}</span>
              </div>
              {selectedLog.userAgent && (
                <div>
                  <p className="text-gray-500 mb-1">User Agent:</p>
                  <p className="text-xs font-mono break-all bg-gray-50 dark:bg-gray-800 p-2 rounded">{selectedLog.userAgent}</p>
                </div>
              )}
              {selectedLog.oldValue && (
                <div>
                  <p className="text-gray-500 mb-1">Previous Value:</p>
                  <pre className="text-xs font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-x-auto">{JSON.stringify(selectedLog.oldValue, null, 2)}</pre>
                </div>
              )}
              {selectedLog.newValue && (
                <div>
                  <p className="text-gray-500 mb-1">New Value:</p>
                  <pre className="text-xs font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-x-auto">{JSON.stringify(selectedLog.newValue, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
