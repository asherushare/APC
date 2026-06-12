import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BookingHero } from '@/components/sections/book/BookingHero';
import { BookingForm } from '@/components/sections/book/BookingForm';

export const metadata: Metadata = {
  title: 'Book a Service | APC',
  description:
    'Schedule a service appointment with APC Odisha — document help, government schemes, business consultancy, farming guidance, and more.',
};

export default function BookServicePage() {
  return (
    <>
      <BookingHero />
      <Suspense fallback={
        <div className="py-20 text-center bg-surface-container-low text-on-surface-variant">
          <span className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
          <p className="text-body-md">Loading Booking Form...</p>
        </div>
      }>
        <BookingForm />
      </Suspense>
    </>
  );
}

