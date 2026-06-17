import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ValueCard } from '@/components/ui/ValueCard';
import { governanceStructure } from '@/data/values';

export function GovernanceStructure() {
  return (
    <section className="py-16 md:py-24 bg-surface-container-low">
      <Container>
        <SectionHeading
          title="A Community-Owned Structure"
          subtitle="Adivasi Producer Company (APC) operates a unique model where governance is decentralized, ensuring that every decision serves the community's collective interest first."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {governanceStructure.map((item) => (
            <ValueCard key={item.title} value={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}
