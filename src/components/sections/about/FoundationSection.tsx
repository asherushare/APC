import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ValueCard } from '@/components/ui/ValueCard';
import { companyInfo } from '@/data/company';
import { foundationValues } from '@/data/values';

export function FoundationSection() {
  return (
    <section className="py-16 md:py-24 bg-surface-container-lowest saura-pattern">
      <Container>
        {/* Section Heading */}
        <SectionHeading
          label="WHAT GUIDES US"
          title="Our Foundation"
          subtitle="Built on clarity, transparency, and a relentless focus on community benefit."
        />

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
          {/* Mission Card */}
          <article className="relative bg-primary rounded-2xl p-8 md:p-10 text-on-primary overflow-hidden">
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full" />

            <div className="relative space-y-4">
              <p className="text-label-sm uppercase tracking-widest text-on-primary/70 font-semibold">
                MISSION
              </p>
              <h3 className="text-headline-md text-on-primary">
                Transforming Livelihoods
              </h3>
              <p className="text-body-md text-on-primary/85 leading-relaxed">
                {companyInfo.mission}
              </p>
            </div>

            {/* Icon */}
            <div className="mt-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
            </div>
          </article>

          {/* Vision Card */}
          <article className="relative bg-inverse-surface rounded-2xl p-8 md:p-10 text-inverse-on-surface overflow-hidden">
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-tribal-gold/10 rounded-bl-full" />

            <div className="relative space-y-4">
              <p className="text-label-sm uppercase tracking-widest text-tribal-gold font-semibold">
                VISION
              </p>
              <h3 className="text-headline-md text-inverse-on-surface">
                Global Heritage Brand
              </h3>
              <p className="text-body-md text-inverse-on-surface/85 leading-relaxed">
                {companyInfo.vision}
              </p>
            </div>

            {/* Icon */}
            <div className="mt-6 w-12 h-12 rounded-full bg-tribal-gold/15 flex items-center justify-center">
              <svg className="w-6 h-6 text-tribal-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
          </article>
        </div>

        {/* Foundation Value Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {foundationValues.map((value) => (
            <ValueCard key={value.title} value={value} />
          ))}
        </div>
      </Container>
    </section>
  );
}
