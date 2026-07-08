'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { AuthProvider } from '@/context/AuthContext';
import { PublicAuthProvider } from '@/context/PublicAuthContext';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStaffPortal = pathname?.startsWith('/staff-portal');

  if (isStaffPortal) {
    return (
      <AuthProvider>
        <PublicAuthProvider>
          <main className="h-screen w-screen overflow-hidden bg-surface-container-lowest">
            {children}
          </main>
        </PublicAuthProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <PublicAuthProvider>
        <Navbar />
        <main className="pt-[72px]">{children}</main>
        <Footer />
        <WhatsAppButton />
      </PublicAuthProvider>
    </AuthProvider>
  );
}
