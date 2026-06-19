import { cn } from '@/lib/utils';

interface TrustBadgeProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export function TrustBadge({ icon, title, description, className }: TrustBadgeProps) {
  return (
    <div className={cn("flex items-center gap-3 bg-white p-3 rounded-xl border border-outline-variant/30 shadow-sm", className)}>
      <div className="w-10 h-10 rounded-lg bg-tribal-gold/10 text-tribal-gold flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-label-sm font-bold text-on-surface">{title}</h4>
        {description && <p className="text-[11px] text-on-surface-variant font-medium leading-tight mt-0.5">{description}</p>}
      </div>
    </div>
  );
}
