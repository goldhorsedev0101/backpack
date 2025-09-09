import { storage } from './storage';

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types: string[];
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    open_now: boolean;
  };
  business_status?: string;
}

interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  reviews?: Array<{
    author_name: string;
    author_url?: string;
    language: string;
    profile_photo_url?: string;
    rating: number;
    relative_time_description: string;
    text: string;
    time: number;
  }>;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    open_now: boolean;
    periods: Array<{
      close?: { day: number; time: string };
      open: { day: number; time: string };
    }>;
    weekday_text: string[];
  };
  geometry: {
    location: { lat: number; lng: number };
  };
  types: string[];
}

const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

export class GooglePlacesService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY!;
    if (!this.apiKey) {
      throw new Error('GOOGLE_PLACES_API_KEY environment variable is required');
    }
  }

  async searchPlaces(query: string, type?: string, location?: string): Promise<GooglePlaceResult[]> {
    try {
      const params = new URLSearchParams({
        query: `${query} ${location || ''}`.trim(),
        key: this.apiKey,
        ...(type && { type })
      });

      const response = await fetch(`${BASE_URL}/textsearch/json?${params}`);
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      return data.results || [];
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
    try {
      const params = new URLSearchParams({
        place_id: placeId,
        fields: 'place_id,name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,price_level,reviews,photos,opening_hours,geometry,types',
        key: this.apiKey
      });

      const response = await fetch(`${BASE_URL}/details/json?${params}`);
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      return data.result;
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  async getPhotoUrl(photoReference: string, maxWidth: number = 400): Promise<string> {
    return `${BASE_URL}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`;
  }

  // Convert Google Places data to our database format
  async importAccommodation(placeResult: GooglePlaceResult, destinationId: number) {
    const details = await this.getPlaceDetails(placeResult.place_id);
    if (!details) return null;

    const accommodationData = {
      locationId: details.place_id,
      name: details.name,
      description: `${details.name} located at ${details.formatted_address}`,
      address: details.formatted_address,
      phone: details.formatted_phone_number,
      website: details.website,
      email: null,
      lat: details.geometry.location.lat,
      lon: details.geometry.location.lng,
      rating: details.rating || 0,
      numReviews: details.user_ratings_total || 0,
      priceLevel: this.convertPriceLevel(details.price_level),
      ranking: null,
      awards: [],
      amenities: [],
      roomTypes: [],
      checkInTime: null,
      checkOutTime: null,
      destinationId
    };

    return await storage.createAccommodation(accommodationData);
  }

  async importRestaurant(placeResult: GooglePlaceResult, destinationId: number) {
    const details = await this.getPlaceDetails(placeResult.place_id);
    if (!details) return null;

    const restaurantData = {
      locationId: details.place_id,
      name: details.name,
      description: `${details.name} located at ${details.formatted_address}`,
      address: details.formatted_address,
      phone: details.formatted_phone_number,
      website: details.website,
      email: null,
      lat: details.geometry.location.lat,
      lon: details.geometry.location.lng,
      rating: details.rating || 0,
      numReviews: details.user_ratings_total || 0,
      priceLevel: this.convertPriceLevel(details.price_level),
      ranking: null,
      awards: [],
      cuisine: this.extractCuisineFromTypes(details.types),
      dietaryRestrictions: [],
      menuUrl: null,
      reservationUrl: null,
      openingHours: details.opening_hours?.weekday_text || [],
      destinationId
    };

    return await storage.createRestaurant(restaurantData);
  }

  async importAttraction(placeResult: GooglePlaceResult, destinationId: number) {
    const details = await this.getPlaceDetails(placeResult.place_id);
    if (!details) return null;

    const attractionData = {
      locationId: details.place_id,
      name: details.name,
      description: `${details.name} located at ${details.formatted_address}`,
      address: details.formatted_address,
      phone: details.formatted_phone_number,
      website: details.website,
      email: null,
      lat: details.geometry.location.lat,
      lon: details.geometry.location.lng,
      rating: details.rating || 0,
      numReviews: details.user_ratings_total || 0,
      ranking: null,
      awards: [],
      category: this.extractCategoryFromTypes(details.types),
      subcategory: null,
      openingHours: details.opening_hours?.weekday_text || [],
      admissionPrice: null,
      duration: null,
      destinationId
    };

    return await storage.createAttraction(attractionData);
  }

  // Import reviews for any location
  async importReviews(placeId: string, category: 'accommodation' | 'restaurant' | 'attraction') {
    const details = await this.getPlaceDetails(placeId);
    if (!details?.reviews) return [];

    const importedReviews = [];
    for (const review of details.reviews.slice(0, 5)) { // Import up to 5 reviews
      const reviewData = {
        locationId: placeId,
        category,
        reviewId: `google_${Date.now()}_${Math.random()}`,
        title: review.text.substring(0, 100) + (review.text.length > 100 ? '...' : ''),
        text: review.text,
        rating: review.rating,
        author: review.author_name,
        date: new Date(review.time * 1000).toISOString(),
        tripType: 'unknown',
        helpful: 0,
        language: review.language || 'en'
      };

      const imported = await storage.createLocationReview(reviewData);
      importedReviews.push(imported);
    }

    return importedReviews;
  }

  private convertPriceLevel(priceLevel?: number): string {
    switch (priceLevel) {
      case 1: return '$';
      case 2: return '$$';
      case 3: return '$$$';
      case 4: return '$$$$';
      default: return '$$';
    }
  }

  private extractCuisineFromTypes(types: string[]): string[] {
    const cuisineMap: { [key: string]: string } = {
      'restaurant': 'International',
      'meal_takeaway': 'Takeaway',
      'meal_delivery': 'Delivery',
      'cafe': 'Cafe',
      'bar': 'Bar',
      'bakery': 'Bakery',
      'night_club': 'Nightlife'
    };

    return types.map(type => cuisineMap[type]).filter(Boolean);
  }

  private extractCategoryFromTypes(types: string[]): string {
    const categoryMap: { [key: string]: string } = {
      'tourist_attraction': 'Attractions',
      'museum': 'Museums',
      'park': 'Parks',
      'zoo': 'Zoos',
      'amusement_park': 'Theme Parks',
      'art_gallery': 'Art Galleries',
      'church': 'Religious Sites',
      'hindu_temple': 'Religious Sites',
      'mosque': 'Religious Sites',
      'synagogue': 'Religious Sites',
      'natural_feature': 'Nature',
      'point_of_interest': 'Points of Interest'
    };

    for (const type of types) {
      if (categoryMap[type]) {
        return categoryMap[type];
      }
    }
    return 'Attractions';
  }
}

export const googlePlaces = new GooglePlacesService();