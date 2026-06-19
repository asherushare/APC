import { useState, useMemo } from 'react';
import { DigitalService } from '@/types/digital';

export type SortOption = 'popular' | 'recently-added' | 'alphabetical' | 'price-low-to-high' | 'processing-time';

export interface FilterState {
  categories: string[];
  status: string[];
  priceRanges: string[]; // 'free', 'under-100', '100-500', 'over-500'
  processingTimes: string[]; // 'fastest', 'standard'
  tags: string[]; // 'featured', 'popular'
}

export function useServiceDiscovery(initialServices: DigitalService[]) {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    status: [],
    priceRanges: [],
    processingTimes: [],
    tags: []
  });
  
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  const filteredAndSortedServices = useMemo(() => {
    let result = [...initialServices];

    // 1. Apply Filters
    if (filters.categories.length > 0) {
      result = result.filter(s => filters.categories.includes(s.categoryId));
    }
    if (filters.status.length > 0) {
      result = result.filter(s => filters.status.includes(s.status));
    }
    if (filters.tags.includes('featured')) {
      result = result.filter(s => s.featured);
    }
    if (filters.tags.includes('popular')) {
      result = result.filter(s => s.popular);
    }
    if (filters.priceRanges.length > 0) {
      result = result.filter(s => {
        const price = s.pricing?.total || 0;
        return filters.priceRanges.some(range => {
          if (range === 'free') return price === 0;
          if (range === 'under-100') return price > 0 && price < 100;
          if (range === '100-500') return price >= 100 && price <= 500;
          if (range === 'over-500') return price > 500;
          return false;
        });
      });
    }
    if (filters.processingTimes.length > 0) {
       result = result.filter(s => {
          const match = s.processingTime.match(/\d+/);
          const days = match ? parseInt(match[0], 10) : 99;
          const isFastest = days <= 5;
          return filters.processingTimes.some(pt => {
            if (pt === 'fastest') return isFastest;
            if (pt === 'standard') return !isFastest;
            return false;
          });
       });
    }

    // 2. Apply Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          return 0;
        case 'recently-added':
          return new Date(b.dateAdded || '2000-01-01').getTime() - new Date(a.dateAdded || '2000-01-01').getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'price-low-to-high':
          return (a.pricing?.total || 0) - (b.pricing?.total || 0);
        case 'processing-time': {
          const aDays = parseInt(a.processingTime.match(/\d+/)?.[0] || '99', 10);
          const bDays = parseInt(b.processingTime.match(/\d+/)?.[0] || '99', 10);
          return aDays - bDays;
        }
        default:
          return 0;
      }
    });

    return result;
  }, [initialServices, filters, sortBy]);

  const toggleFilter = (category: keyof FilterState, value: string) => {
    setFilters(prev => {
      const current = prev[category] as string[];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      status: [],
      priceRanges: [],
      processingTimes: [],
      tags: []
    });
  };

  return {
    filters,
    setFilters,
    toggleFilter,
    clearFilters,
    sortBy,
    setSortBy,
    filteredAndSortedServices
  };
}
