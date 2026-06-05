import { Container } from '@/components/common/Container';
import { StatCard } from '@/components/ui/StatCard';
import { homeStats } from '@/data/stats';

export function StatsBar() {
  return (
    <section className="bg-primary py-12 md:py-16">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {homeStats.map((stat) => (
            <StatCard key={stat.label} stat={stat} light={true} />
          ))}
        </div>
      </Container>
    </section>
  );
}
