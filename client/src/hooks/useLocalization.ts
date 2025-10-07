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

// Built-in Hebrew translations for places worldwide
const PLACE_TRANSLATIONS: Record<string, string> = {
  // World Countries
  'France': 'צרפת',
  'Italy': 'איטליה',
  'Spain': 'ספרד',
  'United Kingdom': 'בריטניה',
  'Germany': 'גרמניה',
  'Greece': 'יוון',
  'Portugal': 'פורטוגל',
  'Netherlands': 'הולנד',
  'Switzerland': 'שוויץ',
  'Austria': 'אוסטריה',
  'Japan': 'יפן',
  'Thailand': 'תאילנד',
  'China': 'סין',
  'South Korea': 'דרום קוריאה',
  'India': 'הודו',
  'Indonesia': 'אינדונזיה',
  'Vietnam': 'וייטנאם',
  'Singapore': 'סינגפור',
  'Malaysia': 'מלזיה',
  'UAE': 'איחוד האמירויות',
  'Turkey': 'טורקיה',
  'United States': 'ארצות הברית',
  'Canada': 'קנדה',
  'Mexico': 'מקסיקו',
  'Australia': 'אוסטרליה',
  'New Zealand': 'ניו זילנד',
  'Egypt': 'מצרים',
  'Morocco': 'מרוקו',
  'South Africa': 'דרום אפריקה',
  'Kenya': 'קניה',
  'Tanzania': 'טנזניה',
  'Jamaica': 'ג\'מייקה',
  'Cuba': 'קובה',
  'Dominican Republic': 'הרפובליקה הדומיניקנית',
  'Bahamas': 'איי בהאמה',
  
  // South American Countries
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
  'Potosi': 'פוטוסי',
  'Oruro': 'אורורו',
  'Tarija': 'טאריחה',
  'Salar de Uyuni': 'סלאר דה אויוני',
  'Uyuni': 'אויוני',
  'Copacabana': 'קופקבנה',

  // Colombia
  'Bogota': 'בוגוטה',
  'Bogotá': 'בוגוטה',
  'Medellín': 'מדיין',
  'Medellin': 'מדיין',
  'Cartagena': 'קרטחנה',
  'Cali': 'קאלי',
  'Barranquilla': 'ברנקיה',
  'Santa Marta': 'סנטה מרתה',
  'Bucaramanga': 'בוקרמנגה',

  // Argentina  
  'Buenos Aires': 'בואנוס איירס',
  'Córdoba': 'קורדובה',
  'Cordoba': 'קורדובה',
  'Rosario': 'רוסאריו',
  'Mendoza': 'מנדוסה',
  'Tucumán': 'טוקומן',
  'Mar del Plata': 'מאר דל פלטה',
  'Salta': 'סלטה',
  'Bariloche': 'בארילוצ\'ה',
  'Ushuaia': 'אושואיה',

  // Chile
  'Santiago': 'סנטיאגו',
  'Valparaiso': 'ולפאראיסו',
  'Valparaíso': 'ולפאראיסו',
  'Valdivia': 'ולדיביה',
  'Puerto Varas': 'פוארטו ואראס',
  'Concepción': 'קונססיון',
  'Concepcion': 'קונססיון',
  'Antofagasta': 'אנטופגסטה',
  'Viña del Mar': 'ביניה דל מאר',
  'Vina del Mar': 'ביניה דל מאר',
  'Temuco': 'טמוקו',
  'Iquique': 'איקיקה',
  'Rancagua': 'רנקגואה',
  'Talca': 'טלקה',
  'Arica': 'אריקה',
  'Puerto Montt': 'פוארטו מונט',
  'Punta Arenas': 'פונטה ארנס',

  // Brazil
  'Sao Paulo': 'סאו פאולו',
  'São Paulo': 'סאו פאולו',
  'Rio de Janeiro': 'ריו דה זאניירו',
  'Brasília': 'ברזיליה',
  'Brasilia': 'ברזיליה',
  'Salvador': 'סלוודור',
  'Fortaleza': 'פורטלזה',
  'Florianopolis': 'פלוריאנופוליס',
  'Belo Horizonte': 'בלו הוריזונטה',
  'Manaus': 'מנאוס',
  'Curitiba': 'קוריטיבה',
  'Recife': 'רסיפה',
  'Belém': 'בלם',
  'Belem': 'בלם',
  'Porto Alegre': 'פורטו אלגרה',
  'Goiânia': 'גויאניה',
  'Goiania': 'גויאניה',

  // Ecuador
  'Quito': 'קיטו',
  'Guayaquil': 'גואיאקיל',
  'Cuenca': 'קואנקה',
  'Galápagos': 'גלפגוס',
  'Galapagos': 'גלפגוס',
  'Montanita': 'מונטאניטה',

  // Venezuela
  'Caracas': 'קראקס',
  'Maracaibo': 'מראקאיבו',
  'Valencia': 'ולנסיה',
  'Barquisimeto': 'ברקיסימטו',

  // Uruguay
  'Montevideo': 'מונטוידאו',
  'Punta del Este': 'פונטה דל אסטה',
  'Colonia': 'קולוניה',
  'Salto': 'סלטו',
  'Piriapolis': 'פיריאפוליס',

  // Paraguay
  'Asunción': 'אסונסיון',
  'Asuncion': 'אסונסיון',
  'Ciudad del Este': 'סיודאד דל אסטה',
  'Encarnacion': 'אנקרנסיון',
  'San Bernardino': 'סן ברנרדינו',
  'Villarrica': 'ויארריקה',

  // Guyana
  'Georgetown': 'ג\'ורג\'טאון',

  // Suriname
  'Paramaribo': 'פרמריבו',

  // Asia Cities
  'Tokyo': 'טוקיו',
  'Kyoto': 'קיוטו',
  'Osaka': 'אוסקה',
  'Hiroshima': 'הירושימה',
  'Nara': 'נארה',
  'Bangkok': 'בנגקוק',
  'Phuket': 'פוקט',
  'Chiang Mai': 'צ\'אנג מאי',
  'Pattaya': 'פטאיה',
  'Krabi': 'קראבי',
  'Beijing': 'בייג\'ינג',
  'Shanghai': 'שנחאי',
  'Hong Kong': 'הונג קונג',
  'Guangzhou': 'גואנגג\'ו',
  'Chengdu': 'צ\'נגדו',
  'Seoul': 'סיאול',
  'Busan': 'בוסן',
  'Jeju': 'ג\'ג\'ו',
  'Incheon': 'אינצ\'ון',
  'Gyeongju': 'גיונגג\'ו',
  'Delhi': 'דלהי',
  'Mumbai': 'מומבאי',
  'Jaipur': 'ג\'איפור',
  'Agra': 'אגרה',
  'Goa': 'גואה',
  'Bali': 'באלי',
  'Jakarta': 'ג\'קרטה',
  'Yogyakarta': 'יוגיאקרטה',
  'Lombok': 'לומבוק',
  'Sumatra': 'סומטרה',
  'Hanoi': 'האנוי',
  'Ho Chi Minh City': 'הו צ\'י מין',
  'Ha Long Bay': 'מפרץ האלונג',
  'Hoi An': 'הוי אן',
  'Da Nang': 'דה נאנג',
  
  // Europe Cities
  'Paris': 'פריז',
  'Lyon': 'ליון',
  'Nice': 'ניס',
  'Marseille': 'מרסיי',
  'Bordeaux': 'בורדו',
  'Rome': 'רומא',
  'Venice': 'ונציה',
  'Florence': 'פירנצה',
  'Milan': 'מילאנו',
  'Naples': 'נאפולי',
  'Barcelona': 'ברצלונה',
  'Madrid': 'מדריד',
  'Seville': 'סביליה',
  'Granada': 'גרנדה',
  'Berlin': 'ברלין',
  'Munich': 'מינכן',
  'Hamburg': 'המבורג',
  'Frankfurt': 'פרנקפורט',
  'Cologne': 'קלן',
  'London': 'לונדון',
  'Edinburgh': 'אדינבורו',
  'Manchester': 'מנצ\'סטר',
  'Liverpool': 'ליברפול',
  'Oxford': 'אוקספורד',
  'Athens': 'אתונה',
  'Santorini': 'סנטוריני',
  'Mykonos': 'מיקונוס',
  'Crete': 'כרתים',
  'Rhodes': 'רודוס',
  'Lisbon': 'ליסבון',
  'Porto': 'פורטו',
  'Faro': 'פארו',
  'Madeira': 'מדיירה',
  'Azores': 'האיים האזוריים',
  'Amsterdam': 'אמסטרדם',
  'Rotterdam': 'רוטרדם',
  'The Hague': 'האג',
  'Utrecht': 'אוטרכט',
  'Eindhoven': 'איינדהובן',
  'Zurich': 'ציריך',
  'Geneva': 'ג\'נבה',
  'Bern': 'ברן',
  'Lucerne': 'לוצרן',
  'Interlaken': 'אינטרלקן',
  'Vienna': 'וינה',
  'Salzburg': 'זלצבורג',
  'Innsbruck': 'אינסברוק',
  'Graz': 'גראץ',
  'Hallstatt': 'הלשטאט',
  'Prague': 'פראג',
  'Brno': 'ברנו',
  'Cesky Krumlov': 'צ\'סקי קרומלוב',
  'Karlovy Vary': 'קרלובי וארי',
  'Olomouc': 'אולומוץ',
  'Warsaw': 'ורשה',
  'Krakow': 'קרקוב',
  'Gdansk': 'גדנסק',
  'Wroclaw': 'ורוצלב',
  'Poznan': 'פוזנן',
  'Dublin': 'דבלין',
  'Cork': 'קורק',
  'Galway': 'גולווי',
  'Killarney': 'קילרני',
  'Belfast': 'בלפסט',
  'Dubrovnik': 'דוברובניק',
  'Split': 'ספליט',
  'Zagreb': 'זאגרב',
  'Hvar': 'הוואר',
  'Pula': 'פולה',
  'Reykjavik': 'רייקיאוויק',
  'Akureyri': 'אקוריירי',
  'Vik': 'ויק',
  'Hofn': 'הופן',
  'Blue Lagoon': 'הלגונה הכחולה',
  'Oslo': 'אוסלו',
  'Bergen': 'ברגן',
  'Tromso': 'טרומסו',
  'Stavanger': 'סטאוונגר',
  'Trondheim': 'טרונדהיים',
  'Stockholm': 'סטוקהולם',
  'Gothenburg': 'גטבורג',
  'Malmo': 'מלמו',
  'Uppsala': 'אופסלה',
  'Kiruna': 'קירונה',
  'Copenhagen': 'קופנהגן',
  'Aarhus': 'ארהוס',
  'Odense': 'אודנסה',
  'Aalborg': 'אלבורג',
  'Roskilde': 'רוסקילה',
  'Brussels': 'בריסל',
  'Bruges': 'ברוז\'',
  'Antwerp': 'אנטוורפן',
  'Ghent': 'גנט',
  'Leuven': 'לוון',
  'Budapest': 'בודפשט',
  'Debrecen': 'דברצן',
  'Szeged': 'סגד',
  'Pecs': 'פץ\'',
  'Eger': 'אגר',
  
  // More Asia Cities
  'Singapore City': 'סינגפור',
  'Sentosa': 'סנטוזה',
  'Marina Bay': 'מרינה ביי',
  'Orchard Road': 'אורצ\'ארד רואד',
  'Clarke Quay': 'קלארק קוואי',
  'Kuala Lumpur': 'קואלה לומפור',
  'Penang': 'פנאנג',
  'Langkawi': 'לנגקאווי',
  'Malacca': 'מלאקה',
  'Kota Kinabalu': 'קוטה קינבלו',
  'Manila': 'מנילה',
  'Cebu': 'סבו',
  'Boracay': 'בורקאי',
  'Palawan': 'פאלאוואן',
  'Davao': 'דבאו',
  'Dubai': 'דובאי',
  'Abu Dhabi': 'אבו דאבי',
  'Sharjah': 'שרג\'ה',
  'Fujairah': 'פוג\'יירה',
  'Al Ain': 'אל עין',
  'Istanbul': 'איסטנבול',
  'Ankara': 'אנקרה',
  'Antalya': 'אנטליה',
  'Cappadocia': 'קפדוקיה',
  'Izmir': 'איזמיר',
  'Tel Aviv': 'תל אביב',
  'Jerusalem': 'ירושלים',
  'Haifa': 'חיפה',
  'Eilat': 'אילת',
  'Dead Sea': 'ים המלח',
  'Amman': 'עמאן',
  'Petra': 'פטרה',
  'Wadi Rum': 'ואדי רום',
  'Aqaba': 'עקבה',
  'Jerash': 'ג\'רש',
  'Colombo': 'קולומבו',
  'Kandy': 'קנדי',
  'Galle': 'גאלה',
  'Ella': 'אלה',
  'Sigiriya': 'סיגיריה',
  'Phnom Penh': 'פנום פן',
  'Siem Reap': 'סיאם ריפ',
  'Sihanoukville': 'סיהנוקוויל',
  'Battambang': 'באטאמבאנג',
  'Kampot': 'קמפוט',
  'Kathmandu': 'קטמנדו',
  'Pokhara': 'פוקהרה',
  'Lumbini': 'לומביני',
  'Chitwan': 'צ\'יטוואן',
  'Nagarkot': 'נאגרקוט',
  'Male': 'מאלה',
  'Maafushi': 'מאפושי',
  'Hulhumale': 'הולהומאלה',
  'Thulusdhoo': 'תולוסדהו',
  'Dhigurah': 'דיגורה',
  
  // North America Cities
  'New York': 'ניו יורק',
  'Los Angeles': 'לוס אנג\'לס',
  'Miami': 'מיאמי',
  'Las Vegas': 'לאס וגאס',
  'San Francisco': 'סן פרנסיסקו',
  'Toronto': 'טורונטו',
  'Vancouver': 'ונקובר',
  'Montreal': 'מונטריאול',
  'Quebec City': 'קוויבק סיטי',
  'Calgary': 'קלגרי',
  'Cancun': 'קנקון',
  'Mexico City': 'מקסיקו סיטי',
  'Playa del Carmen': 'פלאיה דל כרמן',
  'Puerto Vallarta': 'פוארטו ויארטה',
  'Cabo San Lucas': 'קאבו סן לוקס',
  'San Jose': 'סן חוזה',
  'Jaco': 'ג\'אקו',
  'Tamarindo': 'טמרינדו',
  'La Fortuna': 'לה פורטונה',
  'Puerto Viejo': 'פוארטו ויאחו',
  'Panama City': 'פנמה סיטי',
  'Bocas del Toro': 'בוקס דל טורו',
  'San Blas': 'סן בלאס',
  'Boquete': 'בוקטה',
  'Coronado': 'קורונאדו',
  
  // More South America
  'Margarita Island': 'איי מרגריטה',
  'Los Roques': 'לוס רוקס',
  'Merida': 'מרידה',
  'Canaima': 'קנאימה',
  'Kaieteur Falls': 'מפלי קאייטר',
  'Lethem': 'לטהם',
  'New Amsterdam': 'אמסטרדם החדשה',
  'Bartica': 'ברטיקה',
  'Nieuw Nickerie': 'ניו ניקריה',
  'Brokopondo': 'ברוקופונדו',
  'Albina': 'אלבינה',
  'Moengo': 'מואנגו',
  
  // Oceania Cities
  'Sydney': 'סידני',
  'Melbourne': 'מלבורן',
  'Brisbane': 'בריסביין',
  'Perth': 'פרת\'',
  'Gold Coast': 'גולד קוסט',
  'Auckland': 'אוקלנד',
  'Wellington': 'וולינגטון',
  'Queenstown': 'קווינסטאון',
  'Christchurch': 'כרייסטצ\'רץ\'',
  'Rotorua': 'רוטורואה',
  'Nadi': 'נאדי',
  'Suva': 'סובה',
  'Coral Coast': 'חוף האלמוגים',
  'Mamanuca Islands': 'איי ממנוקה',
  'Yasawa Islands': 'איי יסאווה',
  
  // Africa Cities
  'Cairo': 'קהיר',
  'Luxor': 'לוקסור',
  'Aswan': 'אסוואן',
  'Alexandria': 'אלכסנדריה',
  'Hurghada': 'חורגדה',
  'Marrakech': 'מרקש',
  'Casablanca': 'קזבלנקה',
  'Fes': 'פאס',
  'Rabat': 'רבאט',
  'Tangier': 'טנג\'יר',
  'Cape Town': 'קייפטאון',
  'Johannesburg': 'יוהנסבורג',
  'Durban': 'דרבן',
  'Pretoria': 'פרטוריה',
  'Port Elizabeth': 'פורט אליזבת\'',
  'Nairobi': 'ניירובי',
  'Mombasa': 'מומבסה',
  'Masai Mara': 'מסאי מארה',
  'Nakuru': 'נאקורו',
  'Kisumu': 'קיסומו',
  'Dar es Salaam': 'דאר א-סלאם',
  'Zanzibar': 'זנזיבר',
  'Arusha': 'ארושה',
  'Serengeti': 'סרנגטי',
  'Kilimanjaro': 'קילימנג\'רו',
  'Tunis': 'תוניס',
  'Sousse': 'סוסה',
  'Djerba': 'ג\'רבה',
  'Hammamet': 'חמאמת',
  'Carthage': 'קרתגו',
  'Port Louis': 'פור לואי',
  'Grand Baie': 'גראנד בה',
  'Flic en Flac': 'פליק אן פלאק',
  'Belle Mare': 'בל מר',
  'Le Morne': 'לה מורן',
  
  // Caribbean Cities
  'Punta Cana': 'פונטה קאנה',
  'Santo Domingo': 'סנטו דומינגו',
  'Puerto Plata': 'פוארטו פלטה',
  'La Romana': 'לה רומנה',
  'Samana': 'סאמנה',
  'Kingston': 'קינגסטון',
  'Montego Bay': 'מונטגו ביי',
  'Negril': 'נגריל',
  'Ocho Rios': 'אוצ\'ו ריוס',
  'Port Antonio': 'פורט אנטוניו',
  'Havana': 'הוואנה',
  'Varadero': 'וראדרו',
  'Trinidad': 'טרינידד',
  'Santiago de Cuba': 'סנטיאגו דה קובה',
  'Vinales': 'ווינאלס',
  'Nassau': 'נסאו',
  'Paradise Island': 'איי פרדייס',
  'Freeport': 'פריפורט',
  'Exuma': 'אקסומה',
  'Eleuthera': 'אלאוטרה',
  'Clarke Quay': 'קלארק קיי',
  'Kuala Lumpur': 'קואלה לומפור',
  'Penang': 'פנאנג',
  'Langkawi': 'לנגקאווי',
  'Malacca': 'מלאקה',
  'Kota Kinabalu': 'קוטה קינבאלו',
  'Dubai': 'דובאי',
  'Abu Dhabi': 'אבו דאבי',

  // Europe Cities
  'Paris': 'פריז',
  'Lyon': 'ליון',
  'Nice': 'ניס',
  'Marseille': 'מרסיי',
  'Bordeaux': 'בורדו',
  'London': 'לונדון',
  'Edinburgh': 'אדינבורו',
  'Manchester': 'מנצ\'סטר',
  'Liverpool': 'ליברפול',
  'Oxford': 'אוקספורד',
  'Rome': 'רומא',
  'Venice': 'ונציה',
  'Florence': 'פירנצה',
  'Milan': 'מילאנו',
  'Naples': 'נאפולי',
  'Barcelona': 'ברצלונה',
  'Madrid': 'מדריד',
  'Seville': 'סביליה',
  'Valencia': 'ולנסיה',
  'Granada': 'גרנדה',
  'Berlin': 'ברלין',
  'Munich': 'מינכן',
  'Hamburg': 'המבורג',
  'Frankfurt': 'פרנקפורט',
  'Cologne': 'קלן',
  'Athens': 'אתונה',
  'Santorini': 'סנטוריני',
  'Mykonos': 'מיקונוס',
  'Crete': 'כרתים',
  'Rhodes': 'רודוס',
  'Lisbon': 'ליסבון',
  'Porto': 'פורטו',
  'Faro': 'פארו',
  'Madeira': 'מדיירה',
  'Azores': 'האיים האזוריים',
  'Amsterdam': 'אמסטרדם',
  'Rotterdam': 'רוטרדם',
  'The Hague': 'האג',
  'Utrecht': 'אוטרכט',
  'Eindhoven': 'איינדהובן',
  'Zurich': 'ציריך',
  'Geneva': 'ז\'נבה',
  'Bern': 'ברן',
  'Lucerne': 'לוצרן',
  'Interlaken': 'אינטרלקן',
  'Vienna': 'וינה',
  'Salzburg': 'זלצבורג',
  'Innsbruck': 'אינסברוק',
  'Graz': 'גראץ',
  'Hallstatt': 'האלשטאט',
  'Prague': 'פראג',
  'Istanbul': 'איסטנבול',
  'Budapest': 'בודפשט',
  'Warsaw': 'ורשה',
  'Copenhagen': 'קופנהגן',
  'Stockholm': 'סטוקהולם',
  'Oslo': 'אוסלו',
  'Helsinki': 'הלסינקי',
  'Dublin': 'דבלין',
  'Brussels': 'בריסל',

  // North America Cities
  'New York': 'ניו יורק',
  'Los Angeles': 'לוס אנג\'לס',
  'Chicago': 'שיקגו',
  'Miami': 'מיאמי',
  'Las Vegas': 'לאס וגאס',
  'San Francisco': 'סן פרנסיסקו',
  'Washington': 'וושינגטון',
  'Boston': 'בוסטון',
  'Seattle': 'סיאטל',
  'Toronto': 'טורונטו',
  'Vancouver': 'ונקובר',
  'Montreal': 'מונטריאול',
  'Quebec City': 'קוויבק סיטי',
  'Calgary': 'קלגרי',
  'Cancún': 'קנקון',
  'Cancun': 'קנקון',
  'Mexico City': 'מקסיקו סיטי',
  'Playa del Carmen': 'פלאיה דל כרמן',
  'Puerto Vallarta': 'פוארטו ויארטה',
  'Cabo San Lucas': 'קאבו סן לוקאס',

  // Oceania Cities
  'Sydney': 'סידני',
  'Melbourne': 'מלבורן',
  'Brisbane': 'בריסביין',
  'Perth': 'פרת\'',
  'Gold Coast': 'גולד קוסט',
  'Auckland': 'אוקלנד',
  'Wellington': 'וולינגטון',
  'Queenstown': 'קווינסטאון',
  'Christchurch': 'כרייסטצ\'רץ\'',
  'Rotorua': 'רוטורואה',

  // Africa Cities
  'Cairo': 'קהיר',
  'Luxor': 'לוקסור',
  'Aswan': 'אסואן',
  'Alexandria': 'אלכסנדריה',
  'Hurghada': 'הורגדה',
  'Marrakech': 'מרקש',
  'Casablanca': 'קזבלנקה',
  'Fes': 'פאס',
  'Rabat': 'רבאט',
  'Tangier': 'טנג\'יר',
  'Cape Town': 'קייפטאון',
  'Johannesburg': 'יוהנסבורג',
  'Durban': 'דרבן',
  'Pretoria': 'פרטוריה',
  'Port Elizabeth': 'פורט אליזבת\'',
  'Nairobi': 'ניירובי',
  'Mombasa': 'מומבסה',
  'Masai Mara': 'מסאי מארה',
  'Nakuru': 'נאקורו',
  'Kisumu': 'קיסומו',

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

// Simple hook for translating city/country names
export function useLocalization() {
  const { i18n } = useTranslation();
  const isHebrew = i18n.language === 'he';

  const translateCity = (cityName: string): string => {
    if (!isHebrew) return cityName;
    return PLACE_TRANSLATIONS[cityName] || cityName;
  };

  const translateCountry = (countryName: string): string => {
    if (!isHebrew) return countryName;
    return PLACE_TRANSLATIONS[countryName] || countryName;
  };

  return {
    translateCity,
    translateCountry
  };
}