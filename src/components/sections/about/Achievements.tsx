import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';

export function Achievements() {
  const stats = [
    {
      metric: '4,500+',
      title: 'Active Tribal Shareholders',
      description: 'Small and marginal tribal farmers owning equity shares, directing dividends back into families.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
    },
    {
      metric: '10,000+',
      title: 'Citizen Services Handled',
      description: 'Essential certificate applications, banking services, and welfare registrations successfully completed.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 12.481c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 14.25H15c1.03 0 1.9.693 2.166 1.638m-9.75-8.25h.008v.008H7.5V7.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM7.5 12h.008v.008H7.5V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.008v.008H7.5v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
    },
    {
      metric: '12+',
      title: 'Gram Panchayats Covered',
      description: 'Expanding brick-and-mortar village service points to make support accessible to remote forest villages.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
        </svg>
      ),
    },
    {
      metric: '₹1.5Cr+',
      title: 'Direct Farmer Livelihood Value',
      description: 'Achieved through organic bulk marketing, collective processing, and cutting out exploitative middlemen.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-surface" id="achievements-section">
      <Container>
        <SectionHeading
          label="OUR TRACK RECORD"
          title="Achievements & Impact"
          subtitle="Real results driving empowerment, sustainable incomes, and digital integration in tribal Odisha."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <article
              key={index}
              className="bg-surface-container-lowest border border-outline-variant/35 rounded-2xl p-6 shadow-tribal hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Icon wrapper */}
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  {stat.icon}
                </div>

                <div className="space-y-1">
                  <span className="text-display-mobile font-bold text-primary block leading-none tracking-tight">
                    {stat.metric}
                  </span>
                  <h3 className="text-label-lg font-bold text-on-surface">
                    {stat.title}
                  </h3>
                </div>
              </div>

              <p className="text-body-md text-on-surface-variant mt-3 pt-3 border-t border-outline-variant/10 leading-relaxed">
                {stat.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
