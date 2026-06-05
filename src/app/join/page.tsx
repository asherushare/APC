import type { Metadata } from 'next';
import { JoinHero } from '@/components/sections/join/JoinHero';
import { MembershipBenefits } from '@/components/sections/join/MembershipBenefits';
import { MembershipTypes } from '@/components/sections/join/MembershipTypes';
import { EligibilityCriteria } from '@/components/sections/join/EligibilityCriteria';
import { MembershipProcess } from '@/components/sections/join/MembershipProcess';
import { JoinFormSection } from '@/components/sections/join/JoinFormSection';
import { JoinCTA } from '@/components/sections/join/JoinCTA';

export const metadata: Metadata = {
  title: 'Join APC',
  description: 'Become part of Adivasi Producer Company and help build a stronger tribal community.',
};

export default function JoinPage() {
  return (
    <>
      <JoinHero />
      <MembershipBenefits />
      <MembershipTypes />
      <EligibilityCriteria />
      <MembershipProcess />
      <JoinFormSection />
      <JoinCTA />
    </>
  );
}
