import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ValueCard } from '@/components/ui/ValueCard';

const eligibilityList = [
  {
    title: 'Tribal Community Members',
    description: 'Indigenous producers, farmers, and artisans living in Odisha looking to scale their livelihoods.',
    icon: 'community',
  },
  {
    title: 'Mission Believers',
    description: 'Individuals passionate about APC\'s mission of empowering tribal communities through commerce and technology.',
    icon: 'inclusion',
  },
  {
    title: 'Community Entrepreneurs',
    description: 'Local business leaders, co-op organizers, and youth driving value addition at the grassroots.',
    icon: 'rocket',
  },
  {
    title: 'Social Contributors',
    description: 'Development practitioners, volunteers, and researchers dedicated to sustainable tribal upliftment.',
    icon: 'ethics',
  },
];

export function EligibilityCriteria() {
  return (
    <section className="py-16 md:py-24 bg-surface">
      <Container>
        <SectionHeading
          label="ELIGIBILITY"
          title="Who Can Join APC?"
          subtitle="We welcome individuals and collectives committed to collective growth and empowerment."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {eligibilityList.map((item) => (
            <ValueCard key={item.title} value={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}
