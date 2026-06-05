'use client';

import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';

export function NewsletterCTA() {
  return (
    <section className="py-16 md:py-24 bg-inverse-surface">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:max-w-lg">
            <h2 className="text-display-mobile md:text-headline-md text-white mb-3">
              Stay Informed
            </h2>
            <p className="text-body-lg text-white/70">
              Join our mailing list to receive updates on our impact, new services,
              and success stories from our producers.
            </p>
          </div>
          <form className="flex w-full md:w-auto gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 md:w-72 px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:border-tribal-gold focus:ring-1 focus:ring-tribal-gold transition-colors"
              id="newsletter-email"
            />
            <Button
              type="submit"
              variant="gold"
              className="flex-shrink-0"
              id="newsletter-submit"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </Container>
    </section>
  );
}
