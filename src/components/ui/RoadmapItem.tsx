import type { RoadmapPhase } from '@/types';
import { cn } from '@/lib/utils';
import { RoadmapIcon } from '@/lib/icons';

interface RoadmapItemProps {
  phase: RoadmapPhase;
  index: number;
  isLast?: boolean;
}

const statusColors: Record<RoadmapPhase['status'], string> = {
  established: 'bg-primary text-white',
  operational: 'bg-primary text-white',
  active: 'bg-secondary text-white',
  'in-progress': 'bg-tribal-gold text-white',
  upcoming: 'bg-tribal-gold/60 text-white',
  planned: 'bg-surface-container-highest text-on-surface-variant',
};

const statusDotColors: Record<RoadmapPhase['status'], string> = {
  established: 'bg-primary border-surface',
  operational: 'bg-primary border-surface',
  active: 'bg-secondary border-surface',
  'in-progress': 'bg-tribal-gold border-surface',
  upcoming: 'bg-tribal-gold/60 border-surface',
  planned: 'bg-surface-container-highest border-surface',
};

export function RoadmapItem({ phase, isLast = false }: RoadmapItemProps) {
  const isCompleted = ['established', 'operational', 'active'].includes(phase.status);

  return (
    <div className="relative flex gap-6 md:gap-8">
      {/* Timeline Line + Dot */}
      <div className="flex flex-col items-center">
        {/* Numbered Circle */}
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 z-10 flex-shrink-0',
            statusDotColors[phase.status]
          )}
        >
          {isCompleted ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            phase.phase
          )}
        </div>

        {/* Connecting Line */}
        {!isLast && (
          <div className="w-0.5 flex-1 bg-outline-variant" />
        )}
      </div>

      {/* Content Card */}
      <div
        className={cn(
          'bg-surface-container-lowest rounded-lg shadow-tribal border border-outline-variant p-6 mb-8 flex-1',
          !isCompleted && phase.status === 'planned' && 'opacity-60'
        )}
      >
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3
            className={cn(
              'text-headline-sm',
              isCompleted ? 'text-primary' : 'text-on-surface-variant'
            )}
          >
            {phase.title}
          </h3>
          <div className="flex-shrink-0 text-primary/30">
            <RoadmapIcon name={phase.icon} />
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={cn(
            'inline-block px-3 py-1 rounded-full text-label-sm mb-3',
            statusColors[phase.status]
          )}
        >
          {phase.statusLabel}
        </span>

        <p className="text-body-md text-on-surface-variant">{phase.description}</p>
      </div>
    </div>
  );
}
