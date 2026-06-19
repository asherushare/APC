import { DigitalService } from '@/types/digital';

export function getRecommendedServices(
  sourceService: DigitalService,
  allServices: DigitalService[],
  limit: number = 3
): DigitalService[] {
  const recommendations: DigitalService[] = [];
  const seenIds = new Set<string>();
  seenIds.add(sourceService.id);

  const addService = (service: DigitalService) => {
    if (!seenIds.has(service.id)) {
      recommendations.push(service);
      seenIds.add(service.id);
    }
  };

  // 1. Paired Services
  if (sourceService.pairedServices && sourceService.pairedServices.length > 0) {
    for (const pairedId of sourceService.pairedServices) {
      if (recommendations.length >= limit) break;
      const paired = allServices.find(s => s.id === pairedId || s.slug === pairedId);
      if (paired) addService(paired);
    }
  }

  // 2. Overlapping Tags
  if (recommendations.length < limit && sourceService.tags && sourceService.tags.length > 0) {
    const scoredServices = allServices
      .filter(s => !seenIds.has(s.id) && s.tags)
      .map(s => {
        const overlap = s.tags!.filter(t => sourceService.tags!.includes(t)).length;
        return { service: s, score: overlap };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
      
    for (const item of scoredServices) {
      if (recommendations.length >= limit) break;
      addService(item.service);
    }
  }

  // 3. Same Category
  if (recommendations.length < limit) {
    const sameCategory = allServices.filter(
      s => !seenIds.has(s.id) && s.categoryId === sourceService.categoryId
    );
    for (const service of sameCategory) {
      if (recommendations.length >= limit) break;
      addService(service);
    }
  }

  // 4. Fallback to Featured
  if (recommendations.length < limit) {
    const featured = allServices.filter(s => !seenIds.has(s.id) && s.featured);
    for (const service of featured) {
      if (recommendations.length >= limit) break;
      addService(service);
    }
  }

  return recommendations;
}
