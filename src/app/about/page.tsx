import type { Metadata } from 'next';
import { AboutHero } from '@/components/sections/about/AboutHero';
import { CompanyStory } from '@/components/sections/about/CompanyStory';
import { FoundationSection } from '@/components/sections/about/FoundationSection';
import { CommunityOwnership } from '@/components/sections/about/CommunityOwnership';
import { EvolutionTimeline } from '@/components/sections/about/EvolutionTimeline';
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
      <FoundationSection />
      <CommunityOwnership />
      <EvolutionTimeline />
      <AboutCTA />
    </>
  );
}
