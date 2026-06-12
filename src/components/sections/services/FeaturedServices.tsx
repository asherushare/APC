import { services } from '@/data/services';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ServiceIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';

export function FeaturedServices() {
  const featuredServices = services.filter((s) => s.featured === true);

  return (
    <section className="py-16 md:py-24">
      <Container>
        <SectionHeading
          label="FLAGSHIP PROGRAMS"
          title="Featured Services"
          subtitle="Our most impactful initiatives driving real change across tribal communities."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredServices.map((service) => (
            <article
              key={service.id}
              id={`featured-${service.id}`}
              className="bg-surface-container-lowest rounded-xl shadow-tribal border-t-4 border-tribal-gold p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-tribal-hover"
            >
              {/* Top row: icon + price */}
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <div className="scale-150">
                    <ServiceIcon name={service.icon} />
                  </div>
                </div>
                <span
                  className={cn(
                    'inline-flex items-center px-4 py-1.5 rounded-full text-label-md font-bold',
                    service.price === 'Free'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-tribal-gold/15 text-tribal-gold'
                  )}
                >
                  {service.price}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-headline-sm text-on-surface mb-3">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-body-lg text-on-surface-variant mb-6">
                {service.description}
              </p>

              {/* Feature bullets */}
              <ul className="space-y-3 mb-8 flex-1">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-body-md text-on-surface">
                    <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Book now link */}
              <a
                href="/book"
                className="inline-flex items-center gap-2 text-label-md font-semibold text-primary hover:text-dark-green transition-colors"
              >
                Book Now
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
