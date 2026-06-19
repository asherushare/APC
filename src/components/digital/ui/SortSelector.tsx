'use client';

import { SortOption } from '@/hooks/useServiceDiscovery';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect, useCallback } from 'react';

interface SortSelectorProps {
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  className?: string;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'recently-added', label: 'Recently Added' },
  { value: 'alphabetical', label: 'Alphabetical (A-Z)' },
  { value: 'price-low-to-high', label: 'Price: Low to High' },
  { value: 'processing-time', label: 'Processing Time: Fastest' }
];

export function SortSelector({ sortBy, setSortBy, className }: SortSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When dropdown opens, focus the currently active item
  useEffect(() => {
    if (isOpen) {
      const activeIdx = sortOptions.findIndex(o => o.value === sortBy);
      setTimeout(() => {
        setFocusedIndex(activeIdx >= 0 ? activeIdx : 0);
      }, 0);
    }
  }, [isOpen, sortBy]);

  // Move DOM focus to whichever item is focused
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, sortOptions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  }, [isOpen]);

  const activeLabel = sortOptions.find(o => o.value === sortBy)?.label || 'Sort By';

  return (
    <div className={cn("relative z-20", className)} ref={dropdownRef} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center justify-between gap-3 bg-surface-container-low border border-outline-variant/60 py-3 px-5 rounded-xl text-label-md font-bold text-on-surface hover:text-primary hover:border-primary/40 active:scale-95 transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary min-w-[200px]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Sort by: ${activeLabel}`}
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
          </svg>
          {activeLabel}
        </span>
        <svg className={cn("w-4 h-4 transition-transform", isOpen ? "rotate-180" : "")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <ul 
          className="absolute right-0 top-full mt-2 w-full min-w-[220px] bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl overflow-hidden py-2 animate-fade-in"
          role="listbox"
          aria-label="Sort options"
        >
          {sortOptions.map((option, idx) => (
            <li key={option.value}>
              <button
                ref={el => { itemRefs.current[idx] = el; }}
                onClick={() => {
                  setSortBy(option.value);
                  setIsOpen(false);
                  buttonRef.current?.focus();
                }}
                className={cn(
                  "w-full text-left px-5 py-2.5 text-label-md transition-colors flex items-center justify-between group focus:outline-none focus-visible:bg-primary/5",
                  sortBy === option.value 
                    ? "bg-primary/5 text-primary font-extrabold" 
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                )}
                role="option"
                aria-selected={sortBy === option.value}
              >
                {option.label}
                {sortBy === option.value && (
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
