'use client';

import { useState } from 'react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Hero } from '@/components/digital/Hero';
import { WhyChooseUs } from '@/components/digital/WhyChooseUs';
import { Categories } from '@/components/digital/Categories';
import { ServiceCard } from '@/components/digital/ServiceCard';
import { RecentlyUsed } from '@/components/digital/RecentlyUsed';
import { CustomServiceCTA } from '@/components/digital/CustomServiceCTA';
import { FAQ } from '@/components/digital/FAQ';
import { ContactCTA } from '@/components/digital/ContactCTA';
import { Booking } from '@/components/digital/Booking';
import { demoServices, featuredServices } from '@/data/digital';
import { DigitalService } from '@/types/digital';

export default function DigitalPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<DigitalService | null>(null);

  // Filter services by category if selected, otherwise show popular items
  const displayServices = demoServices.filter((service) => {
    if (activeCategory === null) {
      return service.popular; // Default popular list
    }
    return service.categoryId === activeCategory; // Selected category match
  });

  return (
    <>
      {/* 1. Hero + Intelligent Search */}
      <Hero />

      {/* 2. Featured Services */}
      {featuredServices.length > 0 && (
        <section className="py-12 bg-surface">
          <Container>
            <SectionHeading
              title="Featured Digital Services"
              subtitle="Quick access to our highest-traffic digital, AI, and business licensing tools."
              align="center"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {featuredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onBookClick={setSelectedService}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 3. Recently Used Services */}
      <RecentlyUsed />

      {/* 4. Why Choose APC Digital */}
      <WhyChooseUs />

      {/* 5. Browse Categories */}
      <section className="bg-surface-container-low border-b border-outline-variant/30 py-4 select-none">
        <Container>
          <div className="text-center max-w-xl mx-auto mb-6">
            <h2 className="text-headline-sm font-bold text-on-surface">Browse by Category</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Select a category tab to filter the most popular digital services below.
            </p>
          </div>
        </Container>
        <Categories
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
      </section>

      {/* 6. Popular / Category Services */}
      <section className="py-12 bg-surface border-b border-outline-variant/30">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-headline-md font-bold text-on-surface">
              {activeCategory ? 'Matching Category Services' : 'Most Popular Digital Services'}
            </h2>
            <p className="text-body-md text-on-surface-variant mt-2">
              Browse our catalog of services. Select 'Book' to submit details directly to our WhatsApp helpdesk.
            </p>
          </div>

          {displayServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onBookClick={setSelectedService}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-outline-variant/60 rounded-2xl p-8 bg-white max-w-md mx-auto space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary/5 text-primary flex items-center justify-center mx-auto text-xl font-bold">
                📁
              </div>
              <h3 className="text-body-lg font-black text-on-surface">Coming Soon to This Category</h3>
              <p className="text-body-sm text-on-surface-variant leading-relaxed">
                We are actively integrating 500+ grassroots services into this category. If you need any immediate assistance, click below to chat directly with our local helpdesk.
              </p>
              <a
                href="https://wa.me/919348747578?text=Hello%20APC%20Digital%2C%20I%20need%20assistance%20with%20a%20service%20in%20this%20category."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebd59] text-white font-extrabold py-2.5 px-6 rounded-full shadow-md text-label-md transition-all cursor-pointer hover:shadow-lg active:scale-95 uppercase tracking-wider text-[11px]"
              >
                Inquire via WhatsApp
              </a>
            </div>
          )}
        </Container>
      </section>

      {/* 7. Need a Custom Service? */}
      <CustomServiceCTA />

      {/* 8. FAQ */}
      <FAQ />

      {/* 9. Contact CTA */}
      <ContactCTA />

      {/* Interactive Booking Drawer Overlay */}
      <Booking
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </>
  );
}
