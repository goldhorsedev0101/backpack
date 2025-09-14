import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

interface Translation {
  id: number;
  baseName: string;
  translatedName: string | null;
  locale: string;
  translationId: number | null;
}

type EntityType = 'destinations' | 'accommodations' | 'attractions' | 'restaurants';

// Hook to get translations for a specific entity type
export function useEntityTranslations(entityType: EntityType) {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'he' ? 'he' : 'en';

  return useQuery({
    queryKey: [`translations-${entityType}`, locale],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/admin/translations/${entityType}?locale=${locale}`);
        if (!response.ok) {
          console.warn(`No translations found for ${entityType} in ${locale}`);
          return [];
        }
        const data = await response.json();
        return data || [];
      } catch (error) {
        console.warn(`Failed to fetch translations for ${entityType}:`, error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: true, // Always enabled since we want fallback behavior
  });
}

// Helper function to get localized name
export function getLocalizedName(
  originalName: string,
  entityId: number | string,
  translations: Translation[] = []
): string {
  if (!translations || translations.length === 0) {
    return originalName;
  }

  // Find translation for this specific entity
  const translation = translations.find(t => 
    t.id === parseInt(entityId.toString())
  );

  // Return translated name if available, fallback to original
  return translation?.translatedName || originalName;
}

// Built-in Hebrew translations for common South American places
const PLACE_TRANSLATIONS: Record<string, string> = {
  // Countries
  'Peru': 'פרו',
  'Bolivia': 'בוליביה', 
  'Colombia': 'קולומביה',
  'Ecuador': 'אקוודור',
  'Chile': 'צ\'ילה',
  'Argentina': 'ארגנטינה',
  'Brazil': 'ברזיל',
  'Venezuela': 'ונצואלה',
  'Uruguay': 'אורוגוואי',
  'Paraguay': 'פרגוואי',
  'Guyana': 'גויאנה',
  'Suriname': 'סורינאם',
  'French Guiana': 'גויאנה הצרפתית',

  // Major destinations
  'Machu Picchu': 'מאצ\'ו פיצ\'ו',
  'Cusco': 'קוסקו',
  'Lima': 'לימה',
  'Arequipa': 'ארקיפה',
  'Trujillo': 'טרוחיו',
  'Iquitos': 'איקיטוס',
  'Huacachina': 'הואקאצ\'ינה',
  'Paracas': 'פראקאס',
  'Nazca': 'נאסקה',
  'Chachapoyas': 'צ\'אצ\'אפויאס',
  'Mancora': 'מנקורה',
  'Puno': 'פונו',
  'Huaraz': 'הואראס',
  'Ica': 'איקה',
  'Ayacucho': 'איאקוצ\'ו',
  'Cajamarca': 'קחמרקה',
  'Chiclayo': 'צ\'יקלאיו',
  'Huancayo': 'הואנקאיו',
  'Tacna': 'טקנה',
  'Tumbes': 'טומבס',
  'Piura': 'פיורה',
  'Chimbote': 'צ\'ימבוטה',
  'Tarapoto': 'טאראפוטו',
  'Puerto Maldonado': 'פוארטו מלדונאדו',

  // Bolivia
  'La Paz': 'לה פאס',
  'Santa Cruz': 'סנטה קרוס',
  'Cochabamba': 'קוצ\'במבה',
  'Sucre': 'סוקרה',
  'Potosí': 'פוטוסי',
  'Oruro': 'אורורו',
  'Tarija': 'טאריחה',
  'Salar de Uyuni': 'סלאר דה אויוני',
  'Uyuni': 'אויוני',

  // Colombia
  'Bogotá': 'בוגוטה',
  'Medellín': 'מדיין',
  'Cartagena': 'קרטחנה',
  'Cali': 'קאלי',
  'Barranquilla': 'ברנקיה',
  'Santa Marta': 'סנטה מרתה',
  'Bucaramanga': 'בוקרמנגה',

  // Argentina  
  'Buenos Aires': 'בואנוס איירס',
  'Córdoba': 'קורדובה',
  'Rosario': 'רוסאריו',
  'Mendoza': 'מנדוסה',
  'Tucumán': 'טוקומן',
  'Mar del Plata': 'מאר דל פלטה',
  'Salta': 'סלטה',
  'Bariloche': 'בארילוצ\'ה',
  'Ushuaia': 'אושואיה',

  // Chile
  'Santiago': 'סנטיאגו',
  'Valparaíso': 'ולפאראיסו',
  'Concepción': 'קונססיון',
  'Antofagasta': 'אנטופגסטה',
  'Viña del Mar': 'ביניה דל מאר',
  'Temuco': 'טמוקו',
  'Iquique': 'איקיקה',
  'Rancagua': 'רנקגואה',
  'Talca': 'טלקה',
  'Arica': 'אריקה',
  'Puerto Montt': 'פוארטו מונט',
  'Punta Arenas': 'פונטה ארנס',

  // Brazil
  'São Paulo': 'סאו פאולו',
  'Rio de Janeiro': 'ריו דה זאניירו',
  'Brasília': 'ברזיליה',
  'Salvador': 'סלוודור',
  'Fortaleza': 'פורטלזה',
  'Belo Horizonte': 'בלו הוריזונטה',
  'Manaus': 'מנאוס',
  'Curitiba': 'קוריטיבה',
  'Recife': 'רסיפה',
  'Belém': 'בלם',
  'Porto Alegre': 'פורטו אלגרה',
  'Goiânia': 'גויאניה',

  // Ecuador
  'Quito': 'קיטו',
  'Guayaquil': 'גואיאקיל',
  'Cuenca': 'קואנקה',
  'Galápagos': 'גלפגוס',

  // Venezuela
  'Caracas': 'קראקס',
  'Maracaibo': 'מראקאיבו',
  'Valencia': 'ולנסיה',
  'Barquisimeto': 'ברקיסימטו',

  // Uruguay
  'Montevideo': 'מונטוידאו',
  'Punta del Este': 'פונטה דל אסטה',

  // Paraguay
  'Asunción': 'אסונסיון',

  // Guyana
  'Georgetown': 'ג\'ורג\'טאון',

  // Suriname
  'Paramaribo': 'פרמריבו',

  // Common location types/words
  'Airport': 'נמל תעופה',
  'Hotel': 'מלון',
  'Hostel': 'אכסניה',
  'Restaurant': 'מסעדה',
  'Museum': 'מוזיאון',
  'Park': 'פארק',
  'Beach': 'חוף',
  'Market': 'שוק',
  'Plaza': 'כיכר',
  'Cathedral': 'קתדרלה',
  'Church': 'כנסייה',
  'Temple': 'מקדש',
  'Palace': 'ארמון',
  'Castle': 'טירה',
  'Bridge': 'גשר',
  'River': 'נהר',
  'Lake': 'אגם',
  'Mountain': 'הר',
  'Valley': 'עמק',
  'Desert': 'מדבר',
  'Forest': 'יער',
  'Jungle': 'ג\'ונגל',
  'Volcano': 'הר געש',
  'Waterfall': 'מפל',
  'Bay': 'מפרץ',
  'Island': 'אי',
  'Peninsula': 'חצי אי',
  'Coast': 'חוף',
  'Village': 'כפר',
  'Town': 'עיירה',
  'City': 'עיר',
  'Capital': 'בירה',
  'Center': 'מרכז',
  'Downtown': 'מרכז העיר',
  'Old Town': 'העיר העתיקה',
  'Historic Center': 'המרכז ההיסטורי',
  'Archaeological Site': 'אתר ארכיאולוגי',
  'National Park': 'פארק לאומי',
  'Reserve': 'שמורה',
  'Sanctuary': 'מקדש',
  'Fortress': 'מבצר',
  'Ruins': 'חורבות',
  'Archaeological Complex': 'מתחם ארכיאולוגי',
  'Thermal Baths': 'מעיינות חמים',
  'Hot Springs': 'מעיינות חמים',
  'Spa': 'ספא',
  'Lodge': 'צימר',
  'Eco Lodge': 'צימר אקולוגי',
  'Retreat': 'מקום מפלט',
  'Observatory': 'מצפה כוכבים',
  'Viewpoint': 'נקודת תצפית',
  'Lookout': 'תצפית',
  'Trail': 'שביל',
  'Trek': 'מסלול הליכה',
  'Hiking': 'טיול רגלי',
  'Adventure': 'הרפתקה',
  'Expedition': 'משלחת',
  'Safari': 'ספארי',
  'Wildlife': 'חיות בר',
  'Birdwatching': 'צפרות',
  'Diving': 'צלילה',
  'Snorkeling': 'שנורקלינג',
  'Surfing': 'גלישה',
  'Rafting': 'רפטינג',
  'Kayaking': 'קיאקים',
  'Fishing': 'דיג',
  'Climbing': 'טיפוס',
  'Mountaineering': 'טיפוס הרים',
  'Skiing': 'סקי',
  'Snowboarding': 'סנובורד',
  'Paragliding': 'מצנחי רחיפה',
  'Zip Line': 'חבל דמעות',
  'Canopy': 'חבלי כיפת העצים'
};

// Hook for localized place names - combines database and built-in translations
export function useLocalizedPlaceNames() {
  const { i18n } = useTranslation();
  const isHebrew = i18n.language === 'he';

  // Try to get database translations, but don't rely on them
  const destinationsQuery = useEntityTranslations('destinations');
  const accommodationsQuery = useEntityTranslations('accommodations');
  const attractionsQuery = useEntityTranslations('attractions');
  const restaurantsQuery = useEntityTranslations('restaurants');

  const getPlaceName = (
    originalName: string,
    entityId: number | string,
    entityType: EntityType
  ): string => {
    if (!isHebrew) return originalName;

    // First try database translations
    let translations: Translation[] = [];
    
    switch (entityType) {
      case 'destinations':
        translations = destinationsQuery.data || [];
        break;
      case 'accommodations':
        translations = accommodationsQuery.data || [];
        break;
      case 'attractions':
        translations = attractionsQuery.data || [];
        break;
      case 'restaurants':
        translations = restaurantsQuery.data || [];
        break;
    }

    const dbTranslation = getLocalizedName(originalName, entityId, translations);
    if (dbTranslation !== originalName) {
      return dbTranslation; // Database translation found
    }

    // Fallback to built-in translations
    const builtInTranslation = PLACE_TRANSLATIONS[originalName];
    if (builtInTranslation) {
      return builtInTranslation;
    }

    // Try to translate parts of the name (e.g., "Hotel Lima" -> "מלון לימה")
    const words = originalName.split(' ');
    const translatedWords = words.map(word => PLACE_TRANSLATIONS[word] || word);
    const hasTranslation = translatedWords.some(word => PLACE_TRANSLATIONS[word]);
    
    if (hasTranslation) {
      return translatedWords.join(' ');
    }

    // No translation found, return original
    return originalName;
  };

  return {
    getPlaceName,
    isLoading: false, // Don't block on loading since we have fallbacks
    error: null // Don't show errors since we have fallbacks
  };
}