'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Container } from '@/components/common/Container';
import { apiRequest, ApiError } from '@/lib/api-client';
import { ApplicationDetails } from '@/components/sections/admin/ApplicationDetails';
import { DocumentViewer } from '@/components/sections/admin/DocumentViewer';
import { StatusControls } from '@/components/sections/admin/StatusControls';
import { ApplicationStatusHistory } from '@/components/sections/admin/ApplicationStatusHistory';
import { formatStatus, statusBadgeClass } from '@/lib/formatUtils';
import { cn } from '@/lib/utils';
import type {
  ApplicationDetail,
  ApplicationDetailResponse,
  AuditLogsResponse,
  AuditLogEntry,
} from '@/types/admin';

const HISTORY_LIMIT = 50;

export default function ApplicationDetailPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<{ code: string; message: string } | null>(null);

  const [history, setHistory] = useState<AuditLogEntry[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // ---- Auth gating ---------------------------------------------------------
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // ---- Fetch application detail -------------------------------------------
  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await apiRequest<ApplicationDetailResponse>(`/applications/${id}`);
      if (data.success) {
        setApplication(data.application);
      }
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'UNKNOWN_ERROR';
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to load application details.';
      setLoadError({ code, message });
      setApplication(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // ---- Fetch status-transition history (scoped to this application) --------
  const fetchHistory = useCallback(async () => {
    if (!id) return;
    setIsHistoryLoading(true);
    try {
      const query = new URLSearchParams({
        targetEntity: 'ShareholderApplication',
        targetId: id,
        limit: String(HISTORY_LIMIT),
        page: '1',
      });
      const data = await apiRequest<AuditLogsResponse>(`/audit-logs?${query.toString()}`);
      if (data.success) {
        setHistory(data.logs);
      }
    } catch {
      // History is supplementary; do not block the page on its failure.
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && user && id) {
      const timer = setTimeout(() => {
        fetchDetail();
        fetchHistory();
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, id]);

  const handleStatusChanged = () => {
    // Server is the source of truth — re-fetch the full record (incl. documents)
    // and the history slice so the UI reflects committed state.
    fetchDetail();
    fetchHistory();
  };

  // ---- Render gates --------------------------------------------------------
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
      {/* Background Decorative Mesh Elements (matches dashboard) */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-amber-500/5 blur-3xl" />

      <Container className="max-w-6xl relative z-10 space-y-6">
        {/* Top Header Panel */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white border border-outline-variant/30 rounded-3xl p-6 md:p-8 shadow-md">
          <div className="space-y-1 select-none text-left">
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard')}
              className="text-[10px] font-black uppercase tracking-widest text-primary/70 hover:underline cursor-pointer"
            >
              ← Back to Dashboard
            </button>
            <span className="block text-[10px] font-black uppercase tracking-widest text-primary/70">
              APC Administrative Portal · Application Review
            </span>
            <h3 className="text-headline-md font-black text-on-surface break-all">
              {application ? application.fullName : 'Application Details'}
            </h3>
            {application && (
              <p className="text-body-sm font-medium text-on-surface-variant">
                {application.applicationId} ·{' '}
                <span
                  className={cn(
                    'inline-block px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase border tracking-wider align-middle',
                    statusBadgeClass(application.status)
                  )}
                >
                  {formatStatus(application.status)}
                </span>
              </p>
            )}
          </div>

          <button
            onClick={() => logout()}
            className="mt-4 md:mt-0 bg-white border border-outline hover:bg-surface-container-low text-on-surface font-extrabold py-3 px-6 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer uppercase tracking-wider text-label-sm select-none"
          >
            Sign Out Session
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="bg-white border border-outline-variant/30 rounded-3xl shadow-md p-10 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Error states */}
        {!isLoading && loadError && (
          <div className="bg-white border border-outline-variant/30 rounded-3xl shadow-md p-8 space-y-3 text-left">
            {loadError.code === 'INSUFFICIENT_PERMISSIONS' ? (
              <>
                <h4 className="text-headline-sm font-black text-amber-700">🔒 Access Restricted</h4>
                <p className="text-body-sm text-on-surface-variant font-medium">
                  You do not have permission to view this application. Coordinators may only access
                  applications within their assigned block.
                </p>
              </>
            ) : loadError.code === 'APPLICATION_NOT_FOUND' ? (
              <>
                <h4 className="text-headline-sm font-black text-red-700">Application Not Found</h4>
                <p className="text-body-sm text-on-surface-variant font-medium">
                  No application exists with identifier &ldquo;{id}&rdquo;. It may have been removed
                  or the link is incorrect.
                </p>
              </>
            ) : (
              <>
                <h4 className="text-headline-sm font-black text-red-700">⚠️ Unable to Load</h4>
                <p className="text-body-sm text-on-surface-variant font-medium">{loadError.message}</p>
              </>
            )}
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard')}
              className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-white text-label-sm font-black uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {/* Main content grid */}
        {!isLoading && !loadError && application && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              <ApplicationDetails application={application} />
              <DocumentViewer applicationId={application.id} documents={application.documents} />
            </div>
            <div className="space-y-6 lg:sticky lg:top-6">
              <StatusControls
                applicationId={application.id}
                currentStatus={application.status}
                onStatusChanged={handleStatusChanged}
              />
              <ApplicationStatusHistory logs={history} isLoading={isHistoryLoading} />
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
