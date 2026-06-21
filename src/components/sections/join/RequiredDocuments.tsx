import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';

const documents = [
  {
    title: 'Aadhaar Card',
    description: 'Mandatory proof of identity and local residency.',
    icon: '🪪',
    status: 'Required',
  },
  {
    title: 'PAN Card',
    description: 'Required if available for formal taxation and filing.',
    icon: '💳',
    status: 'Optional',
  },
  {
    title: 'Passport Size Photo',
    description: 'Two physical copies required for the member register book.',
    icon: '📸',
    status: 'Required',
  },
  {
    title: 'Proof of Producer Activity',
    description: 'Land record (Patta), Forest Rights Act (FRA) deed, or block collective endorsement letter.',
    icon: '🚜',
    status: 'Required',
  },
  {
    title: 'Bank Passbook Front Page',
    description: 'Clear copy displaying Account Holder, Bank Name, Account Number, and IFSC code for dividend transfers.',
    icon: '📒',
    status: 'Required',
  },
  {
    title: 'Share Capital Receipt',
    description: 'Bank payment slip or offline cash deposit counter-receipt verifying the capital investment.',
    icon: '🧾',
    status: 'Verification Stage',
  },
];

export function RequiredDocuments() {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Required':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'Optional':
        return 'bg-amber-50 text-amber-700 border-amber-200/50';
      case 'Verification Stage':
        return 'bg-blue-50 text-blue-700 border-blue-200/50';
      default:
        return 'bg-surface-container-high text-on-surface-variant';
    }
  };

  return (
    <section className="py-16 md:py-24 bg-surface-container-low border-b border-outline-variant/30">
      <Container>
        <SectionHeading
          label="CHECKLIST"
          title="Documents Required for Onboarding"
          subtitle="Please prepare the following verification items. These documents will be collected physically by our block coordinator during the field verification step."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {documents.map((doc) => (
            <div
              key={doc.title}
              className="bg-white border border-outline-variant/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between select-none"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary text-2xl shrink-0">
                  {doc.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-on-surface text-body-lg">{doc.title}</h4>
                  <p className="text-body-sm text-on-surface-variant leading-relaxed">{doc.description}</p>
                </div>
              </div>
              
              {/* Status Badge Chip */}
              <div className="mt-4 pt-4 border-t border-outline-variant/10 flex justify-end">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${getStatusStyles(doc.status)}`}>
                  {doc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
