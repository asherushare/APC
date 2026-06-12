import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';

export function RoadmapCTA() {
  return (
    <section className="py-16 md:py-24">
      <Container className="text-center">
        <h2 className="text-headline-md md:text-display-mobile text-on-surface mb-4">
          Be Part of the Journey
        </h2>
        <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto mb-8">
          Whether you&apos;re a partner investor, or a community member, there is a place for
          you in our roadmap. Let&apos;s build the future together.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button href="/contact">Partner With Us</Button>
          <Button variant="secondary" href="/contact">Download Full Roadmap (PDF)</Button>
        </div>
      </Container>
    </section>
  );
}
