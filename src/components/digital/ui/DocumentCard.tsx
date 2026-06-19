import { cn } from '@/lib/utils';

interface DocumentCardProps {
  title: string;
  mandatory: boolean;
  className?: string;
}

export function DocumentCard({ title, mandatory, className }: DocumentCardProps) {
  return (
    <div className={cn("group flex items-start gap-3.5 bg-white border border-outline-variant/40 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300", className)}>
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-inner mt-0.5",
        mandatory ? "bg-primary/10 text-primary" : "bg-outline-variant/10 text-on-surface-variant"
      )}>
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="flex-1 space-y-0.5">
        <h4 className="text-body-sm font-bold text-on-surface leading-snug group-hover:text-primary transition-colors">{title}</h4>
        <span className={cn(
          "text-[10px] font-extrabold uppercase tracking-wider inline-block",
          mandatory ? "text-primary/80" : "text-on-surface-variant/70"
        )}>
          {mandatory ? "Mandatory" : "Optional"}
        </span>
      </div>
    </div>
  );
}
