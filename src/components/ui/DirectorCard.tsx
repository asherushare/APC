import type { Director } from '@/types';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface DirectorCardProps {
  director: Director;
  variant?: 'founder' | 'board' | 'placeholder';
}

export function DirectorCard({ director, variant = 'board' }: DirectorCardProps) {
  // Founder spotlight — large horizontal card
  if (variant === 'founder') {
    return (
      <article className="bg-surface-container-lowest rounded-xl shadow-tribal p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center">
        {/* Photo */}
        <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-primary/20 flex-shrink-0">
          {director.image ? (
            <Image
              src={director.image}
              alt={director.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary">
                {director.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-center py-1 text-label-sm uppercase tracking-wider">
            Chief Founder
          </div>
        </div>

        {/* Info */}
        <div className="text-center md:text-left space-y-4">
          <div>
            <h3 className="text-headline-md text-on-surface">{director.name}</h3>
            <p className="text-label-md text-on-surface-variant">
              {director.role}, {director.location}
            </p>
          </div>
          {director.quote && (
            <blockquote className="text-body-md text-on-surface-variant italic border-l-4 border-tribal-gold pl-4">
              &ldquo;{director.quote}&rdquo;
            </blockquote>
          )}
        </div>
      </article>
    );
  }

  // Board member — compact card with circular image
  return (
    <article
      className={cn(
        'bg-surface-container-lowest rounded-lg shadow-tribal p-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-tribal-hover transition-all duration-300',
        variant === 'placeholder' && 'border-2 border-dashed border-outline-variant'
      )}
    >
      {/* Circular Photo */}
      <div className="w-14 h-14 rounded-full overflow-hidden bg-primary/10 flex-shrink-0 flex items-center justify-center">
        {director.image && variant !== 'placeholder' ? (
          <Image
            src={director.image}
            alt={director.name}
            width={56}
            height={56}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-xl font-bold text-primary/40">
            {director.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Info */}
      <div>
        <h4 className="text-headline-sm text-on-surface text-sm font-semibold">
          {director.name}
        </h4>
        <p className="text-label-sm text-on-surface-variant">
          {director.role}, {director.location}
        </p>
      </div>
    </article>
  );
}
