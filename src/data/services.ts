import type { Service, ServiceCategory } from '@/types';

export const serviceCategories: { id: ServiceCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Services' },
  { id: 'documents', label: 'Documents' },
  { id: 'finance', label: 'Finance' },
  { id: 'government', label: 'Government' },
  { id: 'travel', label: 'Travel' },
  { id: 'digital', label: 'Digital' },
  { id: 'consultancy', label: 'Consultancy' },
];

export const services: Service[] = [
  {
    id: 'online-certificates',
    title: 'Online Certificates',
    description:
      'Hassle-free application for Income, Caste & Residence certificates through our digital platform.',
    icon: 'certificate',
    features: ['Digitally Verified', 'Quick Processing', 'Government Approved'],
    category: 'documents',
    price: '₹50',
  },
  {
    id: 'pan-assistance',
    title: 'PAN Assistance',
    description:
      'New PAN card applications and corrections for producers with fast-track processing.',
    icon: 'id-card',
    features: ['Fast-track Processing', 'Correction Support'],
    category: 'documents',
    price: '₹100',
  },
  {
    id: 'aadhaar-services',
    title: 'Aadhaar Services',
    description:
      'Updates, linking, and enrolment guidance at local hubs for seamless identity verification.',
    icon: 'fingerprint',
    features: ['Bio-metric Updates', 'Mobile Linking', 'Address Correction'],
    category: 'documents',
    price: '₹30',
  },
  {
    id: 'gst-tax',
    title: 'GST & Tax Support',
    description:
      'Compliance support for small businesses and co-ops with professional audit assistance.',
    icon: 'calculator',
    features: ['Professional Audit', 'GST Filing', 'Tax Planning'],
    category: 'finance',
    price: '₹200–500',
  },
  {
    id: 'railway-booking',
    title: 'Railway Booking',
    description:
      'Confirmed ticket bookings for all Indian Rail networks with zero service fees.',
    icon: 'train',
    features: ['Zero Service Fees', 'Confirmed Tickets'],
    category: 'travel',
    price: 'Free',
  },
  {
    id: 'bus-booking',
    title: 'Bus Booking',
    description:
      'Interstate and local bus transport ticketing services with route optimization.',
    icon: 'bus',
    features: ['Route Optimization', 'Instant Booking'],
    category: 'travel',
    price: 'Free',
  },
  {
    id: 'bill-payments',
    title: 'Online Bill Payments',
    description:
      'Electricity, water, and mobile bill settlements with instant digital receipts.',
    icon: 'receipt',
    features: ['Instant Receipt', 'All Providers Supported'],
    category: 'finance',
    price: '₹10',
  },
  {
    id: 'print-scan',
    title: 'Print & Scan Services',
    description:
      'High-quality document scanning and printing facilities with archival support.',
    icon: 'printer',
    features: ['Document Archival', 'Color & B/W'],
    category: 'digital',
    price: '₹5/page',
  },
  {
    id: 'scheme-portal',
    title: 'Government Scheme Applications',
    description:
      'Integrated portal to check eligibility and apply for state and central tribal welfare schemes.',
    icon: 'government',
    features: ['Eligibility Check', 'Application Tracking', 'Status Updates'],
    featured: true,
    category: 'government',
    price: 'Free',
  },
  {
    id: 'digital-training',
    title: 'Digital Literacy Training',
    description:
      'Hands-on workshops for digital and financial literacy with certification provided upon completion.',
    icon: 'education',
    features: ['Certification Provided', 'Practical Workshops', 'Mobile Training'],
    featured: true,
    category: 'digital',
    price: 'Free',
  },
  {
    id: 'business-consultancy',
    title: 'Business Consultancy',
    description:
      'End-to-end guidance for starting and growing small businesses — from registration to marketing strategy for tribal entrepreneurs.',
    icon: 'briefcase',
    features: ['Business Registration', 'Market Strategy', 'Financial Planning'],
    category: 'consultancy',
    price: '₹500',
  },
  {
    id: 'farming-consultancy',
    title: 'Farming Consultancy',
    description:
      'Expert agricultural guidance on organic farming, crop selection, soil health management, and government subsidy schemes for tribal farmers.',
    icon: 'leaf',
    features: ['Organic Farming', 'Crop Advisory', 'Subsidy Guidance'],
    category: 'consultancy',
    price: '₹200',
  },
];
