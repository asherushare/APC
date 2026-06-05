import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';

const steps = [
  {
    number: '01',
    title: 'Submit Interest',
    description: 'Fill out the simple online registration form below with your location and occupation details.',
  },
  {
    number: '02',
    title: 'Verification',
    description: 'Our local agent coordinates with you to verify your credentials and tribal collective alignment.',
  },
  {
    number: '03',
    title: 'Approval',
    description: 'The regional APC advisory board approves the application for collective shareholder onboarding.',
  },
  {
    number: '04',
    title: 'Activation',
    description: 'Receive your membership ID, equity share details, and full access to our digital service network.',
  },
];

export function MembershipProcess() {
  return (
    <section className="py-16 md:py-24 bg-surface-container-low saura-pattern">
      <Container>
        <SectionHeading
          label="THE PROCESS"
          title="Onboarding Roadmap"
          subtitle="Four clear steps to activate your membership and join the cooperative board."
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <article key={step.number} className="relative flex flex-col items-center text-center space-y-4">
              {/* Process dot line connector (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[60%] right-[-40%] h-0.5 bg-primary/20 z-0" />
              )}

              {/* Number Circle */}
              <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg z-10 shadow-md">
                {step.number}
              </div>

              {/* Title */}
              <h3 className="text-headline-sm text-on-surface font-semibold">
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
