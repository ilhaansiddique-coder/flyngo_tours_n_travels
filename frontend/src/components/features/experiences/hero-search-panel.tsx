'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, FileCheck, Plane, Search, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

type TabKey = 'tours' | 'visa' | 'hotels' | 'flights';

const TABS: { key: TabKey; label: string; Icon: typeof Compass; href: string }[] = [
  { key: 'tours', label: 'Tour', Icon: Compass, href: '/tours' },
  { key: 'visa', label: 'Visa', Icon: FileCheck, href: '/visa' },
  { key: 'hotels', label: 'Hotel', Icon: Building2, href: '/hotels' },
  { key: 'flights', label: 'Flight', Icon: Plane, href: '/flights' },
];

export function HeroSearchPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>('tours');
  const [destination, setDestination] = useState('');
  const [nationality, setNationality] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');

  // Flight-only fields
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('round-trip');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [depart, setDepart] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState('1');
  const [children, setChildren] = useState('0');
  const [infants, setInfants] = useState('0');
  const [cabin, setCabin] = useState('Economy');

  // Hotel-only fields
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState('1');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.set('q', destination.trim());
    if (nationality.trim()) params.set('nationality', nationality.trim());
    if (contact.trim()) params.set('contact', contact.trim());
    if (email.trim()) params.set('email', email.trim());
    if (tab === 'flights') {
      if (from.trim()) params.set('from', from.trim());
      if (to.trim()) params.set('to', to.trim());
      if (depart) params.set('depart', depart);
      if (returnDate && tripType === 'round-trip') params.set('return', returnDate);
      params.set('adults', adults);
      params.set('children', children);
      params.set('infants', infants);
      params.set('cabin', cabin);
      params.set('trip', tripType);
    }
    if (tab === 'hotels') {
      if (checkIn) params.set('checkIn', checkIn);
      if (checkOut) params.set('checkOut', checkOut);
      params.set('rooms', rooms);
    }
    const tabHref = TABS.find((t) => t.key === tab)?.href ?? '/search';
    const qs = params.toString();
    router.push(qs ? `${tabHref}?${qs}` : tabHref);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative rounded-3xl p-3 sm:p-5 mb-8 overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, color-mix(in oklab, var(--color-surface) 55%, transparent) 0%, color-mix(in oklab, var(--color-surface-container) 35%, transparent) 100%)',
        backdropFilter: 'blur(18px) saturate(140%)',
        WebkitBackdropFilter: 'blur(18px) saturate(140%)',
        border: '1px solid color-mix(in oklab, var(--color-on-surface) 12%, transparent)',
        boxShadow:
          '0 24px 60px -28px color-mix(in oklab, #000 55%, transparent), inset 0 1px 0 color-mix(in oklab, #fff 18%, transparent)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(120% 80% at 0% 0%, color-mix(in oklab, var(--color-primary) 18%, transparent) 0%, transparent 55%), radial-gradient(120% 80% at 100% 100%, color-mix(in oklab, var(--color-tertiary) 14%, transparent) 0%, transparent 55%)',
        }}
      />
      <div role="tablist" aria-label="Search category" className="flex flex-wrap gap-1 mb-4 p-1 rounded-xl" style={{ backgroundColor: 'color-mix(in oklab, var(--color-surface) 35%, transparent)', border: '1px solid color-mix(in oklab, var(--color-on-surface) 8%, transparent)' }}>
        {TABS.map(({ key, label, Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-all ${
                active
                  ? 'text-[var(--color-on-primary)] shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              style={
                active
                  ? {
                      background:
                        'linear-gradient(135deg, var(--color-primary) 0%, var(--color-tertiary) 100%)',
                    }
                  : { backgroundColor: 'transparent' }
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tab === 'flights' ? (
          <>
            <div className="sm:col-span-2 flex items-center gap-2 text-xs">
              {(['one-way', 'round-trip'] as const).map((opt) => (
                <label key={opt} className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="trip"
                    value={opt}
                    checked={tripType === opt}
                    onChange={() => setTripType(opt)}
                    className="accent-primary"
                  />
                  <span className="capitalize">{opt.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
            <Input label="Flying from" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="City or airport" />
            <Input label="Flying to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="City or airport" />
            <Input label="Departing" type="date" value={depart} onChange={(e) => setDepart(e.target.value)} />
            {tripType === 'round-trip' && (
              <Input label="Returning" type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
            )}
            <div className="grid grid-cols-3 gap-3">
              <Input label="Adults (12+)" type="number" min={1} value={adults} onChange={(e) => setAdults(e.target.value)} />
              <Input label="Children (3-11)" type="number" min={0} value={children} onChange={(e) => setChildren(e.target.value)} />
              <Input label="Infants (0-2)" type="number" min={0} value={infants} onChange={(e) => setInfants(e.target.value)} />
            </div>
            <div className="self-end">
              <label className="block text-sm font-medium text-on-surface mb-1.5">Class</label>
              <select
                value={cabin}
                onChange={(e) => setCabin(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border bg-surface-container/60 backdrop-blur-md text-on-surface transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 border-outline-variant hover:border-outline"
              >
                <option>Economy</option>
                <option>Premium Economy</option>
                <option>Business</option>
                <option>First</option>
              </select>
            </div>
          </>
        ) : tab === 'hotels' ? (
          <>
            <Input label="Where do you want to go?" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="City or hotel" />
            <div /> {/* spacer */}
            <Input label="Check-in" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            <Input label="Check-out" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            <Input label="Rooms" type="number" min={1} value={rooms} onChange={(e) => setRooms(e.target.value)} />
            <Input label="Guests" type="number" min={1} value={adults} onChange={(e) => setAdults(e.target.value)} />
          </>
        ) : (
          <>
            <Input label="Where do you want to go?" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Country or city" />
            <Input label="Your nationality" value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="e.g. Bangladeshi" />
            <Input label="Contact number" type="tel" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Optional" />
            <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" />
          </>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-[var(--color-on-primary)] shadow-lg transition hover:opacity-95 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-tertiary) 100%)',
            boxShadow: '0 14px 30px -12px color-mix(in oklab, var(--color-primary) 60%, transparent), inset 0 1px 0 color-mix(in oklab, #fff 25%, transparent)',
          }}
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>
    </form>
  );
}

export default HeroSearchPanel;
