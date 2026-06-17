import { Container } from '@/components/common/Container';
import { Badge } from '@/components/common/Badge';

export function JoinHero() {
  return (
    <section className="bg-primary saura-pattern py-16 md:py-24">
      <Container>
        <div className="text-center max-w-2xl mx-auto space-y-6">
          {/* Badge */}
          <Badge variant="gold">BECOME A MEMBER</Badge>

          {/* Heading */}
          <h1 className="text-display-mobile md:text-display-lg text-on-primary">
            Join the Adivasi Producer Company (APC) Community
          </h1>

          {/* Subtitle */}
          <p className="text-body-lg text-on-primary/80 max-w-xl mx-auto">
            Become part of Odisha&apos;s first community-led tribal technology
            enterprise. Together, we can build a self-reliant future for
            indigenous communities.
          </p>
        </div>
      </Container>
    </section>
  );
}
