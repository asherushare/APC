import Image from 'next/image';
import { Container } from '@/components/common/Container';
import { Badge } from '@/components/common/Badge';

export function BookingHero() {
  return (
    <section className="py-16 md:py-24 bg-surface relative overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left — Text */}
          <div className="space-y-6">
            <Badge variant="gold">BOOK A SERVICE</Badge>

            <h1 className="text-display-mobile md:text-display-lg text-on-surface">
              Schedule Your Service Appointment
            </h1>

            <p className="text-body-lg text-on-surface-variant max-w-lg">
              Fill in your details below and our team will confirm your
              appointment. Walk-ins are also welcome at our Rayagada office.
            </p>

            {/* Quick info pills */}
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-label-md font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mon – Sat, 9 AM – 6 PM
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tribal-gold/10 text-tribal-gold text-label-md font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Confirmation within 24h
              </span>
            </div>
          </div>

          {/* Right — Image */}
          <div className="relative">
            <Image
              src="/images/hero-services.jpg"
              alt="Adivasi Producer Company (APC) service center"
              width={600}
              height={500}
              className="rounded-xl object-cover w-full h-auto"
              priority
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
