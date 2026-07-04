'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Container } from '@/components/common/Container';
import { apiRequest, ApiError } from '@/lib/api-client';
import { DashboardStats } from '@/components/sections/admin/DashboardStats';
import { DashboardFilters } from '@/components/sections/admin/DashboardFilters';
import { ApplicationsTable, ApplicationRecord } from '@/components/sections/admin/ApplicationsTable';
import { AuditLogsTable, AuditLogRecord } from '@/components/sections/admin/AuditLogsTable';
import { cn } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  console.log('[AdminDashboardPage] render state:', { user, isAuthenticated, isAuthLoading });
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derived active tab state from query parameter URL to avoid synchronous setState cascading render warnings
  const tabQuery = searchParams.get('tab');
  const activeTab = (tabQuery === 'applications' || tabQuery === 'audit_logs' ? tabQuery : 'stats') as 'applications' | 'stats' | 'audit_logs';

  const handleTabChange = (tabName: 'applications' | 'stats' | 'audit_logs') => {
    if (tabName === 'applications') {
      router.push('/admin/applications');
    } else {
      router.push(`/admin/dashboard?tab=${tabName}`);
    }
  };

  // Stats dashboard state
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Applications list states
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [isAppsLoading, setIsAppsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  // Query filter states (initial block loaded from logged-in coordinator's block)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    block: '',
    page: 1,
    limit: 10
  });

  // Audit Logs states
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [hasFetchedLogs, setHasFetchedLogs] = useState(false);
  const [auditPagination, setAuditPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });


  // Global feedback messaging
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Gating and routing check
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);



  // Set default block filter for coordinators on user profile load
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setFilters(prev => ({
          ...prev,
          block: user.block || ''
        }));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // 2. Fetch statistics counts
  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const data = await apiRequest<{ success: boolean; stats: Record<string, number> }>('/applications/stats');
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setErrorMsg('Could not fetch aggregate counts metrics from database.');
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // 3. Fetch applications with query parameters
  const fetchApplications = useCallback(async () => {
    setIsAppsLoading(true);
    setErrorMsg('');
    try {
      const queryParams: Record<string, string> = {
        page: String(filters.page),
        limit: String(filters.limit),
      };
      if (filters.search) queryParams.search = filters.search;
      if (filters.status) queryParams.status = filters.status;
      if (filters.block) queryParams.block = filters.block;

      const query = new URLSearchParams(queryParams);

      const data = await apiRequest<{
        success: boolean;
        applications: ApplicationRecord[];
        pagination: typeof pagination;
      }>(`/applications?${query.toString()}`);

      if (data.success) {
        setApplications(data.applications);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      const msg = err instanceof ApiError ? err.message : 'Failed to query database shareholder list.';
      setErrorMsg(msg);
    } finally {
      setIsAppsLoading(false);
    }
  }, [filters]);

  // 4. Fetch audit logs (lazy-loaded)
  const fetchAuditLogs = useCallback(async (targetPage: number) => {
    setIsLogsLoading(true);
    setErrorMsg('');
    try {
      const data = await apiRequest<{
        success: boolean;
        pagination: { total: number; page: number; limit: number; totalPages: number };
        logs: AuditLogRecord[];
      }>(`/audit-logs?page=${targetPage}&limit=10`);

      if (data.success) {
        setAuditLogs(data.logs);
        setAuditPagination({
          total: data.pagination.total,
          page: data.pagination.page,
          limit: data.pagination.limit,
          totalPages: data.pagination.totalPages
        });
        setHasFetchedLogs(true);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      setErrorMsg('Failed to query system activity logs.');
    } finally {
      setIsLogsLoading(false);
    }
  }, []);

  // Fetch stats and initial list immediately on mount and user identification
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        fetchStats();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, fetchStats]);

  // Sync applications list on filter modifications
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        fetchApplications();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, fetchApplications]);

  // Lazy-load audit logs when tab is visited for the first time
  useEffect(() => {
    if (activeTab === 'audit_logs' && !hasFetchedLogs && user) {
      const timer = setTimeout(() => {
        fetchAuditLogs(1);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab, hasFetchedLogs, user, fetchAuditLogs]);

  // Handle audit logs page transitions
  const handleAuditPageChange = (newPage: number) => {
    fetchAuditLogs(newPage);
  };

  // Callback mapping filter updates
  const handleFiltersChange = useCallback((updatedFilters: { search: string; status: string; block: string }) => {
    setFilters(prev => ({
      ...prev,
      ...updatedFilters,
      page: 1 // Reset pagination index to page 1 on filter modifications
    }));
  }, []);

  if (isAuthLoading) {
    return <DashboardSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-surface py-12 px-4 relative overflow-hidden">
      {/* Background Decorative Mesh Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-amber-500/5 blur-3xl" />

      <Container className="max-w-6xl relative z-10 space-y-6">
        {/* Top Header Panel */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white border border-outline-variant/30 rounded-3xl p-6 md:p-8 shadow-md">
          <div className="space-y-1 select-none text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">
              APC Administrative Portal
            </span>
            <h3 className="text-headline-md font-black text-on-surface">
              Welcome back, {user?.fullName || 'User'}
            </h3>
            <p className="text-body-sm font-medium text-on-surface-variant">
              Role: <span className="font-extrabold text-primary uppercase">{user?.role || ''}</span>
              {user?.block && (
                <span>
                  {' '}• Block: <span className="font-extrabold text-primary uppercase">{user.block}</span>
                </span>
              )}
            </p>
          </div>
          
          <button
            onClick={() => logout()}
            className="mt-4 md:mt-0 bg-white border border-outline hover:bg-surface-container-low text-on-surface font-extrabold py-3 px-6 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer uppercase tracking-wider text-label-sm select-none"
          >
            Sign Out Session
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-left animate-shake">
            <span className="text-lg shrink-0">⚠️</span>
            <div className="space-y-1">
              <h5 className="font-extrabold text-red-800 text-label-sm">Query Error</h5>
              <p className="text-[11px] text-red-700 font-medium leading-relaxed">
                {errorMsg}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Tabs Header */}
        <div className="flex border-b border-outline-variant/30 select-none">
          <button
            onClick={() => handleTabChange('applications')}
            className={cn(
              "px-6 py-3 font-extrabold text-label-sm uppercase tracking-wider border-b-2 transition-all cursor-pointer",
              activeTab === 'applications'
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            )}
          >
            📋 Applications
          </button>
          
          <button
            onClick={() => handleTabChange('stats')}
            className={cn(
              "px-6 py-3 font-extrabold text-label-sm uppercase tracking-wider border-b-2 transition-all cursor-pointer",
              activeTab === 'stats'
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            )}
          >
            📈 Status Overview
          </button>

          <button
            onClick={() => handleTabChange('audit_logs')}
            className={cn(
              "px-6 py-3 font-extrabold text-label-sm uppercase tracking-wider border-b-2 transition-all cursor-pointer",
              activeTab === 'audit_logs'
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            )}
          >
            📜 Audit Logs
          </button>
        </div>

        {/* Tab Sub-views Grid */}
        <div className="space-y-6">
          {activeTab === 'applications' && (
            <>
              {/* Search & Filters */}
              <DashboardFilters
                role={user?.role || 'COORDINATOR'}
                initialBlock={user?.block || ''}
                onFiltersChange={handleFiltersChange}
              />

              {/* Data Table */}
              <ApplicationsTable
                applications={applications || []}
                isLoading={isAppsLoading}
                pagination={pagination || { total: 0, page: 1, limit: 10, totalPages: 1 }}
                onPageChange={(p) => setFilters(prev => ({ ...prev, page: p }))}
                onViewDetails={(id) => {
                  router.push(`/admin/applications/${id}`);
                }}
              />
            </>
          )}

          {activeTab === 'stats' && (
            <DashboardStats
              stats={stats || null}
              isLoading={isStatsLoading}
            />
          )}

          {activeTab === 'audit_logs' && (
            <AuditLogsTable
              logs={auditLogs || []}
              isLoading={isLogsLoading}
              pagination={auditPagination || { total: 0, page: 1, limit: 10, totalPages: 1 }}
              onPageChange={handleAuditPageChange}
            />
          )}
        </div>
      </Container>
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <main className="min-h-screen bg-surface py-12 px-4 relative overflow-hidden animate-pulse">
      <Container className="max-w-6xl relative z-10 space-y-6">
        {/* Header Skeleton */}
        <div className="h-28 bg-white border border-outline-variant/20 rounded-3xl p-8 flex items-center justify-between">
          <div className="space-y-3 w-1/3 text-left">
            <div className="h-3 w-1/4 bg-outline-variant/30 rounded" />
            <div className="h-6 w-3/4 bg-outline-variant/40 rounded" />
            <div className="h-3 w-1/2 bg-outline-variant/30 rounded" />
          </div>
          <div className="h-10 w-28 bg-outline-variant/30 rounded-xl" />
        </div>

        {/* Tab Headers Skeleton */}
        <div className="flex border-b border-outline-variant/20 gap-6">
          <div className="h-8 w-24 bg-outline-variant/30 rounded-t" />
          <div className="h-8 w-32 bg-outline-variant/20 rounded-t" />
          <div className="h-8 w-24 bg-outline-variant/20 rounded-t" />
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div key={idx} className="border border-outline-variant/20 bg-white rounded-2xl p-4 h-28 flex flex-col items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-outline-variant/20" />
              <div className="h-3 w-3/4 bg-outline-variant/30 rounded" />
              <div className="w-8 h-8 rounded-full bg-outline-variant/20" />
            </div>
          ))}
        </div>

        {/* Filter bar Skeleton */}
        <div className="h-16 bg-white border border-outline-variant/20 rounded-3xl p-4 flex items-center justify-between gap-4">
          <div className="h-10 bg-outline-variant/20 rounded-xl flex-1" />
          <div className="h-10 w-32 bg-outline-variant/20 rounded-xl" />
          <div className="h-10 w-32 bg-outline-variant/20 rounded-xl" />
        </div>

        {/* Table Skeleton */}
        <div className="bg-white border border-outline-variant/20 rounded-3xl p-6 space-y-4">
          <div className="h-4 w-1/4 bg-outline-variant/30 rounded" />
          <div className="space-y-3">
            <div className="h-10 bg-outline-variant/20 rounded-xl" />
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-12 bg-outline-variant/10 rounded-xl" />
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}

