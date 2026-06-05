import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';
import { membershipBenefits } from '@/data/benefits';

export function CommunityOwnership() {
  return (
    <section className="py-16 md:py-24 bg-surface-container-low">
      <Container>
        <div className="max-w-3xl">
          {/* Label */}
          <p className="text-label-md uppercase tracking-wider font-semibold text-primary mb-4">
            GOVERNANCE MODEL
          </p>

          {/* Heading */}
          <h2 className="text-display-mobile md:text-headline-md text-on-surface mb-6">
            100% Community Owned
          </h2>

          {/* Description */}
          <p className="text-body-lg text-on-surface-variant mb-8 max-w-2xl">
            Unlike conventional corporations, APC Odisha is entirely owned by
            the tribal communities it serves. Every decision, every profit, and
            every innovation flows back to the people who make it possible.
          </p>

          {/* Bullet Points */}
          <ul className="space-y-5 mb-10">
            {membershipBenefits.map((benefit) => (
              <li key={benefit.title} className="flex items-start gap-4">
                {/* Checkmark icon */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-body-lg font-semibold text-on-surface">
                    {benefit.title}
                  </h3>
                  <p className="text-body-md text-on-surface-variant mt-1">
                    {benefit.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <Button variant="primary" size="lg" href="/leadership" id="about-governance-cta">
            Understand Our Governance
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Button>
        </div>
      </Container>
    </section>
  );
}
