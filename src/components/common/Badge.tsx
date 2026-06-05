import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'gold';
}

export function Badge({ children, variant = 'green' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-label-sm font-semibold',
        variant === 'green'
          ? 'bg-secondary-container text-on-secondary-container border border-secondary/20'
          : 'bg-tribal-gold/10 text-tribal-gold border border-tribal-gold/20'
      )}
    >
      {children}
    </span>
  );
}
