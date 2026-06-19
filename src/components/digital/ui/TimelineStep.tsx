import { cn } from '@/lib/utils';

interface TimelineStepProps {
  stepNumber: number;
  title: string;
  description: string;
  isActive?: boolean;
  isLast?: boolean;
}

export function TimelineStep({ stepNumber, title, description, isActive = false, isLast = false }: TimelineStepProps) {
  return (
    <div className="relative group select-none">
      {/* Connector Line */}
      {!isLast && (
        <div className="absolute left-[7px] top-[24px] bottom-[-24px] w-0.5 bg-outline-variant/30 group-hover:bg-primary/20 transition-colors duration-300" />
      )}
      
      <div className="flex items-start gap-4">
        {/* Node */}
        <div className={cn(
          "relative z-10 w-4 h-4 rounded-full mt-1 shrink-0 border-2 transition-all duration-300 group-hover:scale-110",
          isActive 
            ? "bg-primary border-white ring-4 ring-primary/20 shadow-sm" 
            : "bg-surface-container-highest border-white ring-2 ring-outline-variant/20"
        )} />
        
        {/* Content */}
        <div className="pb-8">
          <span className="text-[10px] font-black text-primary/70 uppercase tracking-widest mb-0.5 block">
            Step {stepNumber}
          </span>
          <h4 className={cn(
            "text-body-md font-extrabold transition-colors duration-300",
            isActive ? "text-primary" : "text-on-surface group-hover:text-primary"
          )}>
            {title}
          </h4>
          <p className="text-body-sm text-on-surface-variant mt-1.5 leading-relaxed max-w-sm">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
