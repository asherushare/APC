import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';

export function ShareholderSection() {
  return (
    <section className="py-12 md:py-16 bg-surface">
      <Container>
        <div className="border-2 border-tribal-gold bg-surface-container-lowest rounded-2xl p-8 md:p-12 shadow-tribal flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left Text */}
          <div className="max-w-2xl space-y-4 text-center md:text-left">
            <span className="inline-block bg-tribal-gold/15 text-tribal-gold px-3.5 py-1 rounded-full text-label-sm font-semibold uppercase tracking-wider">
              100% COMMUNITY OWNED
            </span>
            <h2 className="text-display-mobile md:text-headline-md text-on-surface">
              Owned by the People, Guided by Tradition
            </h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Every Adivasi producer we serve is a shareholder. APC Odisha is entirely owned and directed by the community, returning 100% of profits, growth, and governance to our member cooperatives.
            </p>
          </div>

          {/* Right Action */}
          <div className="flex-shrink-0">
            <Button variant="gold" size="lg" href="/join" id="shareholder-join-btn">
              Become a Member
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
