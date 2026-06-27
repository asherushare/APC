'use client';

import React, { useState } from 'react';
import { apiRequest, ApiError } from '@/lib/api-client';
import { formatStatus, STATUS_TRANSITIONS } from '@/lib/formatUtils';
import type {
  ApplicationStatus,
  StatusUpdatePayload,
  StatusUpdateResponse,
} from '@/types/admin';

interface StatusControlsProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
  /** Called after a successful status update with the new status. */
  onStatusChanged: (newStatus: ApplicationStatus) => void;
}

const ALL_STATUSES: ApplicationStatus[] = [
  'SUBMITTED',
  'DOCUMENTS_PENDING',
  'UNDER_REVIEW',
  'PAYMENT_PENDING',
  'PAYMENT_CONFIRMED',
  'APPROVED',
  'REJECTED',
];

export function StatusControls({ applicationId, currentStatus, onStatusChanged }: StatusControlsProps) {
  const allowed = STATUS_TRANSITIONS[currentStatus] ?? [];
  const isFinal = allowed.length === 0;

  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | ''>('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setSelectedStatus('');
    setReviewNotes('');
    setSuccess(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) {
      setError('Please select a target status.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: StatusUpdatePayload = {
        status: selectedStatus,
        reviewNotes: reviewNotes.trim() || undefined,
      };
      await apiRequest<StatusUpdateResponse>(
        `/applications/${applicationId}/status`,
        { method: 'PATCH', body: JSON.stringify(payload) }
      );
      setSuccess(`Status updated to "${formatStatus(selectedStatus)}".`);
      onStatusChanged(selectedStatus);
      // Keep the notes briefly visible, then clear the selection for the next action.
      setSelectedStatus('');
      setReviewNotes('');
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to update status. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white border border-outline-variant/30 rounded-3xl shadow-md p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 select-none">
        <h4 className="text-label-sm font-black uppercase tracking-widest text-primary/70">
          ✅ Status Controls
        </h4>
        <span className="text-body-xs font-semibold text-on-surface-variant">
          Current: <span className="text-primary font-extrabold">{formatStatus(currentStatus)}</span>
        </span>
      </div>

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-body-sm font-semibold text-emerald-700"
        >
          {success}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-body-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      {isFinal ? (
        <p className="text-body-sm text-on-surface-variant font-medium">
          This application has reached a final status ({formatStatus(currentStatus)}). No further
          transitions are available.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor={`target-status-${applicationId}`}
              className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70 select-none"
            >
              Move to status
            </label>
            <select
              id={`target-status-${applicationId}`}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatus)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-body-sm font-semibold text-on-surface focus:outline-none focus:border-primary disabled:opacity-50"
            >
              <option value="">Select a target status…</option>
              {ALL_STATUSES.map((s) => {
                const enabled = allowed.includes(s);
                return (
                  <option key={s} value={s} disabled={!enabled}>
                    {formatStatus(s)}{enabled ? '' : ' (not allowed)'}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`review-notes-${applicationId}`}
              className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70 select-none"
            >
              Review notes <span className="font-medium normal-case">(optional)</span>
            </label>
            <textarea
              id={`review-notes-${applicationId}`}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              disabled={isSubmitting}
              rows={3}
              placeholder="Add context for this status change (recorded in the audit log)…"
              className="w-full rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-body-sm font-medium text-on-surface focus:outline-none focus:border-primary disabled:opacity-50 resize-y"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !selectedStatus}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-label-sm font-black uppercase tracking-wider hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isSubmitting ? 'Updating…' : 'Update Status'}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 text-label-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer"
            >
              Clear
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
