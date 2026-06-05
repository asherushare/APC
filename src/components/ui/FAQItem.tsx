'use client';

import { useState } from 'react';
import type { FAQ } from '@/types';

interface FAQItemProps {
  faq: FAQ;
}

export function FAQItem({ faq }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-outline-variant rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-container-low transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="text-headline-sm text-on-surface pr-4">{faq.question}</span>
        <svg
          className={`w-5 h-5 text-on-surface-variant flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 text-body-md text-on-surface-variant">
          {faq.answer}
        </div>
      )}
    </div>
  );
}
