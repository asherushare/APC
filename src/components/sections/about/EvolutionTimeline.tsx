import Image from 'next/image';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import type { TimelineEvent } from '@/types';

const timelineEntries: TimelineEvent[] = [
  {
    year: '2019',
    title: 'The Seed is Sown',
    description:
      'A group of visionary tribal leaders from Rayagada and Koraput came together to form APC Odisha — a bold experiment in community-owned enterprise. With just a handful of founding members and a dream of self-reliance, the foundation was laid.',
    image: '/images/about-timeline-1.jpg',
  },
  {
    year: '2021',
    title: 'Digital Transformation',
    description:
      'APC embraced technology as a great equalizer. From launching digital service kiosks in remote villages to training tribal youth in IT skills, this phase marked the convergence of heritage and innovation. Our reach expanded to 15+ districts.',
    image: '/images/about-timeline-2.jpg',
  },
  {
    year: 'Today',
    title: 'A Global Blueprint',
    description:
      'Today, APC Odisha stands as a replicable model for community-led development. With partnerships spanning government, NGOs, and international bodies, we are building a global heritage brand rooted in tribal wisdom and sustainable enterprise.',
    image: '/images/about-timeline-3.jpg',
  },
];

export function EvolutionTimeline() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        {/* Section Heading */}
        <SectionHeading
          label="OUR JOURNEY"
          title="The Evolution of APC"
          subtitle="From a grassroots idea to a national model for tribal empowerment."
        />

        {/* Timeline Entries */}
        <div className="space-y-16 md:space-y-24">
          {timelineEntries.map((entry, index) => {
            const isReversed = index % 2 !== 0;

            return (
              <article
                key={entry.year}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center"
              >
                {/* Image */}
                <div
                  className={`relative ${isReversed ? 'md:order-2' : ''}`}
                >
                  <Image
                    src={entry.image}
                    alt={entry.title}
                    width={500}
                    height={350}
                    className="rounded-2xl object-cover w-full h-auto shadow-tribal"
                  />

                  {/* Decorative connector line (hidden on mobile) */}
                  {index < timelineEntries.length - 1 && (
                    <div className="hidden md:block absolute -bottom-16 left-1/2 w-0.5 h-16 bg-outline-variant/40" />
                  )}
                </div>

                {/* Text Content */}
                <div
                  className={`space-y-4 ${isReversed ? 'md:order-1' : ''}`}
                >
                  {/* Year badge */}
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-label-md font-bold">
                    {entry.year}
                  </span>

                  {/* Title */}
                  <h3 className="text-headline-md text-on-surface">
                    {entry.title}
                  </h3>

                  {/* Description */}
                  <p className="text-body-lg text-on-surface-variant leading-relaxed">
                    {entry.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
