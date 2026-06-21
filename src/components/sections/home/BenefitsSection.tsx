import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { BenefitIcon } from '@/lib/icons';
import { membershipBenefits } from '@/data/benefits';

export function BenefitsSection() {
  return (
    <section className="py-16 md:py-24 bg-surface-container-low">
      <Container>
        <SectionHeading
          title="Why Become an APC Shareholder?"
          subtitle="Discover the benefits of community ownership and structured scaling for Adivasi producers"
          label="MEMBERSHIP BENEFITS"
        />

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {membershipBenefits.map((benefit) => (
            <article
              key={benefit.title}
              className="bg-surface-container-lowest rounded-xl shadow-tribal p-8 hover:-translate-y-1 hover:shadow-tribal-hover transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-6">
                <BenefitIcon name={benefit.icon} />
              </div>

              {/* Title */}
              <h3 className="text-headline-sm text-on-surface mb-3">
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
