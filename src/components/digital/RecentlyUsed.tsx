'use client';

import { useEffect, useState } from 'react';
import { Container } from '@/components/common/Container';
import { DigitalService } from '@/types/digital';
import { ServiceIcon } from '@/lib/icons';
import { demoServices } from '@/data/digital';
import Link from 'next/link';

export function RecentlyUsed() {
  const [recentServices, setRecentServices] = useState<DigitalService[]>([]);

  // Load recently viewed services from localStorage on mount
  useEffect(() => {
    try {
      const rawHistory = localStorage.getItem('apc_recent_services');
      if (rawHistory) {
        const slugs: string[] = JSON.parse(rawHistory);
        // Map slugs back to their full service records from the database
        const mapped = slugs
          .map(slug => demoServices.find(s => s.slug === slug))
          .filter((s): s is DigitalService => !!s);
        setRecentServices(mapped);
      }
    } catch (e) {
      console.warn('Failed to load recent services from localStorage:', e);
    }
  }, []);

  if (recentServices.length === 0) {
    return (
      <section className="py-6 bg-surface-container-low/30 border-b border-outline-variant/20 select-none">
        <Container>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-white border border-outline-variant/40 rounded-2xl shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-body-md font-bold text-on-surface">First time visiting APC Digital?</h4>
                <p className="text-body-sm text-on-surface-variant max-w-2xl leading-relaxed">
                  Browse our catalog of services. The systems, guides, or cards you view will be automatically saved in this browser panel for lightning-fast access next time.
                </p>
              </div>
            </div>
            <div className="text-label-sm text-primary font-bold bg-primary/10 border border-primary/20 px-3 py-1 rounded-full shrink-0">
              💡 Smart Browser Panel Active
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-6 bg-surface-container-low/20 border-b border-outline-variant/20 select-none">
      <Container>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-4.5 rounded-full bg-primary" />
          <h3 className="text-body-lg font-bold text-on-surface">Recently Used Services</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {recentServices.map((service) => (
            <Link
              key={service.id}
              href={`/digital/services/${service.slug}`}
              className="flex items-center justify-between p-4 bg-white border border-outline-variant/40 rounded-xl hover:-translate-y-1 hover:shadow-md hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-105">
                  <ServiceIcon name={service.icon} />
                </div>
                <span className="text-body-md font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                  {service.title}
                </span>
              </div>
              <svg className="w-4 h-4 text-on-surface-variant/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
