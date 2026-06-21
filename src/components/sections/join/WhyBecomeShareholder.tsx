import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';

const coreReasons = [
  {
    title: 'Cooperative Governance',
    description: 'Participate directly in APC democratic meetings, helping guide strategy, policies, and regional producer initiatives.',
    icon: '👥',
  },
  {
    title: 'Collective Bargaining Power',
    description: 'Combine resources with thousands of tribal producers to secure premium wholesale pricing, lower inputs, and direct access to high-value markets.',
    icon: '🌾',
  },
  {
    title: 'Community Upliftment',
    description: 'Contribute to building a sustainable and self-reliant tribal digital economy that keeps wealth in Rayagada and surrounding districts.',
    icon: '☀️',
  },
  {
    title: 'Future Enterprises',
    description: 'Get first-priority access to participate in new packaging units, processing facilities, warehouse storage, and international logistics.',
    icon: '🚀',
  },
];

export function WhyBecomeShareholder() {
  return (
    <section className="py-16 md:py-24 bg-surface saura-pattern border-b border-outline-variant/30">
      <Container>
        <SectionHeading
          label="OWNERSHIP"
          title="Why Become an APC Shareholder?"
          subtitle="Unlike general customers, shareholders own equity in the cooperative, directing its mission and sharing in the collective growth."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-4">
          {coreReasons.map((reason) => (
            <article
              key={reason.title}
              className="bg-white border border-outline-variant/20 shadow-tribal rounded-2xl p-6 hover:-translate-y-1 hover:shadow-tribal-hover hover:border-primary/20 transition-all duration-300 flex gap-5"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl shrink-0">
                {reason.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-headline-sm text-on-surface font-extrabold">{reason.title}</h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed">{reason.description}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
