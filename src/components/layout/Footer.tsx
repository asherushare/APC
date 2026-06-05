import Link from 'next/link';
import { companyInfo } from '@/data/company';
import { navLinks } from '@/data/navigation';

export function Footer() {
  const { address, phone, email } = companyInfo;
  const fullAddress = `${address.street}, ${address.area}, ${address.city}, ${address.state} – ${address.pincode}`;

  return (
    <footer className="bg-surface-container-highest border-t-4 border-secondary" role="contentinfo">
      <div className="max-w-[1280px] mx-auto px-5 md:px-16 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="text-headline-sm text-primary font-bold">
              APC Odisha
            </Link>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Empowering tribal producers of Odisha through Heritage Tech and communal innovation.
            </p>
            <div className="flex gap-3">
              <a
                href={`tel:${phone}`}
                className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary hover:text-secondary transition-colors shadow-sm"
                aria-label="Call us"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </a>
              <a
                href={`mailto:${email}`}
                className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary hover:text-secondary transition-colors shadow-sm"
                aria-label="Email us"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-headline-sm text-primary">Quick Links</h4>
            <nav className="flex flex-col gap-2" aria-label="Footer navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-on-surface-variant hover:text-secondary transition-colors text-body-md"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-headline-sm text-primary">Our Services</h4>
            <div className="flex flex-col gap-2">
              <Link href="/services" className="text-on-surface-variant hover:text-secondary transition-colors text-body-md">Digital Training</Link>
              <Link href="/services" className="text-on-surface-variant hover:text-secondary transition-colors text-body-md">Certificate Services</Link>
              <Link href="/services" className="text-on-surface-variant hover:text-secondary transition-colors text-body-md">Government Schemes</Link>
              <Link href="/services" className="text-on-surface-variant hover:text-secondary transition-colors text-body-md">Tax & GST Support</Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-headline-sm text-primary">Contact Us</h4>
            <div className="space-y-3 text-body-md text-on-surface-variant">
              <p>{fullAddress}</p>
              <p>
                <a href={`tel:${phone}`} className="hover:text-secondary transition-colors">
                  {phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${email}`} className="hover:text-secondary transition-colors">
                  {email}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-outline-variant text-center text-body-md text-on-surface-variant">
          © {new Date().getFullYear()} APC Odisha. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
