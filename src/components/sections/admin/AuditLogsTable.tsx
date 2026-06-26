'use client';

import React from 'react';

export interface AuditLogRecord {
  id: string;
  userId: string | null;
  action: string;
  targetEntity: string;
  targetId: string;
  ipAddress: string | null;
  userAgent: string | null;
  changes: unknown;
  createdAt: string;
  user?: {
    email: string;
    fullName: string;
  } | null;
}

interface AuditLogsTableProps {
  logs: AuditLogRecord[];
  isLoading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (newPage: number) => void;
}

export function AuditLogsTable({
  logs,
  isLoading,
  pagination,
  onPageChange
}: AuditLogsTableProps) {
  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return 'N/A';
    }
  };

  const formatChanges = (changes: unknown) => {
    if (!changes) return '-';
    try {
      let obj: Record<string, unknown> | null = null;
      if (typeof changes === 'string') {
        obj = JSON.parse(changes);
      } else if (typeof changes === 'object' && changes !== null) {
        obj = changes as Record<string, unknown>;
      }
      
      if (!obj || Object.keys(obj).length === 0) return '-';
      
      const before = obj.before as Record<string, unknown> | undefined;
      const after = obj.after as Record<string, unknown> | undefined;
      
      // If it contains status changes
      if (before && after) {
        return (
          <div className="space-y-0.5 text-[11px] font-semibold leading-normal">
            <div>
              <span className="text-on-surface-variant">Status change: </span>
              <span className="text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                {String(before.status || 'N/A')}
              </span>
              <span className="text-on-surface-variant mx-1">➔</span>
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {String(after.status || 'N/A')}
              </span>
            </div>
            {!!after.reviewNotes && (
              <div className="text-on-surface-variant font-medium mt-1">
                Note: &quot;{String(after.reviewNotes)}&quot;
              </div>
            )}
          </div>
        );
      }
      
      return (
        <pre className="text-[10px] font-mono bg-surface-container-low p-2 rounded border border-outline-variant/30 overflow-x-auto max-w-[250px] sm:max-w-xs">
          {JSON.stringify(obj, null, 2)}
        </pre>
      );
    } catch {
      return '-';
    }
  };

  const actionColor = (action: string) => {
    if (action.includes('SUCCESS') || action.includes('SUBMITTED') || action.includes('APPROVED')) {
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
    if (action.includes('FAILED') || action.includes('REJECTED')) {
      return 'text-red-700 bg-red-50 border-red-200';
    }
    if (action.includes('UPLOADED') || action.includes('UPDATED')) {
      return 'text-blue-700 bg-blue-50 border-blue-200';
    }
    return 'text-on-surface-variant bg-surface-container-low border-outline-variant/30';
  };

  return (
    <div className="bg-white border border-outline-variant/30 rounded-3xl overflow-hidden shadow-md space-y-4 p-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 select-none">
        <h4 className="text-label-sm font-black uppercase tracking-widest text-primary/70">
          📜 System Activity Audit Logs
        </h4>
        <span className="text-body-xs font-semibold text-on-surface-variant">
          Showing {logs.length} of {pagination.total} records
        </span>
      </div>

      <div className="overflow-x-auto min-h-[200px]">
        {isLoading ? (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : null}

        <table className="w-full text-left border-collapse text-body-sm">
          <thead>
            <tr className="border-b border-outline-variant/20 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/80 select-none bg-surface-container-low/50">
              <th className="py-4 px-4">Timestamp</th>
              <th className="py-4 px-4">Actor</th>
              <th className="py-4 px-4">Action</th>
              <th className="py-4 px-4">Target Entity</th>
              <th className="py-4 px-4">Target ID</th>
              <th className="py-4 px-4">Changes Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-on-surface-variant font-medium select-none">
                  No system activity logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container-lowest/30 transition-all font-medium">
                  <td className="py-4 px-4 text-on-surface select-none">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="py-4 px-4 text-on-surface">
                    {log.user ? (
                      <div className="space-y-0.5">
                        <p className="font-extrabold">{log.user.fullName}</p>
                        <p className="text-[10px] text-on-surface-variant/80 select-all">{log.user.email}</p>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-on-surface-variant select-all">
                        {log.userId || 'System (Applicant)'}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 select-none">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase border tracking-wider ${actionColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-on-surface-variant select-none">
                    {log.targetEntity}
                  </td>
                  <td className="py-4 px-4 text-[10px] font-mono text-on-surface-variant select-all">
                    {log.targetId}
                  </td>
                  <td className="py-4 px-4 font-normal text-on-surface">
                    {formatChanges(log.changes)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4 select-none">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || isLoading}
            className="px-4 py-2 rounded-xl border border-outline-variant hover:bg-surface-container-low disabled:opacity-40 text-label-sm font-extrabold uppercase transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            ◀ Previous
          </button>
          
          <span className="text-body-xs font-semibold text-on-surface-variant">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || isLoading}
            className="px-4 py-2 rounded-xl border border-outline-variant hover:bg-surface-container-low disabled:opacity-40 text-label-sm font-extrabold uppercase transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}
