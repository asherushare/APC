import Image from 'next/image';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';

export function Vision2030() {
  return (
    <section className="py-16 md:py-24 bg-inverse-surface text-inverse-on-surface">
      <Container>
        <SectionHeading
          title="Vision 2030"
          subtitle="Our long-term commitment to reshaping the economic landscape of rural Odisha through heritage tech and communal growth."
          light
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Large Image Card */}
          <div className="relative rounded-xl overflow-hidden min-h-[300px]">
            <Image
              src="/images/vision-2030.jpg"
              alt="Panoramic view of Odisha agricultural landscape"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-label-sm text-tribal-gold uppercase tracking-wider mb-2">
                Primary Goal
              </p>
              <h3 className="text-headline-md text-white mb-2">
                100% Economic Self-Reliance
              </h3>
              <p className="text-body-md text-white/80">
                Creating a self-sustaining ecosystem where every tribal household
                participates in a thriving digital economy while preserving their cultural heritage.
              </p>
            </div>
          </div>

          {/* Right: Cards Grid */}
          <div className="grid grid-rows-2 gap-6">
            {/* Global Brand Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 flex flex-col justify-center">
              <div className="w-12 h-12 rounded-full bg-tribal-gold/20 flex items-center justify-center text-tribal-gold mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <h3 className="text-headline-sm text-white mb-2">Global Brand Presence</h3>
              <p className="text-body-md text-white/70">
                Exporting Odisha&apos;s tribal brilliance to 20+ countries by 2030.
              </p>
            </div>

            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              <div className="bg-primary rounded-xl p-6 text-center flex flex-col justify-center">
                <p className="text-display-mobile text-white mb-1">1 Million+</p>
                <p className="text-label-md text-white/80">Lives impacted through direct engagement</p>
              </div>
              <div className="bg-tribal-gold rounded-xl p-6 text-center flex flex-col justify-center">
                <p className="text-display-mobile text-white mb-1">Net Zero</p>
                <p className="text-label-md text-white/80">Operations with 100% organic certification</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
