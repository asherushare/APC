import type { Metadata } from 'next';
import { LeadershipHero } from '@/components/sections/leadership/LeadershipHero';
import { FounderSpotlight } from '@/components/sections/leadership/FounderSpotlight';
import { GovernanceStructure } from '@/components/sections/leadership/GovernanceStructure';
import { TransparentGovernance } from '@/components/sections/leadership/TransparentGovernance';
import { BoardOfDirectors } from '@/components/sections/leadership/BoardOfDirectors';
import { LeadershipCTA } from '@/components/sections/leadership/LeadershipCTA';

export const metadata: Metadata = {
  title: 'Leadership | APC',
  description: 'Meet the leadership team and governance structure of Adivasi Producer Company.',
};

export default function LeadershipPage() {
  return (
    <>
      <LeadershipHero />
      <FounderSpotlight />
      <GovernanceStructure />
      <TransparentGovernance />
      <BoardOfDirectors />
      <LeadershipCTA />
    </>
  );
}
