import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Container } from '@/components/common/Container';
import { NoticesContent } from '@/components/sections/notices/NoticesContent';

export const metadata: Metadata = {
  title: 'Notices & Updates | APC Odisha',
  description: 'Stay updated with the latest government schemes, tribal achievements, success stories, and board announcements from APC Odisha.',
};

export default function NoticesPage() {
  return (
    <section className="min-h-screen pt-24 pb-16 bg-surface-container-low" id="notices-board-section">
      <Container>
        <Suspense fallback={
          <div className="py-20 text-center">
            <span className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            <p className="text-body-md text-on-surface-variant mt-4">Loading updates...</p>
          </div>
        }>
          <NoticesContent />
        </Suspense>
      </Container>
    </section>
  );
}

