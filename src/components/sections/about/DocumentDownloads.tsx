import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';

export function DocumentDownloads() {
  const documents = [
    {
      title: 'APC Corporate Brochure',
      description: 'Overview of our mission, services, shareholder structure, and institutional framework.',
      fileSize: '1.2 MB',
      fileType: 'PDF',
      url: '/documents/corporate-brochure.pdf',
    },
    {
      title: 'FPO Registration Certificate',
      description: 'Official incorporation document of Adivasi Producer Company Limited registered with RoC.',
      fileSize: '840 KB',
      fileType: 'PDF',
      url: '/documents/registration-certificate.pdf',
    },
    {
      title: 'Shareholder Benefit Manual',
      description: 'Handbook detailing dividend guidelines, voting rights, and agricultural bonus policies.',
      fileSize: '1.5 MB',
      fileType: 'PDF',
      url: '/documents/member-manual.pdf',
    },
    {
      title: 'Annual Performance Report 2024-25',
      description: 'Detailed financial statements, audit reviews, and service milestones achieved in the last fiscal year.',
      fileSize: '2.1 MB',
      fileType: 'PDF',
      url: '/documents/agm-notice-2026.pdf', // Using available placeholders
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-surface-container-lowest" id="documents-section">
      <Container>
        <SectionHeading
          label="RESOURCES & REPORTS"
          title="Document Download Area"
          subtitle="Access and download our official corporate documents, flyers, and compliance reports."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="bg-surface-container-low border border-outline-variant/35 rounded-2xl p-6 flex flex-col justify-between hover:shadow-tribal-hover transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                {/* File Icon */}
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <h3 className="text-headline-sm font-bold text-on-surface leading-snug">
                    {doc.title}
                  </h3>
                  <div className="flex items-center gap-2 text-label-sm text-on-surface-variant font-medium">
                    <span className="bg-red-50 text-red-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                      {doc.fileType}
                    </span>
                    <span>•</span>
                    <span>{doc.fileSize}</span>
                  </div>
                </div>
              </div>

              <p className="text-body-md text-on-surface-variant mt-4 leading-relaxed">
                {doc.description}
              </p>

              <div className="mt-6 pt-4 border-t border-outline-variant/15 flex justify-end">
                <a
                  href={doc.url}
                  download
                  className="inline-flex items-center gap-1.5 bg-primary hover:bg-dark-green text-white px-4 py-2 rounded-lg text-label-md font-semibold transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
