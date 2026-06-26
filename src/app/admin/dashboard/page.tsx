'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Container } from '@/components/common/Container';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-surface py-12 px-4 relative overflow-hidden">
      {/* Background Decorative Mesh Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-amber-500/5 blur-3xl" />

      <Container className="max-w-4xl relative z-10 space-y-8 animate-fade-in">
        {/* Header Branding Panel */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white border border-outline-variant/30 rounded-3xl p-6 md:p-8 shadow-md">
          <div className="space-y-1 select-none">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">
              APC Administrative Portal
            </span>
            <h3 className="text-headline-md font-black text-on-surface">
              Welcome back, {user.fullName}
            </h3>
            <p className="text-body-sm font-medium text-on-surface-variant">
              Logged in as <span className="font-extrabold text-primary">{user.role}</span>
            </p>
          </div>
          
          <button
            onClick={() => logout()}
            className="mt-4 md:mt-0 bg-white border border-outline hover:bg-surface-container-low text-on-surface font-extrabold py-3 px-6 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer uppercase tracking-wider text-label-sm select-none"
          >
            Sign Out Session
          </button>
        </div>

        {/* Profile Card & Session Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Profile Metrics */}
          <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 shadow-md md:col-span-2 space-y-4">
            <h4 className="text-label-sm font-black uppercase tracking-widest text-primary/70 border-b border-outline-variant/20 pb-3">
              👤 User Profile Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-body-sm">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-on-surface-variant/80 uppercase">Full Name</span>
                <p className="font-extrabold text-on-surface">{user.fullName}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-on-surface-variant/80 uppercase">Email Address</span>
                <p className="font-extrabold text-on-surface">{user.email}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-on-surface-variant/80 uppercase">Assigned Role</span>
                <p className="font-extrabold text-primary uppercase">{user.role}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-on-surface-variant/80 uppercase">Geographical Block</span>
                <p className="font-extrabold text-on-surface">{user.block || 'GLOBAL (ALL BLOCKS)'}</p>
              </div>
            </div>
          </div>

          {/* Integration Status Tracker */}
          <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 shadow-md space-y-4">
            <h4 className="text-label-sm font-black uppercase tracking-widest text-primary/70 border-b border-outline-variant/20 pb-3">
              🟢 System Status
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-body-xs font-semibold">
                <span className="text-on-surface-variant">Active Session:</span>
                <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                  Verified
                </span>
              </div>
              <div className="flex justify-between items-center text-body-xs font-semibold">
                <span className="text-on-surface-variant">Database Sync:</span>
                <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                  Connected
                </span>
              </div>
              <div className="flex justify-between items-center text-body-xs font-semibold">
                <span className="text-on-surface-variant">S3 / MinIO Status:</span>
                <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Placeholder Action Panel (Milestone 4 Preview) */}
        <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 md:p-8 text-center space-y-3 shadow-inner">
          <span className="text-2xl">📊</span>
          <h4 className="text-headline-sm font-extrabold text-primary">
            APC Coordinator Dashboard Panel
          </h4>
          <p className="text-body-sm font-medium text-on-surface-variant max-w-lg mx-auto">
            This administrative dashboard placeholder is restricted to authorized coordinators. The full application list, status transition logs, statistics widgets, and document viewer components will be implemented in Milestone 4.
          </p>
        </div>
      </Container>
    </main>
  );
}
