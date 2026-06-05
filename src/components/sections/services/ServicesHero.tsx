import Image from 'next/image';
import { Container } from '@/components/common/Container';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';

export function ServicesHero() {
  return (
    <section className="py-16 md:py-24 bg-surface">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left column — text */}
          <div className="space-y-6">
            <Badge>OUR IMPACT</Badge>

            <h1 className="text-display-lg text-on-surface">
              Comprehensive Services for Sustainable Growth
            </h1>

            <p className="text-body-lg text-on-surface-variant max-w-lg">
              Bridging tribal tradition and modern digital governance, APC
              Odisha delivers end-to-end services that empower producers,
              simplify compliance, and unlock new economic opportunities across
              rural Odisha.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button variant="primary" href="#portfolio" id="services-hero-explore">
                Explore Services
              </Button>
              <Button variant="secondary" id="services-hero-brochure">
                Download Brochure
              </Button>
            </div>
          </div>

          {/* Right column — image with stat overlay */}
          <div className="relative">
            <Image
              src="/images/hero-services.jpg"
              alt="APC Odisha team delivering digital services to tribal communities"
              width={600}
              height={500}
              className="rounded-xl object-cover w-full h-auto"
              priority
            />

            {/* Glass-card stat overlay */}
            <div className="glass-card absolute bottom-4 right-4 px-5 py-3 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-tribal-gold/20 flex items-center justify-center text-tribal-gold">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div>
                <p className="text-label-md font-semibold text-on-surface">50k+ Active Producers</p>
                <p className="text-label-sm text-on-surface-variant">Empowered</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
