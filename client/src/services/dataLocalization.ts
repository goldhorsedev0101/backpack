// Data access layer with localization support
import { queryClient } from '@/lib/queryClient';
import { LocalizationService } from './localizationService';

interface LocalizedDataOptions {
  locale?: string;
  fallbackToEnglish?: boolean;
}

export class DataLocalizationService {
  static async getDestinations(options: LocalizedDataOptions = {}) {
    const { locale = 'en', fallbackToEnglish = true } = options;
    
    try {
      // Fetch destinations from API
      const destinations = await queryClient.fetchQuery({
        queryKey: ['/api/places/destinations'],
        staleTime: 5 * 60 * 1000, // 5 minutes
      });

      // Apply localization
      return destinations.map((destination: any) => ({
        ...destination,
        name: LocalizationService.getLocalizedName(destination, locale),
        description: LocalizationService.getLocalizedDescription(destination, locale)
      }));
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return [];
    }
  }

  static async getAccommodations(options: LocalizedDataOptions = {}) {
    const { locale = 'en' } = options;
    
    try {
      const accommodations = await queryClient.fetchQuery({
        queryKey: ['/api/places/accommodations'],
        staleTime: 5 * 60 * 1000,
      });

      return accommodations.map((accommodation: any) => ({
        ...accommodation,
        name: LocalizationService.getLocalizedName(accommodation, locale),
        description: LocalizationService.getLocalizedDescription(accommodation, locale),
        category: LocalizationService.getLocalizedCategory(accommodation.category || 'hotel', locale)
      }));
    } catch (error) {
      console.error('Error fetching accommodations:', error);
      return [];
    }
  }

  static async getAttractions(options: LocalizedDataOptions = {}) {
    const { locale = 'en' } = options;
    
    try {
      const attractions = await queryClient.fetchQuery({
        queryKey: ['/api/places/attractions'],
        staleTime: 5 * 60 * 1000,
      });

      return attractions.map((attraction: any) => ({
        ...attraction,
        name: LocalizationService.getLocalizedName(attraction, locale),
        description: LocalizationService.getLocalizedDescription(attraction, locale),
        category: LocalizationService.getLocalizedCategory(attraction.category || 'attraction', locale)
      }));
    } catch (error) {
      console.error('Error fetching attractions:', error);
      return [];
    }
  }

  static async getRestaurants(options: LocalizedDataOptions = {}) {
    const { locale = 'en' } = options;
    
    try {
      const restaurants = await queryClient.fetchQuery({
        queryKey: ['/api/places/restaurants'],
        staleTime: 5 * 60 * 1000,
      });

      return restaurants.map((restaurant: any) => ({
        ...restaurant,
        name: LocalizationService.getLocalizedName(restaurant, locale),
        description: LocalizationService.getLocalizedDescription(restaurant, locale),
        cuisine: LocalizationService.getLocalizedCuisine(restaurant.cuisine || [], locale),
        category: LocalizationService.getLocalizedCategory(restaurant.category || 'restaurant', locale)
      }));
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      return [];
    }
  }
}