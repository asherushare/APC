import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';

const benefitsList = [
  {
    icon: 'community',
    title: 'Become an APC Shareholder',
    description: 'Transition from a client to a registered equity holder, establishing a direct stakeholder ownership role in the producer company.',
  },
  {
    icon: 'inclusion',
    title: 'Active Participation',
    description: 'Participate in APC annual general meetings, policy discussions, local governance boards, and strategic community voting.',
  },
  {
    icon: 'ethics',
    title: 'Community Development',
    description: 'Collaborate with indigenous producers to build long-term economic stability, self-reliance, and sustainable growth within tribal areas.',
  },
  {
    icon: 'rocket',
    title: 'Collective Enterprise',
    description: 'Leverage the combined bargaining and procurement capabilities of the company to access inputs, resources, and shared processing networks.',
  },
  {
    icon: 'leaf',
    title: 'Future Opportunities',
    description: 'Receive priority access to regional capacity building workshops, digital literacy events, and new cooperative processing initiatives.',
  },
];

export function MembershipBenefits() {
  return (
    <section id="benefits" className="py-16 md:py-24 bg-surface border-b border-outline-variant/30">
      <Container>
        <SectionHeading
          label="BENEFITS"
          title="Shareholder Rights & Value"
          subtitle="Explore what it means to be a co-owner in Adivasi Producer Company (APC)."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {benefitsList.map((benefit) => (
            <article
              key={benefit.title}
              className="bg-white border border-outline-variant/20 shadow-tribal rounded-2xl p-8 hover:-translate-y-1 hover:shadow-tribal-hover hover:border-primary/20 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Icon Placeholder or text icon (we can use emoji or a simple box) */}
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 text-2xl font-bold">
                  {benefit.icon === 'community' && '👥'}
                  {benefit.icon === 'inclusion' && '✍️'}
                  {benefit.icon === 'ethics' && '🌱'}
                  {benefit.icon === 'rocket' && '🚜'}
                  {benefit.icon === 'leaf' && '📈'}
                </div>

                <h3 className="text-headline-sm text-on-surface mb-3 font-extrabold">
                  {benefit.title}
                </h3>

                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
