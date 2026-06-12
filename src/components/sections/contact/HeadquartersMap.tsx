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
        <div className="relative rounded-xl overflow-hidden border border-outline-variant/30 shadow-tribal h-[350px] md:h-[450px]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3744.1528655815615!2d83.41505367607759!3d20.127599581313364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a24d5ea8d3568fb%3A0xe5a36ff8525b6a7!2sSai%20Temple%20Rd%2C%20Rayagada%2C%20Odisha%20765001!5e0!3m2!1sen!2sin!4v1718181283733!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full grayscale-[10%] contrast-[102%]"
            title="APC Odisha Headquarters Location Map"
          />
          <div className="glass-card absolute bottom-4 left-4 right-4 md:right-auto md:bottom-6 md:left-6 p-5 md:p-6 rounded-lg max-w-sm border border-outline-variant/35 shadow-lg">
            <h3 className="text-headline-sm text-on-surface mb-2 font-bold">Rayagada Office</h3>
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

