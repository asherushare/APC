'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'or'>('en');
  const [showToast, setShowToast] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileAboutOpen, setIsMobileAboutOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const pathname = usePathname();
  const languageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync mobile menu open class with body to prevent background scrolls/clicks
  useEffect(() => {
    if (isMobileOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    return () => document.body.classList.remove('mobile-menu-open');
  }, [isMobileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileOpen(false);
      setIsMobileAboutOpen(false);
      setIsMobileServicesOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Clean up language timeout on unmount
  useEffect(() => {
    return () => {
      if (languageTimeoutRef.current) {
        clearTimeout(languageTimeoutRef.current);
      }
    };
  }, []);

  // Handle language switch
  const handleLanguageChange = (lang: 'en' | 'or') => {
    // Clear any active language timeout
    if (languageTimeoutRef.current) {
      clearTimeout(languageTimeoutRef.current);
      languageTimeoutRef.current = null;
    }

    if (lang === 'or') {
      setCurrentLang('or');
      setShowToast(true);
      // Revert to English UI after a short delay since it is a mock shell
      languageTimeoutRef.current = setTimeout(() => {
        setCurrentLang('en');
        setShowToast(false);
        languageTimeoutRef.current = null;
      }, 3500);
    } else {
      setCurrentLang('en');
      setShowToast(false);
    }
  };

  // Close toast manually
  const closeToast = () => {
    if (languageTimeoutRef.current) {
      clearTimeout(languageTimeoutRef.current);
      languageTimeoutRef.current = null;
    }
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
            className="flex items-center gap-2.5 text-primary font-bold text-headline-md whitespace-nowrap"
            id="nav-logo"
          >
            <Image
              src="/images/APC_official_logo.png"
              alt="APC Logo"
              width={32}
              height={32}
              className="object-contain w-8 h-8 shrink-0"
              priority
            />
            <span>APC</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {/* Home */}
            <Link
              href="/"
              className={cn(
                'text-label-md transition-colors',
                pathname === '/'
                  ? 'text-primary font-bold border-b-2 border-primary pb-1'
                  : 'text-on-surface-variant hover:text-primary'
              )}
              id="nav-home"
            >
              Home
            </Link>

            {/* About Dropdown */}
            <div
              className="relative py-2"
              onMouseEnter={() => setIsAboutOpen(true)}
              onMouseLeave={() => setIsAboutOpen(false)}
            >
              <button
                className={cn(
                  'flex items-center gap-1 text-label-md transition-colors cursor-pointer',
                  pathname === '/about' || pathname === '/roadmap'
                    ? 'text-primary font-bold border-b-2 border-primary pb-0.5'
                    : 'text-on-surface-variant hover:text-primary'
                )}
                aria-expanded={isAboutOpen}
                id="nav-about-btn"
              >
                About
                <svg
                  className={cn(
                    'w-3.5 h-3.5 transition-transform duration-200',
                    isAboutOpen ? 'rotate-180' : ''
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Dropdown Menu Box */}
              <div
                className={cn(
                  'absolute top-full left-0 mt-1 w-48 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl py-2 transition-all duration-200 transform origin-top-left z-50',
                  isAboutOpen
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                )}
              >
                <Link
                  href="/about"
                  className={cn(
                    'block px-4 py-2.5 text-body-md transition-colors hover:bg-surface-container-low hover:text-primary',
                    pathname === '/about' ? 'text-primary font-semibold' : 'text-on-surface-variant'
                  )}
                >
                  About APC
                </Link>
                <Link
                  href="/roadmap"
                  className={cn(
                    'block px-4 py-2.5 text-body-md transition-colors hover:bg-surface-container-low hover:text-primary',
                    pathname === '/roadmap' ? 'text-primary font-semibold' : 'text-on-surface-variant'
                  )}
                >
                  Roadmap
                </Link>
              </div>
            </div>

            {/* Leadership */}
            <Link
              href="/leadership"
              className={cn(
                'text-label-md transition-colors',
                pathname === '/leadership'
                  ? 'text-primary font-bold border-b-2 border-primary pb-1'
                  : 'text-on-surface-variant hover:text-primary'
              )}
              id="nav-leadership"
            >
              Leadership
            </Link>

            {/* APC Digital Dropdown */}
            <div
              className="relative py-2"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button
                className={cn(
                  'flex items-center gap-1 text-label-md transition-colors cursor-pointer',
                  pathname.startsWith('/digital') || pathname === '/services' || pathname === '/book'
                    ? 'text-primary font-bold border-b-2 border-primary pb-0.5'
                    : 'text-on-surface-variant hover:text-primary'
                )}
                aria-expanded={isServicesOpen}
                id="nav-services-btn"
              >
                APC Digital
                <svg
                  className={cn(
                    'w-3.5 h-3.5 transition-transform duration-200',
                    isServicesOpen ? 'rotate-180' : ''
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Dropdown Menu Box */}
              <div
                className={cn(
                  'absolute top-full left-0 mt-1 w-64 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl py-2 transition-all duration-200 transform origin-top-left z-50',
                  isServicesOpen
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                )}
              >
                <Link
                  href="/digital"
                  className={cn(
                    'block px-4 py-2.5 text-body-md transition-colors hover:bg-surface-container-low hover:text-primary font-bold border-b border-outline-variant/20',
                    pathname === '/digital' ? 'text-primary' : 'text-on-surface'
                  )}
                >
                  Digital Portal Hub
                </Link>
                <Link
                  href="/services"
                  className={cn(
                    'block px-4 py-2.5 text-body-md transition-colors hover:bg-surface-container-low hover:text-primary font-semibold border-b border-outline-variant/20',
                    pathname === '/services' && !pathname.includes('/book') ? 'text-primary' : 'text-on-surface'
                  )}
                >
                  All Services
                </Link>
                <Link
                  href="/book"
                  className={cn(
                    'block px-4 py-2.5 text-body-md transition-colors hover:bg-surface-container-low hover:text-primary font-semibold border-b border-outline-variant/20',
                    pathname === '/book' ? 'text-primary' : 'text-on-surface'
                  )}
                >
                  Book Service
                </Link>
                
                {/* Specific Category Links */}
                <div className="py-1">
                  <Link
                    href="/services"
                    className="block px-4 py-2 text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                  >
                    Internet Support
                  </Link>
                  <Link
                    href="/services"
                    className="block px-4 py-2 text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                  >
                    Document Help
                  </Link>
                  <Link
                    href="/services"
                    className="block px-4 py-2 text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                  >
                    Government Scheme Guidance
                  </Link>
                  <Link
                    href="/services"
                    className="block px-4 py-2 text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                  >
                    Business Consultancy
                  </Link>
                  <Link
                    href="/services"
                    className="block px-4 py-2 text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                  >
                    Farming Consultancy
                  </Link>
                </div>
              </div>
            </div>

            {/* Notices */}
            <Link
              href="/notices"
              className={cn(
                'text-label-md transition-colors',
                pathname === '/notices'
                  ? 'text-primary font-bold border-b-2 border-primary pb-1'
                  : 'text-on-surface-variant hover:text-primary'
              )}
              id="nav-notices"
            >
              Notices
            </Link>

            {/* Contact */}
            <Link
              href="/contact"
              className={cn(
                'text-label-md transition-colors',
                pathname === '/contact'
                  ? 'text-primary font-bold border-b-2 border-primary pb-1'
                  : 'text-on-surface-variant hover:text-primary'
              )}
              id="nav-contact"
            >
              Contact
            </Link>
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
          <div className="md:hidden bg-surface border-t border-outline-variant max-h-[calc(100vh-80px)] overflow-y-auto">
            <div className="px-5 py-6 space-y-4">
              {/* Home */}
              <Link
                href="/"
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'block py-2 text-body-lg transition-colors',
                  pathname === '/' ? 'text-primary font-semibold' : 'text-on-surface-variant'
                )}
              >
                Home
              </Link>

              {/* About Accordion */}
              <div>
                <button
                  onClick={() => setIsMobileAboutOpen(!isMobileAboutOpen)}
                  className={cn(
                    'w-full flex items-center justify-between py-2 text-body-lg transition-colors cursor-pointer text-left',
                    pathname === '/about' || pathname === '/roadmap'
                      ? 'text-primary font-semibold'
                      : 'text-on-surface-variant'
                  )}
                >
                  <span>About</span>
                  <svg
                    className={cn(
                      'w-5 h-5 transition-transform duration-200',
                      isMobileAboutOpen ? 'rotate-180' : ''
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div
                  className={cn(
                    'pl-4 overflow-hidden transition-all duration-300 ease-in-out',
                    isMobileAboutOpen ? 'max-h-40 opacity-100 mt-2 space-y-1' : 'max-h-0 opacity-0'
                  )}
                >
                  <Link
                    href="/about"
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      'block py-2 text-body-md transition-colors',
                      pathname === '/about' ? 'text-primary font-semibold' : 'text-on-surface-variant/80'
                    )}
                  >
                    About APC
                  </Link>
                  <Link
                    href="/roadmap"
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      'block py-2 text-body-md transition-colors',
                      pathname === '/roadmap' ? 'text-primary font-semibold' : 'text-on-surface-variant/80'
                    )}
                  >
                    Roadmap
                  </Link>
                </div>
              </div>

              {/* Leadership */}
              <Link
                href="/leadership"
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'block py-2 text-body-lg transition-colors',
                  pathname === '/leadership' ? 'text-primary font-semibold' : 'text-on-surface-variant'
                )}
              >
                Leadership
              </Link>

              {/* APC Digital Accordion */}
              <div>
                <button
                  onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                  className={cn(
                    'w-full flex items-center justify-between py-2 text-body-lg transition-colors cursor-pointer text-left',
                    pathname.startsWith('/digital') || pathname === '/services' || pathname === '/book'
                      ? 'text-primary font-semibold'
                      : 'text-on-surface-variant'
                  )}
                >
                  <span>APC Digital</span>
                  <svg
                    className={cn(
                      'w-5 h-5 transition-transform duration-200',
                      isMobileServicesOpen ? 'rotate-180' : ''
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div
                  className={cn(
                    'pl-4 overflow-hidden transition-all duration-300 ease-in-out',
                    isMobileServicesOpen ? 'max-h-[380px] opacity-100 mt-2 space-y-1' : 'max-h-0 opacity-0'
                  )}
                >
                  <Link
                    href="/digital"
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      'block py-2 text-body-md font-bold transition-colors border-b border-outline-variant/10',
                      pathname === '/digital' ? 'text-primary' : 'text-on-surface'
                    )}
                  >
                    Digital Portal Hub
                  </Link>
                  <Link
                    href="/services"
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      'block py-2 text-body-md font-semibold transition-colors border-b border-outline-variant/10',
                      pathname === '/services' ? 'text-primary' : 'text-on-surface'
                    )}
                  >
                    All Services
                  </Link>
                  <Link
                    href="/book"
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      'block py-2 text-body-md font-semibold transition-colors border-b border-outline-variant/10',
                      pathname === '/book' ? 'text-primary' : 'text-on-surface'
                    )}
                  >
                    Book Service
                  </Link>
                  <Link
                    href="/services"
                    onClick={() => setIsMobileOpen(false)}
                    className="block py-1.5 text-body-md text-on-surface-variant/80"
                  >
                    Internet Support
                  </Link>
                  <Link
                    href="/services"
                    onClick={() => setIsMobileOpen(false)}
                    className="block py-1.5 text-body-md text-on-surface-variant/80"
                  >
                    Document Help
                  </Link>
                  <Link
                    href="/services"
                    onClick={() => setIsMobileOpen(false)}
                    className="block py-1.5 text-body-md text-on-surface-variant/80"
                  >
                    Government Scheme Guidance
                  </Link>
                  <Link
                    href="/services"
                    onClick={() => setIsMobileOpen(false)}
                    className="block py-1.5 text-body-md text-on-surface-variant/80"
                  >
                    Business Consultancy
                  </Link>
                  <Link
                    href="/services"
                    onClick={() => setIsMobileOpen(false)}
                    className="block py-1.5 text-body-md text-on-surface-variant/80"
                  >
                    Farming Consultancy
                  </Link>
                </div>
              </div>

              {/* Notices */}
              <Link
                href="/notices"
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'block py-2 text-body-lg transition-colors',
                  pathname === '/notices' ? 'text-primary font-semibold' : 'text-on-surface-variant'
                )}
              >
                Notices
              </Link>

              {/* Contact */}
              <Link
                href="/contact"
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'block py-2 text-body-lg transition-colors',
                  pathname === '/contact' ? 'text-primary font-semibold' : 'text-on-surface-variant'
                )}
              >
                Contact
              </Link>

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
                onClick={() => setIsMobileOpen(false)}
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
