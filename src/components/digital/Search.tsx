'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { demoServices, categories } from '@/data/digital';
import { getWhatsAppLink, generateInquiryMessage } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

export function Search() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
    setActiveIndex(-1);
  }, [query]);

  const filteredServices = query.trim() === '' ? [] : demoServices.filter(service => {
    const q = query.toLowerCase();
    return (
      service.title.toLowerCase().includes(q) ||
      service.description.toLowerCase().includes(q) ||
      (service.tags && service.tags.some(tag => tag.toLowerCase().includes(q))) ||
      // Synonym mappings
      (service.id === 'pan-card' && (q.includes('pan') || q.includes('tax') || q.includes('card'))) ||
      (service.id === 'aadhaar-services' && (q.includes('aadhaar') || q.includes('aadhar') || q.includes('uid') || q.includes('card'))) ||
      (service.id === 'gst-registration' && (q.includes('gst') || q.includes('tax') || q.includes('business'))) ||
      (service.id === 'passport' && (q.includes('pass') || q.includes('visa') || q.includes('travel'))) ||
      (service.id === 'resume-creation' && (q.includes('cv') || q.includes('resume') || q.includes('biodata')))
    );
  });

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredServices.length === 0) return;

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
        router.push(`/digital/services/${selected.slug}`);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const popularSearches = ['Aadhaar', 'PAN Card', 'GST', 'Passport', 'AI Writing'];

  const handleChipClick = (search: string) => {
    setQuery(search);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const hasResults = filteredServices.length > 0;
  const showEmptyState = query.trim() !== '' && !hasResults;

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

  return (
    <div className="relative w-full text-left" ref={dropdownRef}>
      {/* Search Input Container */}
      <div className="relative group">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-primary transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          className="w-full bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-on-surface placeholder-white/60 focus:placeholder-on-surface-variant pl-12 pr-14 py-3.5 rounded-full border border-white/20 focus:border-primary shadow-lg focus:shadow-primary/15 backdrop-blur-md outline-none transition-all text-body-md"
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
              setIsOpen(false);
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
      {isOpen && query.trim() !== '' && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in max-h-[380px] overflow-y-auto backdrop-blur-md border-t border-t-primary/20">
          {hasResults && (
            <div className="py-2.5">
              <div className="px-4 py-1.5 text-label-xs font-extrabold text-primary uppercase tracking-widest border-b border-outline-variant/10 mb-1">
                Matching Catalog Services
              </div>
              <div className="divide-y divide-outline-variant/10">
                {groupedMatches.map((group) => (
                  <div key={group.category.id} className="py-1">
                    <div className="px-4 py-1 text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest select-none bg-surface-container-low/30">
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
                              onClick={() => setIsOpen(false)}
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
                                  {service.title}
                                </span>
                                <span className="block text-label-sm text-on-surface-variant truncate">
                                  {service.description}
                                </span>
                              </div>
                              <span className={cn(
                                "text-label-sm font-bold bg-tribal-gold/10 px-2 py-0.5 rounded border border-tribal-gold/25 shrink-0 transition-colors",
                                isActive ? "bg-tribal-gold text-white" : "text-tribal-gold"
                              )}>
                                {service.price}
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

          {showEmptyState && (
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-tribal-gold/10 flex items-center justify-center text-tribal-gold mx-auto">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-body-lg font-bold text-on-surface">Service Not Found</h4>
                <p className="text-body-md text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                  We are actively expanding to 500+ services. Tell us what you need and we will help you book it via WhatsApp.
                </p>
              </div>
              <a
                href={whatsappCustomLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white hover:bg-[#1ebd59] px-5 py-2.5 rounded-full text-label-md font-semibold transition-colors shadow-md cursor-pointer active:scale-[0.98]"
              >
                Inquire via WhatsApp Support Desk
              </a>
            </div>
          )}
        </div>
      )}

      {/* Suggested Quick Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4 select-none">
        <span className="text-label-sm text-white/60 mr-1">Suggested:</span>
        {popularSearches.map((term) => (
          <button
            key={term}
            onClick={() => handleChipClick(term)}
            className="text-label-xs md:text-label-sm font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-full px-3.5 py-1 cursor-pointer transition-colors"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
