import type { Service } from '@/types';

export const services: Service[] = [
  {
    id: 'online-certificates',
    title: 'Online Certificates',
    description:
      'Hassle-free application for Income, Caste & Residence certificates through our digital platform.',
    icon: 'certificate',
    features: ['Digitally Verified'],
  },
  {
    id: 'pan-assistance',
    title: 'PAN Assistance',
    description:
      'New PAN card applications and corrections for producers with fast-track processing.',
    icon: 'id-card',
    features: ['Fast-track Processing'],
  },
  {
    id: 'aadhaar-services',
    title: 'Aadhaar Services',
    description:
      'Updates, linking, and enrolment guidance at local hubs for seamless identity verification.',
    icon: 'fingerprint',
    features: ['Bio-metric Updates'],
  },
  {
    id: 'gst-tax',
    title: 'GST & Tax Support',
    description:
      'Compliance support for small businesses and co-ops with professional audit assistance.',
    icon: 'calculator',
    features: ['Professional Audit'],
  },
  {
    id: 'railway-booking',
    title: 'Railway Booking',
    description:
      'Confirmed ticket bookings for all Indian Rail networks with zero service fees.',
    icon: 'train',
    features: ['Zero Service Fees'],
  },
  {
    id: 'bus-booking',
    title: 'Bus Booking',
    description:
      'Interstate and local bus transport ticketing services with route optimization.',
    icon: 'bus',
    features: ['Route Optimization'],
  },
  {
    id: 'bill-payments',
    title: 'Online Bill Payments',
    description:
      'Electricity, water, and mobile bill settlements with instant digital receipts.',
    icon: 'receipt',
    features: ['Instant Receipt'],
  },
  {
    id: 'print-scan',
    title: 'Print & Scan Services',
    description:
      'High-quality document scanning and printing facilities with archival support.',
    icon: 'printer',
    features: ['Document Archival'],
  },
  {
    id: 'scheme-portal',
    title: 'Government Scheme Applications',
    description:
      'Integrated portal to check eligibility and apply for state and central tribal welfare schemes.',
    icon: 'government',
    features: ['Eligibility Check'],
    featured: true,
  },
  {
    id: 'digital-training',
    title: 'Digital Literacy Training',
    description:
      'Hands-on workshops for digital and financial literacy with certification provided upon completion.',
    icon: 'education',
    features: ['Certification Provided'],
    featured: true,
  },
];
