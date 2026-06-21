'use client';

import { useState } from 'react';
import { JoinHero } from './JoinHero';
import { QuickSummary } from './QuickSummary';
import { JoinFormSection } from './JoinFormSection';
import { MembershipBenefits } from './MembershipBenefits';
import { EligibilityCriteria } from './EligibilityCriteria';
import { MembershipProcess } from './MembershipProcess';
import { RequiredDocuments } from './RequiredDocuments';
import { MembershipFAQ } from './MembershipFAQ';
import { FloatingApplyButton } from './FloatingApplyButton';

export function JoinPortalClient() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <JoinHero onLearnMore={() => setIsExpanded(true)} />
      <QuickSummary />
      <JoinFormSection />

      {/* Expandable Information Hub */}
      <section className="bg-surface py-12 border-t border-outline-variant/30 select-none">
        <div className="max-w-2xl mx-auto px-5">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Divider lines decoration */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-outline-variant/50 to-transparent" />
            
            <div className="space-y-2">
              <h3 className="text-headline-sm font-black text-on-surface">
                Want to know more before applying?
              </h3>
              <p className="text-body-sm text-on-surface-variant font-black max-w-lg mx-auto leading-relaxed uppercase tracking-wider text-[10px]">
                Benefits &bull; Eligibility &bull; Required Documents &bull; Application Process &bull; FAQ
              </p>
            </div>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-controls="shareholder-details-hub"
              className="inline-flex items-center gap-2.5 bg-white border border-outline-variant hover:bg-surface-container-low text-primary hover:text-dark-green font-extrabold px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.98] cursor-pointer text-body-sm uppercase tracking-wider focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              <span>{isExpanded ? '▲ Hide Complete Information' : '▼ View Complete Information'}</span>
            </button>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-outline-variant/50 to-transparent" />

            {/* Offline Application Card */}
            <div className="mt-8 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 text-center max-w-lg mx-auto space-y-3 shadow-sm select-none">
              <span className="text-2xl block">📄</span>
              <h4 className="font-extrabold text-on-surface text-body-md">Offline Application Option</h4>
              <p className="text-body-xs text-on-surface-variant font-medium leading-relaxed">
                If you cannot complete the online application, you may download the official form, complete it manually, and submit it to your nearest APC office or coordinator.
              </p>
              <a
                href="/documents/apc-shareholder-application.pdf"
                download="apc-shareholder-application.pdf"
                className="inline-flex items-center gap-2 bg-white border border-outline-variant hover:bg-surface-container-low text-primary hover:text-dark-green font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 text-body-xs uppercase tracking-wider cursor-pointer mt-1"
              >
                📥 Download Application Form (PDF)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Expanded Sections Container */}
      <div
        id="shareholder-details-hub"
        className={`transition-all duration-700 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <MembershipBenefits />
        <EligibilityCriteria />
        <MembershipProcess />
        <RequiredDocuments />
        <MembershipFAQ />
      </div>

      <FloatingApplyButton />
    </>
  );
}
