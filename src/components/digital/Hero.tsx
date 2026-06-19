'use client';

import { Container } from '@/components/common/Container';
import { Search } from './Search';

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-[#064E2B] via-[#053d22] to-[#0B6B3A] animate-mesh py-24 md:py-32 border-b border-tribal-gold/20 text-center overflow-hidden select-none">
      {/* Decorative radial glow to elevate visual depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-tribal-gold/15 blur-[120px] rounded-full pointer-events-none" />
      {/* Decorative Saura tribal backdrop */}
      <div className="absolute inset-0 saura-pattern opacity-15 pointer-events-none mix-blend-overlay" style={{ backgroundAttachment: 'fixed' }} />
      
      <Container className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Badge */}
        <span className="text-tribal-gold text-label-xs md:text-label-sm font-extrabold uppercase tracking-widest px-4 py-1.5 bg-tribal-gold/10 backdrop-blur-md rounded-full border border-tribal-gold/30 mb-6 shadow-sm">
          Flagship Service Hub
        </span>
        
        {/* Title */}
        <h1 className="text-display-mobile md:text-display-lg text-white font-black leading-tight tracking-tight drop-shadow-lg">
          APC Digital
        </h1>
        
        {/* Subtitle */}
        <p className="text-headline-sm text-tribal-gold font-extrabold tracking-wide mt-3 drop-shadow-md">
          Your One-Stop Digital Service Platform
        </p>
        
        {/* Description */}
        <p className="text-body-lg text-white/85 max-w-2xl mt-5 leading-relaxed font-medium">
          Access secure, fast, and assisted digital services. We bridge government welfare, AI technologies, professional documentations, business setups, and organic farming consultations directly to your village block.
        </p>

        {/* Search Bar Input */}
        <div className="w-full max-w-2xl mt-10 relative z-20">
          <Search />
        </div>

        {/* Trust Statistics Strip */}
        <div className="mt-14 w-full max-w-3xl bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 md:p-6 grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/10 shadow-2xl">
          <div className="flex flex-col items-center justify-center pt-2 sm:pt-0 sm:px-4">
            <span className="text-headline-md font-black text-white">500+</span>
            <span className="text-[11px] font-bold text-tribal-gold uppercase tracking-widest mt-1">Villages Served</span>
          </div>
          <div className="flex flex-col items-center justify-center pt-5 sm:pt-0 sm:px-4">
            <span className="text-headline-md font-black text-white">10k+</span>
            <span className="text-[11px] font-bold text-tribal-gold uppercase tracking-widest mt-1">Services Delivered</span>
          </div>
          <div className="flex flex-col items-center justify-center pt-5 sm:pt-0 sm:px-4">
            <span className="text-headline-md font-black text-white">24/7</span>
            <span className="text-[11px] font-bold text-tribal-gold uppercase tracking-widest mt-1">Agent Support</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
