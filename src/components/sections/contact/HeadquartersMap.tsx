import Image from 'next/image';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { GOOGLE_MAPS_URL } from '@/constants';
import { companyInfo } from '@/data/company';

export function HeadquartersMap() {
  const { address } = companyInfo;
  const fullAddress = `${address.street}, ${address.area}, ${address.city}, ${address.state} – ${address.pincode}`;

  return (
    <section className="py-16 md:py-24">
      <Container>
        <SectionHeading
          title="Visit Our Headquarters"
          subtitle="Located in the heart of Rayagada, accessible to our tribal community."
        />
        <div className="relative rounded-xl overflow-hidden">
          <Image
            src="/images/hero-contact.jpg"
            alt="APC Odisha Headquarters in Rayagada"
            width={1200}
            height={500}
            className="object-cover w-full h-[300px] md:h-[400px]"
          />
          <div className="glass-card absolute bottom-6 left-6 p-6 rounded-lg max-w-sm">
            <h3 className="text-headline-sm text-on-surface mb-2">Rayagada Office</h3>
            <p className="text-body-md text-on-surface-variant mb-3">{fullAddress}</p>
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-label-md font-semibold hover:text-dark-green transition-colors inline-flex items-center gap-1"
              id="headquarters-maps-link"
            >
              Open in Google Maps
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
