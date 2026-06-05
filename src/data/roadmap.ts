import type { RoadmapPhase } from '@/types';

export const roadmapPhases: RoadmapPhase[] = [
  {
    phase: 1,
    title: 'Company Formation',
    status: 'established',
    statusLabel: 'ESTABLISHED',
    description:
      'The foundational stage focused on legal formalization, core team recruitment, and establishing our primary operational hub. We defined our mission of bridging the gap between tribal producers and global markets.',
    icon: 'building',
  },
  {
    phase: 2,
    title: 'Digital Service Center',
    status: 'operational',
    statusLabel: 'OPERATIONAL',
    description:
      'Launch of state-of-the-art Digital Service Centers (DSCs) providing essential fintech, e-governance, and e-commerce training to tribal clusters, bringing the modern economy to their doorstep.',
    icon: 'monitor',
  },
  {
    phase: 3,
    title: 'Community Membership Growth',
    status: 'active',
    statusLabel: 'ACTIVE SCALING',
    description:
      'Aggressive community mobilization to build a robust network of 50,000+ tribal producer members, ensuring collective bargaining power and shared resource management.',
    icon: 'users',
  },
  {
    phase: 4,
    title: 'Entrepreneurship Training',
    status: 'in-progress',
    statusLabel: 'IN PROGRESS',
    description:
      'Incubating local talent through specialized workshops on value addition, packaging, and digital marketing, transforming subsistence farmers into agro-entrepreneurs.',
    icon: 'graduation',
  },
  {
    phase: 5,
    title: 'Market Linkage & Expansion',
    status: 'upcoming',
    statusLabel: 'UPCOMING Q3 2024',
    description:
      'Direct integration with domestic and international retail chains. Launching our proprietary B2B platform to eliminate middlemen and maximize producer profits.',
    icon: 'cart',
  },
  {
    phase: 6,
    title: 'Employment Generation',
    status: 'planned',
    statusLabel: 'PLANNED 2025',
    description:
      'Establishing community-owned processing units and logistics hubs, creating thousands of localized jobs in the heart of tribal regions.',
    icon: 'briefcase',
  },
  {
    phase: 7,
    title: 'Sustainable Development Programs',
    status: 'planned',
    statusLabel: 'PLANNED 2026+',
    description:
      'Scaling climate-resilient agriculture practices and circular economy initiatives to ensure long-term ecological and economic health for the APC ecosystem.',
    icon: 'leaf',
  },
];
