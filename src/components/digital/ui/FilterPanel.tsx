'use client';

import { FilterState } from '@/hooks/useServiceDiscovery';
import { categories } from '@/data/digital';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  filters: FilterState;
  toggleFilter: (category: keyof FilterState, value: string) => void;
  clearFilters: () => void;
  className?: string;
}

export function FilterPanel({ filters, toggleFilter, clearFilters, className }: FilterPanelProps) {
  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  return (
    <div className={cn("bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-headline-sm font-black text-on-surface flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-label-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Categories */}
        <fieldset>
          <legend className="text-label-md font-extrabold text-on-surface mb-3 uppercase tracking-wider">Categories</legend>
          <div className="space-y-2">
            {categories.map(cat => (
              <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 border-2 border-outline-variant rounded hover:border-primary checked:bg-primary checked:border-primary transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                    checked={filters.categories.includes(cat.id)}
                    onChange={() => toggleFilter('categories', cat.id)}
                  />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">{cat.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <hr className="border-outline-variant/30" />

        {/* Price Range */}
        <fieldset>
          <legend className="text-label-md font-extrabold text-on-surface mb-3 uppercase tracking-wider">Pricing</legend>
          <div className="space-y-2">
            {[
              { id: 'free', label: 'Free Services' },
              { id: 'under-100', label: 'Under ₹100' },
              { id: '100-500', label: '₹100 - ₹500' },
              { id: 'over-500', label: 'Over ₹500' }
            ].map(range => (
              <label key={range.id} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 border-2 border-outline-variant rounded hover:border-primary checked:bg-primary checked:border-primary transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                    checked={filters.priceRanges.includes(range.id)}
                    onChange={() => toggleFilter('priceRanges', range.id)}
                  />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">{range.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <hr className="border-outline-variant/30" />

        {/* Processing Time */}
        <fieldset>
          <legend className="text-label-md font-extrabold text-on-surface mb-3 uppercase tracking-wider">Processing Time</legend>
          <div className="space-y-2">
            {[
              { id: 'fastest', label: 'Fastest (≤ 5 Days)' },
              { id: 'standard', label: 'Standard (> 5 Days)' }
            ].map(time => (
              <label key={time.id} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 border-2 border-outline-variant rounded hover:border-primary checked:bg-primary checked:border-primary transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                    checked={filters.processingTimes.includes(time.id)}
                    onChange={() => toggleFilter('processingTimes', time.id)}
                  />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">{time.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

      </div>
    </div>
  );
}
