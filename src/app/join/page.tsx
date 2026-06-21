import type { Metadata } from 'next';
import { JoinPortalClient } from '@/components/sections/join/JoinPortalClient';

export const metadata: Metadata = {
  title: 'APC Shareholder Membership Onboarding',
  description: 'Apply to become a cooperative shareholder of Adivasi Producer Company (APC) and build local tribal enterprise equity.',
};

export default function JoinPage() {
  return <JoinPortalClient />;
}
