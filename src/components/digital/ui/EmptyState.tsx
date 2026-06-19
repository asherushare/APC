import { cn } from '@/lib/utils';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  className?: string;
}

export function EmptyState({ icon, title, description, actionLabel, actionHref, actionOnClick, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center bg-surface-container-lowest border border-outline-variant/40 rounded-3xl shadow-sm", className)}>
      <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary/60 mb-5">
        {icon || (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        )}
      </div>
      <h3 className="text-headline-sm font-bold text-on-surface">{title}</h3>
      <p className="text-body-md text-on-surface-variant max-w-sm mt-2 mb-6">
        {description}
      </p>
      
      {actionLabel && actionHref && (
        <Link 
          href={actionHref}
          className="bg-primary hover:bg-dark-green text-white font-semibold py-2.5 px-6 rounded-full transition-all active:scale-95 shadow-md text-label-md"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && actionOnClick && !actionHref && (
        <button 
          onClick={actionOnClick}
          className="bg-primary hover:bg-dark-green text-white font-semibold py-2.5 px-6 rounded-full transition-all active:scale-95 shadow-md text-label-md"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
