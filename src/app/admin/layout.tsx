'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname();
  console.log('[AdminLayout] render state:', { user, isAuthenticated, isLoading, pathname });
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isAuthPage =
    pathname === '/admin/login' ||
    pathname === '/admin/forgot-password' ||
    pathname === '/admin/reset-password';

  // 1. DOM manipulation to override parent main padding pt-[72px] for admin pages
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      const originalPadding = mainElement.style.paddingTop;
      mainElement.style.paddingTop = '0px';
      return () => {
        mainElement.style.paddingTop = originalPadding;
      };
    }
  }, []);

  // 2. Auth Gate Checks
  useEffect(() => {
    if (isAuthPage) return;
    if (!isLoading && !isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, isLoading, router, isAuthPage]);

  // 3. Hide layout wrapper entirely for public auth routes
  if (isAuthPage) {
    return <>{children}</>;
  }



  // Navigation Links
  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      label: 'Applications',
      href: '/admin/dashboard', // Default tab in dashboard is applications list
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Notices Board',
      href: '/admin/notices',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
  ];

  // Admin-Only options
  if (user?.role === 'ADMIN') {
    navItems.push({
      label: 'Coordinators',
      href: '/admin/coordinators',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    });
  }

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex relative w-full">
      {/* 1. Desktop Sidebar Panel */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-outline-variant/35 shrink-0 fixed inset-y-0 left-0 z-30 shadow-sm">
        {/* Sidebar Brand Header */}
        <div className="h-[72px] px-6 border-b border-outline-variant/25 flex items-center gap-3">
          <Image
            src="/images/APC_official_logo.png"
            alt="APC Logo"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70 block leading-none">
              APC
            </span>
            <span className="text-body-md font-black text-on-surface leading-tight">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Sidebar User Profile Card */}
        <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-body-lg uppercase">
              {(user?.fullName || 'US').substring(0, 2)}
            </div>
            <div className="text-left min-w-0 flex-1">
              <h5 className="font-extrabold text-on-surface text-body-sm truncate">
                {user?.fullName || 'User'}
              </h5>
              <p className="text-[10px] text-on-surface-variant font-semibold uppercase flex items-center gap-1.5 mt-0.5">
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 scale-95 font-bold">
                  {user?.role || ''}
                </span>
                {user?.block && <span className="truncate">({user.block})</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 p-4 space-y-1" aria-label="Sidebar navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-label-md font-bold transition-all duration-200 cursor-pointer select-none",
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/10"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="p-4 border-t border-outline-variant/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white border border-outline hover:bg-surface-container-low text-on-surface font-extrabold py-3 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer uppercase tracking-wider text-label-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Mobile Nav Header & Sidebar Overlay Drawer */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 w-full">
        <header className="lg:hidden h-[72px] bg-white border-b border-outline-variant/35 px-5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <Image
              src="/images/APC_official_logo.png"
              alt="APC Logo"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
            <span className="text-body-md font-black text-on-surface">
              APC Admin
            </span>
          </div>

          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 border border-outline hover:bg-surface-container-low rounded-xl text-on-surface transition-all cursor-pointer"
            aria-label="Open navigation sidebar"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        {/* Mobile Sidebar Overlay Drawer Background */}
        {isMobileOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/55 backdrop-blur-xs z-40 transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Mobile Sidebar Container */}
        <aside
          className={cn(
            "lg:hidden fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out border-r border-outline-variant/35 flex flex-col shadow-2xl",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Header */}
          <div className="h-[72px] px-6 border-b border-outline-variant/25 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/images/APC_official_logo.png"
                alt="APC Logo"
                width={28}
                height={28}
                className="w-7 h-7 object-contain"
              />
              <span className="text-body-md font-black text-on-surface">
                Admin Panel
              </span>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
              aria-label="Close navigation sidebar"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low/40 text-left">
            <h5 className="font-extrabold text-on-surface text-body-sm truncate">
              {user?.fullName || 'User'}
            </h5>
            <p className="text-[10px] text-on-surface-variant font-semibold uppercase flex items-center gap-1.5 mt-1">
              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold">
                {user?.role || ''}
              </span>
              {user?.block && <span className="truncate">({user.block})</span>}
            </p>
          </div>

          {/* Links */}
          <nav className="flex-1 p-4 space-y-1" aria-label="Mobile sidebar navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-label-md font-bold transition-all duration-200 cursor-pointer select-none",
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/10"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-outline-variant/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-white border border-outline hover:bg-surface-container-low text-on-surface font-extrabold py-3 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer uppercase tracking-wider text-label-sm"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col min-h-screen relative w-full animate-fadeIn">
          <ErrorBoundary>
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center min-h-screen bg-surface">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              children
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
