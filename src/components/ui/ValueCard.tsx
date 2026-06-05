import type { Value } from '@/types';
import { ValueIcon } from '@/lib/icons';

interface ValueCardProps {
  value: Value;
}

export function ValueCard({ value }: ValueCardProps) {
  return (
    <article className="bg-surface-container-lowest rounded-lg shadow-tribal p-6 hover:-translate-y-1 hover:shadow-tribal-hover transition-all duration-300">
      {/* Icon */}
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        <ValueIcon name={value.icon} />
      </div>

      {/* Title */}
      <h3 className="text-headline-sm text-on-surface mb-2">{value.title}</h3>

      {/* Description */}
      <p className="text-body-md text-on-surface-variant">{value.description}</p>
    </article>
  );
}
