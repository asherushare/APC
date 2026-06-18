'use client';

import { useState } from 'react';
import { Container } from '@/components/common/Container';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items?: FAQItem[];
}

export function FAQ({ items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const defaultFaqs: FAQItem[] = [
    {
      question: 'How do I submit my documents to APC Digital?',
      answer: 'After you submit a booking request, our agent will contact you on WhatsApp to collect digital scans or photos of the required documents. In later phases, you will be able to upload documents securely on this portal directly.'
    },
    {
      question: 'What are the processing charges?',
      answer: 'We charge a flat service fee as listed on each service page. Any mandatory government fee is listed transparently. There are no hidden or extra charges.'
    },
    {
      question: 'How will I receive the processed certificates/documents?',
      answer: 'Once completed by government or technical staff, soft copies will be sent to your WhatsApp/email, and hard copies can be collected from your nearest local block APC Center.'
    },
    {
      question: 'Is my data secure with APC?',
      answer: 'Yes. Data security is our top priority. All submitted documents and personal details are handled confidentially and are deleted from local systems immediately after government verification.'
    }
  ];

  const faqs = items || defaultFaqs;

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 bg-surface">
      <Container className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-headline-md font-bold text-on-surface">Frequently Asked Questions</h2>
          <p className="text-body-md text-on-surface-variant mt-2">
            Answers to common questions about booking, payments, and document security.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleAccordion(i)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between text-body-lg font-bold text-on-surface hover:text-primary transition-colors cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <svg
                    className={cn("w-5 h-5 shrink-0 text-on-surface-variant transition-transform duration-300", isOpen && "rotate-180 text-primary")}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div
                  className={cn(
                    "transition-all duration-300 ease-in-out max-h-0 opacity-0 overflow-hidden px-6",
                    isOpen && "max-h-[300px] opacity-100 pb-5 pt-1 border-t border-outline-variant/10"
                  )}
                >
                  <p className="text-body-md text-on-surface-variant leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
