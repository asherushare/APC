import type { Metadata } from 'next';
import { ContactHero } from '@/components/sections/contact/ContactHero';
import { ContactFormSection } from '@/components/sections/contact/ContactFormSection';
import { HeadquartersMap } from '@/components/sections/contact/HeadquartersMap';
import { FAQSection } from '@/components/sections/contact/FAQSection';
import { NewsletterCTA } from '@/components/sections/contact/NewsletterCTA';

export const metadata: Metadata = {
  title: 'Contact | APC',
  description:
    'Get in touch with Adivasi Producer Company for services, membership, and community initiatives.',
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactFormSection />
      <HeadquartersMap />
      <FAQSection />
      <NewsletterCTA />
    </>
  );
}
