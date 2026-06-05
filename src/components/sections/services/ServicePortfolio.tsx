import { services } from '@/data/services';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ServiceCard } from '@/components/ui/ServiceCard';

export function ServicePortfolio() {
  return (
    <section id="portfolio" className="py-16 md:py-24 bg-surface-container-low">
      <Container>
        <SectionHeading
          label="WHAT WE OFFER"
          title="Our Service Portfolio"
          subtitle="A unified hub for all your administrative, financial, and logistical needs."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </Container>
    </section>
  );
}
