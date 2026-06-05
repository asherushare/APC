import { Container } from '@/components/common/Container';
import { RoadmapItem } from '@/components/ui/RoadmapItem';
import { roadmapPhases } from '@/data/roadmap';

export function RoadmapTimeline() {
  return (
    <section className="py-16 md:py-24">
      <Container className="max-w-3xl mx-auto">
        {roadmapPhases.map((phase, index) => (
          <RoadmapItem
            key={phase.phase}
            phase={phase}
            index={index}
            isLast={index === roadmapPhases.length - 1}
          />
        ))}
      </Container>
    </section>
  );
}
