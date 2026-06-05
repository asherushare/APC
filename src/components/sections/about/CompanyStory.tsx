import Image from 'next/image';
import { Container } from '@/components/common/Container';
import { companyInfo } from '@/data/company';

export function CompanyStory() {
  return (
    <section id="story" className="py-16 md:py-24">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left: Image with stat overlay */}
          <div className="relative">
            <Image
              src="/images/about-story.jpg"
              alt="APC Odisha community empowerment story"
              width={600}
              height={500}
              className="rounded-2xl object-cover w-full h-auto shadow-tribal"
            />

            {/* Stat overlay badge at bottom-left */}
            <div className="absolute bottom-4 left-4 bg-primary text-on-primary px-5 py-3 rounded-xl shadow-lg">
              <p className="text-label-sm uppercase tracking-wider opacity-80">Empowered</p>
              <p className="text-headline-sm font-bold">15+ Tribal Districts</p>
            </div>
          </div>

          {/* Right: Story content */}
          <div className="space-y-6">
            <p className="text-label-md uppercase tracking-wider font-semibold text-primary">
              WHO WE ARE
            </p>

            <h2 className="text-display-mobile md:text-headline-md text-on-surface">
              The APC Story
            </h2>

            <p className="text-body-lg text-on-surface-variant">
              {companyInfo.description}
            </p>

            <p className="text-body-md text-on-surface-variant">
              Born from the aspirations of tribal communities in Odisha,{' '}
              {companyInfo.fullName} ({companyInfo.name}) is a first-of-its-kind
              producer company fully owned and operated by indigenous
              communities. We combine traditional knowledge with digital
              innovation to create sustainable livelihoods.
            </p>

            {/* Three small info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {/* Income */}
              <article className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-label-md font-semibold text-on-surface">Income</h3>
                <p className="text-label-sm text-on-surface-variant mt-1">
                  Fair pricing and profit sharing for every producer
                </p>
              </article>

              {/* Innovation */}
              <article className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/50">
                <div className="w-10 h-10 rounded-lg bg-tribal-gold/10 flex items-center justify-center text-tribal-gold mb-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </div>
                <h3 className="text-label-md font-semibold text-on-surface">Innovation</h3>
                <p className="text-label-sm text-on-surface-variant mt-1">
                  Digital tools and modern technology for rural growth
                </p>
              </article>

              {/* Improvement */}
              <article className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                </div>
                <h3 className="text-label-md font-semibold text-on-surface">Improvement</h3>
                <p className="text-label-sm text-on-surface-variant mt-1">
                  Continuous upliftment of living standards
                </p>
              </article>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
