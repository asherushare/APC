import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ValueIcon } from '@/lib/icons';

const benefits = [
  {
    icon: 'community',
    title: 'Community Ownership',
    description: 'Every member is a shareholder with direct voting rights, ensuring profits and power return to the grassroots.',
  },
  {
    icon: 'digital',
    title: 'Access to Services',
    description: 'Get verified certificates, financial tools, and ticketing options directly at local service centers.',
  },
  {
    icon: 'rocket',
    title: 'Entrepreneurship Opportunities',
    description: 'Mentorship, initial capital support, and supply chain assistance to launch local agro-enterprises.',
  },
  {
    icon: 'inclusion',
    title: 'Digital Empowerment',
    description: 'Free digital literacy workshops and hand-held training to navigate modern financial/fintech products.',
  },
  {
    icon: 'leaf',
    title: 'Future Growth Opportunities',
    description: 'Priority placement in sustainable packaging units, logistics roles, and international market linkage programs.',
  },
];

export function MembershipBenefits() {
  return (
    <section className="py-16 md:py-24 bg-surface">
      <Container>
        <SectionHeading
          label="MEMBERSHIP BENEFITS"
          title="Why Join APC?"
          subtitle="Explore the exclusive advantages of becoming a registered cooperative shareholder in APC Odisha."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="bg-surface-container-lowest shadow-tribal rounded-xl p-8 hover:-translate-y-1 hover:shadow-tribal-hover transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                <ValueIcon name={benefit.icon} />
              </div>

              {/* Title */}
              <h3 className="text-headline-sm text-on-surface mb-2 font-semibold">
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
