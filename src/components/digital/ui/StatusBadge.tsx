import { cn } from '@/lib/utils';

export type ServiceStatus = 'active' | 'coming-soon' | 'temporarily-unavailable';

interface StatusBadgeProps {
  status?: ServiceStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case 'active':
      return (
        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-200 select-none shadow-sm", className)}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active Service
        </span>
      );
    case 'coming-soon':
      return (
        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-100 text-amber-800 border border-amber-200 select-none shadow-sm", className)}>
          Coming Soon
        </span>
      );
    case 'temporarily-unavailable':
      return (
        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-slate-100 text-slate-800 border border-slate-200 select-none shadow-sm", className)}>
          Unavailable
        </span>
      );
    default:
      return null;
  }
}
