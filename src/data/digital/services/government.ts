import { DigitalService } from "@/types/service";

export const governmentServices: DigitalService[] = [
  {
    id: 'aadhaar-services',
    slug: 'aadhaar-services',
    title: 'Aadhaar Services',
    categoryId: 'govt',
    description: 'Update demographic information, print e-Aadhaar, link mobile numbers, or verify existing credentials.',
    icon: 'fingerprint',
    pricing: {
      total: 50,
      currency: 'INR',
      displayPrice: '₹50'
    },
    processingTime: '3-5 Working Days',
    requiredDocuments: [
      { id: 'doc-1', title: 'Proof of Identity (POI)', mandatory: true },
      { id: 'doc-2', title: 'Proof of Address (POA)', mandatory: true },
      { id: 'doc-3', title: 'Date of Birth Document', mandatory: true }
    ],
    status: 'active',
    featured: true,
    popular: true,
    intents: ['identity proof', 'address change', 'fingerprint update', 'uidai', 'link mobile'],
    pairedServices: ['pan-card', 'passport'],
    tags: ['identity', 'government', 'documentation'],
    keywords: ['Aadhaar', 'UIDAI', 'e-Aadhaar', 'Aadhaar update', 'Aadhaar correction', 'biometric', 'UID'],
    synonyms: ['aadhar', 'adhar', 'adhar card', 'aadhaar card', 'uid card'],
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
    pricing: {
      total: 150,
      currency: 'INR',
      displayPrice: '₹150'
    },
    processingTime: '7-10 Working Days',
    requiredDocuments: [
      { id: 'doc-4', title: 'Aadhaar Card', mandatory: true },
      { id: 'doc-5', title: 'Two Passport Sized Photographs', mandatory: true },
      { id: 'doc-6', title: 'Proof of Date of Birth', mandatory: true }
    ],
    status: 'active',
    featured: true,
    popular: true,
    intents: ['tax', 'business registration', 'bank account opening', 'financial proof', 'income tax'],
    pairedServices: ['aadhaar-services', 'income-certificate'],
    tags: ['identity', 'tax', 'government', 'documentation'],
    keywords: ['PAN', 'PAN card', 'permanent account number', 'income tax', 'NSDL', 'UTI PAN', 'e-PAN'],
    synonyms: ['pan card', 'paan card', 'permanent account number card', 'pan registration'],
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
    pricing: {
      total: 80,
      currency: 'INR',
      displayPrice: '₹80'
    },
    processingTime: '5-7 Working Days',
    requiredDocuments: [
      { id: 'doc-7', title: 'Land Revenue Receipt', mandatory: true },
      { id: 'doc-8', title: 'Salary Slip / Self-Declaration of Income', mandatory: true },
      { id: 'doc-9', title: 'Aadhaar Card', mandatory: true },
      { id: 'doc-10', title: 'Ration Card', mandatory: true }
    ],
    status: 'active',
    featured: false,
    popular: true,
    intents: ['scholarship', 'subsidy', 'college admission', 'pension', 'income proof', 'government benefit'],
    pairedServices: ['pm-kisan', 'pan-card'],
    tags: ['certificate', 'government', 'income', 'documentation'],
    keywords: ['income certificate', 'income proof', 'salary certificate', 'tahasildar', 'revenue officer', 'scholarship proof'],
    synonyms: ['income proof certificate', 'income verification', 'aaay praman patra'],
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
    pricing: {
      total: 500,
      currency: 'INR',
      displayPrice: '₹500'
    },
    processingTime: '15-20 Working Days',
    requiredDocuments: [
      { id: 'doc-11', title: 'Aadhaar Card / Voter ID', mandatory: true },
      { id: 'doc-12', title: 'Proof of Address', mandatory: true },
      { id: 'doc-13', title: 'Non-ECR Proof (Matriculation Certificate)', mandatory: true },
      { id: 'doc-14', title: 'Date of Birth Proof', mandatory: true }
    ],
    status: 'active',
    featured: false,
    popular: true,
    intents: ['travel abroad', 'international travel', 'visa', 'foreign trip', 'passport renewal'],
    pairedServices: ['aadhaar-services', 'pan-card'],
    tags: ['identity', 'government', 'travel', 'documentation'],
    keywords: ['passport', 'PSK', 'Passport Seva Kendra', 'travel document', 'passport renewal', 'fresh passport', 'ECR', 'non-ECR'],
    synonyms: ['passport apply', 'passport registration', 'travel passport'],
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
    pricing: {
      total: 30,
      currency: 'INR',
      displayPrice: '₹30'
    },
    processingTime: '2-3 Working Days',
    requiredDocuments: [
      { id: 'doc-15', title: 'Land Record Documents (Patta)', mandatory: true },
      { id: 'doc-16', title: 'Aadhaar Card', mandatory: true },
      { id: 'doc-17', title: 'Bank Passbook Details', mandatory: true },
      { id: 'doc-18', title: 'Mobile linked to Aadhaar', mandatory: true }
    ],
    status: 'active',
    featured: false,
    popular: false,
    intents: ['farmer', 'agriculture', 'subsidy', 'kisan', 'kheti', 'crop', 'farming benefit'],
    pairedServices: ['income-certificate', 'aadhaar-services'],
    tags: ['agriculture', 'government', 'subsidy', 'farmer'],
    keywords: ['PM Kisan', 'Pradhan Mantri Kisan', 'farmer subsidy', 'kisan registration', 'e-KYC kisan', 'PM-KISAN installment'],
    synonyms: ['kisan samman nidhi', 'pm kisan yojana', 'farmer scheme registration', 'kisaan'],
    thumbnail: '/images/services-hero.jpg',
    banner: '/images/hero-services.jpg',
    faqs: [
      {
        question: 'What is e-KYC in PM Kisan?',
        answer: 'It is a mandatory identity verification process using Aadhaar OTP verification to check eligible farmer banking accounts.'
      }
    ]
  }
];
