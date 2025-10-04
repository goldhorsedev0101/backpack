// TripAdvisor API Service - Ready for Future Integration
// Application URL: https://www.tripadvisor.com/APIAccessSupport

interface TripAdvisorConfig {
  apiKey?: string;
  apiSecret?: string;
  baseUrl: string;
  version: string;
}

interface TripAdvisorLocation {
  location_id: string;
  name: string;
  address_obj: {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalcode?: string;
    address_string: string;
  };
  ancestors: Array<{
    abbrv?: string;
    level: string;
    name: string;
    location_id: string;
  }>;
  latitude: string;
  longitude: string;
  timezone: string;
  phone?: string;
  website?: string;
  email?: string;
  rating?: string;
  rating_image_url?: string;
  num_reviews?: string;
  review_rating_count?: Record<string, number>;
  subratings?: Record<string, {
    name: string;
    rating_image_url?: string;
    value: string;
    localized_name: string;
  }>;
  photo?: {
    images: {
      small: { url: string; width: number; height: number };
      thumbnail: { url: string; width: number; height: number };
      original: { url: string; width: number; height: number };
      large: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
    };
    is_blessed: boolean;
    uploaded_date: string;
    caption: string;
    id: string;
    helpful_votes: string;
    published_date: string;
    user: {
      user_id: string;
      member_id: string;
      type: string;
    };
  };
  awards?: Array<{
    award_type: string;
    year: string;
    images: {
      small: string;
      large: string;
    };
    categories: string[];
    display_name: string;
  }>;
  amenities?: string[];
  groups?: Array<{
    name: string;
    localized_name: string;
    categories: Array<{
      name: string;
      localized_name: string;
    }>;
  }>;
}

interface TripAdvisorReview {
  id: string;
  lang?: string;
  location_id: string;
  published_date: string;
  rating: number;
  helpful_votes: number;
  rating_image_url: string;
  url: string;
  trip_type?: string;
  travel_date?: string;
  text: string;
  title: string;
  user: {
    user_id: string;
    member_id: string;
    type: string;
    first_name?: string;
    last_name?: string;
    avatar?: {
      thumbnail: string;
      small: string;
      medium: string;
      large: string;
      original: string;
    };
  };
  subratings?: Array<{
    name: string;
    rating_image_url: string;
    value: string;
    localized_name: string;
  }>;
  machine_translated?: boolean;
  machine_translatable?: boolean;
}

export class TripAdvisorService {
  private config: TripAdvisorConfig;

  constructor() {
    this.config = {
      apiKey: process.env.TRIPADVISOR_API_KEY,
      apiSecret: process.env.TRIPADVISOR_API_SECRET,
      baseUrl: 'https://api.tripadvisor.com/api/partner/2.0',
      version: '2.0'
    };
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    if (!this.config.apiKey) {
      throw new Error('TripAdvisor API key not configured. Apply at https://www.tripadvisor.com/APIAccessSupport');
    }

    const url = new URL(`${this.config.baseUrl}${endpoint}`);
    url.searchParams.append('key', this.config.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'GlobeMate/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`TripAdvisor API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('TripAdvisor API request failed:', error);
      throw error;
    }
  }

  // Search for locations
  async searchLocations(query: string, category?: string, limit: number = 10): Promise<TripAdvisorLocation[]> {
    const response = await this.makeRequest('/search', {
      q: query,
      category: category || 'geos',
      limit
    });
    
    return response.data || [];
  }

  // Get location details
  async getLocationDetails(locationId: string): Promise<TripAdvisorLocation | null> {
    try {
      const response = await this.makeRequest(`/location/${locationId}`);
      return response;
    } catch (error) {
      console.error(`Failed to get location details for ${locationId}:`, error);
      return null;
    }
  }

