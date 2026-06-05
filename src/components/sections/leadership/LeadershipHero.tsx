import Image from 'next/image';
import { Container } from '@/components/common/Container';
import { Badge } from '@/components/common/Badge';

export function LeadershipHero() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge>OUR LEADERS</Badge>
            <h1 className="text-display-mobile md:text-display-lg text-on-surface mt-4 mb-6">
              Guided by Heritage, Focused on Progress
            </h1>
            <p className="text-body-lg text-on-surface-variant">
              Meet the visionaries bridging ancient tribal wisdom with modern economic
              frameworks to empower Odisha&apos;s rural producers.
            </p>
          </div>
          <div className="relative">
            <Image
              src="/images/hero-leadership.jpg"
              alt="Scenic Odisha hills at golden hour"
              width={600}
              height={400}
              className="rounded-xl object-cover w-full"
              priority
            />
            <div className="glass-card absolute bottom-4 right-4 px-4 py-3 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-on-surface">10,000+</p>
                <p className="text-label-sm text-on-surface-variant">Tribal Producers</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
