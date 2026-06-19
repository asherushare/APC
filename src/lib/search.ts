import { DigitalService } from "@/types/digital";

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export interface SearchResult extends DigitalService {
  matchScore?: number;
}

export function searchServices(services: DigitalService[], query: string): SearchResult[] {
  if (!query || query.trim() === '') {
    return [];
  }
  
  const qTokens = query.toLowerCase().trim().split(/\s+/);
  
  const results = services.map(service => {
    let score = 0;
    
    // Check fields
    const titleTokens = service.title.toLowerCase().split(/\s+/);
    const intentTokens = (service.intents || []).flatMap(i => i.toLowerCase().split(/\s+/));
    const keywordTokens = (service.keywords || []).flatMap(k => k.toLowerCase().split(/\s+/));
    const synonymTokens = (service.synonyms || []).flatMap(s => s.toLowerCase().split(/\s+/));
    const catId = service.categoryId.toLowerCase();
    
    // For each query token, find best match in the service
    for (const qToken of qTokens) {
      let tokenScore = 0;
      
      // Exact / Prefix match in title (High weight)
      if (titleTokens.some(t => t === qToken)) tokenScore = Math.max(tokenScore, 100);
      else if (titleTokens.some(t => t.startsWith(qToken))) tokenScore = Math.max(tokenScore, 50);
      else {
        // Typo check on title
        if (qToken.length >= 4) {
          if (titleTokens.some(t => levenshteinDistance(t, qToken) <= 1)) tokenScore = Math.max(tokenScore, 40);
        }
      }
      
      // Intents (High weight for intent-based discovery)
      if (intentTokens.some(t => t === qToken)) tokenScore = Math.max(tokenScore, 80);
      else if (intentTokens.some(t => t.startsWith(qToken))) tokenScore = Math.max(tokenScore, 40);
      else if (qToken.length >= 4 && intentTokens.some(t => levenshteinDistance(t, qToken) <= 1)) tokenScore = Math.max(tokenScore, 30);
      
      // Category ID
      if (catId.includes(qToken)) tokenScore = Math.max(tokenScore, 60);

      // Keywords & Synonyms
      if (keywordTokens.some(t => t === qToken || t.startsWith(qToken))) tokenScore = Math.max(tokenScore, 30);
      if (synonymTokens.some(t => t === qToken || t.startsWith(qToken))) tokenScore = Math.max(tokenScore, 30);
      else if (qToken.length >= 4 && synonymTokens.some(t => levenshteinDistance(t, qToken) <= 1)) tokenScore = Math.max(tokenScore, 20);
      
      // Description fallback
      if (service.description.toLowerCase().includes(qToken)) tokenScore = Math.max(tokenScore, 10);
      if (service.shortDescription && service.shortDescription.toLowerCase().includes(qToken)) tokenScore = Math.max(tokenScore, 15);
      
      score += tokenScore;
    }
    
    return { ...service, matchScore: score };
  });
  
  // Filter out zero scores and sort by score descending
  return results
    .filter(r => r.matchScore && r.matchScore > 0)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}
