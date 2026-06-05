import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';

const membershipTypes = [
  {
    title: 'Producer Member',
    description: 'For tribal farmers and artisans',
    price: '₹100/year',
    features: [
      'Access to digital service centres',
      'Government scheme navigation',
      'Training workshops and events',
      'Voting rights in annual meetings',
    ],
    highlighted: false,
  },
  {
    title: 'Associate Member',
    description: 'For supporters and partners',
    price: '₹500/year',
    features: [
      'All Producer Member benefits',
      'Priority mentorship access',
      'Market linkage opportunities',
      'Quarterly progress reports',
    ],
    highlighted: true,
  },
  {
    title: 'Institutional Partner',
    description: 'For NGOs and research organizations',
    price: 'Contact us',
    features: [
      'Collaborative project partnerships',
      'Research and data sharing access',
      'Co-branded community initiatives',
      'Dedicated partnership manager',
    ],
    highlighted: false,
  },
];

export function MembershipTypes() {
  return (
    <section className="py-16 md:py-24 bg-surface-container-low">
      <Container>
        <SectionHeading title="Membership Options" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {membershipTypes.map((type) => (
            <article
              key={type.title}
              className={`bg-surface-container-lowest rounded-lg p-8 flex flex-col ${
                type.highlighted
                  ? 'border-2 border-tribal-gold shadow-tribal relative'
                  : 'shadow-tribal'
              }`}
            >
              {/* Popular Badge */}
              {type.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="gold">POPULAR</Badge>
                </div>
              )}

              {/* Title */}
              <h3 className="text-headline-sm text-on-surface mt-2">
                {type.title}
              </h3>

              {/* Description */}
              <p className="text-body-md text-on-surface-variant mt-1">
                {type.description}
              </p>

              {/* Price */}
              <p className="text-display-mobile text-primary font-bold mt-4 mb-6">
                {type.price}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {type.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-body-md text-on-surface-variant"
                  >
                    {/* Checkmark Icon */}
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                variant={type.highlighted ? 'primary' : 'secondary'}
                href="#register"
                id={`join-get-started-${type.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="w-full"
              >
                Get Started
              </Button>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
