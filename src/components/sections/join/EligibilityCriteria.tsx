import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';

const eligibilityList = [
  {
    title: 'Odisha Residency',
    description: 'Applicants must reside in the state of Odisha, prioritizing producer clusters in tribal areas like Rayagada, Koraput, and Kalahandi.',
    icon: '📍',
  },
  {
    title: 'Active Producer Role',
    description: 'Active involvement in farming, animal husbandry, aquaculture, handicraft weaving, or gathering minor forest produce (MFP).',
    icon: '👨‍🌾',
  },
  {
    title: 'Age Requirement',
    description: 'Individual applicants must be at least 18 years of age and hold active legal identification (Aadhaar number).',
    icon: '🎂',
  },
  {
    title: 'Cooperative Mission',
    description: 'Belief in cooperative business growth, alignment with the community collective, and commitment to follow APC policies.',
    icon: '🤝',
  },
];

export function EligibilityCriteria() {
  return (
    <section className="py-16 md:py-24 bg-surface-container-low border-b border-outline-variant/30">
      <Container>
        <SectionHeading
          label="ELIGIBILITY"
          title="Who Can Become an APC Shareholder?"
          subtitle="Membership is designed for local producer-citizens committed to community co-ownership and collective enterprise development."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 select-none">
          {eligibilityList.map((item) => (
            <div
              key={item.title}
              className="bg-white border border-outline-variant/20 shadow-tribal rounded-2xl p-6 hover:-translate-y-1 hover:shadow-tribal-hover hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl mb-4">
                {item.icon}
              </div>
              <h3 className="text-headline-sm text-on-surface font-extrabold mb-2">{item.title}</h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
