import { Container } from '@/components/common/Container';
import { StatCard } from '@/components/ui/StatCard';
import { homeStats } from '@/data/stats';

export function StatsBar() {
  return (
    <section className="bg-dark-green py-6 md:py-10 border-y border-tribal-gold/50 relative overflow-hidden">
      {/* Decorative tribal saura backdrop */}
      <div className="absolute inset-0 saura-pattern opacity-10 pointer-events-none" />
      <Container className="relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-outline-variant/20">
          {homeStats.map((stat) => (
            <StatCard key={stat.label} stat={stat} light={true} />
          ))}
        </div>
      </Container>
    </section>
  );
}
