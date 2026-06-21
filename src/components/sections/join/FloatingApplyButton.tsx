'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function FloatingApplyButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <a
      href="#register"
      className={cn(
        "fixed bottom-6 left-6 z-[9999] bg-tribal-gold text-on-surface hover:brightness-105 active:scale-95 font-extrabold px-6 py-3.5 rounded-full shadow-2xl transition-all duration-300 transform flex items-center gap-2 select-none cursor-pointer text-label-md uppercase tracking-wider",
        isVisible 
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" 
          : "opacity-0 translate-y-8 scale-90 pointer-events-none"
      )}
      style={{
        boxShadow: '0 10px 25px -5px rgba(212, 160, 23, 0.4), 0 8px 10px -6px rgba(212, 160, 23, 0.4)'
      }}
    >
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
      <span>Apply Now</span>
    </a>
  );
}
