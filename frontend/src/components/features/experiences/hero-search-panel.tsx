'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, FileCheck, Plane, Search, Building2, Moon, Sparkles, Car } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { DestinationAutocomplete } from '@/components/ui/destination-autocomplete';
import { DEFAULT_COUNTRY_CODE, findDialByCode } from '@/lib/country-dial-codes';
import { useApi } from '@/hooks/use-api';

type TabKey = 'tours' | 'visa' | 'hotels' | 'flights' | 'hajj' | 'umrah' | 'transport';

const TABS: { key: TabKey; label: string; Icon: typeof Compass; href: string }[] = [
  { key: 'tours', label: 'Tour', Icon: Compass, href: '/tours' },
  { key: 'visa', label: 'Visa', Icon: FileCheck, href: '/visa' },
  { key: 'hotels', label: 'Hotel', Icon: Building2, href: '/hotels' },
  { key: 'flights', label: 'Flight', Icon: Plane, href: '/flights' },
  { key: 'hajj', label: 'Hajj', Icon: Moon, href: '/hajj' },
  { key: 'umrah', label: 'Umrah', Icon: Sparkles, href: '/umrah' },
  { key: 'transport', label: 'Transport', Icon: Car, href: '/transport' },
];

// Tabs where a destination/country is the primary search input (and required).
const DESTINATION_REQUIRED: TabKey[] = ['tours', 'visa', 'hotels'];

