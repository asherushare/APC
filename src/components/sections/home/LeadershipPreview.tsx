import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { DirectorCard } from '@/components/ui/DirectorCard';
import { Button } from '@/components/common/Button';
import { founder, boardMembers } from '@/data/directors';

export function LeadershipPreview() {
  /* Show founder + first 3 board members */
  const previewMembers = boardMembers.slice(0, 3);

  return (
    <section className="py-16 md:py-24">
      <Container>
        <SectionHeading
          title="The Visionaries"
          subtitle="Guided by experienced leaders who understand the tribal pulse and technological potential"
          align="left"
        />

        {/* Founder — full width */}
        <div className="mb-8">
          <DirectorCard director={founder} variant="founder" />
        </div>

        {/* Board Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          {previewMembers.map((member) => (
            <DirectorCard key={member.name} director={member} variant="board" />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="ghost" href="/leadership" id="leadership-cta">
            Meet the whole team →
          </Button>
        </div>
      </Container>
    </section>
  );
}
