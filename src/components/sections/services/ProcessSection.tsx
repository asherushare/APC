import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';

const steps = [
  {
    step: '01',
    title: 'Visit Hub or Agent',
    description: 'Locate your nearest APC Digital Service Center or get in touch with a local mobile agent in your cluster.',
  },
  {
    step: '02',
    title: 'Select & Submit',
    description: 'Choose from our fintech, documentation, or logistics services and submit basic credentials safely.',
  },
  {
    step: '03',
    title: 'Fast-Track Processing',
    description: 'Our digital network processes requests instantly, updating biometric registries or securing confirmed bookings.',
  },
];

export function ProcessSection() {
  return (
    <section className="py-16 md:py-24 bg-surface saura-pattern">
      <Container>
        <SectionHeading
          label="ACCESS WORKFLOW"
          title="How It Works"
          subtitle="Three simple steps for Adivasi producers to access modern digital utilities."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((item) => (
            <article
              key={item.step}
              className="relative p-6 bg-surface-container-lowest rounded-xl shadow-tribal border border-outline-variant/30 text-center flex flex-col items-center"
            >
              {/* Giant number indicator */}
              <span className="text-[64px] font-bold text-primary/10 leading-none mb-4 block">
                {item.step}
              </span>

              {/* Title */}
              <h3 className="text-headline-sm text-on-surface mb-3 font-semibold">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
