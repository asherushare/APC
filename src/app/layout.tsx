import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'APC Odisha — Empowering Tribal Communities',
    template: '%s | APC Odisha',
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="bg-surface text-on-surface antialiased">
        <Navbar />
        <main className="pt-[72px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
