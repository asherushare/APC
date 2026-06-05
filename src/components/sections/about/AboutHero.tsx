import Image from 'next/image';
import { Container } from '@/components/common/Container';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';

export function AboutHero() {
  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/hero-about.jpg"
        alt="Tribal communities of Odisha working together"
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover"
        priority
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Content */}
      <Container className="relative z-10 py-16 md:py-24">
        <div className="max-w-2xl space-y-6">
          {/* Badge */}
          <Badge variant="gold">OUR HERITAGE &amp; TECH</Badge>

          {/* Heading */}
          <h1 className="text-display-mobile md:text-display-lg text-on-surface">
            Rooted in Tradition, Driven by Innovation
          </h1>

          {/* Subtitle */}
          <p className="text-body-lg text-on-surface-variant max-w-xl">
            Discover how APC Odisha bridges centuries-old tribal wisdom with
            modern technology to build a self-reliant future for indigenous
            communities across Odisha.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button variant="primary" size="lg" href="#story" id="about-hero-explore">
              Explore Our Journey
            </Button>
            <Button variant="secondary" size="lg" href="#video" id="about-hero-video">
              {/* Play icon */}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              Watch Video
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
