import { DigitalService } from '@/types/digital';

export const demoServices: DigitalService[] = [
  {
    id: 'aadhaar-services',
    slug: 'aadhaar-services',
    title: 'Aadhaar Services',
    categoryId: 'govt',
    description: 'Update demographic information, print e-Aadhaar, link mobile numbers, or verify existing credentials.',
    icon: 'fingerprint',
    price: '₹50',
    processingTime: '3-5 Working Days',
    requiredDocuments: ['Proof of Identity (POI)', 'Proof of Address (POA)', 'Date of Birth Document'],
    status: 'active',
    featured: true,
    popular: true,
    thumbnail: '/images/services-hero.jpg',
    banner: '/images/hero-services.jpg',
    faqs: [
      {
        question: 'What documents are accepted as Proof of Identity (POI)?',
        answer: 'Passport, Voter ID, PAN Card, Driving License, or Ration Card are accepted as POI.'
      },
      {
        question: 'How long does it take for Aadhaar information to update online?',
        answer: 'Usually, updates are completed online in 3 to 5 working days, though it can take up to 30 days in some verification cases.'
      }
    ]
  },
  {
    id: 'pan-card',
    slug: 'pan-card',
    title: 'PAN Card Registration',
    categoryId: 'govt',
    description: 'Apply for a new Permanent Account Number (PAN) or correct details on an existing physical card.',
    icon: 'id-card',
    price: '₹150',
    processingTime: '7-10 Working Days',
    requiredDocuments: ['Aadhaar Card', 'Two Passport Sized Photographs', 'Proof of Date of Birth'],
    status: 'active',
    featured: true,
    popular: true,
    thumbnail: '/images/services-hero.jpg',
    banner: '/images/hero-services.jpg',
    faqs: [
      {
        question: 'Is Aadhaar mandatory for PAN card applications?',
        answer: 'Yes, Aadhaar is mandatory for filing new PAN card registration applications and for linking existing cards.'
      },
      {
        question: 'Will I receive a physical PAN card?',
        answer: 'Yes. A physical card will be dispatched directly to your registered Aadhaar home address, and an e-PAN will be sent to your email.'
      }
    ]
  },
  {
    id: 'income-certificate',
    slug: 'income-certificate',
    title: 'Income Certificate',
    categoryId: 'govt',
    description: 'Procure official state-certified government Income Certificates for educational scholarships or subsidy access.',
    icon: 'certificate',
    price: '₹80',
    processingTime: '5-7 Working Days',
    requiredDocuments: ['Land Revenue Receipt', 'Salary Slip / Self-Declaration of Income', 'Aadhaar Card', 'Ration Card'],
    status: 'active',
    featured: false,
    popular: true,
    thumbnail: '/images/services-hero.jpg',
    banner: '/images/hero-services.jpg',
    faqs: [
      {
        question: 'Who issues the Income Certificate in Odisha?',
        answer: 'Income Certificates are officially approved and issued by the Revenue Officer / Tahasildar of your local block administrative area.'
      }
    ]
  },
  {
    id: 'passport',
    slug: 'passport',
    title: 'Passport Application',
    categoryId: 'govt',
    description: 'Assisted submission of online registration, appointment slot booking, and document list checking for fresh or renewal Passports.',
    icon: 'government',
    price: '₹500',
    processingTime: '15-20 Working Days',
    requiredDocuments: ['Aadhaar Card / Voter ID', 'Proof of Address', 'Non-ECR Proof (Matriculation Certificate)', 'Date of Birth Proof'],
    status: 'active',
    featured: false,
    popular: true,
    thumbnail: '/images/services-hero.jpg',
    banner: '/images/hero-services.jpg',
    faqs: [
      {
        question: 'Do I need to visit the Passport Office physically?',
        answer: 'Yes. After we book your online slot, you must visit the Passport Seva Kendra (PSK) for biometric capturing and document verification.'
      }
    ]
  },
  {
    id: 'pm-kisan',
    slug: 'pm-kisan',
    title: 'PM Kisan Registration',
    categoryId: 'govt',
    description: 'New farmer registration, e-KYC updates, and installment credit status checks for Pradhan Mantri Kisan Samman Nidhi.',
    icon: 'leaf',
    price: '₹30',
    processingTime: '2-3 Working Days',
    requiredDocuments: ['Land Record Documents (Patta)', 'Aadhaar Card', 'Bank Passbook Details', 'Mobile linked to Aadhaar'],
    status: 'active',
    featured: false,
    popular: false,
    thumbnail: '/images/services-hero.jpg',
    banner: '/images/hero-services.jpg',
    faqs: [
      {
        question: 'What is e-KYC in PM Kisan?',
        answer: 'It is a mandatory identity verification process using Aadhaar OTP verification to check eligible farmer banking accounts.'
      }
    ]
  },
  {
    id: 'gst-registration',
    slug: 'gst-registration',
    title: 'GST Registration',
    categoryId: 'business',
    description: 'Get Goods and Services Tax Identification Number (GSTIN) for your business or local co-op society.',
    icon: 'briefcase',
    price: '₹1200',
    processingTime: '5-7 Working Days',
    requiredDocuments: ['PAN Card of Business/Proprietor', 'Aadhaar Card', 'Proof of Business Address (Utility Bill/Rent Agreement)', 'Bank Statement'],
    status: 'active',
    featured: true,
    popular: false,
    thumbnail: '/images/services-hero.jpg',
    banner: '/images/hero-services.jpg',
    faqs: [
      {
        question: 'Is a physical business address required for GST?',
        answer: 'Yes, a valid registered office address is mandatory. A electricity bill or rent agreement can be provided as proof.'
      }
    ]
  },
  {
    id: 'ai-content-writing',
    slug: 'ai-content-writing',
    title: 'AI Content Writing & Translation',
    categoryId: 'ai',
    description: 'Generate marketing copy, professional Odia/English translations, and digital newsletters powered by custom AI tools.',
    icon: 'education',
    price: '₹300',
    processingTime: '1-2 Working Days',
    requiredDocuments: ['Draft text or project details', 'Keywords list', 'Target audience info'],
    status: 'coming-soon',
    featured: false,
    popular: false,
    thumbnail: '/images/services-hero.jpg',
    banner: '/images/hero-services.jpg',
    faqs: [
      {
        question: 'Is the content unique and plagiarism-free?',
        answer: 'Yes. All generated content is customized, reviewed by our editors, and cross-checked for plagiarism.'
      }
    ]
  },
  {
    id: 'resume-creation',
    slug: 'resume-creation',
    title: 'Professional Resume Creation',
    categoryId: 'creative',
    description: 'Create premium, ATS-friendly resumes and job profiles tailored for local, corporate, or technology roles.',
    icon: 'certificate',
    price: '₹200',
    processingTime: '2-3 Working Days',
    requiredDocuments: ['Educational certificates', 'Work experience details', 'Passport photo'],
    status: 'active',
    featured: false,
    popular: false,
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
