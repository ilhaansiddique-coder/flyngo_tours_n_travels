'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useApi } from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';
import { FileCheck, Search, Phone, Mail, MapPin, Users, Calendar } from 'lucide-react';

interface PreReg {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  passportNo?: string;
  district?: string;
  travelers: number;
  packageTier?: string;
  year?: number;
  status: string;
  notes?: string;
  createdAt: string;
}

const STATUSES = [
  { value: 'new', label: 'New', variant: 'default' as const },
  { value: 'contacted', label: 'Contacted', variant: 'info' as const },
  { value: 'registered', label: 'Registered', variant: 'success' as const },
  { value: 'rejected', label: 'Rejected', variant: 'danger' as const },
];

export default function AdminHajjPreRegistrationsPage() {
  const { getHajjPreRegistrations, updateHajjPreRegistrationStatus } = useApi();
  const [items, setItems] = useState<PreReg[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('');

  const load = () => {
    setLoading(true);
    getHajjPreRegistrations({ limit: '100' })
      .then((r: any) => setItems(r?.items ?? []))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter((i) => {
    if (filter && i.status !== filter) return false;
    if (search && !(`${i.fullName} ${i.phone} ${i.email ?? ''} ${i.district ?? ''}`.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const setStatus = async (id: string, status: string) => {
    await updateHajjPreRegistrationStatus(id, status);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Hajj Pre-Registrations</h1>
        <p className="text-sm text-muted">{items.length} submissions</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone, district..." />
        </div>
        <select
          className="px-3 py-2 rounded-md border bg-surface text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted">No pre-registrations yet.</Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const statusMeta = STATUSES.find((s) => s.value === r.status) ?? STATUSES[0];
            return (
              <Card key={r.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCheck className="w-4 h-4 text-emerald-500" />
                      <h3 className="font-semibold">{r.fullName}</h3>
                      <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                      {r.year && <Badge variant="cyan">{r.year}</Badge>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                      <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-muted" /> {r.phone}</div>
                      {r.email && <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-muted" /> {r.email}</div>}
                      {r.district && <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-muted" /> {r.district}</div>}
                      <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-muted" /> {r.travelers} traveler{r.travelers === 1 ? '' : 's'}</div>
                      {r.packageTier && <div className="flex items-center gap-1.5 text-muted">Tier: {r.packageTier}</div>}
                      <div className="flex items-center gap-1.5 text-muted"><Calendar className="w-3.5 h-3.5" /> {formatDate(r.createdAt)}</div>
                    </div>
                    {r.notes && <p className="text-xs text-muted mt-2 italic">{r.notes}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-muted">Update status</label>
                    <select
                      className="px-2 py-1.5 rounded-md border bg-surface text-sm"
                      value={r.status}
                      onChange={(e) => setStatus(r.id, e.target.value)}
                    >
                      {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
