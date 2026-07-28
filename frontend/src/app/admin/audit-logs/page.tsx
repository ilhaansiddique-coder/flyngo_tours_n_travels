'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState, useCallback } from 'react';
import { FileText, Shield } from 'lucide-react';

interface AuditUser {
  fullName: string;
}

interface AuditLog {
  id: string;
  createdAt: string;
  user?: AuditUser;
  action: string;
  entity: string;
  entityId: string;
  ipAddress: string;
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
  const { getAuditLogs } = useApi();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const result: any = await getAuditLogs({ page: String(p), limit: String(LIMIT) });

      if (Array.isArray(result)) {
        setLogs(result);
      } else if (result && typeof result === 'object') {
        if (result.items && Array.isArray(result.items)) {
          setLogs(result.items);
        }
        if (result.meta) {
          setMeta(result.meta as PaginationMeta);
        } else if (result.data && Array.isArray(result.data)) {
          setLogs(result.data);
        } else {
          setLogs([]);
        }
      } else {
        setLogs([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [getAuditLogs]);

  useEffect(() => {
    fetchLogs(page);
  }, [fetchLogs, page]);

  const totalPages = meta?.totalPages ?? (logs.length < LIMIT ? page : page + 1);
  const startIndex = meta ? (meta.page - 1) * meta.limit + 1 : (page - 1) * LIMIT + 1;
  const endIndex = meta
    ? Math.min(meta.page * meta.limit, meta.total)
    : page * LIMIT;
  const total = meta?.total ?? (logs.length < LIMIT ? logs.length : undefined);

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

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-bold flex items-center gap-2">
        <FileText className="w-5 h-5 text-brand-600" /> Audit Logs
      </h2>

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
                  <td className="p-4 font-mono text-xs">{l.entityId}</td>
                  <td className="p-4 font-mono text-xs text-gray-500">{l.ipAddress}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">No audit logs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500">
            {total !== undefined
              ? `Showing ${startIndex}-${endIndex} of ${total} entries`
              : `Showing ${startIndex}-${Math.max(0, logs.length ? startIndex + logs.length - 1 : 0)} entries`}
          </p>
          <div className="flex gap-1">
            <button
              className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    pageNum === page
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={logs.length < LIMIT || page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
