'use client';

import { DigitalService } from '@/types/digital';
import { ServiceCard } from '../ServiceCard';
import { useRef } from 'react';

interface ServiceCarouselProps {
  services: DigitalService[];
  onBookClick: (service: DigitalService) => void;
}

export function ServiceCarousel({ services, onBookClick }: ServiceCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!services || services.length === 0) return null;

  return (
    <div className="relative group">
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-6 pt-2 px-2 -mx-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {services.map(service => (
          <div key={service.id} className="min-w-[300px] sm:min-w-[340px] max-w-[350px] snap-start shrink-0">
            <ServiceCard service={service} onBookClick={onBookClick} />
          </div>
        ))}
      </div>
      
      {/* Navigation Buttons (Desktop mostly) */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-surface border border-outline-variant/30 rounded-full shadow-lg flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hidden md:flex hover:scale-105"
        aria-label="Scroll left"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-surface border border-outline-variant/30 rounded-full shadow-lg flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hidden md:flex hover:scale-105"
        aria-label="Scroll right"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
