import Image from 'next/image';
import { Container } from '@/components/common/Container';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { companyInfo } from '@/data/company';

export function HeroSection() {
  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center">
      {/* Background Image */}
      <Image
        src="/images/hero-home.jpg"
        alt="Tribal communities of Odisha"
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
          <Badge variant="gold">Heritage Technology Pioneer</Badge>

          {/* Heading */}
          <h1 className="text-display-mobile md:text-display-lg text-on-surface">
            Empowering Tribal Communities Through Enterprise, Technology &amp; Innovation
          </h1>

          {/* Subtitle */}
          <p className="text-body-lg text-on-surface-variant">
            {companyInfo.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Button variant="primary" size="lg" href="/join" id="hero-join-btn">
              Join APC
            </Button>
            <Button variant="secondary" size="lg" href="/services" id="hero-services-btn">
              Explore Services
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