  // Get location photos
  async getLocationPhotos(locationId: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await this.makeRequest(`/location/${locationId}/photos`, { limit });
      return response.data || [];
    } catch (error) {
      console.error(`Failed to get photos for location ${locationId}:`, error);
      return [];
    }
  }

  // Get location reviews
  async getLocationReviews(locationId: string, limit: number = 10, offset: number = 0): Promise<TripAdvisorReview[]> {
    try {
      const response = await this.makeRequest(`/location/${locationId}/reviews`, {
        limit,
        offset,
        lang: 'en'
      });
      return response.data || [];
    } catch (error) {
      console.error(`Failed to get reviews for location ${locationId}:`, error);
      return [];
    }
  }

  // Get nearby attractions
  async getNearbyAttractions(locationId: string, limit: number = 10): Promise<TripAdvisorLocation[]> {
    try {
      const response = await this.makeRequest(`/location/${locationId}/attractions`, { limit });
      return response.data || [];
    } catch (error) {
      console.error(`Failed to get attractions near ${locationId}:`, error);
      return [];
    }
  }

  // Get nearby restaurants
  async getNearbyRestaurants(locationId: string, limit: number = 10): Promise<TripAdvisorLocation[]> {
    try {
      const response = await this.makeRequest(`/location/${locationId}/restaurants`, { limit });
      return response.data || [];
    } catch (error) {
      console.error(`Failed to get restaurants near ${locationId}:`, error);
      return [];
    }
  }

  // Get nearby hotels
  async getNearbyHotels(locationId: string, limit: number = 10): Promise<TripAdvisorLocation[]> {
    try {
      const response = await this.makeRequest(`/location/${locationId}/hotels`, { limit });
      return response.data || [];
    } catch (error) {
      console.error(`Failed to get hotels near ${locationId}:`, error);
      return [];
    }
  }

  // Convert TripAdvisor data to our database format
  convertToDestination(location: TripAdvisorLocation) {
    return {
      locationId: location.location_id,
      name: location.name,
      country: location.ancestors?.find(a => a.level === 'country')?.name || '',
      region: location.ancestors?.find(a => a.level === 'state')?.name || '',
      description: `${location.name} - Discover this amazing destination through TripAdvisor`,
      lat: parseFloat(location.latitude),
      lon: parseFloat(location.longitude),
      timezone: location.timezone,
      currency: this.getCurrencyByCountry(location.ancestors?.find(a => a.level === 'country')?.name || ''),
      language: 'en',
      bestTimeToVisit: 'Year-round',
      averageTemperature: 20,
      population: null,
      attractions: [],
      activities: [],
      tags: []
    };
  }

  convertToAccommodation(location: TripAdvisorLocation, destinationId: number) {
    return {
      locationId: location.location_id,
      name: location.name,
      description: `${location.name} - ${location.address_obj.address_string}`,
      address: location.address_obj.address_string,
      phone: location.phone,
      website: location.website,
      email: location.email,
      lat: parseFloat(location.latitude),
      lon: parseFloat(location.longitude),
      rating: location.rating ? parseFloat(location.rating) : 0,
      numReviews: location.num_reviews ? parseInt(location.num_reviews) : 0,
      priceLevel: this.convertPriceLevel(location.rating),
      ranking: null,
      awards: location.awards?.map(award => award.display_name) || [],
      amenities: location.amenities || [],
      roomTypes: [],
      checkInTime: null,
      checkOutTime: null,
      destinationId
    };
  }

  convertToRestaurant(location: TripAdvisorLocation, destinationId: number) {
    return {
      locationId: location.location_id,
      name: location.name,
      description: `${location.name} - ${location.address_obj.address_string}`,
      address: location.address_obj.address_string,
      phone: location.phone,
      website: location.website,
      email: location.email,
      lat: parseFloat(location.latitude),
      lon: parseFloat(location.longitude),
      rating: location.rating ? parseFloat(location.rating) : 0,
      numReviews: location.num_reviews ? parseInt(location.num_reviews) : 0,
      priceLevel: this.convertPriceLevel(location.rating),
      ranking: null,
      awards: location.awards?.map(award => award.display_name) || [],
      cuisine: this.extractCuisineFromGroups(location.groups),
      dietaryRestrictions: [],
      menuUrl: null,
      reservationUrl: null,
      openingHours: [],
      destinationId
    };
  }

  convertToAttraction(location: TripAdvisorLocation, destinationId: number) {
    return {
      locationId: location.location_id,
      name: location.name,
      description: `${location.name} - ${location.address_obj.address_string}`,
      address: location.address_obj.address_string,
      phone: location.phone,
      website: location.website,
      email: location.email,
      lat: parseFloat(location.latitude),
      lon: parseFloat(location.longitude),
      rating: location.rating ? parseFloat(location.rating) : 0,
      numReviews: location.num_reviews ? parseInt(location.num_reviews) : 0,
      ranking: null,
      awards: location.awards?.map(award => award.display_name) || [],
      category: this.extractCategoryFromGroups(location.groups),
      subcategory: null,
      openingHours: [],
      admissionPrice: null,
      duration: null,
      destinationId
    };
  }

  private convertPriceLevel(rating?: string): string {
    if (!rating) return '$$';
    const ratingNum = parseFloat(rating);
    if (ratingNum >= 4.5) return '$$$$';
    if (ratingNum >= 4.0) return '$$$';
    if (ratingNum >= 3.5) return '$$';
    return '$';
  }

  private getCurrencyByCountry(country: string): string {
    const currencyMap: Record<string, string> = {
      'Peru': 'PEN',
      'Colombia': 'COP',
      'Bolivia': 'BOB',
      'Chile': 'CLP',
      'Argentina': 'ARS',
      'Brazil': 'BRL',
      'Ecuador': 'USD',
      'Uruguay': 'UYU',
      'Paraguay': 'PYG',
      'Venezuela': 'VES'
    };
    return currencyMap[country] || 'USD';
  }

  private extractCuisineFromGroups(groups?: any[]): string[] {
    if (!groups) return ['International'];
    const cuisines = groups
      .flatMap(group => group.categories || [])
      .map(cat => cat.name)
      .filter(name => name && !['Restaurant', 'Food'].includes(name));
    return cuisines.length > 0 ? cuisines : ['International'];
  }

  private extractCategoryFromGroups(groups?: any[]): string {
    if (!groups) return 'Attractions';
    const categories = groups
      .flatMap(group => group.categories || [])
      .map(cat => cat.name);
    return categories[0] || 'Attractions';
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      await this.searchLocations('Lima Peru', 'geos', 1);
      return true;
    } catch (error) {
      console.error('TripAdvisor API connection test failed:', error);
      return false;
    }
  }
}

export const tripAdvisorService = new TripAdvisorService();