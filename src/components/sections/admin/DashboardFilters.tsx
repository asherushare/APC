'use client';

import React, { useState, useEffect } from 'react';

// Standard blocks in the target district
const DISTRICT_BLOCKS = [
  'Rayagada',
  'Muniguda',
  'Bisam Cuttack',
  'Gunupur',
  'Kalyansingpur',
  'Chandrapur',
  'Gudari',
  'Padmapur',
  'Ramanaguda',
  'Kolnara'
];

interface DashboardFiltersProps {
  role: 'ADMIN' | 'COORDINATOR' | 'STAFF';
  initialBlock?: string;
  onFiltersChange: (filters: { search: string; status: string; block: string }) => void;
}

export function DashboardFilters({
  role,
  initialBlock = '',
  onFiltersChange
}: DashboardFiltersProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [block, setBlock] = useState(initialBlock);

  // Debounce search query changes by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      onFiltersChange({ search: search.trim(), status, block });
    }, 300);

    return () => clearTimeout(handler);
  }, [search, status, block, onFiltersChange]);

  const selectStyles = 'rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all select-none';

  return (
    <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
      {/* Search Input field */}
      <div className="flex-1 relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm">🔍</span>
        <input
          type="text"
          className="w-full rounded-xl border border-outline-variant bg-white pl-10 pr-4 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
          placeholder="Search by Name, Application ID, Mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Select Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Dropdown */}
        <select
          className={selectStyles}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="DOCUMENTS_PENDING">Documents Pending</option>
          <option value="PAYMENT_PENDING">Payment Pending</option>
          <option value="PAYMENT_CONFIRMED">Payment Confirmed</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        {/* Block Dropdown (Only visible to Admin role) */}
        {role === 'ADMIN' ? (
          <select
            className={selectStyles}
            value={block}
            onChange={(e) => setBlock(e.target.value)}
          >
            <option value="">All Blocks</option>
            {DISTRICT_BLOCKS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        ) : block ? (
          <div className="bg-primary/10 text-primary border border-primary/20 text-body-xs font-extrabold uppercase px-4 py-2.5 rounded-xl select-none">
            Block: {block}
          </div>
        ) : null}
      </div>
    </div>
  );
}
