'use client';

import { useState } from 'react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'What is the value of one share in APC?',
    answer: 'The nominal face value of one equity share is ₹10,000. Under cooperative bylaws, this capital forms the core equity reserve of the producer company, belonging directly to the producer members.',
  },
  {
    question: 'What is the limit on shares I can subscribe to?',
    answer: 'Our current online registration supports subscribing between 1 share (₹10,000) and 10 shares (₹100,000). If you are representing a large cooperative, a village organization, or require additional shares, please contact the APC leadership team directly for custom institutional processing.',
  },
  {
    question: 'Are there annual recurring membership fees?',
    answer: 'No. Subscribing to equity shares is a one-time capital investment. Once your share allotment is approved, you remain a registered shareholder member of the Adivasi Producer Company without any recurring annual renewal charges.',
  },
  {
    question: 'How are applications processed and verified?',
    answer: 'After you submit your application details, our system routes it to the regional helpdesk. Within 24 hours, a regional block coordinator will contact you to perform field verification, verify crop/producer activity, collect physical copies of documents, and guide you through the remaining onboarding steps.',
  },
  {
    question: 'Can minor forest gatherers and handicraft artisans join?',
    answer: 'Yes. The APC welcomes all tribal producers, including traditional farmers, horticulturists, minor forest produce (MFP) collectors, dairy/animal husbandry operators, weavers, and cottage artisans living in Odisha.',
  },
];

export function MembershipFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <section className="py-16 md:py-24 bg-surface saura-pattern border-b border-outline-variant/30">
      <Container>
        <SectionHeading
          label="QUESTIONS"
          title="Shareholder Frequently Asked Questions"
          subtitle="Clear guidelines regarding equity contribution, shareholding rules, and cooperative rights."
        />

        <div className="max-w-3xl mx-auto space-y-4 pt-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white border border-outline-variant/30 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left font-extrabold text-on-surface hover:text-primary transition-colors cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-body-lg pr-4">{faq.question}</span>
                  <span className={cn(
                    "text-xl transform transition-transform duration-300 text-primary shrink-0",
                    isOpen ? "rotate-180" : ""
                  )}>
                    ▼
                  </span>
                </button>

                <div
                  className={cn(
                    "transition-all duration-300 ease-in-out overflow-hidden border-t border-outline-variant/10",
                    isOpen ? "max-h-[300px] opacity-100 p-6 bg-surface-container-lowest" : "max-h-0 opacity-0 pointer-events-none"
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
