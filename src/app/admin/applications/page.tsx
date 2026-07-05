'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Container } from '@/components/common/Container';
import { apiRequest, ApiError, getAccessToken } from '@/lib/api-client';
import { DashboardFilters } from '@/components/sections/admin/DashboardFilters';
import { ApplicationsTable, ApplicationRecord } from '@/components/sections/admin/ApplicationsTable';

export default function AdminApplicationsPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const router = useRouter();

  // Applications list states
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [isAppsLoading, setIsAppsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Query filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    block: '',
    page: 1,
    limit: 10
  });

  // Auth gate check
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

  // Fetch applications list on filter modifications
  const fetchApplications = useCallback(async () => {
    setIsAppsLoading(true);
    setErrorMsg('');
    try {
      const query = new URLSearchParams({
        page: String(filters.page),
        limit: String(filters.limit),
        search: filters.search,
        status: filters.status,
        block: filters.block
      });
      const data = await apiRequest<{
        success: boolean;
        applications: ApplicationRecord[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>(`/applications?${query.toString()}`);

      if (data.success) {
        setApplications(data.applications);
        setPagination({
          total: data.pagination.total,
          page: data.pagination.page,
          limit: data.pagination.limit,
          totalPages: data.pagination.totalPages
        });
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      const msg = err instanceof ApiError ? err.message : 'Failed to query database shareholder list.';
      setErrorMsg(msg);
    } finally {
      setIsAppsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        fetchApplications();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, fetchApplications]);
  const handleExportCSV = async () => {
    setIsExporting(true);
    setErrorMsg('');
    try {
      const query = new URLSearchParams({
        search: filters.search,
        status: filters.status,
        block: filters.block
      });

      const token = getAccessToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://apc-backend-wsyo.onrender.com/api/v1' 
          : 'http://localhost:4000/api/v1');

      const response = await fetch(`${apiUrl}/applications/export?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to export data: ${response.statusText}`);
      }

      const csvBlob = await response.blob();
      
      const disposition = response.headers.get('content-disposition');
      let filename = `shareholder_applications_${new Date().toISOString().split('T')[0]}.csv`;
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const downloadUrl = window.URL.createObjectURL(csvBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.setAttribute('download', filename);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to export shareholder database.');
    } finally {
      setIsExporting(false);
    }
  };
  const handleFiltersChange = useCallback((updatedFilters: { search: string; status: string; block: string }) => {
    setFilters(prev => ({
      ...prev,
      ...updatedFilters,
      page: 1
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
            <span className="block text-[10px] font-black uppercase tracking-widest text-primary/70">
              APC Administrative Portal
            </span>
            <h3 className="text-headline-md font-black text-on-surface">
              Shareholder Applications
            </h3>
            <p className="text-body-sm font-medium text-on-surface-variant">
              Manage and evaluate incoming cooperative member registrations
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            {user?.role === 'ADMIN' && (
              <button
                onClick={handleExportCSV}
                disabled={isExporting}
                className="bg-primary hover:bg-dark-green text-white font-extrabold py-3 px-6 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer uppercase tracking-wider text-label-sm select-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isExporting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <span>Export CSV</span>
                )}
              </button>
            )}

            <button
              onClick={() => logout()}
              className="bg-white border border-outline hover:bg-surface-container-low text-on-surface font-extrabold py-3 px-6 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer uppercase tracking-wider text-label-sm select-none"
            >
              Sign Out Session
            </button>
          </div>
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

        {/* Search & Filters */}
        <DashboardFilters
          role={user.role as 'ADMIN' | 'COORDINATOR' | 'STAFF'}
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
            router.push(`/admin/applications/${id}`);
          }}
        />
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
          </div>
          <div className="h-10 w-28 bg-outline-variant/30 rounded-xl" />
        </div>

        {/* Filter bar Skeleton */}
        <div className="h-16 bg-white border border-outline-variant/20 rounded-3xl p-4 flex items-center justify-between gap-4">
          <div className="h-10 bg-outline-variant/20 rounded-xl flex-1" />
        </div>

        {/* Table Skeleton */}
        <div className="bg-white border border-outline-variant/20 rounded-3xl p-6 space-y-4">
          <div className="h-4 w-1/4 bg-outline-variant/30 rounded" />
          <div className="space-y-3">
            <div className="h-10 bg-outline-variant/20 rounded-xl" />
            <div className="h-12 bg-outline-variant/10 rounded-xl" />
            <div className="h-12 bg-outline-variant/10 rounded-xl" />
            <div className="h-12 bg-outline-variant/10 rounded-xl" />
          </div>
        </div>
      </Container>
    </main>
  );
}
