import { FEATURE_FLAGS } from '../config/featureFlags';

export interface TripAdvisorAttraction {
  name: string;
  rating: number;
  num_reviews: number;
  ranking: string;
  description: string;
  photo_url?: string;
}

export class TripAdvisorService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.TRIPADVISOR_API_KEY;
  }

  async getTopAttractions(location: string, limit: number = 10): Promise<TripAdvisorAttraction[]> {
    if (!FEATURE_FLAGS.ENABLE_TRIPADVISOR || !this.apiKey) {
      return this.getStubAttractions(location, limit);
    }

    // Real TripAdvisor API implementation would go here
    // Using RapidAPI TripAdvisor endpoint
    return this.getStubAttractions(location, limit);
  }

  async getDestinationInsights(location: string): Promise<{
    trending_score: number;
    popular_months: string[];
    visitor_types: Record<string, number>;
  }> {
    if (!FEATURE_FLAGS.ENABLE_TRIPADVISOR || !this.apiKey) {
      return this.getStubInsights();
    }

    return this.getStubInsights();
  }

  private getStubAttractions(location: string, limit: number): TripAdvisorAttraction[] {
    const attractions: TripAdvisorAttraction[] = [
      {
        name: 'Historic Old Town',
        rating: 4.5,
        num_reviews: 2847,
        ranking: '#1 of 150 things to do',
        description: 'Beautiful historic district with charming architecture and local shops',
      },
      {
        name: 'City Museum',
        rating: 4.3,
        num_reviews: 1523,
        ranking: '#2 of 150 things to do',
        description: 'World-class museum featuring art and historical exhibits',
      },
      {
        name: 'Central Park',
        rating: 4.6,
        num_reviews: 3241,
        ranking: '#3 of 150 things to do',
        description: 'Large urban park perfect for walking, picnics, and outdoor activities',
      },
      {
        name: 'Harbor Cruise',
        rating: 4.4,
        num_reviews: 987,
        ranking: '#4 of 150 things to do',
        description: 'Scenic boat tour offering stunning city views from the water',
      },
      {
        name: 'Local Market',
        rating: 4.2,
        num_reviews: 1654,
        ranking: '#5 of 150 things to do',
        description: 'Vibrant marketplace with local produce, crafts, and street food',
      },
    ];

    return attractions.slice(0, limit);
  }

  private getStubInsights() {
    return {
      trending_score: 85,
      popular_months: ['April', 'May', 'September', 'October'],
      visitor_types: {
        couples: 35,
        families: 30,
        solo: 20,
        business: 15,
      },
    };
  }
}

export const tripAdvisorService = new TripAdvisorService();
