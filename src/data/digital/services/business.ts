import { DigitalService } from "@/types/service";

export const businessServices: DigitalService[] = [
  {
    id: 'gst-registration',
    slug: 'gst-registration',
    title: 'GST Registration',
    categoryId: 'business',
    description: 'Get Goods and Services Tax Identification Number (GSTIN) for your business or local co-op society.',
    icon: 'briefcase',
    pricing: {
      total: 1200,
      currency: 'INR',
      displayPrice: '₹1200'
    },
    processingTime: '5-7 Working Days',
    requiredDocuments: [
      { id: 'doc-19', title: 'PAN Card of Business/Proprietor', mandatory: true },
      { id: 'doc-20', title: 'Aadhaar Card', mandatory: true },
      { id: 'doc-21', title: 'Proof of Business Address (Utility Bill/Rent Agreement)', mandatory: true },
      { id: 'doc-22', title: 'Bank Statement', mandatory: true }
    ],
    status: 'active',
    featured: true,
    popular: false,
    intents: ['business registration', 'tax', 'GSTIN', 'shop', 'small business', 'trader'],
    pairedServices: ['pan-card', 'aadhaar-services'],
    tags: ['business', 'tax', 'registration'],
    keywords: ['GST', 'GSTIN', 'goods and services tax', 'business license', 'tax registration', 'IGST', 'CGST', 'SGST'],
    synonyms: ['goods and services tax registration', 'GST number', 'GSTIN registration'],
    thumbnail: '/images/services-hero.jpg',
    banner: '/images/hero-services.jpg',
    faqs: [
      {
        question: 'Is a physical business address required for GST?',
        answer: 'Yes, a valid registered office address is mandatory. A electricity bill or rent agreement can be provided as proof.'
      }
    ]
  }
];
