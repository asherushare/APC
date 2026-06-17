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
            Discover how Adivasi Producer Company (APC) bridges centuries-old
            tribal wisdom with modern technology to build a self-reliant future
            for indigenous communities across Odisha.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button variant="primary" size="lg" href="#story" id="about-hero-explore">
              Explore Our Journey
            </Button>
            <Button variant="secondary" size="lg" href="/leadership" id="about-hero-leadership">
              {/* Users icon */}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 20M14.214 16.058A8.17 8.17 0 0010 15.06a8.17 8.17 0 00-4.214.998m10.028-3.99A4.5 4.5 0 1112 6.25a4.5 4.5 0 012.214 5.818M19.5 10.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              Meet Our Leaders
            </Button>

          </div>
        </div>
      </Container>
    </section>
  );
}