export function HeroSearchPanel() {
  const router = useRouter();
  const { submitLead } = useApi();
  const [tab, setTab] = useState<TabKey>('tours');
  const [destination, setDestination] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [contactCountry, setContactCountry] = useState<string>(DEFAULT_COUNTRY_CODE);
  const [contactError, setContactError] = useState('');
  const [destinationError, setDestinationError] = useState('');

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

  function clearErrors() {
    setContactError('');
    setDestinationError('');
  }

  function validate(): boolean {
    clearErrors();
    let ok = true;

    if (DESTINATION_REQUIRED.includes(tab) && !destination.trim()) {
      setDestinationError(tab === 'visa' ? 'Please choose a country.' : 'Please choose a destination.');
      ok = false;
    }

    if (!contactNumber.trim()) {
      setContactError('Contact number is required.');
      ok = false;
    } else if (contactNumber.trim().length < 6) {
      setContactError('Please enter a valid phone number.');
      ok = false;
    }

    return ok;
  }

  function buildLead() {
    const dial = findDialByCode(contactCountry)?.dial ?? '';
    const service = TABS.find((t) => t.key === tab)?.label ?? tab;
    // The hero collects only a phone number, so there is no name to derive.
    // Staff identify the enquiry by phone and the message below.
    const fullName = 'Website enquiry';

    const details: string[] = [];
    if (destination.trim()) details.push(`Destination: ${destination.trim()}`);
    if (tab === 'flights') {
      if (from.trim() || to.trim()) details.push(`Route: ${from.trim() || '?'} → ${to.trim() || '?'}`);
      if (depart) details.push(`Depart: ${depart}`);
      if (returnDate && tripType === 'round-trip') details.push(`Return: ${returnDate}`);
      details.push(`Pax: ${adults}A ${children}C ${infants}I · ${cabin} · ${tripType}`);
    }
    if (tab === 'hotels') {
      if (checkIn) details.push(`Check-in: ${checkIn}`);
      if (checkOut) details.push(`Check-out: ${checkOut}`);
      details.push(`Rooms: ${rooms} · Guests: ${adults}`);
    }

    return {
      fullName,
      phone: `${dial} ${contactNumber.trim()}`.trim(),
      source: 'website',
      formSlug: `hero-search-${tab}`,
      packageSlug: destination.trim() || undefined,
      message: `Hero search — ${service}${details.length ? ` · ${details.join(' · ')}` : ''}`,
    };
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    // Fire-and-forget lead capture — never block the search on it.
    submitLead(buildLead()).catch(() => {});

    // Only carry search-relevant params into the URL. The contact number is
    // captured in the lead above, not leaked into the address bar / history.
    const params = new URLSearchParams();
    if (destination.trim()) params.set('q', destination.trim());
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
    router.push(`${tabHref}?${params.toString()}`);
  }

  function handleTabChange(next: TabKey) {
    setTab(next);
    clearErrors();
  }

  const contactField = (
    <PhoneInput
      label="Contact number"
      countryCode={contactCountry}
      number={contactNumber}
      onCountryCodeChange={(c) => {
        setContactCountry(c);
        if (contactError) setContactError('');
      }}
      onNumberChange={(v) => {
        setContactNumber(v);
        if (contactError) setContactError('');
      }}
      required
      placeholder="e.g. 1XXX-XXXXXX"
      error={contactError}
    />
  );

  const destinationLabel = (() => {
    switch (tab) {
      case 'visa': return 'Which country do you need a visa for?';
      case 'hajj': return 'Hajj package (optional)';
      case 'umrah': return 'Umrah package (optional)';
      case 'transport': return 'Route or city (optional)';
      default: return 'Where do you want to go?';
    }
  })();
  const destinationPlaceholder = (() => {
    switch (tab) {
      case 'visa': return 'Country';
      case 'hajj':
      case 'umrah': return 'Search packages';
      case 'transport': return 'City or route';
      default: return 'Country or city';
    }
  })();

  const destinationField = (
    <DestinationAutocomplete
      label={destinationLabel}
      value={destination}
      onChange={(v) => {
        setDestination(v);
        if (destinationError) setDestinationError('');
      }}
      placeholder={destinationPlaceholder}
      mode={tab === 'visa' ? 'country' : 'city'}
      required={DESTINATION_REQUIRED.includes(tab)}
      error={destinationError}
    />
  );

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="relative rounded-3xl p-3 sm:p-5 mb-8 overflow-visible"
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
            'radial-gradient(ellipse 80% 80% at 0% 0%, color-mix(in oklab, var(--color-primary) 15%, transparent) 0%, transparent 60%), radial-gradient(ellipse 80% 80% at 100% 100%, color-mix(in oklab, var(--color-tertiary) 12%, transparent) 0%, transparent 60%)',
        }}
      />
      <div
        role="tablist"
        aria-label="Search category"
        className="flex flex-nowrap gap-1 mb-4 p-1 rounded-xl overflow-x-auto scrollbar-none"
        style={{
          backgroundColor: 'color-mix(in oklab, var(--color-surface) 35%, transparent)',
          border: '1px solid color-mix(in oklab, var(--color-on-surface) 8%, transparent)',
        }}
      >
        {TABS.map(({ key, label, Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleTabChange(key)}
              className={`flex-1 min-w-[84px] whitespace-nowrap inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-all ${
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
            <DestinationAutocomplete
              label="Flying from"
              value={from}
              onChange={(v) => setFrom(v)}
              placeholder="City or airport"
            />
            <DestinationAutocomplete
              label="Flying to"
              value={to}
              onChange={(v) => setTo(v)}
              placeholder="City or airport"
            />
            <Input label="Departing" type="date" value={depart} onChange={(e) => setDepart(e.target.value)} />
            {tripType === 'round-trip' && (
              <Input
                label="Returning"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            )}
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Adults (12+)"
                type="number"
                min={1}
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
              />
              <Input
                label="Children (3-11)"
                type="number"
                min={0}
                value={children}
                onChange={(e) => setChildren(e.target.value)}
              />
              <Input
                label="Infants (0-2)"
                type="number"
                min={0}
                value={infants}
                onChange={(e) => setInfants(e.target.value)}
              />
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
            {contactField}
          </>
        ) : tab === 'hotels' ? (
          <>
            {destinationField}
            <div />
            <Input label="Check-in" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            <Input
              label="Check-out"
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
            <Input
              label="Rooms"
              type="number"
              min={1}
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
            />
            <Input
              label="Guests"
              type="number"
              min={1}
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
            />
            {contactField}
          </>
        ) : tab === 'visa' ? (
          <>
            {destinationField}
            {contactField}
          </>
        ) : (
          <>
            {destinationField}
            {contactField}
          </>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-[var(--color-on-primary)] shadow-lg transition hover:opacity-95 active:scale-[0.98]"
          style={{
            background:
              'linear-gradient(135deg, var(--color-primary) 0%, var(--color-tertiary) 100%)',
            boxShadow:
              '0 14px 30px -12px color-mix(in oklab, var(--color-primary) 60%, transparent), inset 0 1px 0 color-mix(in oklab, #fff 25%, transparent)',
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
