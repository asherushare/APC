import { DigitalService } from "@/types/service";

export const creativeServices: DigitalService[] = [
  {
    id: 'resume-creation',
    slug: 'resume-creation',
    title: 'Professional Resume Creation',
    categoryId: 'creative',
    description: 'Create premium, ATS-friendly resumes and job profiles tailored for local, corporate, or technology roles.',
    icon: 'certificate',
    pricing: {
      total: 200,
      currency: 'INR',
      displayPrice: '₹200'
    },
    processingTime: '2-3 Working Days',
    requiredDocuments: [
      { id: 'doc-26', title: 'Educational certificates', mandatory: true },
      { id: 'doc-27', title: 'Work experience details', mandatory: true },
      { id: 'doc-28', title: 'Passport photo', mandatory: false }
    ],
    status: 'active',
    featured: false,
    popular: false,
    intents: ['job', 'employment', 'career', 'resume', 'CV', 'interview', 'job application'],
    pairedServices: ['pan-card'],
    tags: ['creative', 'employment', 'career'],
    keywords: ['resume', 'CV', 'curriculum vitae', 'job profile', 'ATS resume', 'job application'],
    synonyms: ['biodata creation', 'job resume', 'professional CV writing'],
    thumbnail: '/images/services-hero.jpg',
    banner: '/images/hero-services.jpg',
    faqs: [
      {
        question: 'Do you provide editable copies of the resume?',
        answer: 'Yes, we provide both a ready-to-print PDF file and an editable document file.'
      }
    ]
  }
];
