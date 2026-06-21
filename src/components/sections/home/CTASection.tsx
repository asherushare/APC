import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';

export function CTASection() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="bg-primary rounded-2xl px-6 py-16 md:px-16 md:py-20 text-center text-white">
          {/* Heading */}
          <h2 className="text-display-mobile md:text-display-lg mb-4">
            Join the Movement
          </h2>

          {/* Subtitle */}
          <p className="text-body-lg text-white/80 max-w-xl mx-auto mb-10">
            Be part of a community-driven initiative transforming tribal
            livelihoods through enterprise, technology, and sustainable growth
            across Odisha.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button variant="gold" size="lg" href="/join" id="cta-register-btn">
              Become a Shareholder
            </Button>
            <Button
              variant="secondary"
              size="lg"
              href="/contact"
              id="cta-contact-btn"
              className="border-white/50 text-white hover:bg-white/10"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
