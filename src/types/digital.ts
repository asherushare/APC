import { FAQ } from './index';

export interface DigitalCategory {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
}

export interface DigitalService {
  id: string;
  slug: string;
  title: string;
  categoryId: string;
  description: string;
  icon: string;
  price: string;
  processingTime: string;
  requiredDocuments: string[];
  faqs?: FAQ[];
  
  // Optional parameters for CMS/Admin integration:
  status?: "active" | "coming-soon" | "temporarily-unavailable";
  thumbnail?: string;
  banner?: string;
  featured?: boolean;
  popular?: boolean;
  tags?: string[];
  sortOrder?: number;
}
