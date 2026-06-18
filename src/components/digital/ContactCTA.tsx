import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';
import { companyInfo } from '@/data/company';

export function ContactCTA() {
  return (
    <section className="py-12 bg-surface-container-low border-t border-outline-variant/30">
      <Container className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="space-y-2">
          <h2 className="text-headline-sm font-bold text-on-surface">Prefer Visiting Us in Person?</h2>
          <p className="text-body-md text-on-surface-variant max-w-xl">
            You can visit our main corporate office in {companyInfo.address.city}, {companyInfo.address.state} or proceed to your nearest local block service helpdesk.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Button variant="secondary" href="/contact" id="contact-cta-btn">
            Office Address
          </Button>
          <a
            href={`tel:${companyInfo.phone.replace(/\s+/g, '')}`}
            className="inline-flex items-center justify-center border border-primary text-primary hover:bg-primary/5 active:scale-[0.98] rounded-lg px-5 py-2.5 text-label-md font-semibold transition-all cursor-pointer"
          >
            Call Helpdesk
          </a>
        </div>
      </Container>
    </section>
  );
}
