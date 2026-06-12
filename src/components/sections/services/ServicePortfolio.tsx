'use client';

import { useState } from 'react';
import { services, serviceCategories } from '@/data/services';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ServiceCard } from '@/components/ui/ServiceCard';
import type { ServiceCategory } from '@/types';

export function ServicePortfolio() {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>('all');

  const filteredServices =
    activeCategory === 'all'
      ? services
      : services.filter((s) => s.category === activeCategory);

  return (
    <section id="portfolio" className="py-16 md:py-24 bg-surface-container-low">
      <Container>
        <SectionHeading
          label="WHAT WE OFFER"
          title="Our Service Portfolio"
          subtitle="A unified hub for all your administrative, financial, and logistical needs."
        />

        {/* Category Filter Bar */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {serviceCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                px-5 py-2 rounded-full text-label-md font-medium
                transition-all duration-200 cursor-pointer
                ${
                  activeCategory === cat.id
                    ? 'bg-primary text-on-primary shadow-tribal'
                    : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:border-primary hover:text-primary'
                }
              `}
              id={`filter-${cat.id}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="transition-all duration-300 animate-[fadeIn_0.3s_ease-out]"
            >
              <ServiceCard service={service} />
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-body-lg text-on-surface-variant">
              No services found in this category.
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}
