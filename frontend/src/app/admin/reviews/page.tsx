'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/admin/ui';
import { formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState } from 'react';
import { MessageSquare, Star, Check, X, Search, Filter as FilterIcon, Trash2 } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  title?: string;
  content: string;
  itemType: string;
  itemId: string;
  isApproved: boolean;
  isVerified: boolean;
  createdAt: string;
  user?: { id: string; fullName: string; email: string };
}

export default function ReviewsPage() {
  const { getReviews, approveReview, deleteReview } = useApi();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('');
  const [approvalFilter, setApprovalFilter] = useState<string>('');

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const fetchReviews = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(p), limit: '20' };
      if (search) params.search = search;
      if (itemTypeFilter) params.itemType = itemTypeFilter;
      if (approvalFilter) params.isApproved = approvalFilter;
      const res = await getReviews(params);
      const data = res as any;
      if (Array.isArray(data)) {
        setReviews(data);
        setTotalPages(1);
      } else {
        setReviews(data?.items ?? data?.data ?? []);
        setTotalPages(data?.meta?.totalPages ?? 1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (id: string, isApproved: boolean) => {
    try {
      await approveReview(id, isApproved);
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isApproved } : r)));
    } catch {
      // silently fail
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      await deleteReview(confirmDelete.id);
      setConfirmDelete({ open: false, id: null });
      fetchReviews(page);
    } catch {
      // silently fail
    }
  };

  const applyFilters = () => {
    setPage(1);
    fetchReviews(1);
  };

  const clearFilters = () => {
    setSearch('');
    setItemTypeFilter('');
    setApprovalFilter('');
    setPage(1);
    fetchReviews(1);
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3 h-3 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card hover={false}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by content"
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Item Type</label>
            <select
              value={itemTypeFilter}
              onChange={(e) => setItemTypeFilter(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
            >
              <option value="">All types</option>
              <option value="tour">Tours</option>
              <option value="hotel">Hotels</option>
              <option value="flight">Flights</option>
              <option value="visa">Visa</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
            >
              <option value="">All</option>
              <option value="false">Pending</option>
              <option value="true">Approved</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={applyFilters} size="md" className="flex-1">Apply</Button>
            <Button onClick={clearFilters} size="md" variant="outline">Clear</Button>
          </div>
        </div>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
        </div>
      )}

      {error && !loading && (
        <Card hover={false}>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={() => fetchReviews(page)}>Retry</Button>
          </div>
        </Card>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.length === 0 ? (
              <Card hover={false} className="md:col-span-2">
                <div className="text-center py-12">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-500">No reviews found</p>
                </div>
              </Card>
            ) : (
              reviews.map((r) => (
                <Card key={r.id} hover={false}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{r.user?.fullName || 'Anonymous'}</span>
                        {r.isVerified && (
                          <Badge variant="info" className="text-xs">Verified</Badge>
                        )}
                        {r.isApproved ? (
                          <Badge variant="success" className="text-xs">Approved</Badge>
                        ) : (
                          <Badge variant="warning" className="text-xs">Pending</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(r.rating)}
                        <span className="text-xs text-gray-500">{formatDate(r.createdAt)}</span>
                        <Badge variant="default" className="text-xs capitalize">{r.itemType}</Badge>
                      </div>
                    </div>
                  </div>
                  {r.title && <h4 className="font-semibold mb-1">{r.title}</h4>}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{r.content}</p>
                  <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                    {!r.isApproved ? (
                      <Button size="sm" onClick={() => handleApprove(r.id, true)} className="gap-1">
                        <Check className="w-3 h-3" /> Approve
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleApprove(r.id, false)} className="gap-1">
                        <X className="w-3 h-3" /> Unapprove
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDelete({ open: true, id: r.id })} className="gap-1 text-red-600">
                      <Trash2 className="w-3 h-3" /> Delete
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(page - 1); fetchReviews(page - 1); }}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => { setPage(page + 1); fetchReviews(page + 1); }}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review?"
      />
    </div>
  );
}
