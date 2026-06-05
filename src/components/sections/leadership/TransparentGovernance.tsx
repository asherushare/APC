import Image from 'next/image';
import { Container } from '@/components/common/Container';

const governancePoints = [
  {
    title: 'Tribal Representation',
    description: 'Ensuring 100% tribal representation in the core decision-making committees to protect ancestral rights and ecological wisdom.',
  },
  {
    title: 'Social Accountability',
    description: 'Regular social audits conducted by independent community observers to ensure ethical management and fair trade practices.',
  },
  {
    title: 'Open-Book Policy',
    description: 'Live dashboard for cooperative members to track sales data, operational costs, and development fund allocation.',
  },
];

export function TransparentGovernance() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <Image
            src="/images/governance-team.jpg"
            alt="APC tribal leaders discussing governance"
            width={600}
            height={400}
            className="rounded-xl object-cover w-full"
          />
          <div>
            <h2 className="text-display-mobile md:text-headline-md text-on-surface mb-8">
              Transparent Governance
            </h2>
            <div className="space-y-6">
              {governancePoints.map((point) => (
                <div key={point.title} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-headline-sm text-on-surface mb-1">{point.title}</h3>
                    <p className="text-body-md text-on-surface-variant">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
