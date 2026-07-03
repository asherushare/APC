'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePublicAuth } from '@/context/PublicAuthContext';
import { apiRequest, ApiError } from '@/lib/api-client';

interface DocumentRecord {
  id: string;
  documentType: string;
  filename: string;
  url: string | null;
  uploadStatus: string;
  createdAt: string;
}

interface ApplicationRecord {
  id: string;
  applicationId: string;
  fullName: string;
  mobileNumber: string;
  block: string;
  district: string;
  numberOfShares: number;
  calculatedContribution: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'DOCUMENTS_PENDING' | 'PAYMENT_PENDING' | 'PAYMENT_CONFIRMED' | 'APPROVED' | 'REJECTED';
  paymentStatus: string;
  verificationStatus: string;
  submittedAt: string;
  reviewNotes: string | null;
  reviewedAt: string | null;
  documents: DocumentRecord[];
}

export default function ProducerDashboardPage() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = usePublicAuth();
  const [application, setApplication] = useState<ApplicationRecord | null>(null);
  const [appLoading, setAppLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  // Redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) return;

    (async () => {
      try {
        const data = await apiRequest<{ success: boolean; application: ApplicationRecord | null }>(
          '/applications/my-application'
        );
        if (active) {
          setApplication(data.application);
          setAppLoading(false);
        }
      } catch (err) {
        if (active) {
          if (err instanceof ApiError && (err.statusCode === 404 || err.statusCode === 401)) {
            setApplication(null);
          } else {
            setErrorMsg('Failed to load application status. Please refresh the page.');
          }
          setAppLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'UNDER_REVIEW':
      case 'DOCUMENTS_PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PAYMENT_PENDING':
      case 'PAYMENT_CONFIRMED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  const getStepProgress = (status: string) => {
    // Returns active step: 1 = Submitted, 2 = Under Review, 3 = Completed
    if (status === 'APPROVED' || status === 'REJECTED') return 3;
    if (status === 'UNDER_REVIEW' || status === 'DOCUMENTS_PENDING' || status === 'PAYMENT_PENDING' || status === 'PAYMENT_CONFIRMED') return 2;
    return 1;
  };

  if (authLoading || appLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-surface select-none">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const activeStep = application ? getStepProgress(application.status) : 0;

  return (
    <div className="min-h-[85vh] bg-surface-container-lowest py-10 select-none text-left">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        
        {/* Dashboard Header Bar */}
        <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <p className="text-body-xs font-black text-primary uppercase tracking-widest text-[9px]">Welcome to APC Portal</p>
            <h2 className="text-headline-sm font-black text-on-surface">{user.fullName}</h2>
            <p className="text-body-xs font-semibold text-on-surface-variant">📞 {user.phoneNumber}</p>
          </div>
          <button
            onClick={logout}
            className="w-fit bg-white hover:bg-surface-container-low border border-outline-variant text-on-surface hover:text-red-600 font-extrabold py-2 px-5 rounded-xl transition-all shadow-xs text-body-xs uppercase tracking-wider cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-600 font-semibold leading-relaxed animate-fade-in">
            ⚠ {errorMsg}
          </div>
        )}

        {/* Application Status Grid */}
        {!application ? (
          <div className="bg-white border border-outline-variant/30 rounded-3xl p-10 text-center space-y-5 shadow-sm">
            <span className="text-5xl block">📄</span>
            <div className="space-y-2">
              <h3 className="text-body-lg font-black text-on-surface">Become a Cooperative Shareholder</h3>
              <p className="text-body-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
                You have not submitted a membership application yet. Fill out the application form online to subscribe to company shares and build equity.
              </p>
            </div>
            <Link
              href="/join"
              className="inline-flex bg-primary hover:bg-dark-green text-white font-extrabold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 uppercase tracking-wider text-label-sm"
            >
              Start Application Form
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Visual Progress Stepper Card */}
            <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 md:p-8 space-y-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                <h3 className="font-extrabold text-on-surface text-body-md">Application Tracking Details</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusBadgeClass(application.status)}`}>
                  {application.status.replace('_', ' ')}
                </span>
              </div>

              {/* Progress Timeline Stepper */}
              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4 md:px-8">
                {/* Horizontal connection line for desktop */}
                <div className="absolute top-1/2 left-[12%] right-[12%] h-[3px] bg-outline-variant/30 -translate-y-1/2 hidden md:block z-0" />
                <div 
                  className="absolute top-1/2 left-[12%] h-[3px] bg-primary transition-all duration-500 -translate-y-1/2 hidden md:block z-0"
                  style={{ width: activeStep === 1 ? '0%' : activeStep === 2 ? '38%' : '76%' }}
                />

                {/* Step 1: Submission */}
                <div className="flex items-center md:flex-col gap-4 md:gap-2 z-10 text-left md:text-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-body-xs border-2 ${
                    activeStep >= 1 ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-outline-variant text-on-surface-variant'
                  }`}>
                    1
                  </div>
                  <div>
                    <h4 className="font-extrabold text-body-xs text-on-surface">Application Submitted</h4>
                    <p className="text-[10px] text-on-surface-variant font-medium">Record uploaded successfully</p>
                  </div>
                </div>

                {/* Step 2: Under Review */}
                <div className="flex items-center md:flex-col gap-4 md:gap-2 z-10 text-left md:text-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-body-xs border-2 ${
                    activeStep >= 2 ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-outline-variant text-on-surface-variant'
                  }`}>
                    2
                  </div>
                  <div>
                    <h4 className="font-extrabold text-body-xs text-on-surface">Officer Evaluation</h4>
                    <p className="text-[10px] text-on-surface-variant font-medium">Under block level review</p>
                  </div>
                </div>

                {/* Step 3: Verification & Decision */}
                <div className="flex items-center md:flex-col gap-4 md:gap-2 z-10 text-left md:text-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-body-xs border-2 ${
                    activeStep >= 3 ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-outline-variant text-on-surface-variant'
                  }`}>
                    3
                  </div>
                  <div>
                    <h4 className="font-extrabold text-body-xs text-on-surface">Cooperative Membership</h4>
                    <p className="text-[10px] text-on-surface-variant font-medium">Final approval & share issuance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Notes from Coordinator if applicable */}
            {application.reviewNotes && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-2 text-amber-900 shadow-xs">
                <h4 className="font-black text-body-xs uppercase tracking-wide flex items-center gap-1.5">
                  <span>💡</span> APC Review Team Advice Notes
                </h4>
                <p className="text-body-xs leading-relaxed font-semibold">
                  {application.reviewNotes}
                </p>
              </div>
            )}

            {/* Application Overview details */}
            <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 space-y-4 shadow-sm select-none">
              <h4 className="font-extrabold text-on-surface border-b border-outline-variant/20 pb-3 text-body-sm">
                Shareholder Profile Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-xs">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-on-surface-variant uppercase">Application ID</p>
                  <p className="font-extrabold text-on-surface">{application.applicationId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-on-surface-variant uppercase">Submitted At</p>
                  <p className="font-extrabold text-on-surface">{new Date(application.submittedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-on-surface-variant uppercase">Subscribed Share Count</p>
                  <p className="font-extrabold text-on-surface">{application.numberOfShares} Shares</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-on-surface-variant uppercase">Capital Contribution</p>
                  <p className="font-extrabold text-primary">₹{Number(application.calculatedContribution).toLocaleString('en-IN')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-on-surface-variant uppercase">Assigned Location</p>
                  <p className="font-extrabold text-on-surface">{application.block}, {application.district}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-on-surface-variant uppercase">Submitted Attachments</p>
                  <p className="font-extrabold text-on-surface">{application.documents.length} Files Uploaded</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
