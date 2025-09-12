import { useTranslation } from 'react-i18next';

// Simple localization service with fallback mechanism
export class LocalizationService {
  static getLocalizedName(item: any, locale: string = 'en'): string {
    // If item has localized names, use them
    if (item.localizedNames && item.localizedNames[locale]) {
      return item.localizedNames[locale];
    }
    
    // Fallback to English if Hebrew not available
    if (locale === 'he' && item.localizedNames && item.localizedNames['en']) {
      return item.localizedNames['en'];
    }
    
    // Final fallback to the main name field
    return item.name || '';
  }

  static getLocalizedDescription(item: any, locale: string = 'en'): string {
    if (item.localizedDescriptions && item.localizedDescriptions[locale]) {
      return item.localizedDescriptions[locale];
    }
    
    if (locale === 'he' && item.localizedDescriptions && item.localizedDescriptions['en']) {
      return item.localizedDescriptions['en'];
    }
    
    return item.description || '';
  }

  static getLocalizedCuisine(cuisines: string[], locale: string = 'en'): string[] {
    const cuisineTranslations: Record<string, Record<string, string>> = {
      'italian': { en: 'Italian', he: 'איטלקית' },
      'mexican': { en: 'Mexican', he: 'מקסיקנית' },
      'chinese': { en: 'Chinese', he: 'סינית' },
      'indian': { en: 'Indian', he: 'הודית' },
      'thai': { en: 'Thai', he: 'תאילנדית' },
      'japanese': { en: 'Japanese', he: 'יפנית' },
      'mediterranean': { en: 'Mediterranean', he: 'ים תיכונית' },
      'american': { en: 'American', he: 'אמריקאית' },
      'french': { en: 'French', he: 'צרפתית' },
      'spanish': { en: 'Spanish', he: 'ספרדית' }
    };

    return cuisines.map(cuisine => {
      const lowerCuisine = cuisine.toLowerCase();
      return cuisineTranslations[lowerCuisine]?.[locale] || cuisine;
    });
  }

  static getLocalizedCategory(category: string, locale: string = 'en'): string {
    const categoryTranslations: Record<string, Record<string, string>> = {
      'hotel': { en: 'Hotel', he: 'מלון' },
      'restaurant': { en: 'Restaurant', he: 'מסעדה' },
      'attraction': { en: 'Attraction', he: 'אטרקציה' },
      'museum': { en: 'Museum', he: 'מוזיאון' },
      'park': { en: 'Park', he: 'פארק' },
      'beach': { en: 'Beach', he: 'חוף' },
      'shopping': { en: 'Shopping', he: 'קניות' },
      'entertainment': { en: 'Entertainment', he: 'בידור' }
    };

    const lowerCategory = category.toLowerCase();
    return categoryTranslations[lowerCategory]?.[locale] || category;
  }
}

// React hook for easy access to localization
export function useLocalization() {
  const { i18n } = useTranslation();
  
  return {
    getLocalizedName: (item: any) => LocalizationService.getLocalizedName(item, i18n.language),
    getLocalizedDescription: (item: any) => LocalizationService.getLocalizedDescription(item, i18n.language),
    getLocalizedCuisine: (cuisines: string[]) => LocalizationService.getLocalizedCuisine(cuisines, i18n.language),
    getLocalizedCategory: (category: string) => LocalizationService.getLocalizedCategory(category, i18n.language)
  };
}