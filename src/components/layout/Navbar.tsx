'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navLinks } from '@/data/navigation';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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

  return (
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
        <div className="hidden md:flex items-center gap-8">
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

        {/* Join APC Button (desktop) */}
        <Link
          href="/join"
          className="hidden md:inline-flex bg-primary text-white px-6 py-2.5 rounded-full text-label-md font-medium hover:bg-dark-green transition-colors shadow-md"
          id="nav-join-cta"
        >
          Join APC
        </Link>

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
  );
}
