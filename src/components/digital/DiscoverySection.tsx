'use client';

import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { DigitalService } from '@/types/digital';
import { ServiceCarousel } from './ui/ServiceCarousel';

interface DiscoverySectionProps {
  title: string;
  subtitle?: string;
  services: DigitalService[];
  onBookClick: (service: DigitalService) => void;
  background?: 'white' | 'surface';
}

export function DiscoverySection({ title, subtitle, services, onBookClick, background = 'surface' }: DiscoverySectionProps) {
  if (!services || services.length === 0) return null;

  return (
    <section className={`py-12 ${background === 'surface' ? 'bg-surface' : 'bg-white'}`}>
      <Container>
        <div className="mb-8">
          <SectionHeading
            title={title}
            subtitle={subtitle}
            align="left"
          />
        </div>
        <ServiceCarousel services={services} onBookClick={onBookClick} />
      </Container>
    </section>
  );
}
