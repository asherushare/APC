import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';
import { DirectorCard } from '@/components/ui/DirectorCard';
import { founder } from '@/data/directors';

export function FounderSpotlight() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <DirectorCard director={founder} variant="founder" />
        <div className="text-center mt-8">
          <Button variant="secondary" href="/about">Read Full Vision</Button>
        </div>
      </Container>
    </section>
  );
}
