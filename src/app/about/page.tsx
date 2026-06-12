import type { Metadata } from 'next';
import { AboutHero } from '@/components/sections/about/AboutHero';
import { CompanyStory } from '@/components/sections/about/CompanyStory';
import { LegalIdentity } from '@/components/sections/about/LegalIdentity';
import { FoundationSection } from '@/components/sections/about/FoundationSection';
import { Achievements } from '@/components/sections/about/Achievements';
import { CommunityOwnership } from '@/components/sections/about/CommunityOwnership';
import { EvolutionTimeline } from '@/components/sections/about/EvolutionTimeline';
import { DocumentDownloads } from '@/components/sections/about/DocumentDownloads';
import { AboutCTA } from '@/components/sections/about/AboutCTA';

export const metadata: Metadata = {
  title: 'About | APC',
  description: 'Learn about APC’s mission, vision, and tribal empowerment.',
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <CompanyStory />
      <LegalIdentity />
      <FoundationSection />
      <Achievements />
      <CommunityOwnership />
      <EvolutionTimeline />
      <DocumentDownloads />
      <AboutCTA />
    </>
  );
}

