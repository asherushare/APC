import { Container } from '@/components/common/Container';

export function RoadmapHero() {
  return (
    <section className="py-16 md:py-24 bg-surface-container-low">
      <Container>
        <p className="text-label-md uppercase tracking-wider text-primary font-semibold mb-4">
          Strategic Roadmap
        </p>
        <h1 className="text-display-mobile md:text-display-lg text-on-surface mb-6 max-w-3xl">
          Our Strategic Journey to Scale
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl">
          Empowering tribal communities through structured phases of institutional building,
          digital transformation, and sustainable market integration. We are building the future
          of rural commerce, one milestone at a time.
        </p>
      </Container>
    </section>
  );
}
