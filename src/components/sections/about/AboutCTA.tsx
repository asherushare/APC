import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';

export function AboutCTA() {
  return (
    <section className="py-16 md:py-24 bg-primary saura-pattern">
      <Container>
        <div className="text-center max-w-2xl mx-auto space-y-6">
          {/* Heading */}
          <h2 className="text-headline-md md:text-display-mobile text-on-primary">
            Be a Part of the Movement
          </h2>

          {/* Subtitle */}
          <p className="text-body-lg text-on-primary/80">
            Whether you are a partner, investor, government body, or an
            individual who believes in the power of community — there is a
            place for you in this journey.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="gold" size="lg" href="/contact" id="about-cta-partner">
              Partner With Us
            </Button>
            <Button
              variant="secondary"
              size="lg"
              href="/join"
              id="about-cta-support"
              className="border-white/30 text-on-primary hover:bg-white/10"
            >
              Support the Cause
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
