import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { Button } from '@/components/common/Button';
import { services } from '@/data/services';

export function ServicesPreview() {
  // Show first 4 services for preview
  const previewServices = services.slice(0, 4);

  return (
    <section className="py-16 md:py-24 bg-surface">
      <Container>
        <SectionHeading
          title="Digital Services at the Grassroots"
          subtitle="Empowering tribal communities with easy access to finance, governance, and identity services"
          label="OUR SERVICES"
        />

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {previewServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button variant="primary" href="/services" id="services-preview-btn">
            View All Services
          </Button>
        </div>
      </Container>
    </section>
  );
}
