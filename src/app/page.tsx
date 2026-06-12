import { NoticesSlider } from '@/components/sections/home/NoticesSlider';
import { HeroSection } from '@/components/sections/home/HeroSection';
import { CorePillars } from '@/components/sections/home/CorePillars';
import { StatsBar } from '@/components/sections/home/StatsBar';
import { MissionVision } from '@/components/sections/home/MissionVision';
import { ServicesPreview } from '@/components/sections/home/ServicesPreview';
import { BenefitsSection } from '@/components/sections/home/BenefitsSection';
import { LeadershipPreview } from '@/components/sections/home/LeadershipPreview';
import { ShareholderSection } from '@/components/sections/home/ShareholderSection';
import { RoadmapPreview } from '@/components/sections/home/RoadmapPreview';
import { CTASection } from '@/components/sections/home/CTASection';

export default function HomePage() {
  return (
    <>
      <NoticesSlider />
      <HeroSection />
      <CorePillars />
      <StatsBar />
      <MissionVision />
      <ServicesPreview />
      <BenefitsSection />
      <LeadershipPreview />
      <ShareholderSection />
      <RoadmapPreview />
      <CTASection />
    </>
  );
}

