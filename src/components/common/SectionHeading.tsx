import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  light?: boolean;
  isMainHeading?: boolean;
}

export function SectionHeading({
  label,
  title,
  subtitle,
  align = 'center',
  light = false,
  isMainHeading = false,
}: SectionHeadingProps) {
  const HeadingTag = isMainHeading ? 'h1' : 'h2';

  return (
    <div
      className={cn(
        'mb-12 md:mb-16 space-y-4',
        align === 'center' ? 'text-center' : 'text-left'
      )}
    >
      {label && (
        <p
          className={cn(
            'text-label-md uppercase tracking-wider font-semibold',
            light ? 'text-white/70' : 'text-primary'
          )}
        >
          {label}
        </p>
      )}
      <HeadingTag
        className={cn(
          'text-headline-md md:text-display-mobile',
          light ? 'text-white' : 'text-on-surface'
        )}
      >
        {title}
      </HeadingTag>
      {subtitle && (
        <p
          className={cn(
            'text-body-lg max-w-2xl',
            align === 'center' ? 'mx-auto' : '',
            light ? 'text-white/80' : 'text-on-surface-variant'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

