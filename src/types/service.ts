import { FAQ } from './faq';

export interface DocumentRequirement {
  id: string;
  title: string;
  mandatory: boolean;
  description?: string;
  sampleFile?: string;
}

export interface Pricing {
  governmentFee?: number;
  serviceFee?: number;
  gst?: number;
  total?: number;
  currency?: "INR" | string;
  displayPrice?: string; // e.g. "₹50" or "Free"
}

export interface DigitalService {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  description: string;
  categoryId: string;
  
  // Media Assets
  thumbnail?: string;
  banner?: string;
  icon: string;
  gallery?: string[];
  downloadableDocuments?: string[];
  
  // Search & SEO
  tags?: string[];
  keywords?: string[];
  synonyms?: string[];
  intents?: string[]; // e.g. "farmer", "scholarship", "business"
  seoTitle?: string;
  seoDescription?: string;
  
  // Details
  requiredDocuments: DocumentRequirement[];
  faqs?: FAQ[];
  processingTime: string;
  pricing?: Pricing;
  
  // Recommendations & Comparisons
  pairedServices?: string[]; // IDs of frequently booked together services
  compareFields?: Record<string, string | boolean | number>; // For future service comparison
  
  // Flags & Status
  featured?: boolean;
  popular?: boolean;
  recommended?: boolean;
  status: "active" | "coming-soon" | "temporarily-unavailable" | "maintenance" | "archived";
  displayOrder?: number;
  
  // Auditing
  dateAdded?: string; // For "Recently Added" sorting
  createdAt?: string;
  updatedAt?: string;
}
