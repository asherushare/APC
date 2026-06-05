import type { Metadata } from 'next';
import { RoadmapHero } from '@/components/sections/roadmap/RoadmapHero';
import { RoadmapTimeline } from '@/components/sections/roadmap/RoadmapTimeline';
import { Vision2030 } from '@/components/sections/roadmap/Vision2030';
import { RoadmapCTA } from '@/components/sections/roadmap/RoadmapCTA';

export const metadata: Metadata = {
  title: 'Roadmap | APC',
  description: 'Explore the long-term roadmap and future vision of Adivasi Producer Company.',
};

export default function RoadmapPage() {
  return (
    <>
      <RoadmapHero />
      <RoadmapTimeline />
      <Vision2030 />
      <RoadmapCTA />
    </>
  );
}
