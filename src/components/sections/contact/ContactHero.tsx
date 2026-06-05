import { Container } from '@/components/common/Container';
import { Badge } from '@/components/common/Badge';

export function ContactHero() {
  return (
    <section className="bg-primary py-16 md:py-24 text-center text-white">
      <Container>
        <Badge variant="gold">GET IN TOUCH</Badge>
        <h1 className="text-display-mobile md:text-display-lg mt-4 mb-6">
          Connect With Our Team
        </h1>
        <p className="text-body-lg text-white/80 max-w-xl mx-auto">
          We are here to support our community of tribal producers. Whether you have a
          query about membership, services, or collaboration, our team in Rayagada is
          ready to assist.
        </p>
      </Container>
    </section>
  );
}
