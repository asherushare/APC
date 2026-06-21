import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';

const steps = [
  {
    number: '01',
    title: 'Submit Application',
    description: 'Complete the digital form wizard and submit details via WhatsApp to the APC helpdesk.',
  },
  {
    number: '02',
    title: 'Field Verification',
    description: 'A block coordinator visits your cluster to verify producer activity and collect physical copies of documents.',
  },
  {
    number: '03',
    title: 'Board Approval',
    description: 'The regional APC advisory board reviews the field reports and approves your shareholder entry.',
  },
  {
    number: '04',
    title: 'Share Allotment',
    description: 'Deposit confirmation, allocation of your unique Membership ID, and share certificate dispatch.',
  },
];

export function MembershipProcess() {
  return (
    <section className="py-16 md:py-24 bg-surface saura-pattern border-b border-outline-variant/30">
      <Container>
        <SectionHeading
          label="TIMELINE"
          title="Onboarding Roadmap"
          subtitle="Four clear steps to finalize your equity subscription and activate your cooperative shareholder role."
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-4">
          {steps.map((step, index) => (
            <article key={step.number} className="relative flex flex-col items-center text-center space-y-4 select-none">
              {/* Process line connector (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[60%] right-[-40%] h-0.5 bg-primary/20 z-0" />
              )}

              {/* Number Circle */}
              <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-black text-lg z-10 shadow-md">
                {step.number}
              </div>

              {/* Title */}
              <h3 className="text-headline-sm text-on-surface font-extrabold">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-body-md text-on-surface-variant max-w-[240px]">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
