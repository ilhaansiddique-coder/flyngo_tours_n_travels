'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Loader2,
  Printer,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import { adminFetch } from '@/lib/admin-api';
import { cn } from '@/lib/utils';

interface MemberRow {
  id: string;
  memberId: string;
  category: string;
  categoryLabelEn: string | null;
  categoryLabelBn: string | null;
  fee: string | null;
  fullName: string;
  email: string;
  mobile: string;
  gender: string | null;
  bloodGroup: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface MemberDetail extends MemberRow {
  fatherName?: string | null;
  motherName?: string | null;
  nidNo?: string | null;
  dob?: string | null;
  presentAddress?: string | null;
  permanentAddress?: string | null;
  education?: string | null;
  profession?: string | null;
  institution?: string | null;
  emergencyContactName?: string | null;
  emergencyContactNumber?: string | null;
  fbLink?: string | null;
  volunteerExperience?: string | null;
  photo?: string | null;
  adminNote?: string | null;
  approvedAt?: string | null;
  user?: { id: string; email: string; name: string } | null;
}

interface ListResponse {
  items: MemberRow[];
  total: number;
  page: number;
  pageSize: number;
}

interface RegistrationRow {
  id: string;
  slug: string;
  tag: string;
  name: string;
  mobile: string;
  emergency: string | null;
  organization: string | null;
  bloodGroup: string | null;
  address: string | null;
  reference: string | null;
  fbProfile: string | null;
  photo: string | null;
  bkashTrxId: string | null;
  receipt: string | null;
  adminNote: string | null;
  approvedAt: string | null;
  status: string;
  createdAt: string;
}

interface RegistrationListResponse {
  items: RegistrationRow[];
  total: number;
  page: number;
  pageSize: number;
}

type Source = 'membership' | 'saintmartin';

const SOURCES: Array<{ key: Source; label: string; hint: string }> = [
  { key: 'membership', label: 'Membership', hint: 'Membership applications' },
  { key: 'saintmartin', label: 'Saint Martin Trip', hint: 'Landing page registrations tagged "saintmartin"' },
];

const FILTERS: Array<{ key: string; label: string }> = [
  { key: '', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

function categoryLabel(m: MemberRow): string {
  return m.categoryLabelEn || m.category;
}

export function AdminMembers() {
  const [source, setSource] = useState<Source>('membership');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [list, setList] = useState<ListResponse>({ items: [], total: 0, page: 1, pageSize: 50 });
  const [regList, setRegList] = useState<RegistrationListResponse>({ items: [], total: 0, page: 1, pageSize: 50 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<MemberDetail | null>(null);
  const [regDetail, setRegDetail] = useState<RegistrationRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (source === 'membership') {
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      adminFetch<ListResponse>(`/admin/members?${params.toString()}`)
        .then(setList)
        .catch((e) => setError((e as Error).message))
        .finally(() => setLoading(false));
    } else {
      params.set('tag', 'saintmartin');
      if (search) params.set('search', search);
      adminFetch<RegistrationListResponse>(`/admin/registrations?${params.toString()}`)
        .then(setRegList)
        .catch((e) => setError((e as Error).message))
        .finally(() => setLoading(false));
    }
  }, [source, status, search]);

  useEffect(() => {
    load();
  }, [load]);

  const setMemberStatus = async (id: string, next: 'APPROVED' | 'REJECTED') => {
    setBusyId(id);
    try {
      await adminFetch(`/admin/members/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: next }),
      });
      setDetail((d) => (d && d.id === id ? { ...d, status: next } : d));
      load();
      if (status && status !== '' && status !== next) {
        // row left the current filter; refresh screen state
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const removeMember = async (id: string) => {
    if (!window.confirm('Delete this member application? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await adminFetch(`/admin/members/${id}`, { method: 'DELETE' });
      if (detail?.id === id) setDetail(null);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const removeRegistration = async (id: string) => {
    if (!window.confirm('Delete this trip registration? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await adminFetch(`/admin/registrations/${id}`, { method: 'DELETE' });
      if (regDetail?.id === id) setRegDetail(null);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const setRegistrationStatus = async (id: string, next: 'APPROVED' | 'REJECTED') => {
    setBusyId(id);
    try {
      await adminFetch(`/admin/registrations/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: next }),
      });
      setRegDetail((d) => (d && d.id === id ? { ...d, status: next } : d));
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const photoSrc = detail?.photo;
  const photoHref = photoSrc && /^data:image/.test(photoSrc) ? photoSrc : undefined;

  const buildExport = (): { name: string; headers: string[]; rows: string[][] } => {
    const stamp = new Date().toISOString().slice(0, 10);
    if (source === 'membership') {
      return {
        name: `vbt-members-${stamp}`,
        headers: ['Ref', 'Name', 'Email', 'Mobile', 'Category', 'Fee (BDT)', 'Gender', 'Blood Group', 'Status', 'Applied'],
        rows: list.items.map((m) => [
          m.memberId,
          m.fullName,
          m.email,
          m.mobile,
          categoryLabel(m),
          m.fee ?? '',
          m.gender ?? '',
          m.bloodGroup ?? '',
          m.status,
          new Date(m.createdAt).toLocaleString(),
        ]),
      };
    }
    return {
      name: `vbt-saintmartin-${stamp}`,
      headers: ['ID', 'Name', 'Organization', 'Mobile', 'Emergency', 'Blood Group', 'Address', 'Reference', 'FB Profile', 'Tag', 'Status', 'Registered'],
      rows: regList.items.map((r) => [
        r.id.slice(0, 8),
        r.name,
        r.organization ?? '',
        r.mobile,
        r.emergency ?? '',
        r.bloodGroup ?? '',
        r.address ?? '',
        r.reference ?? '',
        r.fbProfile ?? '',
        r.tag,
        r.status,
        new Date(r.createdAt).toLocaleString(),
      ]),
    };
  };

  const exportCsv = () => {
    const { name, headers, rows } = buildExport();
    const csv = `\uFEFF${[headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')}`;
    downloadFile(csv, 'text/csv', `${name}.csv`);
  };

  const exportExcel = () => {
    const { name, headers, rows } = buildExport();
    const rowXml = (cells: string[]) =>
      `<Row>${cells.map((c) => `<Cell><Data ss:Type="String">${xmlEsc(c)}</Data></Cell>`).join('')}</Row>`;
    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="VBT"><Table>${rowXml(headers)}${rows.map(rowXml).join('')}</Table></Worksheet></Workbook>`;
    downloadFile(xml, 'application/vnd.ms-excel', `${name}.xls`);
  };

  const exportPdf = () => window.print();

  return (
    <div>
      <h1 className="text-2xl font-bold">Members &amp; Registrations</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
        Review membership applications and landing page trip registrations.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl bg-white p-1 shadow-[var(--shadow-card)]">
          {SOURCES.map((s) => (
            <button
              key={s.key}
              onClick={() => {
                setSource(s.key);
                setDetail(null);
                setRegDetail(null);
              }}
              title={s.hint}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                source === s.key ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-ink-soft)]',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        {source === 'membership' ? (
          <div className="flex flex-wrap gap-1 rounded-xl bg-white p-1 shadow-[var(--shadow-card)]">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatus(f.key)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                  status === f.key ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-ink-soft)]',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : null}
        <div className="relative min-w-56 flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              source === 'membership'
                ? 'Search name, email, phone or ref…'
                : 'Search trip registration name, phone or organization…'
            }
            className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            onClick={exportCsv}
            title="Download the table as CSV"
            className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm font-semibold text-[var(--color-ink-soft)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
          >
            <Download size={15} /> CSV
          </button>
          <button
            onClick={exportExcel}
            title="Download the table as Excel (.xls)"
            className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm font-semibold text-[var(--color-ink-soft)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
          >
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button
            onClick={exportPdf}
            title="Print the table or save it as PDF"
            className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm font-semibold text-[var(--color-ink-soft)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
          >
            <FileText size={15} /> PDF
          </button>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-[var(--color-crimson)]">{error}</p> : null}

      {loading ? (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-black/5 bg-white p-16 text-[var(--color-ink-soft)] shadow-[var(--shadow-card)]">
          <Loader2 size={18} className="animate-spin" /> Loading…
        </div>
      ) : source === 'membership' ? (
        <div id="vbt-export-table" className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[var(--shadow-card)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs font-bold uppercase tracking-wide text-[var(--color-ink-muted)]">
                  <th className="px-4 py-3">Ref</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Applied</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((m) => (
                  <tr key={m.id} className="border-b border-black/5 last:border-0 hover:bg-[var(--color-mist)]/60">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-[var(--color-royal)]">{m.memberId}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{m.fullName}</p>
                      <p className="text-xs text-[var(--color-ink-muted)]">{m.email}</p>
                    </td>
                    <td className="px-4 py-3">{categoryLabel(m)}</td>
                    <td className="px-4 py-3 text-[var(--color-ink-soft)]">{m.mobile || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-block rounded-full px-2.5 py-0.5 text-xs font-bold',
                          m.status === 'APPROVED' && 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]',
                          m.status === 'REJECTED' && 'bg-[var(--color-crimson-light)] text-[var(--color-crimson)]',
                          m.status === 'PENDING' && 'bg-[var(--color-gold-lighter)] text-[var(--color-gold-deep)]',
                        )}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-ink-muted)]">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() =>
                            adminFetch<MemberDetail>(`/admin/members/${m.id}`).then(setDetail).catch((e) => setError((e as Error).message))
                          }
                          className="rounded-lg bg-[var(--color-mist)] p-2 text-[var(--color-ink-soft)] hover:text-[var(--color-royal)]"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        {m.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => setMemberStatus(m.id, 'APPROVED')}
                              disabled={busyId === m.id}
                              className="rounded-lg bg-[var(--color-primary-light)] p-2 text-[var(--color-primary-dark)] hover:bg-[var(--color-primary)] hover:text-white"
                              title="Approve"
                            >
                              <CheckCircle2 size={15} />
                            </button>
                            <button
                              onClick={() => setMemberStatus(m.id, 'REJECTED')}
                              disabled={busyId === m.id}
                              className="rounded-lg bg-[var(--color-crimson-light)] p-2 text-[var(--color-crimson)] hover:bg-[var(--color-crimson)] hover:text-white"
                              title="Reject"
                            >
                              <XCircle size={15} />
                            </button>
                          </>
                        ) : null}
                        <button
                          onClick={() => removeMember(m.id)}
                          disabled={busyId === m.id}
                          className="rounded-lg bg-[var(--color-crimson-light)] p-2 text-[var(--color-crimson)] hover:bg-[var(--color-crimson)] hover:text-white"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {list.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-[var(--color-ink-muted)]">
                      No members match the current filter.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <div className="border-t border-black/5 px-4 py-3 text-xs text-[var(--color-ink-muted)]">
            {list.total} total{list.items.length !== list.total ? ` • showing ${list.items.length}` : ''}
          </div>
        </div>
      ) : (
        <div id="vbt-export-table" className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[var(--shadow-card)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs font-bold uppercase tracking-wide text-[var(--color-ink-muted)]">
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Ref</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Blood</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {regList.items.map((r) => (
                  <tr key={r.id} className="border-b border-black/5 last:border-0 hover:bg-[var(--color-mist)]/60">
                    <td className="px-4 py-3">
                      {r.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.photo} alt={r.name} className="h-10 w-10 rounded-xl border border-black/10 object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-mist)] text-sm font-bold text-[var(--color-ink-soft)]">
                          {(r.name || '?').trim().slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-[var(--color-royal)]">{r.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{r.name}</p>
                      {r.organization ? <p className="text-xs text-[var(--color-ink-muted)]">{r.organization}</p> : null}
                    </td>
                    <td className="px-4 py-3">
                      {r.bloodGroup ? (
                        <span className="inline-block rounded-md bg-[var(--color-royal-light)] px-2 py-0.5 text-xs font-bold text-[var(--color-royal)]">
                          {r.bloodGroup}
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--color-ink-muted)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.bkashTrxId ? (
                        <span className="font-mono text-xs font-bold text-[var(--color-primary-dark)]">{r.bkashTrxId}</span>
                      ) : (
                        <span className="text-xs text-[var(--color-ink-muted)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-ink-soft)]">{r.mobile}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-[var(--color-gold-lighter)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-gold-deep)]">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-ink-muted)]">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setRegDetail(r)}
                          className="rounded-lg bg-[var(--color-mist)] p-2 text-[var(--color-ink-soft)] hover:text-[var(--color-royal)]"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => removeRegistration(r.id)}
                          disabled={busyId === r.id}
                          className="rounded-lg bg-[var(--color-crimson-light)] p-2 text-[var(--color-crimson)] hover:bg-[var(--color-crimson)] hover:text-white"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {regList.items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-sm text-[var(--color-ink-muted)]">
                      No Saint Martin registrations yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <div className="border-t border-black/5 px-4 py-3 text-xs text-[var(--color-ink-muted)]">
            {regList.total} total{regList.items.length !== regList.total ? ` • showing ${regList.items.length}` : ''}
          </div>
        </div>
      )}

      {detail ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="mt-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{detail.fullName}</h2>
                <p className="font-mono text-xs font-bold text-[var(--color-royal)]">{detail.memberId}</p>
                <span
                  className={cn(
                    'mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold',
                    detail.status === 'APPROVED' && 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]',
                    detail.status === 'REJECTED' && 'bg-[var(--color-crimson-light)] text-[var(--color-crimson)]',
                    detail.status === 'PENDING' && 'bg-[var(--color-gold-lighter)] text-[var(--color-gold-deep)]',
                  )}
                >
                  {detail.status}
                </span>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="rounded-lg bg-[var(--color-mist)] px-3 py-1.5 text-sm font-semibold text-[var(--color-ink-soft)]"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <DetailRow label="Category" value={`${categoryLabel(detail)}${detail.fee ? ` • ৳${Number(detail.fee).toLocaleString()}` : ''}`} />
              <DetailRow label="Email" value={detail.email} />
              <DetailRow label="Mobile" value={detail.mobile} />
              <DetailRow label="Date of birth" value={detail.dob ? new Date(detail.dob).toLocaleDateString() : '—'} />
              <DetailRow label="Gender" value={detail.gender || '—'} />
              <DetailRow label="Blood group" value={detail.bloodGroup || '—'} />
              <DetailRow label="Father's name" value={detail.fatherName || '—'} />
              <DetailRow label="Mother's name" value={detail.motherName || '—'} />
              <DetailRow label="NID no." value={detail.nidNo || '—'} />
              <DetailRow label="Profession" value={detail.profession || '—'} />
              <DetailRow label="Institution" value={detail.institution || '—'} />
              <DetailRow label="Education" value={detail.education || '—'} />
              <DetailRow label="Present address" value={detail.presentAddress || '—'} />
              <DetailRow label="Permanent address" value={detail.permanentAddress || '—'} />
              <DetailRow label="Emergency contact" value={`${detail.emergencyContactName || ''} ${detail.emergencyContactNumber ? `(${detail.emergencyContactNumber})` : ''}`.trim() || '—'} />
              <DetailRow label="Facebook" value={detail.fbLink || '—'} />
              <DetailRow label="Volunteer experience" value={detail.volunteerExperience || '—'} />
              <DetailRow label="Linked account" value={detail.user ? `${detail.user.name} <${detail.user.email}>` : 'None'} />
              <DetailRow label="Admin note" value={detail.adminNote || '—'} />
              <DetailRow label="Applied" value={new Date(detail.createdAt).toLocaleString()} />
            </div>

            {photoHref ? (
              <div className="mt-5">
                <p className="text-sm font-semibold text-[var(--color-ink-soft)]">Photo</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoHref} alt={detail.fullName} className="mt-2 h-40 w-40 rounded-xl object-cover" />
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              {detail.status === 'PENDING' ? (
                <>
                  <button
                    onClick={() => setMemberStatus(detail.id, 'APPROVED')}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-primary-dark)]"
                  >
                    <CheckCircle2 size={16} /> Approve
                  </button>
                  <button
                    onClick={() => setMemberStatus(detail.id, 'REJECTED')}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-crimson)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-crimson-dark)]"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </>
              ) : null}
              <button
                onClick={() => removeMember(detail.id)}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-crimson-light)] px-5 py-2.5 text-sm font-bold text-[var(--color-crimson)] hover:bg-[var(--color-crimson)] hover:text-white"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {regDetail ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm print:static print:block print:overflow-visible print:bg-white print:p-0 print:backdrop-blur-none">
          <div
            id="reg-print-card"
            className="mt-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl print:m-0 print:max-w-none print:rounded-none print:shadow-none"
          >
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold">{regDetail.name}</h2>
                <p className="mt-1 font-mono text-xs font-bold uppercase tracking-wide text-[var(--color-royal)]">
                  {regDetail.id.slice(0, 8)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="inline-block rounded-full bg-[var(--color-primary-light)] px-3 py-1 text-xs font-bold text-[var(--color-primary-dark)]">
                    #{regDetail.tag}
                  </span>
                  <span className="inline-block rounded-full bg-[var(--color-gold-lighter)] px-3 py-1 text-xs font-bold text-[var(--color-gold-deep)]">
                    {regDetail.status}
                  </span>
                </div>
              </div>
              <div className="shrink-0">
                {regDetail.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={regDetail.photo}
                    alt={regDetail.name}
                    className="h-24 w-24 rounded-2xl border border-black/10 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-black/10 bg-[var(--color-mist)] text-2xl font-bold text-[var(--color-ink-soft)]">
                    {(regDetail.name || '?').trim().slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <DetailRow label="Status" value={regDetail.status} />
              <DetailRow label="Mobile" value={regDetail.mobile} />
              <DetailRow label="Organization" value={regDetail.organization || '—'} />
              <DetailRow label="Blood group" value={regDetail.bloodGroup || '—'} />
              <DetailRow label="Emergency contact" value={regDetail.emergency || '—'} />
              <DetailRow label="Address" value={regDetail.address || '—'} />
              <DetailRow label="Reference" value={regDetail.reference || '—'} />
              <DetailRow label="FB profile" value={regDetail.fbProfile || '—'} />
              <DetailRow label="bKash TrxID" value={regDetail.bkashTrxId || '—'} />
              <DetailRow label="Approved at" value={regDetail.approvedAt ? new Date(regDetail.approvedAt).toLocaleString() : '—'} />
              <DetailRow label="Admin note" value={regDetail.adminNote || '—'} />
              <DetailRow label="Registered" value={new Date(regDetail.createdAt).toLocaleString()} />
            </div>

            {regDetail.receipt ? (
              <div className="mt-5">
                <p className="text-sm font-semibold text-[var(--color-ink-soft)]">Payment receipt</p>
                {regDetail.receipt.startsWith('data:application/pdf') ? (
                  <a
                    href={regDetail.receipt}
                    target="_blank"
                    rel="noreferrer"
                    download="receipt"
                    className="mt-2 inline-flex items-center gap-2 rounded-xl border border-black/10 bg-[var(--color-mist)] px-4 py-2.5 text-sm font-semibold text-[var(--color-crimson)] hover:border-[var(--color-crimson)]"
                  >
                    <FileText size={16} /> View PDF receipt
                  </a>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={regDetail.receipt} alt="Payment receipt" className="mt-2 max-h-72 rounded-xl border border-black/10 object-contain" />
                )}
              </div>
            ) : null}

            {regDetail.adminNote ? (
              <div className="mt-5 rounded-xl border border-[var(--color-gold-deep)] bg-[var(--color-gold-lighter)] p-4">
                <p className="text-sm font-semibold">Admin note</p>
                <p className="mt-1 text-sm">{regDetail.adminNote}</p>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-black/5 pt-4 print:hidden">
              {regDetail.status === 'NEW' || regDetail.status === 'REJECTED' ? (
                <button
                  onClick={() => setRegistrationStatus(regDetail.id, 'APPROVED')}
                  disabled={busyId === regDetail.id}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
                >
                  <CheckCircle2 size={16} /> Approve
                </button>
              ) : null}
              {regDetail.status === 'NEW' || regDetail.status === 'APPROVED' ? (
                <button
                  onClick={() => setRegistrationStatus(regDetail.id, 'REJECTED')}
                  disabled={busyId === regDetail.id}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-crimson)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-crimson-dark)] disabled:opacity-60"
                >
                  <XCircle size={16} /> Decline
                </button>
              ) : null}
              <button
                onClick={() => setRegDetail(null)}
                className="rounded-xl bg-[var(--color-mist)] px-4 py-2.5 text-sm font-semibold text-[var(--color-ink-soft)]"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-royal)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-royal-dark)]"
              >
                <Printer size={16} /> Print
              </button>
              <button
                onClick={() => removeRegistration(regDetail.id)}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-crimson-light)] px-5 py-2.5 text-sm font-bold text-[var(--color-crimson)] hover:bg-[var(--color-crimson)] hover:text-white"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-ink-muted)]">{label}</p>
      <p className="mt-0.5 break-words text-[var(--color-ink)]">{value}</p>
    </div>
  );
}

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function xmlEsc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function downloadFile(content: string, mime: string, filename: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}