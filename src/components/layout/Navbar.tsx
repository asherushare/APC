'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navLinks } from '@/data/navigation';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'or'>('en');
  const [showToast, setShowToast] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Handle language switch
  const handleLanguageChange = (lang: 'en' | 'or') => {
    if (lang === 'or') {
      setCurrentLang('or');
      setShowToast(true);
      // Revert to English UI after a short delay since it is a mock shell
      const timer = setTimeout(() => {
        setCurrentLang('en');
        setShowToast(false);
      }, 3500);
      return () => clearTimeout(timer);
    } else {
      setCurrentLang('en');
      setShowToast(false);
    }
  };

  // Close toast manually
  const closeToast = () => {
    setShowToast(false);
    setCurrentLang('en');
  };

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant transition-all duration-300',
          isScrolled ? 'py-2 shadow-sm' : 'py-4'
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-[1280px] mx-auto px-5 md:px-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-primary font-bold text-headline-md whitespace-nowrap"
            id="nav-logo"
          >
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 4c1.5 0 2.8.6 3.8 1.6L16 11.4l-3.8-3.8A5.4 5.4 0 0116 6zm-6 10c0-1.5.6-2.8 1.6-3.8L15.4 16l-3.8 3.8A5.4 5.4 0 0110 16zm6 6c-1.5 0-2.8-.6-3.8-1.6L16 16.6l3.8 3.8A5.4 5.4 0 0116 22zm3.8-2.2L16 16l3.8-3.8c1 1 1.6 2.3 1.6 3.8s-.6 2.8-1.6 3.8z" />
            </svg>
            APC Odisha
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-label-md transition-colors',
                    isActive
                      ? 'text-primary font-bold border-b-2 border-primary pb-1'
                      : 'text-on-surface-variant hover:text-primary'
                  )}
                  id={`nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right items: Language Switch + Join CTA */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Toggle */}
            <div className="flex items-center border border-outline-variant/60 rounded-full px-1 py-0.5 bg-surface-container-low text-label-sm">
              <button
                onClick={() => handleLanguageChange('en')}
                className={cn(
                  "px-2.5 py-0.5 rounded-full font-semibold transition-all cursor-pointer",
                  currentLang === 'en' ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-primary"
                )}
              >
                EN
              </button>
              <button
                onClick={() => handleLanguageChange('or')}
                className={cn(
                  "px-2.5 py-0.5 rounded-full font-semibold transition-all cursor-pointer",
                  currentLang === 'or' ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-primary"
                )}
              >
                ଓଡ଼ିଆ
              </button>
            </div>

            <Link
              href="/join"
              className="bg-primary text-white px-6 py-2.5 rounded-full text-label-md font-medium hover:bg-dark-green transition-colors shadow-md"
              id="nav-join-cta"
            >
              Join APC
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 text-on-surface"
            aria-label="Toggle menu"
            aria-expanded={isMobileOpen}
            id="nav-mobile-toggle"
          >
            {isMobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileOpen && (
          <div className="md:hidden bg-surface border-t border-outline-variant">
            <div className="px-5 py-6 space-y-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'block py-2 text-body-lg transition-colors',
                      isActive ? 'text-primary font-semibold' : 'text-on-surface-variant'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <hr className="border-outline-variant/50 my-2" />

              {/* Mobile Language switch */}
              <div className="flex items-center justify-between py-2">
                <span className="text-body-md text-on-surface-variant">Switch Language:</span>
                <div className="flex items-center border border-outline-variant/60 rounded-full px-1 py-0.5 bg-surface-container-low text-label-sm">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={cn(
                      "px-3 py-1 rounded-full font-semibold transition-all cursor-pointer",
                      currentLang === 'en' ? "bg-primary text-white" : "text-on-surface-variant"
                    )}
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleLanguageChange('or')}
                    className={cn(
                      "px-3 py-1 rounded-full font-semibold transition-all cursor-pointer",
                      currentLang === 'or' ? "bg-primary text-white" : "text-on-surface-variant"
                    )}
                  >
                    ଓଡ଼ିଆ
                  </button>
                </div>
              </div>

              <Link
                href="/join"
                className="block w-full text-center bg-primary text-white py-3 rounded-lg text-label-md font-medium mt-4"
              >
                Join APC
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Language toast popup */}
      {showToast && (
        <div className="fixed bottom-24 right-6 md:right-10 z-[10000] max-w-sm bg-inverse-surface border border-outline/30 text-inverse-on-surface rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-fade-in">
          <svg className="w-5 h-5 text-tribal-gold shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="space-y-1">
            <h4 className="text-label-md font-bold text-white">ଓଡ଼ିଆ ଭାଷା ସଂସ୍କରଣ ଶୀଘ୍ର ଆସୁଛି!</h4>
            <p className="text-body-sm text-inverse-on-surface/85 leading-normal">
              Odia language translation is currently in development and will be available soon.
            </p>
          </div>
          <button
            onClick={closeToast}
            className="text-white hover:text-white/80 p-0.5 cursor-pointer ml-auto"
            aria-label="Dismiss toast"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
