import { DigitalCategory } from '@/types/digital';

export const categories: DigitalCategory[] = [
  { id: 'govt', name: 'Government', icon: 'shield', sortOrder: 1 },
  { id: 'ai', name: 'AI Services', icon: 'cpu', sortOrder: 2 },
  { id: 'business', name: 'Business Support', icon: 'briefcase', sortOrder: 3 },
  { id: 'edu', name: 'Education', icon: 'graduation-cap', sortOrder: 4 },
  { id: 'agri', name: 'Agriculture', icon: 'sprout', sortOrder: 5 },
  { id: 'comm', name: 'Community', icon: 'users', sortOrder: 6 },
  { id: 'tech', name: 'Technology', icon: 'laptop', sortOrder: 7 },
  { id: 'creative', name: 'Creative', icon: 'palette', sortOrder: 8 },
];
