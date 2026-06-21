'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Container } from '@/components/common/Container';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';

const slides = [
  {
    image: '/images/hero-home.jpg',
    badge: 'Heritage Technology Pioneer',
    title: 'Adivasi Producer Company (APC)',
    description: 'Empowering tribal communities through enterprise and innovation. We bridge traditional wisdom with modern technology to build sustainable, self-reliant communities across Odisha.',
    ctaPrimary: 'Become a Shareholder',
    ctaPrimaryHref: '/join',
    ctaSecondary: 'Explore Services',
    ctaSecondaryHref: '/services',
  },
  {
    image: '/images/hero-services.jpg',
    badge: 'APC Digital',
    title: 'Bringing Digital Governance to the Grassroots',
    description: 'Providing caste certificates, Aadhaar services, and direct access to essential government welfare schemes at the village helpdesk level.',
    ctaPrimary: 'Book a Service',
    ctaPrimaryHref: '/book',
    ctaSecondary: 'View Services',
    ctaSecondaryHref: '/services',
  },
  {
    image: '/images/mission-landscape.jpg',
    badge: 'Sustainable Agro-Enterprise',
    title: 'Organic Farming & Global Market Linkages',
    description: 'Connecting tribal farmers directly to national buyers, boosting organic turmeric value, and creating direct co-op revenues.',
    ctaPrimary: 'Learn About Us',
    ctaPrimaryHref: '/about',
    ctaSecondary: 'Read Success Stories',
    ctaSecondaryHref: '/notices',
  },
  {
    image: '/images/about-community.jpg',
    badge: 'Women Cooperatives',
    title: 'Empowering Women through Collective Enterprise',
    description: 'Organizing grading, processing, and marketing networks for tribal women to secure economic sovereignty and double household incomes.',
    ctaPrimary: 'Become a Shareholder',
    ctaPrimaryHref: '/join',
    ctaSecondary: 'Meet Our Leadership',
    ctaSecondaryHref: '/leadership',
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Rotate slide every 6 seconds
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden bg-surface-container-high">
      {/* Background Slides */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out z-0",
              isActive ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 hero-gradient" />
          </div>
        );
      })}

      {/* Content */}
      <Container className="relative z-10 py-16 md:py-24">
        <div className="max-w-2xl space-y-6">
          {/* Badge */}
          <div className="transition-all duration-500">
            <Badge variant="gold">{slides[currentSlide].badge}</Badge>
          </div>

          {/* Heading */}
          <h1 className="text-display-mobile md:text-display-lg text-on-surface leading-tight transition-all duration-500">
            {slides[currentSlide].title}
          </h1>

          {/* Subtitle */}
          <p className="text-body-lg text-on-surface-variant leading-relaxed transition-all duration-500">
            {slides[currentSlide].description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2 transition-all duration-500">
            <Button
              variant="primary"
              size="lg"
              href={slides[currentSlide].ctaPrimaryHref}
              id={`hero-cta-primary-${currentSlide}`}
              className="w-full sm:w-auto"
            >
              {slides[currentSlide].ctaPrimary}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              href={slides[currentSlide].ctaSecondaryHref}
              id={`hero-cta-secondary-${currentSlide}`}
              className="w-full sm:w-auto"
            >
              {slides[currentSlide].ctaSecondary}
            </Button>
          </div>
        </div>
      </Container>

      {/* Nav Arrows */}
      <button
        onClick={handlePrev}
        aria-label="Previous Slide"
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-on-surface p-1.5 md:p-2 rounded-full backdrop-blur-sm transition-colors cursor-pointer flex z-20"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onClick={handleNext}
        aria-label="Next Slide"
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-on-surface p-1.5 md:p-2 rounded-full backdrop-blur-sm transition-colors cursor-pointer flex z-20"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Slide Counter & Indicators Control Pill */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3.5 z-20 bg-black/30 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
        <span className="text-label-sm font-bold text-on-surface tracking-widest shrink-0 select-none">
          {currentSlide + 1}/{slides.length}
        </span>
        <div className="h-4 w-px bg-on-surface/20" />
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300 cursor-pointer",
                index === currentSlide ? "bg-primary w-5" : "bg-on-surface/40 hover:bg-on-surface/60"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
