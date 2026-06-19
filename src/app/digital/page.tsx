'use client';

import { useState } from 'react';
import { Container } from '@/components/common/Container';
import { Hero } from '@/components/digital/Hero';
import { TrustSection } from '@/components/digital/TrustSection';
import { WhyChooseUs } from '@/components/digital/WhyChooseUs';
import { ServiceCard } from '@/components/digital/ServiceCard';
import { RecentlyUsed } from '@/components/digital/RecentlyUsed';
import { CustomServiceCTA } from '@/components/digital/CustomServiceCTA';
import { FAQ } from '@/components/digital/FAQ';
import { ContactCTA } from '@/components/digital/ContactCTA';
import { Booking } from '@/components/digital/Booking';
import { featuredServices } from '@/data/digital';
import { getAllServices } from '@/data/digital/services';
import { DigitalService } from '@/types/digital';
import { useServiceDiscovery } from '@/hooks/useServiceDiscovery';
import { FilterPanel } from '@/components/digital/ui/FilterPanel';
import { SortSelector } from '@/components/digital/ui/SortSelector';
import { DiscoverySection } from '@/components/digital/DiscoverySection';

export default function DigitalPage() {
  const [selectedService, setSelectedService] = useState<DigitalService | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const allServices = getAllServices();
  
  const {
    filters,
    toggleFilter,
    clearFilters,
    sortBy,
    setSortBy,
    filteredAndSortedServices
  } = useServiceDiscovery(allServices);

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);
  const displayServices = filteredAndSortedServices.slice(0, 12);
  const hasMore = filteredAndSortedServices.length > 12;

  // Derive Popular services for Discovery Section
  const popularServices = allServices.filter(s => s.popular && !s.featured).slice(0, 6);

  return (
    <>
      {/* 1. Hero + Intelligent Search */}
      <Hero />

      {/* 2. Trust & Security Section */}
      <TrustSection />

      {/* 3. Discovery Sections (Featured & Popular) */}
      {!hasActiveFilters && (
        <>
          <DiscoverySection
            title="Featured Digital Services"
            subtitle="Quick access to our highest-traffic digital, AI, and business licensing tools."
            services={featuredServices}
            onBookClick={setSelectedService}
            background="surface"
          />
          <DiscoverySection
            title="Most Popular in Your Area"
            subtitle="Services frequently requested by users in your region."
            services={popularServices}
            onBookClick={setSelectedService}
            background="white"
          />
        </>
      )}

      {/* 4. Recently Used Services */}
      <RecentlyUsed />

      {/* 5. Enterprise Catalog Experience */}
      <section className="py-12 md:py-20 bg-surface border-b border-outline-variant/30 relative">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12 items-start relative">
            
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block lg:col-span-1 sticky top-28 z-10">
              <FilterPanel 
                filters={filters} 
                toggleFilter={toggleFilter} 
                clearFilters={clearFilters} 
              />
            </aside>

            {/* Mobile Filter Drawer Overlay */}
            {isMobileFilterOpen && (
              <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
                <div className="relative w-[320px] max-w-[85vw] h-full bg-surface-container-lowest shadow-2xl overflow-y-auto animate-slide-in-right">
                  <div className="sticky top-0 bg-surface-container-lowest z-10 p-4 flex items-center justify-between border-b border-outline-variant/30">
                    <h3 className="font-bold text-headline-sm">Filters</h3>
                    <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-surface-container-low rounded-full hover:bg-outline-variant/30 text-on-surface">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <FilterPanel 
                      filters={filters} 
                      toggleFilter={toggleFilter} 
                      clearFilters={clearFilters}
                      className="border-none shadow-none p-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="col-span-1 lg:col-span-3 space-y-8">
              
              {/* Accessible live region for screen-readers */}
              <div aria-live="polite" aria-atomic="true" className="sr-only">
                {filteredAndSortedServices.length === 0
                  ? 'No services match the current filters.'
                  : `Showing ${filteredAndSortedServices.length} service${filteredAndSortedServices.length === 1 ? '' : 's'}.`}
              </div>

              {/* Header & Sort/Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
                <div>
                  <h2 className="text-headline-md font-black text-on-surface">
                    {hasActiveFilters ? 'Filtered Service Catalog' : 'Complete Service Catalog'}
                  </h2>
                  <p className="text-body-md text-on-surface-variant mt-1.5">
                    Showing {filteredAndSortedServices.length} matching services.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <SortSelector sortBy={sortBy} setSortBy={setSortBy} />
                  
                  {/* Mobile Filter Trigger */}
                  <button 
                    onClick={() => setIsMobileFilterOpen(true)} 
                    className="lg:hidden flex items-center justify-center gap-2 bg-primary/10 border border-primary/20 py-3 px-5 rounded-xl text-label-md font-bold text-primary hover:bg-primary/20 active:scale-95 transition-all shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                    </svg>
                    Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2 sm:static sm:w-auto sm:h-auto sm:bg-transparent sm:text-primary sm:top-auto sm:right-auto">(Active)</span>}
                  </button>
                </div>
              </div>

              {displayServices.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayServices.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        onBookClick={setSelectedService}
                      />
                    ))}
                  </div>
                  
                  {hasMore && (
                    <div className="mt-12 flex justify-center">
                      <button className="group px-8 py-3.5 rounded-full border-2 border-outline-variant text-on-surface font-extrabold text-label-md uppercase tracking-wider hover:bg-surface-container-low hover:border-primary/50 hover:text-primary transition-all duration-300 active:scale-95 flex items-center gap-2 shadow-sm hover:shadow-md">
                        Load More Services
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 border border-dashed border-outline-variant/60 rounded-3xl p-8 bg-surface-container-lowest max-w-lg mx-auto space-y-5 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-primary/5 text-primary flex items-center justify-center mx-auto text-3xl font-bold">
                    📁
                  </div>
                  <div>
                    <h3 className="text-headline-sm font-black text-on-surface">No matching services</h3>
                    <p className="text-body-md text-on-surface-variant leading-relaxed mt-2">
                      Try adjusting your filters or sorting to find what you need. Or tap the button below to clear all filters.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 max-w-[250px] mx-auto pt-2">
                    <button 
                      onClick={clearFilters}
                      className="bg-primary hover:bg-dark-green text-white font-extrabold py-3 px-6 rounded-full transition-all shadow-md active:scale-95 text-label-md"
                    >
                      Clear All Filters
                    </button>
                    <a
                      href="https://wa.me/919348747578?text=Hello%20APC%20Digital%2C%20I%20need%20assistance%20finding%20a%20service."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5 font-extrabold py-3 px-6 rounded-full transition-all active:scale-95 text-label-md"
                    >
                      WhatsApp Support
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* 6. Why Choose APC Digital */}
      <WhyChooseUs />

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
