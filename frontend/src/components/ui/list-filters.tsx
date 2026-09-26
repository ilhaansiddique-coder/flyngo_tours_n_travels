'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { CustomSelect } from '@/components/ui/select';

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
  'w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-outline-variant bg-surface-container/60 text-sm text-on-surface ' +
  'transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-outline shadow-xs cursor-pointer';
const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container/60 text-sm text-on-surface ' +
  'transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-outline shadow-xs';
const labelClass = 'block text-xs font-medium text-on-surface-variant mb-1.5';

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
          <CustomSelect
            id="lf-sort"
            value={value.sort ?? ''}
            onChange={(val) => set('sort', val)}
            options={SORT_OPTIONS}
            placeholder="Recommended"
          />
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
            <CustomSelect
              id="lf-days"
              value={value.maxDuration ?? ''}
              onChange={(val) => set('maxDuration', val)}
              options={[
                { value: '', label: 'Any length' },
                { value: '3', label: 'Up to 3 days' },
                { value: '7', label: 'Up to 7 days' },
                { value: '14', label: 'Up to 14 days' },
                { value: '30', label: 'Up to 30 days' },
              ]}
              placeholder="Any length"
            />
          </div>
        )}

        {extras.includes('difficulty') && (
          <div>
            <label className={labelClass} htmlFor="lf-diff">Difficulty</label>
            <CustomSelect
              id="lf-diff"
              value={value.difficulty ?? ''}
              onChange={(val) => set('difficulty', val)}
              options={[
                { value: '', label: 'Any' },
                { value: 'easy', label: 'Easy' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'challenging', label: 'Challenging' },
              ]}
              placeholder="Any"
            />
          </div>
        )}

        {extras.includes('stars') && (
          <div>
            <label className={labelClass} htmlFor="lf-stars">Star rating</label>
            <CustomSelect
              id="lf-stars"
              value={value.minStars ?? ''}
              onChange={(val) => set('minStars', val)}
              options={[
                { value: '', label: 'Any rating' },
                { value: '3', label: '3★ and up' },
                { value: '4', label: '4★ and up' },
                { value: '5', label: '5★ only' },
              ]}
              placeholder="Any rating"
            />
          </div>
        )}

        {extras.includes('cabin') && (
          <div>
            <label className={labelClass} htmlFor="lf-cabin">Cabin class</label>
            <CustomSelect
              id="lf-cabin"
              value={value.cabinClass ?? ''}
              onChange={(val) => set('cabinClass', val)}
              options={[
                { value: '', label: 'Any class' },
                { value: 'economy', label: 'Economy' },
                { value: 'premium_economy', label: 'Premium economy' },
                { value: 'business', label: 'Business' },
                { value: 'first', label: 'First' },
              ]}
              placeholder="Any class"
            />
          </div>
        )}

        {extras.includes('vehicle') && (
          <div>
            <label className={labelClass} htmlFor="lf-vehicle">Vehicle</label>
            <CustomSelect
              id="lf-vehicle"
              value={value.vehicleType ?? ''}
              onChange={(val) => set('vehicleType', val)}
              options={[
                { value: '', label: 'Any vehicle' },
                { value: 'car', label: 'Car' },
                { value: 'microbus', label: 'Microbus' },
                { value: 'bus', label: 'Bus' },
                { value: 'shuttle', label: 'Shuttle' },
                { value: 'ferry', label: 'Ferry' },
              ]}
              placeholder="Any vehicle"
            />
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
