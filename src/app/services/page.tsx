import type { Metadata } from 'next';
import { ServicesHero } from '@/components/sections/services/ServicesHero';
import { ServicePortfolio } from '@/components/sections/services/ServicePortfolio';
import { FeaturedServices } from '@/components/sections/services/FeaturedServices';
import { ProcessSection } from '@/components/sections/services/ProcessSection';
import { ServicesCTA } from '@/components/sections/services/ServicesCTA';

export const metadata: Metadata = {
  title: 'Services | APC',
  description: 'Digital, documentation, training, and community services provided by APC.',
};

export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <ServicePortfolio />
      <FeaturedServices />
      <ProcessSection />
      <ServicesCTA />
    </>
  );
}
