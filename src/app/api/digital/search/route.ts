import { NextResponse } from 'next/server';
import { getAllServices } from '@/data/digital/services';
import { searchServices } from '@/lib/search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const allServices = getAllServices();
  const results = searchServices(allServices, query);

  return NextResponse.json({ results });
}
