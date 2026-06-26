'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<'applications' | 'stats' | 'audit_logs'>('applications');

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

      <Container className="max-w-6xl relative z-10 space-y-6">
        {/* Top Header Panel */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white border border-outline-variant/30 rounded-3xl p-6 md:p-8 shadow-md">
          <div className="space-y-1 select-none text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">
              APC Administrative Portal
            </span>
            <h3 className="text-headline-md font-black text-on-surface">
              Welcome back, {user.fullName}
            </h3>
            <p className="text-body-sm font-medium text-on-surface-variant">
              Role: <span className="font-extrabold text-primary uppercase">{user.role}</span>
              {user.block && (
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
            onClick={() => setActiveTab('applications')}
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
            onClick={() => setActiveTab('stats')}
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
            onClick={() => setActiveTab('audit_logs')}
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
                role={user.role}
                initialBlock={user.block || ''}
                onFiltersChange={handleFiltersChange}
              />

              {/* Data Table */}
              <ApplicationsTable
                applications={applications}
                isLoading={isAppsLoading}
                pagination={pagination}
                onPageChange={(p) => setFilters(prev => ({ ...prev, page: p }))}
                onViewDetails={(id) => {
                  console.log('View details clicked for ID:', id);
                  // Routed in Phase 8 Milestone 5
                }}
              />
            </>
          )}

          {activeTab === 'stats' && (
            <DashboardStats
              stats={stats}
              isLoading={isStatsLoading}
            />
          )}

          {activeTab === 'audit_logs' && (
            <AuditLogsTable
              logs={auditLogs}
              isLoading={isLogsLoading}
              pagination={auditPagination}
              onPageChange={handleAuditPageChange}
            />
          )}
        </div>
      </Container>
    </main>
  );
}
