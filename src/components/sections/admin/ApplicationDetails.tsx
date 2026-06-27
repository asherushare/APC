'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { statusBadgeClass, formatStatus, formatDate, formatFileSize } from '@/lib/formatUtils';
import type { ApplicationDetail } from '@/types/admin';

interface ApplicationDetailsProps {
  application: ApplicationDetail | null;
}

/** Small labelled field cell used throughout the detail view. */
function Field({ label, value, mono = false, sensitive = false }: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  sensitive?: boolean;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70 select-none">
        {label}
      </dt>
      <dd className={cn(
        'text-body-sm font-semibold text-on-surface break-words',
        mono && 'font-mono select-all',
        sensitive && 'bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 inline-block'
      )}>
        {value === null || value === undefined || value === '' ? '—' : value}
      </dd>
    </div>
  );
}

/** Card wrapper that matches the existing admin section card idiom. */
function DetailCard({ title, icon, children }: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-outline-variant/30 rounded-3xl shadow-md p-6 space-y-4 animate-fade-in">
      <h4 className="text-label-sm font-black uppercase tracking-widest text-primary/70 border-b border-outline-variant/20 pb-3 select-none">
        {icon} {title}
      </h4>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {children}
      </dl>
    </section>
  );
}

export function ApplicationDetails({ application }: ApplicationDetailsProps) {
  if (!application) {
    return null;
  }

  const contribution = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(application.calculatedContribution);

  return (
    <div className="space-y-6">
      {/* Header / Identity */}
      <section className="bg-white border border-outline-variant/30 rounded-3xl shadow-md p-6 space-y-4 animate-fade-in">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-outline-variant/20 pb-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70 select-none">
              Application ID
            </p>
            <p className="text-body-lg font-extrabold text-primary font-mono select-all">
              {application.applicationId}
            </p>
          </div>
          <span className={cn(
            'inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border tracking-wider',
            statusBadgeClass(application.status)
          )}>
            {formatStatus(application.status)}
          </span>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Full Name" value={application.fullName} />
          <Field label="Father / Husband Name" value={application.fatherHusbandName} />
          <Field label="Date of Birth" value={formatDate(application.dateOfBirth)} />
          <Field label="Gender" value={formatStatus(application.gender)} />
          <Field label="Mobile Number" value={application.mobileNumber} mono />
          <Field label="Email" value={application.email} />
          <Field label="Primary Occupation" value={application.occupation} />
          <Field label="Aadhaar Number (decrypted)" value={application.aadhaarNumber} mono sensitive />
          <Field label="PAN Number (decrypted)" value={application.panNumber} mono sensitive />
        </dl>
      </section>

      {/* Address */}
      <DetailCard title="Residential Address" icon="🏠">
        <Field label="Village" value={application.village} />
        <Field label="Gram Panchayat" value={application.gramPanchayat} />
        <Field label="Block" value={application.block} />
        <Field label="District" value={application.district} />
        <Field label="State" value={application.state} />
        <Field label="PIN Code" value={application.pinCode} mono />
      </DetailCard>

      {/* Share Subscription */}
      <DetailCard title="Share Subscription" icon="📊">
        <Field label="Number of Shares" value={application.numberOfShares} />
        <Field label="Calculated Contribution" value={contribution} />
        <Field label="Payment Status" value={formatStatus(application.paymentStatus)} />
        <Field label="Verification Status" value={formatStatus(application.verificationStatus)} />
      </DetailCard>

      {/* Nominee */}
      <DetailCard title="Nominee Details" icon="👤">
        <Field label="Nominee Name" value={application.nomineeName} />
        <Field label="Relationship" value={application.nomineeRelationship} />
        <Field label="Date of Birth" value={formatDate(application.nomineeDateOfBirth)} />
        <Field label="Mobile Number" value={application.nomineeMobileNumber} mono />
        <div className="sm:col-span-2">
          <Field label="Address" value={application.nomineeAddress} />
        </div>
      </DetailCard>

      {/* Bank Details */}
      <DetailCard title="Bank Details" icon="🏦">
        <Field label="Account Holder Name" value={application.bankAccountHolderName} />
        <Field label="Bank Name" value={application.bankName} />
        <Field label="Account Number (decrypted)" value={application.bankAccountNumber} mono sensitive />
        <Field label="IFSC Code" value={application.bankIfscCode} mono />
      </DetailCard>

      {/* Producer Activities */}
      <section className="bg-white border border-outline-variant/30 rounded-3xl shadow-md p-6 space-y-4 animate-fade-in">
        <h4 className="text-label-sm font-black uppercase tracking-widest text-primary/70 border-b border-outline-variant/20 pb-3 select-none">
          🌾 Producer Activities
        </h4>
        {application.producerActivities.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant font-medium">No producer activities declared.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {application.producerActivities.map((act) => (
              <li
                key={act.id}
                className="px-3 py-1 rounded-full text-body-xs font-semibold bg-surface-container-low border border-outline-variant/30 text-on-surface"
              >
                {act.activityName}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Uploaded Documents summary (count + size; viewer component renders the full list) */}
      <section className="bg-white border border-outline-variant/30 rounded-3xl shadow-md p-6 space-y-4 animate-fade-in">
        <h4 className="text-label-sm font-black uppercase tracking-widest text-primary/70 border-b border-outline-variant/20 pb-3 select-none">
          📎 Uploaded Documents
        </h4>
        {application.documents.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant font-medium">
            No documents uploaded yet for this application.
          </p>
        ) : (
          <p className="text-body-sm text-on-surface-variant font-medium">
            {application.documents.length} document{application.documents.length !== 1 ? 's' : ''} on file
            {' · '}
            {formatFileSize(application.documents.reduce((sum, d) => sum + d.fileSize, 0))} total.
            Use the document viewer below to preview or download.
          </p>
        )}
      </section>
    </div>
  );
}
