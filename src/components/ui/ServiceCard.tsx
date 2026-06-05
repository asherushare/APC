import type { Service } from '@/types';
import { cn } from '@/lib/utils';
import { ServiceIcon } from '@/lib/icons';
import { Button } from '@/components/common/Button';

interface ServiceCardProps {
  service: Service;
  variant?: 'default' | 'featured';
}

export function ServiceCard({ service, variant = 'default' }: ServiceCardProps) {
  return (
    <article
      className={cn(
        'bg-surface-container-lowest rounded-lg shadow-tribal hover:-translate-y-1 hover:shadow-tribal-hover transition-all duration-300 p-6 flex flex-col',
        variant === 'featured' && 'border-t-4 border-tribal-gold'
      )}
      id={`service-${service.id}`}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        <ServiceIcon name={service.icon} />
      </div>

      {/* Title */}
      <h3 className="text-headline-sm text-on-surface mb-2">{service.title}</h3>

      {/* Description */}
      <p className="text-body-md text-on-surface-variant mb-4 flex-1">
        {service.description}
      </p>

      {/* Features */}
      {service.features.length > 0 && (
        <div className="mb-4">
          {service.features.map((feature) => (
            <span
              key={feature}
              className="inline-flex items-center gap-1 text-label-sm text-primary"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {feature}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <Button
        variant="secondary"
        href="/contact"
        className="w-full"
        id={`inquire-${service.id}`}
      >
        Inquire Now
      </Button>
    </article>
  );
}
