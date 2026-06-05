// ===================================
// APC Odisha — TypeScript Interfaces
// ===================================

/** Navigation link item */
export interface NavLink {
  label: string;
  href: string;
}

/** Statistic display (e.g., "15+ Founding Leaders") */
export interface Stat {
  value: string;
  label: string;
  icon?: string;
}

/** Service offered by APC */
export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  featured?: boolean;
}

/** Board director or founder */
export interface Director {
  name: string;
  role: string;
  location: string;
  image?: string;
  quote?: string;
  isFounder?: boolean;
}

/** Roadmap phase */
export interface RoadmapPhase {
  phase: number;
  title: string;
  status: 'established' | 'operational' | 'active' | 'in-progress' | 'upcoming' | 'planned';
  statusLabel: string;
  description: string;
  icon: string;
  plannedDate?: string;
}

/** Core value */
export interface Value {
  title: string;
  description: string;
  icon: string;
}

/** Membership benefit */
export interface Benefit {
  title: string;
  description: string;
  icon: string;
}

/** FAQ item */
export interface FAQ {
  question: string;
  answer: string;
}

/** Company information */
export interface CompanyInfo {
  name: string;
  fullName: string;
  tagline: string;
  description: string;
  mission: string;
  vision: string;
  phone: string;
  email: string;
  address: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
  };
  founded?: string;
  registrationType?: string;
}

/** Timeline event for company history */
export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  image: string;
}

/** Governance transparency point */
export interface GovernancePoint {
  title: string;
  description: string;
  icon: string;
}
