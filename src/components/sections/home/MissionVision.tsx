import Image from 'next/image';
import { Container } from '@/components/common/Container';
import { companyInfo } from '@/data/company';

export function MissionVision() {
  return (
    <section className="py-16 md:py-24 bg-surface-container-low">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left — Image */}
          <div className="relative">
            <Image
              src="/images/mission-landscape.jpg"
              alt="Tribal landscape of Odisha"
              width={600}
              height={500}
              className="rounded-2xl object-cover w-full h-auto"
            />
          </div>

          {/* Right — Mission & Vision */}
          <div className="space-y-8">
            {/* Label */}
            <p className="text-label-md uppercase tracking-wider font-semibold text-primary">
              OUR PURPOSE
            </p>

            {/* Heading */}
            <h2 className="text-display-mobile md:text-headline-md text-on-surface">
              Driven by Community, Empowered by Tech
            </h2>

            {/* Mission Block */}
            <div className="flex gap-4">
              {/* Green Square Icon */}
              <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-headline-sm text-on-surface mb-1">Mission</h3>
                <p className="text-body-md text-on-surface-variant">
                  {companyInfo.mission}
                </p>
              </div>
            </div>

            {/* Vision Block */}
            <div className="flex gap-4">
              {/* Gold Square Icon */}
              <div className="w-10 h-10 rounded-md bg-tribal-gold flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-headline-sm text-on-surface mb-1">Vision</h3>
                <p className="text-body-md text-on-surface-variant">
                  {companyInfo.vision}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
