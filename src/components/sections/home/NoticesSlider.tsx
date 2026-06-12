'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notices } from '@/data/notices';

export function NoticesSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeNotices = notices.slice(0, 4); // Show the latest 4 notices

  useEffect(() => {
    if (activeNotices.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activeNotices.length);
    }, 5000); // Change notice every 5 seconds
    return () => clearInterval(interval);
  }, [activeNotices.length]);

  if (activeNotices.length === 0) return null;

  const currentNotice = activeNotices[currentIndex];

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'scheme':
        return 'Govt Scheme';
      case 'announcement':
        return 'Announcement';
      case 'event':
        return 'Event';
      case 'story':
        return 'Success Story';
      default:
        return 'Notice';
    }
  };

  const getCategoryClass = (category: string) => {
    switch (category) {
      case 'scheme':
        return 'bg-secondary text-on-secondary';
      case 'story':
        return 'bg-tribal-gold text-on-surface';
      default:
        return 'bg-primary text-on-primary';
    }
  };

  return (
    <div className="bg-surface border-b border-outline-variant py-2.5 relative z-40 overflow-hidden" id="notices-slider">
      <div className="max-w-[1280px] mx-auto px-5 md:px-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        {/* Label Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="animate-pulse flex h-2 w-2 rounded-full bg-primary" />
          <span className="text-label-sm font-bold text-primary tracking-wider uppercase">
            LATEST UPDATE:
          </span>
        </div>

        {/* Sliding Notice Content */}
        <div className="flex-1 overflow-hidden h-6 relative w-full">
          {activeNotices.map((notice, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                key={notice.id}
                className={`
                  absolute inset-0 flex items-center gap-2 transition-all duration-500
                  ${isActive ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}
                `}
              >
                {/* Category tag */}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${getCategoryClass(notice.category)}`}>
                  {getCategoryLabel(notice.category)}
                </span>
                
                {/* Notice text links to the notices page */}
                <Link
                  href={`/notices?id=${notice.id}`}
                  className="text-body-sm font-medium text-on-surface hover:text-primary transition-colors truncate block max-w-[90%]"
                >
                  {notice.title}
                </Link>
                <span className="text-[10px] text-on-surface-variant shrink-0 hidden md:inline">
                  ({new Date(notice.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
                </span>
              </div>
            );
          })}
        </div>

        {/* Action button */}
        <Link
          href="/notices"
          className="text-label-sm font-bold text-primary hover:text-dark-green transition-colors inline-flex items-center gap-1 shrink-0 mt-1 sm:mt-0"
          id="view-all-notices-link"
        >
          View All Board
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
