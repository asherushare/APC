'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { fetchBlob } from '@/lib/api-client';
import { formatDate, formatFileSize } from '@/lib/formatUtils';
import type { ApplicationDocument } from '@/types/admin';

interface DocumentViewerProps {
  /** DB id of the application these documents belong to. */
  applicationId: string;
  documents: ApplicationDocument[];
}

/** Human-friendly label for a document type enum. */
function documentTypeLabel(type: string): string {
  const map: Record<string, string> = {
    AADHAAR: 'Aadhaar Card',
    PAN: 'PAN Card',
    PASSPORT_PHOTO: 'Passport Photo',
    PRODUCER_ACTIVITY_PROOF: 'Producer Activity Proof',
    BANK_PASSBOOK: 'Bank Passbook',
  };
  return map[type] || type.replace(/_/g, ' ');
}

/** Badge classes reflecting a document's upload / scan status. */
function scanStatusBadge(doc: ApplicationDocument): { label: string; className: string } {
  if (doc.uploadStatus !== 'DONE') {
    return {
      label: doc.uploadStatus,
      className: 'bg-surface-container-low text-on-surface-variant border-outline-variant/30',
    };
  }
  switch (doc.virusScanStatus) {
    case 'CLEAN':
      return { label: 'Clean', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'INFECTED':
      return { label: 'Infected', className: 'bg-red-50 text-red-700 border-red-200' };
    case 'PENDING':
      return { label: 'Scan pending', className: 'bg-amber-50 text-amber-700 border-amber-200' };
    default:
      return {
        label: doc.virusScanStatus,
        className: 'bg-surface-container-low text-on-surface-variant border-outline-variant/30',
      };
  }
}

export function DocumentViewer({ applicationId, documents }: DocumentViewerProps) {
  // Per-document action state: 'idle' | 'loading' | 'error'
  const [actionState, setActionState] = useState<Record<string, 'idle' | 'loading' | 'error'>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const openDocument = async (doc: ApplicationDocument, disposition: 'inline' | 'attachment') => {
    setActionError(null);
    setActionState((prev) => ({ ...prev, [doc.id]: 'loading' }));
    try {
      const query = disposition === 'attachment' ? '?disposition=attachment' : '';
      const blob = await fetchBlob(
        `/applications/${applicationId}/documents/${doc.id}/download${query}`
      );
      // Object URL keeps the bytes fully client-side; revoke after opening.
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank', 'noopener,noreferrer');
      // Revoke shortly after to release memory while allowing the tab to load it.
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open document';
      setActionError(message);
      setActionState((prev) => ({ ...prev, [doc.id]: 'error' }));
    }
  };

  return (
    <section className="bg-white border border-outline-variant/30 rounded-3xl shadow-md p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 select-none">
        <h4 className="text-label-sm font-black uppercase tracking-widest text-primary/70">
          🖼️ Document Viewer
        </h4>
        <span className="text-body-xs font-semibold text-on-surface-variant">
          {documents.length} file{documents.length !== 1 ? 's' : ''}
        </span>
      </div>

      {actionError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-body-sm font-semibold text-red-700"
        >
          {actionError}
        </div>
      )}

      {documents.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant font-medium py-4">
          No documents have been uploaded for this application yet.
        </p>
      ) : (
        <ul className="divide-y divide-outline-variant/10">
          {documents.map((doc) => {
            const state = actionState[doc.id] || 'idle';
            const scan = scanStatusBadge(doc);
            return (
              <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-body-sm font-extrabold text-on-surface break-all">
                      {documentTypeLabel(doc.documentType)}
                    </span>
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase border tracking-wider',
                        scan.className
                      )}
                    >
                      {scan.label}
                    </span>
                  </div>
                  <p className="text-body-xs text-on-surface-variant font-medium break-all">
                    {doc.filename} · {formatFileSize(doc.fileSize)} · {formatDate(doc.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openDocument(doc, 'inline')}
                    disabled={state === 'loading' || doc.uploadStatus !== 'DONE'}
                    className="px-3 py-1.5 rounded-xl border border-primary/30 text-primary hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    {state === 'loading' ? 'Opening…' : 'View'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openDocument(doc, 'attachment')}
                    disabled={state === 'loading' || doc.uploadStatus !== 'DONE'}
                    className="px-3 py-1.5 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Download
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
