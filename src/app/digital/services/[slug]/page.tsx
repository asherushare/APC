import { categories } from '@/data/digital';
import { getAllServices } from '@/data/digital/services';
import { notFound } from 'next/navigation';
import ServiceDetailClient from './ServiceDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const services = getAllServices();
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;

  const allServices = getAllServices();

  // Fallback to first demo service if slug is explicitly 'demo'
  let service = allServices.find((s) => s.slug === slug);
  if (slug === 'demo' && allServices.length > 0) {
    service = allServices[0];
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
