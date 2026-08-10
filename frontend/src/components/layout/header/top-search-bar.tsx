'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MapPin, Calendar, Search, Sparkles, Compass, Briefcase, Building2, Plane, Car, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CITIES } from '@/lib/geo';
import { POPULAR_PACKAGES } from '@/lib/packages';
import { useScrollReveal } from '@/lib/use-scroll-reveal';

type CategoryKind = 'destination' | 'package' | 'category';

type Suggestion = {
  kind: CategoryKind;
  label: string;
  hint: string;
  href: string;
  Icon: typeof MapPin;
  accent: string;
};

const CATEGORY_ENTRIES: { label: string; hint: string; href: string; Icon: typeof Compass; accent: string }[] = [
  { label: 'Tours', hint: 'Guided experiences worldwide', href: '/tours', Icon: Compass, accent: '#0c6fdf' },
  { label: 'Visas', hint: 'Visa assistance & processing', href: '/visa', Icon: Briefcase, accent: '#0891b2' },
  { label: 'Hajj & Umrah', hint: 'Pilgrimage packages', href: '/hajj', Icon: Sparkles, accent: '#d54f15' },
  { label: 'Hotels', hint: 'Stays in 500+ cities', href: '/hotels', Icon: Building2, accent: '#0c6fdf' },
  { label: 'Flights', hint: 'Tickets & deals', href: '/flights', Icon: Plane, accent: '#1881ff' },
  { label: 'Transport', hint: 'Airport transfers & rentals', href: '/transport', Icon: Car, accent: '#d54f15' },
];

const DESTINATION_INDEX: Suggestion[] = CITIES.map((c) => ({
  kind: 'destination',
  label: c.name,
  hint: 'Destination',
  href: `/tours?q=${encodeURIComponent(c.name)}`,
  Icon: MapPin,
  accent: '#0c6fdf',
}));

const PACKAGE_INDEX: Suggestion[] = POPULAR_PACKAGES.map((p) => ({
  kind: 'package',
  label: p.title,
  hint: `${p.destination} · ${p.durationDays} days · from $${p.priceUsd}`,
  href: p.href,
  Icon: Briefcase,
  accent: '#d54f15',
}));

const CATEGORY_INDEX: Suggestion[] = CATEGORY_ENTRIES.map((c) => ({
  kind: 'category',
  label: c.label,
  hint: c.hint,
  href: c.href,
  Icon: c.Icon,
  accent: c.accent,
}));

const ALL_SUGGESTIONS: Suggestion[] = [...DESTINATION_INDEX, ...CATEGORY_INDEX, ...PACKAGE_INDEX];

const QUICK_CHIPS = ['Bali', 'Dubai', 'Maldives', 'London', 'Istanbul', 'Thailand'];

const RECENT_KEY = 'flyngo-recent-searches';
const MAX_RECENT = 5;

function readRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string').slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function pushRecent(value: string) {
  if (typeof window === 'undefined') return;
  if (!value) return;
  try {
    const next = [value, ...readRecent().filter((v) => v.toLowerCase() !== value.toLowerCase())].slice(0, MAX_RECENT);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

type GuestCounts = { adults: number; children: number; rooms: number };
const DEFAULT_GUESTS: GuestCounts = { adults: 2, children: 0, rooms: 1 };

function formatGuests(g: GuestCounts): string {
  const people = g.adults + g.children;
  return `${people} guest${people === 1 ? '' : 's'} · ${g.rooms} room${g.rooms === 1 ? '' : 's'}`;
}

export function TopSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { visible, compact } = useScrollReveal();
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [guests, setGuests] = useState<GuestCounts>(DEFAULT_GUESTS);
  const [destOpen, setDestOpen] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [guestsText, setGuestsText] = useState('');
  const destRef = useRef<HTMLDivElement>(null);
  const datesRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecent(readRecent());
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!destRef.current?.contains(e.target as Node)) setDestOpen(false);
      if (!datesRef.current?.contains(e.target as Node)) setDatesOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (checkIn && checkOut) {
      const fmt = (d: Date) =>
        d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      setDates(`${fmt(checkIn)} → ${fmt(checkOut)}`);
    } else if (checkIn) {
      const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      setDates(`${fmt(checkIn)} → Add return`);
    } else {
      setDates('');
    }
  }, [checkIn, checkOut]);

  const parseGuests = (raw: string): GuestCounts | null => {
    const text = raw.toLowerCase();
    const adultsMatch = text.match(/(\d+)\s*a(dult)?s?/);
    const childrenMatch = text.match(/(\d+)\s*c(hild(ren)?)?s?/);
    const roomsMatch = text.match(/(\d+)\s*r(oom)?s?/);
    const guestMatch = text.match(/^(\d+)$/);
    const fallbackMatch = text.match(/(\d+)\s*(guest|people|person|traveler)/);
    const adults = adultsMatch
      ? parseInt(adultsMatch[1], 10)
      : guestMatch
        ? parseInt(guestMatch[1], 10)
        : fallbackMatch
          ? parseInt(fallbackMatch[1], 10)
          : null;
    if (adults == null) return null;
    const children = childrenMatch ? parseInt(childrenMatch[1], 10) : 0;
    const rooms = roomsMatch
      ? parseInt(roomsMatch[1], 10)
      : Math.max(1, Math.ceil((adults + children) / 2));
    return {
      adults: Math.max(1, adults),
      children: Math.max(0, children),
      rooms: Math.max(1, rooms),
    };
  };

  const commitGuests = () => {
    const parsed = parseGuests(guestsText);
    if (parsed) {
      setGuests(parsed);
      setGuestsText(formatGuests(parsed));
    } else {
      setGuestsText(formatGuests(guests));
    }
  };

  const handleGuestsBlur = () => commitGuests();

  const handleGuestsKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitGuests();
      guestsRef.current?.blur();
    } else if (e.key === 'Escape') {
      setGuestsText(formatGuests(guests));
      guestsRef.current?.blur();
    }
  };

  const calendarDays = useMemo(() => {
    const first = new Date(calendarMonth);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
    const cells: Array<Date | null> = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), d));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [calendarMonth]);

  const sameDay = (a: Date | null, b: Date | null) => {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const inRange = (d: Date) => {
    if (!checkIn || !checkOut) return false;
    return d > checkIn && d < checkOut;
  };

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const matches = useMemo(() => {
    const q = destination.trim().toLowerCase();
    if (!q) return [];
    return ALL_SUGGESTIONS.filter(
      (s) => s.label.toLowerCase().includes(q) || s.hint.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [destination]);

  const grouped = useMemo(() => {
    const groups: Record<CategoryKind, Suggestion[]> = { destination: [], package: [], category: [] };
    matches.forEach((m) => groups[m.kind].push(m));
    return groups;
  }, [matches]);

  const flatIndex = useMemo(() => {
    const list: Suggestion[] = [];
    (['destination', 'category', 'package'] as CategoryKind[]).forEach((k) => {
      grouped[k].forEach((s) => list.push(s));
    });
    return list;
  }, [grouped]);

  useEffect(() => {
    setActiveIndex(0);
  }, [destination]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = destination.trim();
    if (term) pushRecent(term);
    const params = new URLSearchParams();
    if (term) params.set('q', term);
    if (checkIn) {
      params.set('checkIn', checkIn.toISOString().slice(0, 10));
      if (checkOut) params.set('checkOut', checkOut.toISOString().slice(0, 10));
    }
    if (guests.adults) params.set('adults', String(guests.adults));
    if (guests.children > 0) params.set('children', String(guests.children));
    if (guests.rooms) params.set('rooms', String(guests.rooms));
    const qs = params.toString();
    router.push(`/search${qs ? `?${qs}` : ''}`);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(flatIndex.length - 1, 0)));
      setDestOpen(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && destOpen) {
      e.preventDefault();
      const choice = flatIndex[activeIndex];
      if (choice) {
        pushRecent(choice.label);
        setRecent(readRecent());
        setDestination(choice.label);
        setDestOpen(false);
        router.push(choice.href);
      } else if (destination.trim()) {
        handleSubmit(new Event('submit') as unknown as React.FormEvent);
      }
    } else if (e.key === 'Escape') {
      setDestOpen(false);
    }
  };

  const showPanel = destOpen && (matches.length > 0 || recent.length > 0 || destination.trim().length > 0);

  if (pathname?.startsWith('/admin')) return null;
  // Hero-only: the search bar lives on the home page. On other pages the
  // navbar + per-page content are enough — and the bar would otherwise
  // waste vertical space and compete with page hero treatments.
  if (pathname && pathname !== '/') return null;

  return (
    <div
      className={cn(
        'fixed inset-x-0 z-40 px-4 sm:px-6 lg:px-16 pointer-events-none will-change-transform',
        'transition-[top,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0',
        compact ? 'top-14' : 'top-20',
      )}
    >
      <form
        onSubmit={handleSubmit}
        className={cn(
          'relative max-w-[1120px] mx-auto pointer-events-auto',
          'transition-[margin] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          compact ? 'mt-2' : 'mt-3',
        )}
        role="search"
        aria-label="Travel search"
      >
        <div
          className="flex flex-col sm:flex-row items-stretch rounded-full border backdrop-blur-xl shadow-lg overflow-visible"
          style={{
            backgroundColor: 'var(--color-header-search-bg)',
            borderColor: 'var(--color-header-search-border)',
            boxShadow: '0 16px 40px -12px rgba(7, 86, 184, 0.18)',
          }}
        >
          {/* ---------------- Destination ---------------- */}
          <div ref={destRef} className="relative flex-1 min-w-0">
            <div className="flex items-center gap-3 h-14 px-5 rounded-full sm:rounded-none transition-colors" style={{ backgroundColor: destOpen ? 'color-mix(in oklab, var(--color-primary) 6%, transparent)' : 'transparent' }}>
              <span
                className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                style={{ backgroundColor: 'color-mix(in oklab, var(--color-primary) 14%, transparent)' }}
              >
                <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--color-nav-active)' }} />
              </span>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[10px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: 'var(--color-header-text-muted)' }}
                >
                  Where
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setDestOpen(true);
                  }}
                  onFocus={() => setDestOpen(true)}
                  onKeyDown={handleKey}
                  placeholder="Search destinations or packages"
                  className="w-full bg-transparent border-none outline-none text-sm font-medium"
                  style={{ color: 'var(--color-header-search-text)' }}
                  aria-label="Destination"
                />
              </div>
            </div>

            {showPanel && (
              <div
                className="absolute top-full left-0 right-0 sm:left-2 sm:right-auto sm:w-[520px] mt-2 rounded-2xl border shadow-2xl overflow-hidden z-20"
                style={{
                  backgroundColor: 'var(--color-popover-bg)',
                  borderColor: 'var(--color-popover-border)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {matches.length > 0 ? (
                  <div className="max-h-[60vh] overflow-y-auto py-2">
                    {(['destination', 'category', 'package'] as CategoryKind[]).map((kind) => {
                      const items = grouped[kind];
                      if (items.length === 0) return null;
                      const heading = kind === 'destination' ? 'Destinations' : kind === 'category' ? 'Categories' : 'Top packages';
                      return (
                        <div key={kind} className="mb-1">
                          <div
                            className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-[0.2em] font-bold"
                            style={{ color: 'var(--color-header-text-muted)' }}
                          >
                            {heading}
                          </div>
                          <ul>
                            {items.map((s) => {
                              const flatPos = flatIndex.indexOf(s);
                              const active = flatPos === activeIndex;
                              const Icon = s.Icon;
                              return (
                                <li key={`${s.kind}-${s.label}`}>
                                  <button
                                    type="button"
                                    onMouseEnter={() => setActiveIndex(flatPos)}
                                    onClick={() => {
                                      pushRecent(s.label);
                                      setRecent(readRecent());
                                      setDestination(s.label);
                                      setDestOpen(false);
                                      router.push(s.href);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors"
                                    style={{
                                      color: 'var(--color-header-search-text)',
                                      backgroundColor: active
                                        ? 'color-mix(in oklab, var(--color-primary) 14%, transparent)'
                                        : 'transparent',
                                    }}
                                  >
                                    <span
                                      className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                                      style={{ backgroundColor: `${s.accent}1f` }}
                                    >
                                      <Icon className="w-3.5 h-3.5" style={{ color: s.accent }} />
                                    </span>
                                    <span className="flex-1 min-w-0">
                                      <span className="block truncate font-medium">{s.label}</span>
                                      <span
                                        className="block truncate text-[11px]"
                                        style={{ color: 'var(--color-header-text-muted)' }}
                                      >
                                        {s.hint}
                                      </span>
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-header-text-muted)' }} />
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                ) : destination.trim() ? (
                  <div className="px-4 py-5 text-sm" style={{ color: 'var(--color-header-text-muted)' }}>
                    No matches for &ldquo;{destination}&rdquo;. Press{' '}
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                      style={{
                        color: 'var(--color-nav-active)',
                        backgroundColor: 'color-mix(in oklab, var(--color-primary) 12%, transparent)',
                      }}
                    >
                      ↵
                    </span>{' '}
                    to search anyway.
                  </div>
                ) : null}

                {recent.length > 0 && (
                  <div
                    className="border-t"
                    style={{ borderColor: 'color-mix(in oklab, var(--color-header-text) 10%, transparent)' }}
                  >
                    <div
                      className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-[0.2em] font-bold"
                      style={{ color: 'var(--color-header-text-muted)' }}
                    >
                      Recent
                    </div>
                    <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                      {recent.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            setDestination(r);
                            setDestOpen(true);
                            inputRef.current?.focus();
                          }}
                          className="px-3 py-1 rounded-full text-xs transition-colors"
                          style={{
                            color: 'var(--color-header-search-text)',
                            backgroundColor: 'color-mix(in oklab, var(--color-primary) 10%, transparent)',
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {matches.length === 0 && recent.length === 0 && !destination.trim() && (
                  <div className="px-4 py-3">
                    <div
                      className="pb-2 text-[10px] uppercase tracking-[0.2em] font-bold"
                      style={{ color: 'var(--color-header-text-muted)' }}
                    >
                      Trending
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_CHIPS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setDestination(c);
                            setDestOpen(true);
                            inputRef.current?.focus();
                          }}
                          className="px-3 py-1 rounded-full text-xs transition-colors"
                          style={{
                            color: 'var(--color-header-search-text)',
                            backgroundColor: 'color-mix(in oklab, var(--color-tertiary) 12%, transparent)',
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden sm:block w-px my-3" style={{ backgroundColor: 'var(--color-header-search-border)' }} />

          {/* ---------------- Dates (custom calendar popover) ---------------- */}
          <div ref={datesRef} className="relative sm:flex-1 min-w-0">
            <button
              type="button"
              onClick={() => {
                setDatesOpen((v) => !v);
                setDestOpen(false);
              }}
              className="w-full flex items-center gap-3 h-14 px-5 text-left rounded-full sm:rounded-none transition-colors"
              style={{ backgroundColor: datesOpen ? 'color-mix(in oklab, var(--color-primary) 6%, transparent)' : 'transparent' }}
              aria-label="Travel dates"
            >
              <span
                className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                style={{ backgroundColor: 'color-mix(in oklab, var(--color-primary) 14%, transparent)' }}
              >
                <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--color-nav-active)' }} />
              </span>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[10px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: 'var(--color-header-text-muted)' }}
                >
                  When
                </div>
                <div
                  className="text-sm font-medium truncate"
                  style={{ color: dates ? 'var(--color-header-search-text)' : 'var(--color-header-search-placeholder)' }}
                >
                  {dates || 'Add dates'}
                </div>
              </div>
            </button>

            {datesOpen && (
              <div
                className="absolute top-full right-0 sm:right-auto sm:left-0 mt-2 w-[320px] rounded-2xl border shadow-2xl overflow-hidden z-20"
                style={{
                  backgroundColor: 'var(--color-popover-bg)',
                  borderColor: 'var(--color-popover-border)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3 border-b"
                  style={{ borderColor: 'color-mix(in oklab, var(--color-header-text) 10%, transparent)' }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))
                    }
                    className="w-7 h-7 rounded-full inline-flex items-center justify-center transition-colors"
                    style={{ color: 'var(--color-header-search-text)' }}
                    aria-label="Previous month"
                  >
                    ‹
                  </button>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: 'var(--color-header-search-text)' }}
                  >
                    {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))
                    }
                    className="w-7 h-7 rounded-full inline-flex items-center justify-center transition-colors"
                    style={{ color: 'var(--color-header-search-text)' }}
                    aria-label="Next month"
                  >
                    ›
                  </button>
                </div>

                <div className="grid grid-cols-7 px-3 pt-3 gap-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div
                      key={i}
                      className="text-center text-[10px] font-bold uppercase tracking-widest py-1"
                      style={{ color: 'var(--color-header-text-muted)' }}
                    >
                      {d}
                    </div>
                  ))}
                  {calendarDays.map((d, i) => {
                    if (!d) return <div key={i} />;
                    const isPast = d < today;
                    const isStart = sameDay(d, checkIn);
                    const isEnd = sameDay(d, checkOut);
                    const inR = inRange(d);
                    const accent = isStart || isEnd;
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={isPast}
                        onClick={() => {
                          if (!checkIn || (checkIn && checkOut)) {
                            setCheckIn(d);
                            setCheckOut(null);
                          } else if (d > checkIn) {
                            setCheckOut(d);
                          } else {
                            setCheckIn(d);
                            setCheckOut(null);
                          }
                        }}
                        className="h-9 rounded-lg text-xs font-semibold transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                        style={{
                          color: accent ? '#ffffff' : 'var(--color-header-search-text)',
                          backgroundColor: accent
                            ? 'var(--color-primary)'
                            : inR
                              ? 'color-mix(in oklab, var(--color-primary) 18%, transparent)'
                              : 'transparent',
                        }}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>

                <div
                  className="flex items-center justify-between px-4 py-3 border-t mt-2"
                  style={{ borderColor: 'color-mix(in oklab, var(--color-header-text) 10%, transparent)' }}
                >
                  <div className="text-[11px]" style={{ color: 'var(--color-header-text-muted)' }}>
                    {checkIn
                      ? checkOut
                        ? `${Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000)} nights`
                        : 'Pick a return date'
                      : 'Pick a check-in date'}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCheckIn(null);
                        setCheckOut(null);
                      }}
                      className="text-[11px] font-semibold px-2 py-1"
                      style={{ color: 'var(--color-header-text-muted)' }}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setDatesOpen(false)}
                      className="text-[11px] font-semibold px-3 py-1 rounded-full"
                      style={{
                        color: '#ffffff',
                        background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)',
                      }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:block w-px my-3" style={{ backgroundColor: 'var(--color-header-search-border)' }} />

          {/* ---------------- Guests (typing only, no stepper) ---------------- */}
          <div className="flex items-center gap-3 h-14 px-5 sm:flex-1 min-w-0">
            <span
              className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
              style={{ backgroundColor: 'color-mix(in oklab, var(--color-primary) 14%, transparent)' }}
            >
              <Search className="w-3.5 h-3.5" style={{ color: 'var(--color-nav-active)' }} />
            </span>
            <div className="flex-1 min-w-0">
              <div
                className="text-[10px] font-bold uppercase tracking-[0.16em]"
                style={{ color: 'var(--color-header-text-muted)' }}
              >
                Guest
              </div>
              <input
                ref={guestsRef}
                type="text"
                value={guestsText}
                onChange={(e) => setGuestsText(e.target.value)}
                onBlur={handleGuestsBlur}
                onKeyDown={handleGuestsKey}
                placeholder="Add guests and rooms"
                className="w-full bg-transparent border-none outline-none text-sm font-medium"
                style={{ color: 'var(--color-header-search-text)' }}
                aria-label="Number of guests"
              />
            </div>
          </div>

          {/* ---------------- Search button ---------------- */}
          <div className="p-2 sm:p-1.5">
            <button
              type="submit"
              className="w-full sm:w-auto h-12 sm:h-12 sm:px-7 rounded-full inline-flex items-center justify-center gap-2 font-semibold text-sm tracking-wide shadow-md transition-transform hover:scale-[1.02] active:scale-95"
              style={{
                color: 'var(--color-header-btn-text)',
                background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)',
              }}
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
