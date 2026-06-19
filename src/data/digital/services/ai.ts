import { DigitalService } from "@/types/service";

export const aiServices: DigitalService[] = [
  {
    id: 'ai-content-writing',
    slug: 'ai-content-writing',
    title: 'AI Content Writing & Translation',
    categoryId: 'ai',
    description: 'Generate marketing copy, professional Odia/English translations, and digital newsletters powered by custom AI tools.',
    icon: 'education',
    pricing: {
      total: 300,
      currency: 'INR',
      displayPrice: '₹300'
    },
    processingTime: '1-2 Working Days',
    requiredDocuments: [
      { id: 'doc-23', title: 'Draft text or project details', mandatory: true },
      { id: 'doc-24', title: 'Keywords list', mandatory: false },
      { id: 'doc-25', title: 'Target audience info', mandatory: false }
    ],
    status: 'coming-soon',
    featured: false,
    popular: false,
    intents: ['content writing', 'translation', 'marketing', 'newsletter', 'odia language', 'digital marketing'],
    pairedServices: ['gst-registration'],
    tags: ['ai', 'content', 'digital'],
    keywords: ['AI writing', 'content generation', 'translation', 'Odia English', 'marketing copy', 'newsletter'],
    synonyms: ['artificial intelligence writing', 'auto content', 'machine translation'],
    thumbnail: '/images/services-hero.jpg',
    banner: '/images/hero-services.jpg',
    faqs: [
      {
        question: 'Is the content unique and plagiarism-free?',
        answer: 'Yes. All generated content is customized, reviewed by our editors, and cross-checked for plagiarism.'
      }
    ]
  }
];
