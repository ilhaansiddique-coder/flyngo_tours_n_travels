'use client';

import { useEffect, useState } from 'react';
import { Trash2, RotateCcw, Search as SearchIcon, X } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/admin/ui';
import { adminButtonSmStyle } from '@/components/admin/button-styles';

interface TrashItem {
  entity: string;
  entityLabel: string;
  id: string;
  title: string;
  subtitle: string;
  deletedAt: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ENTITIES: Array<{ key: string; label: string }> = [
  { key: 'destination', label: 'Destinations' },
  { key: 'tour', label: 'Tours' },
  { key: 'hotel', label: 'Hotels' },
  { key: 'flight', label: 'Flights' },
  { key: 'visa', label: 'Visa' },
  { key: 'transport', label: 'Transport' },
  { key: 'hajj', label: 'Hajj' },
  { key: 'umrah', label: 'Umrah' },
  { key: 'visa-country', label: 'Visa Countries' },
  { key: 'blog', label: 'Blogs' },
  { key: 'cms-page', label: 'CMS Pages' },
  { key: 'testimonial', label: 'Testimonials' },
  { key: 'faq', label: 'FAQs' },
  { key: 'coupon', label: 'Coupons' },
  { key: 'bank-account', label: 'Bank Accounts' },
  { key: 'mobile-wallet', label: 'Mobile Wallets' },
  { key: 'user', label: 'Users' },
  { key: 'review', label: 'Reviews' },
];

export default function AdminTrashPage() {
  const { getTrash, restoreTrashItem, purgeTrashItem } = useApi();

  const [items, setItems] = useState<TrashItem[]>([]);
  const [perEntity, setPerEntity] = useState<Record<string, number>>({});
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [entity, setEntity] = useState<string>('');
  const [q, setQ] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<TrashItem | null>(null);

  const fetchTrash = async (page = 1, e = entity, query = q) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(meta.limit) };
      if (e) params.entity = e;
      if (query.trim()) params.q = query.trim();
      const res = (await getTrash(params)) as unknown as {
        items?: TrashItem[];
        meta?: PaginationMeta;
        perEntity?: Record<string, number>;
      };
      setItems(res.items ?? []);
      setMeta(res.meta ?? { page: 1, limit: meta.limit, total: 0, totalPages: 0 });
      setPerEntity(res.perEntity ?? {});
    } catch (err: any) {
      setError(err.message || 'Failed to load trash');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchTrash(1, entity, q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, q]);

  const totalTrash = ENTITIES.reduce((sum, e) => sum + (perEntity[e.key] ?? 0), 0);

  const handleRestore = async (item: TrashItem) => {
    if (!item) return;
    setBusyId(`restore-${item.id}`);
    setNotice(null);
    setError(null);
    try {
      await restoreTrashItem(item.entity, item.id);
      setNotice(`${item.entityLabel} restored.`);
      fetchTrash(meta.page, entity, q);
    } catch (err: any) {
      setError(err.message || 'Failed to restore item');
    } finally {
      setBusyId(null);
    }
  };

  const handlePurge = async () => {
    if (!purgeTarget) return;
    setBusyId(`purge-${purgeTarget.id}`);
    setNotice(null);
    setError(null);
    try {
      await purgeTrashItem(purgeTarget.entity, purgeTarget.id);
      setNotice(`${purgeTarget.entityLabel} permanently deleted.`);
      setPurgeTarget(null);
      fetchTrash(meta.page, entity, q);
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
    } finally {
      setBusyId(null);
    }
  };

  const goToPage = (p: number) => {
    if (p < 1 || p > meta.totalPages) return;
    fetchTrash(p, entity, q);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-brand-600" /> Trash
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setQ(searchInput);
                  setEntity('');
                }
              }}
              placeholder="Search trash..."
              className="w-64 pl-9 pr-8 py-2 text-sm rounded-lg border border-outline-variant bg-surface-container text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  setQ('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => { setEntity(''); setQ(''); setSearchInput(''); }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            entity === ''
              ? 'bg-gradient-to-r from-blue-600/20 to-amber-500/10 text-accent border-accent/40'
              : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          All ({totalTrash})
        </button>
        {ENTITIES.map((e) => (
          <button
            key={e.key}
            onClick={() => { setEntity(e.key); setQ(''); setSearchInput(''); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              entity === e.key
                ? 'bg-gradient-to-r from-blue-600/20 to-amber-500/10 text-accent border-accent/40'
                : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {e.label} ({perEntity[e.key] ?? 0})
          </button>
        ))}
      </div>

      {notice && (
        <div className="text-sm px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
          {notice}
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-error">{error}</p>
        </div>
      )}

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-on-surface-variant bg-surface-container-low">
                <th className="p-4 font-medium">Entity</th>
                <th className="p-4 font-medium">Item</th>
                <th className="p-4 font-medium">Detail</th>
                <th className="p-4 font-medium">Deleted</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                    <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2 align-middle" />
                    Loading trash...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant/40">
                    {q || entity ? 'No deleted items match your filters.' : 'Trash is empty.'}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={`${item.entity}-${item.id}`} className="border-b border-outline-variant hover:bg-surface-container-high">
                    <td className="p-4">
                      <Badge variant="danger">{item.entityLabel}</Badge>
                    </td>
                    <td className="p-4 font-medium max-w-xs truncate">{item.title}</td>
                    <td className="p-4 text-on-surface-variant max-w-xs truncate">{item.subtitle || '—'}</td>
                    <td className="p-4 text-on-surface-variant whitespace-nowrap">
                      {new Date(item.deletedAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1.5">
                        <button
                          className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary"
                          title="Restore"
                          disabled={busyId === `restore-${item.id}`}
                          onClick={() => handleRestore(item)}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg hover:bg-danger-soft text-on-surface-variant hover:text-error"
                          title="Delete permanently"
                          disabled={busyId === `purge-${item.id}`}
                          onClick={() => setPurgeTarget(item)}
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

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant">
            <span className="text-sm text-on-surface-variant">
              Page {meta.page} of {meta.totalPages} ({meta.total} total)
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => goToPage(meta.page - 1)}
                disabled={meta.page <= 1}
                className="px-3 py-1 text-sm rounded-lg border border-outline-variant hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  style={p === meta.page ? adminButtonSmStyle : undefined}
                  className={
                    p === meta.page
                      ? 'hover:opacity-95'
                      : 'px-3 py-1 text-sm rounded-lg border border-outline-variant hover:bg-surface-container-high'
                  }
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => goToPage(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="px-3 py-1 text-sm rounded-lg border border-outline-variant hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={purgeTarget !== null}
        onClose={() => setPurgeTarget(null)}
        onConfirm={handlePurge}
        title="Delete permanently"
        message={`Permanently delete "${purgeTarget?.title}"? This cannot be undone.`}
      />
    </div>
  );
}