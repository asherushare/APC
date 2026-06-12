import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';

export function LegalIdentity() {
  const legalDetails = [
    { label: 'Registered Entity Name', value: 'Adivasi Producer Company Limited (APC Odisha)' },
    { label: 'Corporate ID Number (CIN)', value: 'U01110OR2019PTC032284', isCode: true },
    { label: 'Entity Type', value: 'Farmer Producer Company (FPO / FPC)' },
    { label: 'Date of Incorporation', value: 'December 12, 2019' },
    { label: 'Registrar Authority', value: 'Registrar of Companies (RoC), Cuttack, Odisha' },
    { label: 'Authorized Share Capital', value: '₹10,00,000 (INR Ten Lakhs)' },
    { label: 'Paid-up Capital', value: '₹5,00,000 (INR Five Lakhs)' },
    { label: 'Registered Address', value: 'Sai Temple Road, New Colony, Rayagada, Odisha – 765001' },
  ];

  return (
    <section className="py-16 md:py-24 bg-surface-container-low" id="legal-identity-section">
      <Container>
        <SectionHeading
          label="COMPLIANCE & STANDARDS"
          title="Legal Identity"
          subtitle="APC Odisha is fully registered and compliant with the Ministry of Corporate Affairs, ensuring transparency and institutional trust."
        />

        <div className="max-w-4xl mx-auto bg-surface-container-lowest border border-outline-variant/35 rounded-2xl p-6 md:p-10 shadow-tribal overflow-hidden relative">
          {/* Decorative Background Badge */}
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-primary/5 rounded-full flex items-center justify-center text-primary/10 select-none pointer-events-none">
            <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>

          <div className="relative space-y-8">
            {/* Header Identity banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
              <div>
                <h3 className="text-headline-md font-bold text-on-surface">FPO Institutional Profile</h3>
                <p className="text-body-md text-on-surface-variant">Ministry of Corporate Affairs (MCA) Registered Details</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-label-md font-bold border border-primary/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Active & Compliant
              </span>
            </div>

            {/* Grid detail entries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {legalDetails.map((detail, index) => (
                <div key={index} className="space-y-1">
                  <span className="text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider block">
                    {detail.label}
                  </span>
                  <p className={`text-body-lg text-on-surface font-medium leading-relaxed ${detail.isCode ? 'font-mono text-primary bg-primary/5 px-2.5 py-0.5 rounded border border-primary/10 inline-block text-label-md select-all' : ''}`}>
                    {detail.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Note alert */}
            <div className="mt-4 p-4 rounded-xl bg-surface-container-low/70 border border-outline-variant/30 flex items-start gap-3 text-body-md text-on-surface-variant">
              <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <span>
                <strong>Shareholder Rights:</strong> As an incorporated Producer Company under the Companies Act, ownership of APC is fully distributed among our tribal growers. Board elections are held democratically, ensuring complete community sovereignty.
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
