import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';

export function ServicesCTA() {
  return (
    <section className="py-16 md:py-24 bg-primary">
      <Container className="text-center">
        <h2 className="text-display-lg text-white mb-4">
          Ready to empower your community?
        </h2>

        <p className="text-body-lg text-white/80 max-w-2xl mx-auto mb-10">
          Connect with our local agents or visit a hub near you to access
          government services, digital training, and economic opportunities
          tailored for tribal producers.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="gold" href="/contact" id="services-cta-agent">
            Connect with an Agent
          </Button>
          <Button
            variant="secondary"
            href="/contact"
            id="services-cta-hub"
            className="text-white border-white hover:bg-white/10"
          >
            Visit Local Hub
          </Button>
        </div>
      </Container>
    </section>
  );
}
