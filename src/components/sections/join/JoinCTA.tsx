import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';

export function JoinCTA() {
  return (
    <section className="py-16 md:py-24">
      <Container className="text-center">
        <h2 className="text-display-mobile md:text-headline-md text-on-surface mb-4">
          Have Questions?
        </h2>
        <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto mb-8">
          Whether you need more information about membership benefits or want to visit our
          office in Rayagada, our team is happy to help.
        </p>
        <Button href="/contact">Contact Our Team</Button>
      </Container>
    </section>
  );
}
