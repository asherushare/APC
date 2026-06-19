import { cn } from '@/lib/utils';

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-surface-container-low rounded-xl", className)} />
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 flex flex-col shadow-sm h-[320px]">
      <div className="flex justify-between items-center mb-4">
        <LoadingSkeleton className="h-5 w-24 rounded-md" />
        <LoadingSkeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex items-start gap-3.5 mb-3.5">
        <LoadingSkeleton className="w-11 h-11 rounded-xl shrink-0" />
        <LoadingSkeleton className="h-6 w-3/4 rounded-md mt-1" />
      </div>
      <div className="space-y-2 mb-6 flex-1 mt-2">
        <LoadingSkeleton className="h-3.5 w-full rounded-sm" />
        <LoadingSkeleton className="h-3.5 w-5/6 rounded-sm" />
        <LoadingSkeleton className="h-3.5 w-4/6 rounded-sm" />
      </div>
      <div className="border-t border-b border-outline-variant/20 py-3 mb-5 space-y-2">
        <div className="flex justify-between">
          <LoadingSkeleton className="h-3.5 w-20 rounded-sm" />
          <LoadingSkeleton className="h-3.5 w-16 rounded-sm" />
        </div>
        <div className="flex justify-between">
          <LoadingSkeleton className="h-3.5 w-24 rounded-sm" />
          <LoadingSkeleton className="h-3.5 w-16 rounded-sm" />
        </div>
      </div>
      <div className="flex justify-between mt-auto gap-3.5">
        <LoadingSkeleton className="h-10 w-20 rounded-xl" />
        <div className="flex gap-2 flex-1">
          <LoadingSkeleton className="h-10 flex-1 rounded-xl" />
          <LoadingSkeleton className="h-10 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
