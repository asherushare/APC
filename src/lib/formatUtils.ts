// formatUtils.ts
// Pure presentation helpers shared by the Phase 8 Milestone 5 admin components
// (Application Details & Document Viewer). Intentionally introduced only for the
// NEW components to keep them DRY; existing working tables are left untouched.

import type { ApplicationStatus } from '@/types/admin';

/** Tailwind classes for a status badge, keyed by application status. */
export function statusBadgeClass(status: string): string {
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
    case 'DRAFT':
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200';
  }
}

/** Humanizes an enum-style status (e.g. UNDER_REVIEW -> "UNDER REVIEW"). */
export function formatStatus(status: string): string {
  return status.replace(/_/g, ' ');
}

/** Formats an ISO date as an Indian locale date (e.g. "26 Jun 2026"). */
export function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

/** Formats an ISO date as an Indian locale date + time. */
export function formatDateTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return 'N/A';
  }
}

/** Formats a byte count as a human-readable file size. */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  const rounded = i === 0 ? value : Math.round(value * 10) / 10;
  return `${rounded} ${units[i]}`;
}

/**
 * Allowed next statuses for a given current status.
 * Mirrors the backend VALID_TRANSITIONS map so the UI can disable invalid
 * options for UX without re-implementing business rules authoritatively
 * (the server remains the source of truth).
 */
export const STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['UNDER_REVIEW', 'DOCUMENTS_PENDING', 'REJECTED'],
  UNDER_REVIEW: ['DOCUMENTS_PENDING', 'PAYMENT_PENDING', 'APPROVED', 'REJECTED'],
  DOCUMENTS_PENDING: ['UNDER_REVIEW', 'SUBMITTED', 'REJECTED'],
  PAYMENT_PENDING: ['PAYMENT_CONFIRMED', 'REJECTED', 'UNDER_REVIEW'],
  PAYMENT_CONFIRMED: ['APPROVED', 'REJECTED', 'UNDER_REVIEW'],
  APPROVED: [],
  REJECTED: ['UNDER_REVIEW'],
};
