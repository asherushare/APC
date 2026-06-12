import type { Stat } from '@/types';

interface StatCardProps {
  stat: Stat;
  light?: boolean;
}

export function StatCard({ stat, light = false }: StatCardProps) {
  return (
    <div className="text-center space-y-1">
      <p
        className={`text-display-mobile md:text-[40px] font-bold leading-tight ${
          light ? 'text-white' : 'text-on-primary-container'
        }`}
      >

        {stat.value}
      </p>
      <p
        className={`text-label-md uppercase tracking-wider ${
          light ? 'text-white/80' : 'text-on-primary-container/80'
        }`}
      >
        {stat.label}
      </p>
    </div>
  );
}
