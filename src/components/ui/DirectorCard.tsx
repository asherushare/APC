'use client';

import { useState } from 'react';
import type { Director } from '@/types';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface DirectorCardProps {
  director: Director;
  variant?: 'founder' | 'board' | 'placeholder';
}

export function DirectorCard({ director, variant = 'board' }: DirectorCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Founder spotlight — large horizontal card
  if (variant === 'founder') {
    return (
      <>
        <article className="bg-surface-container-lowest rounded-xl shadow-tribal p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center">
          {/* Photo */}
          <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-primary/20 flex-shrink-0">
            {director.image ? (
              <Image
                src={director.image}
                alt={director.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <span className="text-4xl font-bold text-primary">
                  {director.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-center md:text-left space-y-4">
            <div>
              <h3 className="text-headline-md text-on-surface">{director.name}</h3>
              <p className="text-label-md text-on-surface-variant">
                {director.role}, {director.location}
              </p>
            </div>
            {director.quote && (
              <div className="space-y-4">
                <blockquote className="text-body-md text-on-surface-variant italic border-l-4 border-tribal-gold pl-4">
                  &ldquo;{director.quote}&rdquo;
                </blockquote>
                <div className="pt-2">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-primary hover:text-dark-green font-semibold text-label-md transition-colors cursor-pointer"
                  >
                    Read Full Message
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Modal Overlay */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div
              className="bg-surface-container-lowest max-w-2xl w-full max-h-[85vh] rounded-2xl overflow-y-auto border border-outline-variant shadow-2xl relative flex flex-col animate-fade-in"
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant/30 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="font-bold text-headline-sm text-primary">Founder's Message</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
                  aria-label="Close message"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 text-body-md text-on-surface leading-relaxed">
                <p className="font-bold text-headline-sm text-on-surface">
                  Dear Members, Shareholders, Customers, Partners, and Well-Wishers,
                </p>
                <p>I warmly welcome you to Adivasi Producer Company (APC).</p>
                <p>
                  APC was established with a vision to empower tribal communities, farmers, youth, women, entrepreneurs, and rural citizens through sustainable business opportunities, digital services, skill development, and social progress. Our mission is to create a strong, self-reliant, and prosperous society by connecting people with modern technology, markets, information, and economic opportunities.
                </p>
                <p>
                  Through APC Digital, we aim to provide affordable internet-based services, e-commerce opportunities, business consultancy, government scheme assistance, financial awareness, digital literacy, and employment-generating initiatives at the village level. We believe that every individual deserves equal access to growth, knowledge, and development.
                </p>
                <p>
                  Transparency, accountability, innovation, and community participation are the core values of APC. As a Producer Company, we are committed to working for the collective benefit of our shareholders, members, customers, and society.
                </p>
                <p>
                  I invite all stakeholders to join hands with APC and contribute towards building a stronger, digitally empowered, and economically vibrant future for our communities.
                </p>
                <p>
                  Together, we can transform challenges into opportunities and create lasting positive change.
                </p>
                <p className="font-semibold italic text-primary pt-2">
                  &ldquo;Educate - Employ - Empower.&rdquo;
                </p>
                
                <div className="pt-4 border-t border-outline-variant/30 flex flex-col text-sm text-on-surface-variant">
                  <span className="font-bold text-on-surface">Bijaya Kumar Mellaka</span>
                  <span>Founder</span>
                  <span className="font-medium text-primary">Adivasi Producer Company (APC)</span>
                  <span>Odisha, India</span>
                  <span className="mt-2">Website: <a href="https://apcodisha.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">APC Digital</a></span>
                  <span>Email: <a href="mailto:adivasiproducercompany@gmail.com" className="text-primary hover:underline font-semibold">adivasiproducercompany@gmail.com</a></span>
                  <span>Phone: <a href="tel:+919348747578" className="text-primary hover:underline font-semibold">+91 9348747578</a></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Board member — compact card with circular image
  return (
    <article
      className={cn(
        'bg-surface-container-lowest border border-primary/10 rounded-2xl shadow-tribal p-5 flex items-center gap-4 hover:-translate-y-1.5 hover:shadow-tribal-hover transition-all duration-300',
        variant === 'placeholder' && 'border-2 border-dashed border-outline-variant'
      )}
    >
      {/* Circular Photo */}
      <div className="w-14 h-14 rounded-full overflow-hidden bg-primary/10 flex-shrink-0 flex items-center justify-center">
        {director.image && variant !== 'placeholder' ? (
          <Image
            src={director.image}
            alt={director.name}
            width={56}
            height={56}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-xl font-bold text-primary/40">
            {director.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Info */}
      <div>
        <h4 className="text-headline-sm text-on-surface text-sm font-semibold">
          {director.name}
        </h4>
        <p className="text-label-sm text-on-surface-variant">
          {director.role}, {director.location}
        </p>
      </div>
    </article>
  );
}
