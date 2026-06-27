'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { formatDateTime, statusBadgeClass, formatStatus } from '@/lib/formatUtils';
import type { AuditLogEntry } from '@/types/admin';

interface ApplicationStatusHistoryProps {
  logs: AuditLogEntry[];
  isLoading: boolean;
}

/** Extracts a { before, after, reviewNotes } view from an audit log change payload. */
function parseStatusChange(changes: unknown): {
  before?: string;
  after?: string;
  reviewNotes?: string;
} | null {
  if (!changes) return null;
  let obj: Record<string, unknown> | null = null;
  if (typeof changes === 'string') {
    try {
      obj = JSON.parse(changes);
    } catch {
      return null;
    }
  } else if (typeof changes === 'object' && changes !== null) {
    obj = changes as Record<string, unknown>;
  }
  if (!obj) return null;

  const before = obj.before as Record<string, unknown> | undefined;
  const after = obj.after as Record<string, unknown> | undefined;
  if (!before && !after) return null;

  return {
    before: (before?.status as string) || undefined,
    after: (after?.status as string) || undefined,
    reviewNotes: (after?.reviewNotes as string) || undefined,
  };
}

export function ApplicationStatusHistory({ logs, isLoading }: ApplicationStatusHistoryProps) {
  // Only render rows that carry a status change diff; everything else is out of scope here.
  const transitions = logs
    .map((log) => ({ log, change: parseStatusChange(log.changes) }))
    .filter((t): t is { log: AuditLogEntry; change: NonNullable<ReturnType<typeof parseStatusChange>> } => t.change !== null);

  return (
    <section className="bg-white border border-outline-variant/30 rounded-3xl shadow-md p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 select-none">
        <h4 className="text-label-sm font-black uppercase tracking-widest text-primary/70">
          🕘 Status History
        </h4>
        <span className="text-body-xs font-semibold text-on-surface-variant">
          {transitions.length} transition{transitions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : transitions.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant font-medium py-4">
          No status changes have been recorded for this application yet.
        </p>
      ) : (
        <ol className="relative border-l-2 border-outline-variant/20 ml-2 space-y-5">
          {transitions.map(({ log, change }) => (
            <li key={log.id} className="ml-5 space-y-1.5">
              <span
                className="absolute -left-[7px] mt-1 w-3 h-3 rounded-full bg-primary border-2 border-white"
                aria-hidden
              />
              <div className="flex flex-wrap items-center gap-2">
                {change.before && (
                  <span
                    className={cn(
                      'inline-block px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase border tracking-wider',
                      statusBadgeClass(change.before)
                    )}
                  >
                    {formatStatus(change.before)}
                  </span>
                )}
                <span className="text-on-surface-variant text-[10px] font-black">➔</span>
                {change.after && (
                  <span
                    className={cn(
                      'inline-block px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase border tracking-wider',
                      statusBadgeClass(change.after)
                    )}
                  >
                    {formatStatus(change.after)}
                  </span>
                )}
              </div>
              <p className="text-body-xs text-on-surface-variant font-medium">
                {log.user ? `${log.user.fullName}` : 'System'} · {formatDateTime(log.createdAt)}
              </p>
              {!!change.reviewNotes && (
                <p className="text-body-xs text-on-surface italic bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5">
                  &ldquo;{change.reviewNotes}&rdquo;
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
