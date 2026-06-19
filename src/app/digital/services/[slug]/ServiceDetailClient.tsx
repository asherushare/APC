'use client';

import { useEffect, useState } from 'react';
import { Container } from '@/components/common/Container';
import { DigitalService } from '@/types/digital';
import { Booking } from '@/components/digital/Booking';
import { FAQ } from '@/components/digital/FAQ';
import { getWhatsAppLink, generateSupportMessage } from '@/lib/whatsapp';
import { ServiceIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { StatusBadge } from '@/components/digital/ui/StatusBadge';
import { TimelineStep } from '@/components/digital/ui/TimelineStep';
import { DocumentCard } from '@/components/digital/ui/DocumentCard';
import { ServiceCarousel } from '@/components/digital/ui/ServiceCarousel';
import { getAllServices } from '@/data/digital/services';
import { getRecommendedServices } from '@/lib/recommendations';

interface ClientProps {
  service: DigitalService;
  categoryName: string;
}

export default function ServiceDetailClient({ service, categoryName }: ClientProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const relatedServices = getRecommendedServices(service, getAllServices(), 6);
  useEffect(() => {
    try {
      const rawHistory = localStorage.getItem('apc_recent_services');
      let history: string[] = rawHistory ? JSON.parse(rawHistory) : [];
      
      // Remove current slug if it already exists, then push to the front
      history = history.filter(slug => slug !== service.slug);
      history.unshift(service.slug);
      
      // Capped at 4 items
      if (history.length > 4) {
        history = history.slice(0, 4);
      }
      
      localStorage.setItem('apc_recent_services', JSON.stringify(history));
    } catch (e) {
      console.warn('LocalStorage failed to log history:', e);
    }
  }, [service.slug]);



  const isComingSoon = service.status === 'coming-soon';
  const isUnavailable = service.status === 'temporarily-unavailable';
  const supportLink = getWhatsAppLink(generateSupportMessage(service.title));

  return (
    <>
      {/* Service Header Banner */}
      <section className="bg-surface-container-low border-b border-outline-variant/30 py-12 md:py-16">
        <Container>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-label-sm font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                  {categoryName}
                </span>
                <StatusBadge status={service.status} />
              </div>
              <h1 className="text-display-mobile md:text-headline-lg font-extrabold text-on-surface">
                {service.title}
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                {service.description}
              </p>
            </div>

            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 self-start md:self-auto shadow-md">
              <ServiceIcon name={service.icon} />
            </div>
          </div>
        </Container>
      </section>

      {/* Details Sections */}
      <section className="py-12 bg-surface">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column (Main content) */}
            <div className="lg:col-span-2 space-y-8 pb-16 md:pb-0">
              {/* Documents Card */}
              <div className="bg-surface-container-low rounded-2xl border border-outline-variant/30 p-6 space-y-4 shadow-sm">
                <h3 className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Required Documents Checklist
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  Prepare the following verification files. Our agent will verify these via WhatsApp:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 select-none">
                  {service.requiredDocuments.map((doc, idx) => (
                    <li key={idx}>
                      <DocumentCard title={doc.title} mandatory={true} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Processing Timeline */}
              <div className="space-y-4">
                <h3 className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Processing Milestone Path
                </h3>
                <div className="pt-2 pl-2">
                  <TimelineStep
                    stepNumber={1}
                    title="Submit Booking"
                    description="Complete our dynamic booking drawer form. Submitting will compile details and open WhatsApp."
                    isActive={true}
                  />
                  <TimelineStep
                    stepNumber={2}
                    title="Document Handover"
                    description="Our block verification agent contacts you to collect documents and details before submission."
                  />
                  <TimelineStep
                    stepNumber={3}
                    title="Processing Status"
                    description={`We process your request through official state channels. Estimated time is ${service.processingTime}.`}
                  />
                  <TimelineStep
                    stepNumber={4}
                    title="Secure Delivery"
                    description="Digital copies are sent instantly online. Physical certificates can be collected at the local APC branch."
                    isLast={true}
                  />
                </div>
              </div>

              {/* FAQs Accordion */}
              {service.faqs && service.faqs.length > 0 && (
                <div className="pt-4 border-t border-outline-variant/30">
                  <FAQ items={service.faqs} />
                </div>
              )}
            </div>

            {/* Right Column (Sticky Checkout widget) */}
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 shadow-xl space-y-5 shadow-primary/5 hover:border-primary/20 transition-all duration-300">
                <div className="space-y-1">
                  <span className="text-label-xs uppercase font-extrabold tracking-wider text-on-surface-variant">Flat Processing Fee</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[36px] font-black text-primary leading-none">{service.pricing?.displayPrice}</span>
                    <span className="text-body-sm text-on-surface-variant font-medium">(All-inclusive)</span>
                  </div>
                </div>

                <div className="border-t border-outline-variant/20 pt-4 space-y-3.5 text-body-sm text-on-surface-variant font-medium select-none">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-on-surface-variant/80">⏱️ Processing Speed:</span>
                    <span className="font-extrabold text-on-surface">{service.processingTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-on-surface-variant/80">📁 Required Files:</span>
                    <span className="font-extrabold text-on-surface">{service.requiredDocuments.length} Documents</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-on-surface-variant/80">⚡ Service Mode:</span>
                    <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Assisted Online</span>
                  </div>
                </div>

                <div className="border-t border-outline-variant/20 pt-4 space-y-3">
                  <button
                    onClick={() => setIsBookingOpen(true)}
                    disabled={isComingSoon || isUnavailable}
                    className={cn(
                      "w-full text-center bg-primary hover:bg-dark-green text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-body-sm uppercase tracking-wider select-none",
                      (isComingSoon || isUnavailable) && "bg-slate-200 text-slate-400 cursor-not-allowed hover:bg-slate-200 active:scale-100 shadow-none"
                    )}
                  >
                    Book This Service
                  </button>

                  <a
                    href={supportLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center border border-[#25D366] hover:bg-[#25D366]/5 text-on-surface font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-body-md cursor-pointer select-none"
                  >
                    <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp Helpline
                  </a>
                </div>
              </div>

              <Link
                href="/digital"
                className="inline-flex items-center gap-1.5 text-primary hover:text-dark-green font-bold text-label-md transition-colors cursor-pointer select-none"
              >
                ← Back to APC Digital Hub
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <section className="py-12 bg-surface-container-low border-t border-outline-variant/30">
          <Container>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-headline-sm font-bold text-on-surface">Frequently Booked Together</h3>
                <p className="text-body-sm text-on-surface-variant mt-1">Explore other services in the {categoryName} category.</p>
              </div>
              <Link href="/digital" className="text-primary hover:text-dark-green font-bold text-label-md transition-colors hidden sm:block">
                View All →
              </Link>
            </div>
            <div className="-mx-2">
              <ServiceCarousel services={relatedServices} onBookClick={() => setIsBookingOpen(true)} />
            </div>
          </Container>
        </section>
      )}


    {/* Mobile Sticky Action Bar */}
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant/30 p-4 z-40 flex items-center justify-between shadow-2xl">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Cost:</span>
        <span className="text-body-lg font-extrabold text-primary leading-none">{service.pricing?.displayPrice}</span>
      </div>
      <div className="flex gap-2 w-2/3 max-w-[280px]">
        <button
          onClick={() => setIsBookingOpen(true)}
          disabled={isComingSoon || isUnavailable}
          className={cn(
            "flex-1 text-center bg-primary hover:bg-dark-green text-white font-bold py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer text-label-md select-none",
            (isComingSoon || isUnavailable) && "bg-slate-200 text-slate-400 cursor-not-allowed hover:bg-slate-200 active:scale-100 shadow-none"
          )}
        >
          Book Now
        </button>
        <a
          href={supportLink}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-[#25D366] text-on-surface p-2.5 rounded-xl hover:bg-[#25D366]/5 transition-all cursor-pointer flex items-center justify-center"
          aria-label="WhatsApp helpline support"
        >
          <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>
    </div>

    {/* Booking Form Drawer Modal */}
    <Booking service={isBookingOpen ? service : null} onClose={() => setIsBookingOpen(false)} />
  </>
  );
}
