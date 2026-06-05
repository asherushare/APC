import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { DirectorCard } from '@/components/ui/DirectorCard';
import { boardMembers } from '@/data/directors';

export function BoardOfDirectors() {
  return (
    <section className="py-16 md:py-24 bg-surface-container-low">
      <Container>
        <SectionHeading
          title="Board of Directors"
          subtitle="Representing diverse districts and tribal communities, our board ensures a balanced voice for all of Odisha's producers."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {boardMembers.map((director) => (
            <DirectorCard key={director.name} director={director} />
          ))}
        </div>
      </Container>
    </section>
  );
}
