'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container } from '@/components/common/Container';

export default function DigitalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);

  const getSegmentLabel = (segment: string) => {
    switch (segment) {
      case 'digital':
        return 'APC Digital';
      case 'services':
        return 'Services';
      default:
        return segment
          .split('-')
          .map((word) => {
            const up = word.toUpperCase();
            if (up === 'PAN' || up === 'AI' || up === 'GST') {
              return up;
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
          })
          .join(' ');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Dynamic Breadcrumbs */}
      {pathSegments.length > 1 && (
        <div className="bg-surface-container-low border-b border-outline-variant/30 py-2.5">
          <Container>
            <nav className="flex items-center gap-1.5 text-label-sm text-on-surface-variant font-medium select-none">
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <svg className="w-3.5 h-3.5 text-on-surface-variant/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              {pathSegments.map((segment, index) => {
                const isLast = index === pathSegments.length - 1;
                const href = '/' + pathSegments.slice(0, index + 1).join('/');

                if (isLast) {
                  return (
                    <span key={segment} className="text-on-surface font-semibold truncate max-w-[200px] md:max-w-none">
                      {getSegmentLabel(segment)}
                    </span>
                  );
                }

                return (
                  <div key={segment} className="flex items-center gap-1.5 shrink-0">
                    <Link href={href} className="hover:text-primary transition-colors">
                      {getSegmentLabel(segment)}
                    </Link>
                    <svg className="w-3.5 h-3.5 text-on-surface-variant/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                );
              })}
            </nav>
          </Container>
        </div>
      )}

      {/* Shared layout viewport */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
