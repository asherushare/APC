import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { FAQItem } from '@/components/ui/FAQItem';
import { faqs } from '@/data/faq';

export function FAQSection() {
  return (
    <section className="py-16 md:py-24 bg-surface-container-low">
      <Container className="max-w-2xl mx-auto">
        <SectionHeading
          title="Frequently Asked Questions"
          subtitle="Quick answers to common questions about Adivasi Producer Company (APC)."
        />
        <div className="space-y-4">
          {faqs.map((faq) => (
            <FAQItem key={faq.question} faq={faq} />
          ))}
        </div>
      </Container>
    </section>
  );
}
