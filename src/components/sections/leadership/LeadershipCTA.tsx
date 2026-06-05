import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';

export function LeadershipCTA() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="bg-primary rounded-2xl px-8 py-16 md:px-16 text-center text-white">
          <h2 className="text-display-mobile md:text-headline-md mb-4">
            Partner with Odisha&apos;s Producers
          </h2>
          <p className="text-body-lg text-white/80 max-w-xl mx-auto mb-8">
            Interested in learning more about our governance model or exploring partnerships?
            Reach out to our leadership team today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="gold" href="/contact">Contact Board</Button>
            <Button variant="secondary" href="/about" className="border-white text-white hover:bg-white/10">
              View Annual Report
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
