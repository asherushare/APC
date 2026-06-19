'use client';

import Link from 'next/link';
import { ServiceIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { DigitalService } from '@/types/digital';
import { categories } from '@/data/digital';
import { StatusBadge } from './ui/StatusBadge';

interface ServiceCardProps {
  service: DigitalService;
  onBookClick: (service: DigitalService) => void;
}

export function ServiceCard({ service, onBookClick }: ServiceCardProps) {
  const category = categories.find((c) => c.id === service.categoryId);



  const isComingSoon = service.status === 'coming-soon';
  const isUnavailable = service.status === 'temporarily-unavailable';

  return (
    <article
      className={cn(
        "group bg-white/80 backdrop-blur-md border border-outline-variant/40 rounded-2xl p-6 flex flex-col hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 duration-300 transition-all shadow-sm",
        service.featured && "border-t-4 border-t-tribal-gold border-x-outline-variant/30 border-b-outline-variant/30 shadow-primary/5 shadow-md"
      )}
    >
      {/* Category & Status */}
      <div className="flex items-center justify-between mb-4 select-none">
        <span className="text-label-xs font-extrabold text-primary uppercase tracking-widest bg-primary/5 px-2.5 py-0.5 rounded-md border border-primary/10">
          {category ? category.name : 'Service'}
        </span>
        <StatusBadge status={service.status} />
      </div>

      {/* Title & Icon */}
      <div className="flex items-start gap-3.5 mb-3.5">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/20">
          <ServiceIcon name={service.icon} />
        </div>
        <h3 className="text-body-lg font-black text-on-surface leading-snug tracking-tight">
          {service.title}
        </h3>
      </div>

      {/* Description */}
      <p className="text-body-sm text-on-surface-variant flex-1 mb-4 leading-relaxed line-clamp-3">
        {service.description}
      </p>

      {/* Metadata strip */}
      <div className="border-t border-b border-outline-variant/20 py-3 mb-5 flex flex-col gap-2 select-none">
        <div className="flex justify-between items-center text-label-xs text-on-surface-variant">
          <span className="flex items-center gap-1.5 font-medium">
            <svg className="w-3.5 h-3.5 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Est. Time:
          </span>
          <span className="font-extrabold text-on-surface">{service.processingTime}</span>
        </div>
        <div className="flex justify-between items-center text-label-xs text-on-surface-variant">
          <span className="flex items-center gap-1.5 font-medium">
            <svg className="w-3.5 h-3.5 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Required Docs:
          </span>
          <span className="font-extrabold text-on-surface">{service.requiredDocuments.length} documents</span>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex items-center justify-between mt-auto gap-3.5">
        <div className="flex flex-col bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10 select-none shrink-0 min-w-[80px]">
          <span className="text-[9px] uppercase font-black tracking-widest text-primary/80 leading-none">Flat Fee</span>
          <span className="text-body-md font-black text-primary mt-1.5 leading-none">{service.pricing?.displayPrice}</span>
        </div>
        <div className="flex gap-2 flex-1">
          <Link
            href={`/digital/services/${service.slug}`}
            className="flex-1 text-center border border-outline-variant hover:border-primary/50 text-on-surface-variant hover:text-primary active:scale-[0.98] rounded-xl py-2.5 text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer bg-white"
          >
            Details
          </Link>
          <button
            onClick={() => onBookClick(service)}
            disabled={isComingSoon || isUnavailable}
            className={cn(
              "flex-1 text-center bg-primary hover:bg-dark-green text-white active:scale-[0.98] rounded-xl py-2.5 text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-md select-none group-hover:shadow-lg relative overflow-hidden",
              (isComingSoon || isUnavailable) && "bg-slate-200 border-slate-200 text-slate-400 hover:bg-slate-200 cursor-not-allowed active:scale-100 shadow-none group-hover:shadow-none"
            )}
          >
            {/* Shimmer effect on hover */}
            {!isComingSoon && !isUnavailable && (
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            )}
            Book
          </button>
        </div>
      </div>
    </article>
  );
}
