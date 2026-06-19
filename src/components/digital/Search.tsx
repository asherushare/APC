'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { categories } from '@/data/digital';
import { getWhatsAppLink, generateInquiryMessage } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import { useServiceSearch } from '@/hooks/useServiceSearch';
import { DiscoveryAnalyticsEvent } from '@/types/digital';

export function Search() {
  const { query, setQuery, results: filteredServices, isLoading } = useServiceSearch(300);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Mock Analytics Logger for Prep Phase
  const logAnalytics = (event: Omit<DiscoveryAnalyticsEvent, 'timestamp'>) => {
    console.log('[Analytics]', { ...event, timestamp: new Date().toISOString() });
  };

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem('apc_recent_searches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setRecentSearches(parsed);
        }, 0);
      } catch {
        // ignore
      }
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const newRecent = [term, ...recentSearches.filter(t => t !== term)].slice(0, 3);
    setRecentSearches(newRecent);
    localStorage.setItem('apc_recent_searches', JSON.stringify(newRecent));
  };

  const removeRecentSearch = (term: string) => {
    const newRecent = recentSearches.filter(t => t !== term);
    setRecentSearches(newRecent);
    localStorage.setItem('apc_recent_searches', JSON.stringify(newRecent));
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut listener to focus search on '/'
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === '/' &&
        document.activeElement !== inputRef.current &&
        !(document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset active suggestion index when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveIndex(-1);
    }, 0);
    return () => clearTimeout(timer);
  }, [query]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!query && e.key === 'Enter') return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < filteredServices.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : filteredServices.length - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < filteredServices.length) {
        e.preventDefault();
        const selected = filteredServices[activeIndex];
        saveRecentSearch(query);
        logAnalytics({ eventType: 'search', query });
        router.push(`/digital/services/${selected.slug}`);
        setIsOpen(false);
      } else if (filteredServices.length > 0) {
        // If they just press enter, go to the first one or just save search
        saveRecentSearch(query);
        logAnalytics({ eventType: 'search', query });
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const popularSearches = ['Aadhaar', 'PAN Card', 'GST', 'Passport', 'AI Writing'];

  const handleChipClick = (search: string) => {
    logAnalytics({ eventType: 'click_suggestion', query: search });
    setQuery(search);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const hasResults = filteredServices.length > 0;
  const showEmptyState = query.trim() !== '' && !hasResults && !isLoading;

  useEffect(() => {
    if (showEmptyState) {
      logAnalytics({ eventType: 'zero_results', query });
    }
  }, [showEmptyState, query]);

  // Group matches by category
  const groupedMatches = categories
    .map(cat => {
      const matches = filteredServices.filter(s => s.categoryId === cat.id);
      return { category: cat, services: matches };
    })
    .filter(group => group.services.length > 0);

  // Group uncategorized matches
  const uncategorized = filteredServices.filter(
    s => !categories.some(cat => cat.id === s.categoryId)
  );
  if (uncategorized.length > 0) {
    groupedMatches.push({
      category: { id: 'uncategorized', name: 'Other Services', icon: 'certificate', sortOrder: 99 },
      services: uncategorized
    });
  }

  const whatsappCustomLink = getWhatsAppLink(generateInquiryMessage(`Hi, I'm looking for a digital service: "${query}" but couldn't find it in the search catalog. Please assist.`));

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <span key={index} className="text-tribal-gold font-black">{part}</span> 
        : part
    );
  };

  return (
    <div className="relative w-full text-left" ref={dropdownRef}>
      {/* Search Input Container */}
      <div className="relative group">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-tribal-gold transition-colors">
          {isLoading ? (
            <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
          )}
        </span>
        <input
          ref={inputRef}
          type="text"
          className="w-full bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-on-surface placeholder-white/60 focus:placeholder-on-surface-variant pl-12 pr-14 py-3.5 rounded-full border border-white/20 focus:border-tribal-gold shadow-lg focus:shadow-primary/15 backdrop-blur-md outline-none transition-all text-body-md"
          placeholder="Search Aadhaar, PAN, AI, GST, Passport..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
        />
        {query ? (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white focus:text-primary cursor-pointer"
            type="button"
            aria-label="Clear search query"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none select-none">
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-white/50 bg-white/10 border border-white/20 rounded-md">
              /
            </kbd>
          </div>
        )}
      </div>

      {/* Dropdown Suggestions Card */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in max-h-[420px] overflow-y-auto backdrop-blur-md border-t border-t-primary/20">
          
          {/* Empty Query State: Recent & Trending */}
          {!query.trim() && (
            <div className="p-4 flex flex-col gap-6">
              {recentSearches.length > 0 && (
                <div>
                  <h4 className="text-label-sm font-extrabold text-on-surface-variant uppercase tracking-widest mb-3">Recent Searches</h4>
                  <ul className="space-y-1">
                    {recentSearches.map((term) => (
                      <li key={term} className="flex items-center justify-between group rounded-lg hover:bg-surface-container-low px-3 py-2 cursor-pointer transition-colors">
                        <div 
                          className="flex items-center gap-3 flex-1"
                          onClick={() => handleChipClick(term)}
                        >
                          <svg className="w-4 h-4 text-on-surface-variant/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-body-md text-on-surface">{term}</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeRecentSearch(term); }}
                          className="text-on-surface-variant/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                          aria-label="Remove recent search"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div>
                <h4 className="text-label-sm font-extrabold text-on-surface-variant uppercase tracking-widest mb-3">Trending Right Now</h4>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleChipClick(term)}
                      className="flex items-center gap-1.5 text-label-sm font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-full px-3 py-1.5 cursor-pointer transition-colors active:scale-95"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results State */}
          {query.trim() !== '' && hasResults && (
            <div className="py-2.5">
              <div className="px-4 py-1.5 text-label-xs font-extrabold text-primary uppercase tracking-widest border-b border-outline-variant/10 mb-1 flex items-center justify-between">
                <span>Matching Catalog Services</span>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {groupedMatches.map((group) => (
                  <div key={group.category.id} className="py-1">
                    <div className="px-4 py-1.5 text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest select-none bg-surface-container-low/30">
                      {group.category.name}
                    </div>
                    <ul className="mt-0.5">
                      {group.services.map((service) => {
                        const flatIndex = filteredServices.indexOf(service);
                        const isActive = flatIndex === activeIndex;
                        return (
                          <li key={service.id}>
                            <Link
                              href={`/digital/services/${service.slug}`}
                              onClick={() => {
                                saveRecentSearch(query);
                                setIsOpen(false);
                              }}
                              className={cn(
                                "flex items-center gap-3.5 px-4 py-3 transition-all group border-l-4",
                                isActive 
                                  ? "bg-primary/5 border-primary pl-3 text-primary" 
                                  : "border-transparent hover:bg-surface-container-low"
                              )}
                            >
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-transform shrink-0",
                                isActive ? "bg-primary text-white scale-105" : "bg-primary/10 text-primary group-hover:scale-105"
                              )}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className={cn(
                                  "block text-body-md font-semibold truncate transition-colors",
                                  isActive ? "text-primary" : "text-on-surface group-hover:text-primary"
                                )}>
                                  {highlightMatch(service.title, query)}
                                </span>
                                <span className="block text-label-sm text-on-surface-variant truncate">
                                  {service.description}
                                </span>
                              </div>
                              <span className={cn(
                                "text-label-sm font-bold bg-tribal-gold/10 px-2 py-0.5 rounded border border-tribal-gold/25 shrink-0 transition-colors",
                                isActive ? "bg-tribal-gold text-white" : "text-tribal-gold"
                              )}>
                                {service.pricing?.displayPrice}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty Results State */}
          {showEmptyState && (
            <div className="p-8 text-center space-y-4 bg-surface-container-lowest">
              <div className="w-16 h-16 rounded-full bg-tribal-gold/10 flex items-center justify-center text-tribal-gold mx-auto mb-2">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-headline-sm font-black text-on-surface">No matching services</h4>
                <p className="text-body-md text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                  We couldn&apos;t find an exact match for &quot;<span className="font-bold text-on-surface">{query}</span>&quot;. 
                  Try searching by your intent (e.g. &quot;farmer&quot;, &quot;business&quot;, &quot;tax&quot;) or check out our popular services below.
                </p>
              </div>
              
              <div className="pt-4">
                <p className="text-label-xs font-extrabold text-on-surface-variant uppercase tracking-widest mb-3">Popular Intent Searches</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['farmer', 'business', 'tax', 'scholarship'].map(term => (
                    <button key={term} onClick={() => handleChipClick(term)} className="text-label-sm font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-full px-3 py-1.5 cursor-pointer transition-colors active:scale-95">
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/10">
                <a
                  href={whatsappCustomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white hover:bg-[#1ebd59] px-6 py-3 rounded-full text-label-md font-extrabold transition-all shadow-md cursor-pointer active:scale-95 uppercase tracking-wider"
                >
                  Inquire via WhatsApp Support
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
