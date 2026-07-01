'use client';

import React from 'react';
import { Container } from '@/components/common/Container';

export default function AdminNoticesPage() {
  return (
    <main className="py-12 px-4 text-left">
      <Container className="max-w-6xl space-y-6">
        <div className="bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-md space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">
            APC Administrative Portal
          </span>
          <h3 className="text-headline-md font-black text-on-surface">
            Notices & Announcements Manager
          </h3>
          <p className="text-body-md text-on-surface-variant font-medium max-w-xl">
            Create, edit, and publish government scheme information, updates, and success stories dynamically to the public Information Board.
          </p>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-3xl p-10 text-center shadow-md border-dashed border-2 flex flex-col items-center justify-center space-y-4 py-20">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-headline-sm">
            📢
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-on-surface text-body-lg">Under Active Development</h4>
            <p className="text-body-sm text-on-surface-variant font-medium">
              The notices database schema migrations and publish endpoints will be built in Phase 3 & 4.
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}
