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
      {/* Icon + Price row */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <ServiceIcon name={service.icon} />
        </div>
        {/* Price badge */}
        <span
          className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-label-sm font-bold',
            service.price === 'Free'
              ? 'bg-primary/10 text-primary'
              : 'bg-tribal-gold/15 text-tribal-gold'
          )}
        >
          {service.price}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-headline-sm text-on-surface mb-2">{service.title}</h3>

      {/* Description */}
      <p className="text-body-md text-on-surface-variant mb-4 flex-1">
        {service.description}
      </p>

      {/* Features */}
      {service.features.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-x-3 gap-y-1">
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

      {/* CTAs */}
      <div className="space-y-2 mt-auto pt-4">
        <Button
          variant="secondary"
          href={`/book?service=${service.id}`}
          className="w-full text-label-md py-2"
          id={`book-${service.id}`}
        >
          Book Online
        </Button>
        <a
          href={`https://wa.me/919348747578?text=Hello%20APC%20Odisha%2C%20I%20am%20interested%20in%20booking%20the%20service%3A%20${encodeURIComponent(service.title)}.%20Please%20provide%20more%20details.`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full border border-[#25D366] text-on-surface hover:bg-[#25D366]/5 active:scale-[0.98] rounded-lg py-2 text-label-md font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          id={`wa-${service.id}`}
        >
          <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Query via WhatsApp
        </a>
      </div>

    </article>
  );
}
