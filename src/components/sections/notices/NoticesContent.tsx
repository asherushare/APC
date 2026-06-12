'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SectionHeading } from '@/components/common/SectionHeading';
import { notices } from '@/data/notices';
import type { Notice } from '@/types';

type CategoryFilter = 'all' | 'scheme' | 'announcement' | 'story';

export function NoticesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Search and Category states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  
  // Selected notice for modal detailed view
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // Sync state with query parameters (?id=xxx or ?category=xxx)
  useEffect(() => {
    const noticeId = searchParams.get('id');
    const categoryParam = searchParams.get('category');
    
    if (noticeId) {
      const match = notices.find((n) => n.id === noticeId);
      if (match) {
        setSelectedNotice(match);
      }
    } else {
      setSelectedNotice(null);
    }

    if (categoryParam && ['scheme', 'announcement', 'story'].includes(categoryParam)) {
      setActiveCategory(categoryParam as CategoryFilter);
    }
  }, [searchParams]);

  // Handle category change
  const handleCategoryChange = (category: CategoryFilter) => {
    setActiveCategory(category);
    // Clear specific notice ID from url when changing tabs to prevent confusion
    const params = new URLSearchParams(searchParams.toString());
    params.delete('id');
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/notices?${params.toString()}`, { scroll: false });
  };

  // Open modal / set notice details
  const openNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    const params = new URLSearchParams(searchParams.toString());
    params.set('id', notice.id);
    router.push(`/notices?${params.toString()}`, { scroll: false });
  };

  // Close modal
  const closeNotice = () => {
    setSelectedNotice(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('id');
    router.push(`/notices?${params.toString()}`, { scroll: false });
  };

  // Filter notices based on search query and category
  const filteredNotices = notices.filter((notice) => {
    const matchesCategory = activeCategory === 'all' || notice.category === activeCategory;
    const matchesSearch =
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'scheme':
        return 'Government Scheme';
      case 'announcement':
        return 'APC Announcement';
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
        return 'bg-secondary/10 text-secondary border border-secondary/20';
      case 'story':
        return 'bg-tribal-gold/10 text-on-surface border border-tribal-gold/30 font-semibold';
      case 'announcement':
        return 'bg-primary/10 text-primary border border-primary/20';
      default:
        return 'bg-outline-variant/30 text-on-surface-variant';
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <SectionHeading
        label="INFORMATION BOARD"
        title="Notices & Scheme Updates"
        subtitle="Access latest announcements, verify scheme eligibility, and read success stories from our tribal producer community."
        isMainHeading={true}
      />


      {/* Filter and Search Bar Row */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-container-lowest rounded-xl p-4 shadow-tribal border border-outline-variant/30">
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {(['all', 'scheme', 'announcement', 'story'] as CategoryFilter[]).map((cat) => {
            const isActive = activeCategory === cat;
            const labels: Record<CategoryFilter, string> = {
              all: 'All Updates',
              scheme: 'Govt Schemes',
              announcement: 'Announcements',
              story: 'Success Stories',
            };
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`
                  px-4 py-2 rounded-full text-label-md transition-all font-medium cursor-pointer
                  ${isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-surface hover:bg-surface-container-low text-on-surface-variant border border-outline-variant/55'}
                `}
              >
                {labels[cat]}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search notices or schemes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-body-md"
          />
          <svg
            className="absolute left-3.5 top-3 w-4 h-4 text-outline"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Notices Grid */}
      {filteredNotices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotices.map((notice) => (
            <article
              key={notice.id}
              className="bg-surface-container-lowest border border-outline-variant/35 rounded-2xl p-6 flex flex-col justify-between hover:shadow-tribal-hover hover:-translate-y-1 transition-all duration-300"
            >
              <div className="space-y-3">
                {/* Header row: Badge + Date */}
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${getCategoryClass(notice.category)}`}>
                    {getCategoryLabel(notice.category)}
                  </span>
                  <span className="text-label-sm text-on-surface-variant flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    {new Date(notice.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-headline-sm text-on-surface line-clamp-2 leading-snug font-bold">
                  {notice.title}
                </h3>

                {/* Summary */}
                <p className="text-body-md text-on-surface-variant line-clamp-3 leading-relaxed">
                  {notice.summary}
                </p>
              </div>

              {/* Action buttons row */}
              <div className="flex items-center gap-3 pt-6 mt-4 border-t border-outline-variant/20">
                <button
                  onClick={() => openNotice(notice)}
                  className="flex-1 text-center bg-primary hover:bg-dark-green text-white py-2 rounded-lg text-label-md font-semibold transition-colors cursor-pointer"
                >
                  Read Details
                </button>
                {notice.pdfUrl && (
                  <a
                    href={notice.pdfUrl}
                    download
                    className="p-2 border border-outline-variant hover:bg-surface-container-low text-primary rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                    title="Download document / form"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl py-16 text-center space-y-3">
          <svg className="w-12 h-12 text-outline mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-body-lg text-on-surface font-semibold">No updates found</p>
          <p className="text-body-md text-on-surface-variant">Try refining your search terms or choosing a different category.</p>
        </div>
      )}

      {/* Details Modal overlay */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div
            className="bg-surface-container-lowest max-w-2xl w-full max-h-[85vh] rounded-2xl overflow-y-auto border border-outline-variant shadow-2xl relative flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Sticky Header */}
            <div className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant/30 px-6 py-4 flex items-center justify-between z-10">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${getCategoryClass(selectedNotice.category)}`}>
                {getCategoryLabel(selectedNotice.category)}
              </span>
              <button
                onClick={closeNotice}
                className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
                aria-label="Close details"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <span className="text-label-md text-on-surface-variant block">
                Posted on {new Date(selectedNotice.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>

              <h2 className="text-headline-md font-bold text-on-surface leading-tight">
                {selectedNotice.title}
              </h2>

              <p className="text-body-lg font-medium text-on-surface-variant leading-relaxed italic border-l-4 border-primary/50 pl-4 bg-surface-container-low/40 py-2 rounded-r-md">
                {selectedNotice.summary}
              </p>

              {selectedNotice.imageUrl && (
                <div className="relative rounded-xl overflow-hidden aspect-video w-full border border-outline-variant/30 shadow-sm">
                  <img
                    src={selectedNotice.imageUrl}
                    alt={selectedNotice.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="text-body-md text-on-surface leading-relaxed space-y-4 pt-2 whitespace-pre-line">
                {selectedNotice.content}
              </div>

            </div>

            {/* Modal Footer */}
            {selectedNotice.pdfUrl && (
              <div className="p-6 border-t border-outline-variant/30 bg-surface-container-low/40 flex justify-end">
                <a
                  href={selectedNotice.pdfUrl}
                  download
                  className="bg-primary hover:bg-dark-green text-white px-5 py-2.5 rounded-lg text-label-md font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download Guide / Official Document (PDF)
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
