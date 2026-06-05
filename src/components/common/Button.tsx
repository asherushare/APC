import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
  type?: 'button' | 'submit';
  id?: string;
}

const variantStyles = {
  primary:
    'bg-primary text-white hover:bg-dark-green shadow-tribal hover:shadow-tribal-hover',
  secondary:
    'border-2 border-tribal-gold text-on-surface hover:bg-surface-container-low',
  ghost:
    'text-primary hover:text-dark-green bg-transparent',
  gold:
    'bg-tribal-gold text-on-surface hover:opacity-95 shadow-lg',
};

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg font-semibold',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  className,
  type = 'button',
  id,
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 active:scale-[0.98] cursor-pointer',
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} id={id}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} id={id}>
      {children}
    </button>
  );
}
