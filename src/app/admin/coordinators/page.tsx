'use client';

import React from 'react';
import { Container } from '@/components/common/Container';

export default function AdminCoordinatorsPage() {
  return (
    <main className="py-12 px-4 text-left">
      <Container className="max-w-6xl space-y-6">
        <div className="bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-md space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">
            APC Administrative Portal
          </span>
          <h3 className="text-headline-md font-black text-on-surface">
            Block Coordinator Accounts Manager
          </h3>
          <p className="text-body-md text-on-surface-variant font-medium max-w-xl">
            Register new block coordinators, allocate geographic blocks, lock accounts, and manage passwords for portal users.
          </p>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-3xl p-10 text-center shadow-md border-dashed border-2 flex flex-col items-center justify-center space-y-4 py-20">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-headline-sm">
            👥
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-on-surface text-body-lg">Under Active Development</h4>
            <p className="text-body-sm text-on-surface-variant font-medium">
              The user controller update routes and allocation views will be built in Phase 5.
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}
