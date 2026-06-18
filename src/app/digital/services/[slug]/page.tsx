import { demoServices, categories } from '@/data/digital';
import { notFound } from 'next/navigation';
import ServiceDetailClient from './ServiceDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;

  // Fallback to first demo service if slug is explicitly 'demo'
  let service = demoServices.find((s) => s.slug === slug);
  if (slug === 'demo') {
    service = demoServices[0];
  }

  if (!service) {
    notFound();
  }

  const category = categories.find((c) => c.id === service.categoryId);

  return (
    <ServiceDetailClient
      service={service}
      categoryName={category ? category.name : 'Digital Service'}
    />
  );
}
