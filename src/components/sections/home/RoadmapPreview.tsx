import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { RoadmapItem } from '@/components/ui/RoadmapItem';
import { Button } from '@/components/common/Button';
import { roadmapPhases } from '@/data/roadmap';

export function RoadmapPreview() {
  /* Show first 3 phases */
  const previewPhases = roadmapPhases.slice(0, 3);

  return (
    <section className="py-16 md:py-24 bg-surface-container-low">
      <Container>
        <SectionHeading title="The Journey Ahead" />

        {/* Timeline */}
        <div className="max-w-2xl mx-auto">
          {previewPhases.map((phase, index) => (
            <RoadmapItem
              key={phase.phase}
              phase={phase}
              index={index}
              isLast={index === previewPhases.length - 1}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Button variant="ghost" href="/roadmap" id="roadmap-cta">
            View Full Roadmap →
          </Button>
        </div>
      </Container>
    </section>
  );
}
