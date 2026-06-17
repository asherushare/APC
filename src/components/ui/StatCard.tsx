import type { Stat } from '@/types';

interface StatCardProps {
  stat: Stat;
  light?: boolean;
}

export function StatCard({ stat, light = false }: StatCardProps) {
  return (
    <div className="text-center p-3 md:p-6 transition-all duration-300 hover:scale-105">
      <p
        className={`text-display-mobile md:text-[44px] font-extrabold leading-none tracking-tight ${
          light ? 'text-tribal-gold' : 'text-primary'
        }`}
      >
        {stat.value}
      </p>
      <p
        className={`text-[11px] md:text-label-sm font-bold uppercase tracking-widest mt-3.5 block leading-tight ${
          light ? 'text-white/90' : 'text-on-surface-variant'
        }`}
      >
        {stat.label}
      </p>
    </div>
  );
}
