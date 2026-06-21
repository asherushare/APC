import { Container } from '@/components/common/Container';

export function QuickSummary() {
  const summaryItems = [
    {
      title: 'Share Value',
      value: '₹10,000',
      desc: 'Nominative face value per individual equity share.',
      icon: '✓'
    },
    {
      title: 'Minimum Investment',
      value: '1 Share',
      desc: 'Requires a minimum entry contribution of ₹10,000.',
      icon: '✓'
    },
    {
      title: 'Maximum Investment',
      value: '10 Shares',
      desc: 'Up to ₹100,000 in equity contribution per shareholder.',
      icon: '✓'
    },
    {
      title: 'Processing Time',
      value: 'Within 24 Hours',
      desc: 'Instant coordinator review and direct callback confirmation.',
      icon: '✓'
    },
    {
      title: 'Support',
      value: 'Call + WhatsApp',
      desc: 'Direct human guidance through the entire onboarding process.',
      icon: '✓'
    }
  ];

  return (
    <section id="summary" className="py-12 md:py-16 bg-surface-container-low border-b border-outline-variant/30 relative select-none">
      <Container>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-headline-md md:text-headline-lg font-black text-on-surface">
              Shareholder Program at a Glance
            </h2>
            <p className="text-body-md text-on-surface-variant max-w-2xl mx-auto leading-relaxed font-medium">
              Immediate answers to your top questions regarding our cooperative equity model.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-5 pt-2">
            {summaryItems.map((item) => (
              <div 
                key={item.title} 
                className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 w-full sm:w-[calc(50%-10px)] md:w-[calc(33.33%-14px)] lg:w-[calc(20%-16px)] min-w-[180px] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {item.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-label-sm uppercase font-black tracking-widest text-primary/70">{item.title}</h3>
                    <p className="text-headline-sm font-black text-on-surface">{item.value}</p>
                  </div>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed font-medium pt-2 border-t border-outline-variant/10">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
