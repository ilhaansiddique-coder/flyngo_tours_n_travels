'use client';

import { SlidersHorizontal, X } from 'lucide-react';

export interface ListFilterState {
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  minDuration?: string;
  maxDuration?: string;
  difficulty?: string;
  minStars?: string;
  cabinClass?: string;
  vehicleType?: string;
}

/** Which vertical-specific controls to render alongside price + sort. */
export type ListFilterExtra = 'duration' | 'difficulty' | 'stars' | 'cabin' | 'vehicle';

const SORT_OPTIONS = [
  { value: '', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'newest', label: 'Newest first' },
];

const selectClass =
  'w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container/60 text-sm text-on-surface ' +
  'transition focus:outline-none focus:ring-2 focus:ring-primary/50 hover:border-outline';
const inputClass = selectClass;
const labelClass = 'block text-xs font-medium text-on-surface-variant mb-1';

/**
 * Filter + sort bar for the public listing pages.
 *
 * Values are passed straight to the API (see ListQueryDto server-side) rather
 * than filtering in the browser, so filtering applies to the whole catalogue
 * and not just the page that happens to be loaded.
 */
export function ListFilters({
  value,
  onChange,
  extras = [],
  currency = '৳',
}: {
  value: ListFilterState;
  onChange: (next: ListFilterState) => void;
  extras?: ListFilterExtra[];
  currency?: string;
}) {
  const set = (key: keyof ListFilterState, v: string) =>
    onChange({ ...value, [key]: v || undefined });

  const active = Object.entries(value).filter(([, v]) => v).length;

  return (
    <div className="mb-6 rounded-xl border border-outline-variant bg-surface-container/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filter &amp; sort
          {active > 0 && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
              {active}
            </span>
          )}
        </div>
        {active > 0 && (
          <button
            type="button"
            onClick={() => onChange({})}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
          >
            <X className="h-3.5 w-3.5" /> Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <div>
          <label className={labelClass} htmlFor="lf-sort">Sort by</label>
          <select
            id="lf-sort"
            className={selectClass}
            value={value.sort ?? ''}
            onChange={(e) => set('sort', e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="lf-min">Min price ({currency})</label>
          <input
            id="lf-min"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="0"
            className={inputClass}
            value={value.minPrice ?? ''}
            onChange={(e) => set('minPrice', e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="lf-max">Max price ({currency})</label>
          <input
            id="lf-max"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Any"
            className={inputClass}
            value={value.maxPrice ?? ''}
            onChange={(e) => set('maxPrice', e.target.value)}
          />
        </div>

        {extras.includes('duration') && (
          <div>
            <label className={labelClass} htmlFor="lf-days">Trip length</label>
            <select
              id="lf-days"
              className={selectClass}
              value={value.maxDuration ?? ''}
              onChange={(e) => set('maxDuration', e.target.value)}
            >
              <option value="">Any length</option>
              <option value="3">Up to 3 days</option>
              <option value="7">Up to 7 days</option>
              <option value="14">Up to 14 days</option>
              <option value="30">Up to 30 days</option>
            </select>
          </div>
        )}

        {extras.includes('difficulty') && (
          <div>
            <label className={labelClass} htmlFor="lf-diff">Difficulty</label>
            <select
              id="lf-diff"
              className={selectClass}
              value={value.difficulty ?? ''}
              onChange={(e) => set('difficulty', e.target.value)}
            >
              <option value="">Any</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="challenging">Challenging</option>
            </select>
          </div>
        )}

        {extras.includes('stars') && (
          <div>
            <label className={labelClass} htmlFor="lf-stars">Star rating</label>
            <select
              id="lf-stars"
              className={selectClass}
              value={value.minStars ?? ''}
              onChange={(e) => set('minStars', e.target.value)}
            >
              <option value="">Any rating</option>
              <option value="3">3★ and up</option>
              <option value="4">4★ and up</option>
              <option value="5">5★ only</option>
            </select>
          </div>
        )}

        {extras.includes('cabin') && (
          <div>
            <label className={labelClass} htmlFor="lf-cabin">Cabin class</label>
            <select
              id="lf-cabin"
              className={selectClass}
              value={value.cabinClass ?? ''}
              onChange={(e) => set('cabinClass', e.target.value)}
            >
              <option value="">Any class</option>
              <option value="economy">Economy</option>
              <option value="premium_economy">Premium economy</option>
              <option value="business">Business</option>
              <option value="first">First</option>
            </select>
          </div>
        )}

        {extras.includes('vehicle') && (
          <div>
            <label className={labelClass} htmlFor="lf-vehicle">Vehicle</label>
            <select
              id="lf-vehicle"
              className={selectClass}
              value={value.vehicleType ?? ''}
              onChange={(e) => set('vehicleType', e.target.value)}
            >
              <option value="">Any vehicle</option>
              <option value="car">Car</option>
              <option value="microbus">Microbus</option>
              <option value="bus">Bus</option>
              <option value="shuttle">Shuttle</option>
              <option value="ferry">Ferry</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

/** Drop empty values so we never send `?minPrice=` and 400 on validation. */
export function filtersToParams(f: ListFilterState): Record<string, string> {
  return Object.fromEntries(
    Object.entries(f).filter(([, v]) => v !== undefined && v !== ''),
  ) as Record<string, string>;
}
