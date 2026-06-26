'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ApplicationRecord {
  id: string;
  applicationId: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  village: string;
  gramPanchayat: string;
  block: string;
  district: string;
  state: string;
  pinCode: string;
  numberOfShares: number;
  calculatedContribution: number;
  submittedAt: string;
  status: string;
}

interface ApplicationsTableProps {
  applications: ApplicationRecord[];
  isLoading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (newPage: number) => void;
  onViewDetails?: (id: string) => void;
}

export function ApplicationsTable({
  applications,
  isLoading,
  pagination,
  onPageChange,
  onViewDetails
}: ApplicationsTableProps) {
  const statusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'UNDER_REVIEW':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DOCUMENTS_PENDING':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'PAYMENT_PENDING':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'PAYMENT_CONFIRMED':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'SUBMITTED':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="bg-white border border-outline-variant/30 rounded-3xl overflow-hidden shadow-md space-y-4 p-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 select-none">
        <h4 className="text-label-sm font-black uppercase tracking-widest text-primary/70">
          📋 Shareholder Application Records
        </h4>
        <span className="text-body-xs font-semibold text-on-surface-variant">
          Showing {applications.length} of {pagination.total} records
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
              <th className="py-4 px-4">Application ID</th>
              <th className="py-4 px-4">Applicant Name</th>
              <th className="py-4 px-4">Mobile</th>
              <th className="py-4 px-4">Gram Panchayat</th>
              <th className="py-4 px-4">Block</th>
              <th className="py-4 px-4">Submitted</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-on-surface-variant font-medium select-none">
                  No application records found matching the filters.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="hover:bg-surface-container-lowest/30 transition-all">
                  <td className="py-4 px-4 font-extrabold text-primary select-all">
                    {app.applicationId}
                  </td>
                  <td className="py-4 px-4 font-bold text-on-surface">
                    {app.fullName}
                  </td>
                  <td className="py-4 px-4 text-on-surface-variant font-medium select-all">
                    {app.mobileNumber}
                  </td>
                  <td className="py-4 px-4 text-on-surface-variant font-medium">
                    {app.gramPanchayat}
                  </td>
                  <td className="py-4 px-4 text-on-surface-variant font-medium">
                    {app.block}
                  </td>
                  <td className="py-4 px-4 text-on-surface-variant font-medium">
                    {formatDate(app.submittedAt)}
                  </td>
                  <td className="py-4 px-4 select-none">
                    <span className={cn(
                      "inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border tracking-wider",
                      statusBadge(app.status)
                    )}>
                      {formatStatus(app.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => onViewDetails?.(app.id)}
                      className="text-[10px] font-black uppercase tracking-wider text-primary hover:underline cursor-pointer focus:outline-none"
                    >
                      View Details →
                    </button>
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
