import { Container } from '@/components/common/Container';
import { Badge } from '@/components/common/Badge';

export function JoinHero({ onLearnMore }: { onLearnMore?: () => void }) {
  return (
    <section className="bg-primary saura-pattern py-16 md:py-24 text-center text-white relative border-b-4 border-tribal-gold shadow-md">
      {/* Mesh background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30 pointer-events-none" />
      
      <Container className="relative z-10 space-y-6">
        {/* Badge */}
        <div className="flex justify-center select-none">
          <Badge variant="gold">BECOME AN APC SHAREHOLDER</Badge>
        </div>

        {/* Heading */}
        <h1 className="text-display-mobile md:text-display-lg text-white font-extrabold max-w-4xl mx-auto leading-tight drop-shadow-md">
          Own a Piece of Adivasi Producer Company
        </h1>

        {/* Subtitle */}
        <p className="text-body-lg text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-medium">
          Step into a co-owner role in Odisha&apos;s flagship tribal producer network. 
          Unify with local collectives to build regional enterprise wealth and scale sustainable livelihoods.
        </p>

        {/* Prominent Share Information Banner */}
        <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 md:p-5 mt-8 shadow-inner select-none flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/20 items-center justify-center gap-4 md:gap-0">
          <div className="space-y-1 w-full md:w-1/3 text-center pb-4 md:pb-0 md:px-4">
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-tribal-gold">Share Value</span>
            <p className="text-headline-sm md:text-headline-md font-black">₹10,000</p>
          </div>
          <div className="space-y-1 w-full md:w-1/3 text-center py-4 md:py-0 md:px-4">
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-tribal-gold">Minimum Limit</span>
            <p className="text-headline-sm md:text-headline-md font-black">1 Share</p>
          </div>
          <div className="space-y-1 w-full md:w-1/3 text-center pt-4 md:pt-0 md:px-4">
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-tribal-gold">Maximum Limit</span>
            <p className="text-headline-sm md:text-headline-md font-black">10 Shares</p>
          </div>
        </div>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <a
            href="#application-form"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('application-form');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="w-full sm:w-auto bg-tribal-gold text-on-surface hover:brightness-105 shadow-lg px-8 py-3.5 rounded-xl font-extrabold transition-all active:scale-[0.98] cursor-pointer select-none text-body-md uppercase tracking-wider text-center"
          >
            Apply Now
          </a>
          <a
            href="#benefits"
            onClick={(e) => {
              e.preventDefault();
              if (onLearnMore) {
                onLearnMore();
              }
              setTimeout(() => {
                const el = document.getElementById('benefits');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }}
            className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10 px-8 py-3.5 rounded-xl font-extrabold transition-all active:scale-[0.98] cursor-pointer select-none text-body-md uppercase tracking-wider"
          >
            Learn More
          </a>
        </div>
      </Container>
    </section>
  );
}
