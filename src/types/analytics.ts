export interface DiscoveryAnalyticsEvent {
  eventType: 'search' | 'filter' | 'click_suggestion' | 'zero_results' | 'view_related';
  query?: string;
  category?: string;
  filtersApplied?: string[];
  timestamp: string;
  sessionId?: string;
}

export interface PopularSearchMetrics {
  term: string;
  searchCount: number;
  clickThroughRate: number;
}
