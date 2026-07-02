import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://apcodisha.org'),
  title: {
    default: 'Adivasi Producer Company (APC) — Empowering Tribal Communities',
    template: '%s | Adivasi Producer Company (APC)',
  },
  description:
    'Adivasi Producer Company — building opportunities for tribal communities through entrepreneurship, digital services, education, and sustainable development in Odisha, India.',
  keywords: [
    'APC',
    'Adivasi Producer Company',
    'tribal',
    'Odisha',
    'producer company',
    'digital services',
    'tribal development',
  ],
  icons: {
    icon: '/images/APC_official_logo.png',
    shortcut: '/images/APC_official_logo.png',
    apple: '/images/APC_official_logo.png',
  },
  openGraph: {
    title: 'Adivasi Producer Company (APC) — Empowering Tribal Communities',
    description:
      'Adivasi Producer Company — building opportunities for tribal communities through entrepreneurship, digital services, education, and sustainable development in Odisha, India.',
    url: 'https://apcodisha.org',
    siteName: 'Adivasi Producer Company (APC)',
    images: [
      {
        url: '/images/hero-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Adivasi Producer Company (APC) — Empowering Tribal Communities',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};


import { AuthProvider } from '@/context/AuthContext';
import { PublicAuthProvider } from '@/context/PublicAuthContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="bg-surface text-on-surface antialiased">
        <AuthProvider>
          <PublicAuthProvider>
            <Navbar />
            <main className="pt-[72px]">{children}</main>
            <Footer />
            <WhatsAppButton />
          </PublicAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
