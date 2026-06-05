import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ValueIcon } from '@/lib/icons';
import { coreValues } from '@/data/values';

export function CorePillars() {
  /* Pull specific values from data */
  const community = coreValues.find((v) => v.title === 'Community Ownership') ?? coreValues[0];
  const entrepreneurship = coreValues.find((v) => v.title === 'Entrepreneurship') ?? coreValues[2];
  const digital = coreValues.find((v) => v.title === 'Digital Empowerment') ?? coreValues[1];
  const tribal = coreValues.find((v) => v.title === 'Tribal Development') ?? coreValues[3];

  return (
    <section className="py-16 md:py-24">
      <Container>
        <SectionHeading
          title="Core Pillars"
          subtitle="Building Opportunity Through Community Ownership"
        />

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Large card — Community Development */}
          <article className="bg-surface-container-lowest rounded-xl shadow-tribal p-8 md:p-10 row-span-2 flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                <ValueIcon name={community.icon} />
              </div>
              <h3 className="text-headline-md text-on-surface mb-3">
                {community.title}
              </h3>
              <p className="text-body-lg text-on-surface-variant">
                {community.description}
              </p>
            </div>
            {/* Decorative pattern */}
            <div className="mt-8 h-2 w-24 rounded-full bg-tribal-gold/30" />
          </article>

          {/* Entrepreneurship — standard card */}
          <article className="bg-surface-container-lowest rounded-xl shadow-tribal p-6 md:p-8 hover:-translate-y-1 hover:shadow-tribal-hover transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
              <ValueIcon name={entrepreneurship.icon} />
            </div>
            <h3 className="text-headline-sm text-on-surface mb-2">
              {entrepreneurship.title}
            </h3>
            <p className="text-body-md text-on-surface-variant">
              {entrepreneurship.description}
            </p>
          </article>

          {/* Digital Empowerment — standard card */}
          <article className="bg-surface-container-lowest rounded-xl shadow-tribal p-6 md:p-8 hover:-translate-y-1 hover:shadow-tribal-hover transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
              <ValueIcon name={digital.icon} />
            </div>
            <h3 className="text-headline-sm text-on-surface mb-2">
              {digital.title}
            </h3>
            <p className="text-body-md text-on-surface-variant">
              {digital.description}
            </p>
          </article>

          {/* Dark card — Tribal Leadership */}
          <article className="bg-primary rounded-xl shadow-tribal p-8 md:p-10 md:col-span-2 text-white">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-14 h-14 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                <ValueIcon name={tribal.icon} />
              </div>
              <div>
                <h3 className="text-headline-md mb-2">
                  {tribal.title}
                </h3>
                <p className="text-body-lg text-white/80">
                  {tribal.description}
                </p>
              </div>
            </div>
          </article>
        </div>
      </Container>
    </section>
  );
}
