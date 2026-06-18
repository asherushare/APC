'use client';

import { Container } from '@/components/common/Container';
import { Search } from './Search';

export function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-[#064E2B] via-[#053d22] to-[#04331c] py-20 md:py-24 border-b border-tribal-gold/20 text-center overflow-hidden select-none">
      {/* Decorative radial glow to elevate visual depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/25 blur-[120px] rounded-full pointer-events-none" />
      {/* Decorative Saura tribal backdrop */}
      <div className="absolute inset-0 saura-pattern opacity-10 pointer-events-none" />
      
      <Container className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Badge */}
        <span className="text-tribal-gold text-label-xs md:text-label-sm font-extrabold uppercase tracking-widest px-3.5 py-1 bg-tribal-gold/10 rounded-full border border-tribal-gold/25 mb-5 shadow-sm">
          Flagship Service Hub
        </span>
        
        {/* Title */}
        <h1 className="text-display-mobile md:text-display-md text-white font-black leading-tight tracking-tight">
          APC Digital
        </h1>
        
        {/* Subtitle */}
        <p className="text-headline-sm text-tribal-gold font-extrabold tracking-wide mt-2.5">
          Your One-Stop Digital Service Platform
        </p>
        
        {/* Description */}
        <p className="text-body-lg text-white/80 max-w-2xl mt-4 leading-relaxed">
          Access secure, fast, and assisted digital services. We bridge government welfare, AI technologies, professional documentations, business setups, and organic farming consultations directly to your village block.
        </p>

        {/* Search Bar Input */}
        <div className="w-full max-w-2xl mt-8">
          <Search />
        </div>
      </Container>
    </section>
  );
}
