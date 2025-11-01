import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useLocalizedFormatting } from "@/hooks/useLanguageSwitch";
import { useLocalizedDestinations } from "@/lib/localizedData";
import { useLocalization } from "@/hooks/useLocalization";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { he, enUS } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
// import { RealPlaceLinks } from "@/components/RealPlaceLinks";
import { CONTINENTS, CONTINENT_COUNTRY_MAP, getCountriesByContinent, getContinentByCountry, type Continent } from "@/lib/constants";
import { 
  Bot, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Mountain, 
  Camera, 
  Utensils, 
  GlassWater,
  Loader2,
  Sparkles,
  Clock,
  Users,
  CheckCircle,
  Route,
  ListChecks,
  Lightbulb,
  Star,
  ExternalLink,
  FolderOpen,
  BookOpen,
  Heart,
  Save,
  Trash2,
  Waves,
  Music,
  ShoppingBag,
  Globe,
  Plane,
  Plus
} from "lucide-react";

// Remove problematic Unicode control characters that OpenAI injects into Hebrew text
const normalizeRtlText = (text: string | null | undefined, isHebrew: boolean) => {
  if (!text || !isHebrew) return text || '';
  // Remove LTR marks and other directional control characters
  const cleaned = text.replace(/[\u200e\u202a\u202c\u202d\u202e]/g, '').trim();
  // Optionally add RLM after terminal punctuation
  return cleaned.replace(/([.!?])(\s|$)/g, '$1\u200F$2');
};

// Create form schema function that uses translations
const createTripFormSchema = (t: any) => z.object({
  destinations: z.array(z.object({
    country: z.string().min(1, t('trips.select_destination')),
    city: z.string().optional(),
    startDate: z.date({required_error: t('trips.start_date_required')}),
    endDate: z.date({required_error: t('trips.end_date_required')}),
  }).refine((data) => data.endDate > data.startDate, {
    message: t('trips.end_date_must_be_after_start'),
    path: ['endDate'],
  })).min(1, t('trips.select_at_least_one_destination')),
  travelStyle: z.array(z.string()).optional(), // Keep for backward compatibility but optional
  budget: z.number().min(100, t('trips.budget_required')),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  interests: z.array(z.string()).min(1, t('trips.select_interests')),
});

type Destination = {
  country: string;
  city?: string;
  startDate: Date;
  endDate: Date;
};

type TripFormData = {
  destinations: Destination[];
  destination: string; // Keep for backward compatibility
  specificCity: string;
  travelStyle: string[];
  budget: number;
  startDate?: Date;
  endDate?: Date;
  interests: string[];
  adults: number;
  children: number;
  tripType: string;
};

const getWorldDestinations = () => ({
  // Europe
  'France': ['Paris', 'Lyon', 'Nice', 'Marseille', 'Bordeaux'],
  'Italy': ['Rome', 'Venice', 'Florence', 'Milan', 'Naples'],
  'Spain': ['Barcelona', 'Madrid', 'Seville', 'Valencia', 'Granada'],
  'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'],
  'United Kingdom': ['London', 'Edinburgh', 'Manchester', 'Liverpool', 'Oxford'],
  'Greece': ['Athens', 'Santorini', 'Mykonos', 'Crete', 'Rhodes'],
  'Portugal': ['Lisbon', 'Porto', 'Faro', 'Madeira', 'Azores'],
  'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
  'Switzerland': ['Zurich', 'Geneva', 'Bern', 'Lucerne', 'Interlaken'],
  'Austria': ['Vienna', 'Salzburg', 'Innsbruck', 'Graz', 'Hallstatt'],
  'Czech Republic': ['Prague', 'Brno', 'Cesky Krumlov', 'Karlovy Vary', 'Olomouc'],
  'Poland': ['Warsaw', 'Krakow', 'Gdansk', 'Wroclaw', 'Poznan'],
  'Ireland': ['Dublin', 'Cork', 'Galway', 'Killarney', 'Belfast'],
  'Croatia': ['Dubrovnik', 'Split', 'Zagreb', 'Hvar', 'Pula'],
  'Iceland': ['Reykjavik', 'Akureyri', 'Vik', 'Hofn', 'Blue Lagoon'],
  'Norway': ['Oslo', 'Bergen', 'Tromso', 'Stavanger', 'Trondheim'],
  'Sweden': ['Stockholm', 'Gothenburg', 'Malmo', 'Uppsala', 'Kiruna'],
  'Denmark': ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Roskilde'],
  'Belgium': ['Brussels', 'Bruges', 'Antwerp', 'Ghent', 'Leuven'],
  'Hungary': ['Budapest', 'Debrecen', 'Szeged', 'Pecs', 'Eger'],
  'Romania': ['Bucharest', 'Brasov', 'Cluj-Napoca', 'Timisoara', 'Sibiu'],
  'Bulgaria': ['Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Rila'],
  'Slovenia': ['Ljubljana', 'Bled', 'Piran', 'Maribor', 'Bohinj'],
  'Serbia': ['Belgrade', 'Novi Sad', 'Nis', 'Subotica', 'Zlatibor'],
  'Latvia': ['Riga', 'Jurmala', 'Sigulda', 'Cesis', 'Liepaja'],
  'Lithuania': ['Vilnius', 'Kaunas', 'Klaipeda', 'Trakai', 'Palanga'],
  'Estonia': ['Tallinn', 'Tartu', 'Parnu', 'Saaremaa', 'Narva'],
  'Slovakia': ['Bratislava', 'Kosice', 'Zilina', 'Poprad', 'Trencin'],
  'Cyprus': ['Nicosia', 'Limassol', 'Paphos', 'Larnaca', 'Ayia Napa'],
  'Malta': ['Valletta', 'Sliema', 'St. Julians', 'Mdina', 'Gozo'],
  'Finland': ['Helsinki', 'Rovaniemi', 'Turku', 'Tampere', 'Lapland'],
  'Luxembourg': ['Luxembourg City', 'Vianden', 'Echternach', 'Remich', 'Clervaux'],
  
  // Asia
  'Japan': ['Tokyo', 'Kyoto', 'Osaka', 'Hiroshima', 'Nara'],
  'Thailand': ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Krabi'],
  'China': ['Beijing', 'Shanghai', 'Hong Kong', 'Guangzhou', 'Chengdu'],
  'South Korea': ['Seoul', 'Busan', 'Jeju', 'Incheon', 'Gyeongju'],
  'India': ['Delhi', 'Mumbai', 'Jaipur', 'Agra', 'Goa'],
  'Indonesia': ['Bali', 'Jakarta', 'Yogyakarta', 'Lombok', 'Sumatra'],
  'Vietnam': ['Hanoi', 'Ho Chi Minh City', 'Ha Long Bay', 'Hoi An', 'Da Nang'],
  'Singapore': ['Singapore City', 'Sentosa', 'Marina Bay', 'Orchard Road', 'Clarke Quay'],
  'Malaysia': ['Kuala Lumpur', 'Penang', 'Langkawi', 'Malacca', 'Kota Kinabalu'],
  'Philippines': ['Manila', 'Cebu', 'Boracay', 'Palawan', 'Davao'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Fujairah', 'Al Ain'],
  'Turkey': ['Istanbul', 'Ankara', 'Antalya', 'Cappadocia', 'Izmir'],
  'Israel': ['Tel Aviv', 'Jerusalem', 'Haifa', 'Eilat', 'Dead Sea'],
  'Jordan': ['Amman', 'Petra', 'Wadi Rum', 'Aqaba', 'Jerash'],
  'Sri Lanka': ['Colombo', 'Kandy', 'Galle', 'Ella', 'Sigiriya'],
  'Cambodia': ['Phnom Penh', 'Siem Reap', 'Sihanoukville', 'Battambang', 'Kampot'],
  'Nepal': ['Kathmandu', 'Pokhara', 'Lumbini', 'Chitwan', 'Nagarkot'],
  'Maldives': ['Male', 'Maafushi', 'Hulhumale', 'Thulusdhoo', 'Dhigurah'],
  'Georgia': ['Tbilisi', 'Batumi', 'Mtskheta', 'Kazbegi', 'Kutaisi'],
  'Azerbaijan': ['Baku', 'Gabala', 'Sheki', 'Ganja', 'Quba'],
  'Armenia': ['Yerevan', 'Gyumri', 'Dilijan', 'Sevan', 'Garni'],
  'Uzbekistan': ['Tashkent', 'Samarkand', 'Bukhara', 'Khiva', 'Fergana'],
  'Kazakhstan': ['Almaty', 'Nur-Sultan', 'Shymkent', 'Aktau', 'Turkestan'],
  'Kyrgyzstan': ['Bishkek', 'Osh', 'Issyk-Kul', 'Karakol', 'Jalalabad'],
  'Mongolia': ['Ulaanbaatar', 'Gobi Desert', 'Terelj', 'Khovsgol', 'Kharkhorin'],
  'Myanmar': ['Yangon', 'Bagan', 'Mandalay', 'Inle Lake', 'Ngapali'],
  'Laos': ['Vientiane', 'Luang Prabang', 'Vang Vieng', 'Pakse', '4000 Islands'],
  'Brunei': ['Bandar Seri Begawan', 'Tutong', 'Seria', 'Kuala Belait', 'Temburong'],
  'Bangladesh': ['Dhaka', 'Chittagong', 'Coxs Bazar', 'Sylhet', 'Sundarbans'],
  'Pakistan': ['Islamabad', 'Karachi', 'Lahore', 'Hunza', 'Skardu'],
  'Oman': ['Muscat', 'Salalah', 'Nizwa', 'Sur', 'Wahiba Sands'],
  'Qatar': ['Doha', 'Al Wakrah', 'Al Khor', 'Dukhan', 'Mesaieed'],
  'Bahrain': ['Manama', 'Muharraq', 'Riffa', 'Hamad Town', 'Isa Town'],
  'Kuwait': ['Kuwait City', 'Salmiya', 'Hawalli', 'Farwaniya', 'Jahra'],
  
  // North America
  'United States': ['New York', 'Los Angeles', 'Miami', 'Las Vegas', 'San Francisco'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Quebec City', 'Calgary'],
  'Mexico': ['Cancun', 'Mexico City', 'Playa del Carmen', 'Puerto Vallarta', 'Cabo San Lucas'],
  'Costa Rica': ['San Jose', 'Jaco', 'Tamarindo', 'La Fortuna', 'Puerto Viejo'],
  'Panama': ['Panama City', 'Bocas del Toro', 'San Blas', 'Boquete', 'Coronado'],
  'Guatemala': ['Guatemala City', 'Antigua', 'Panajachel', 'Flores', 'Quetzaltenango'],
  'Belize': ['Belize City', 'San Pedro', 'Caye Caulker', 'Placencia', 'Hopkins'],
  'Honduras': ['Tegucigalpa', 'Roatan', 'Copan', 'La Ceiba', 'Utila'],
  'Nicaragua': ['Managua', 'Granada', 'Leon', 'San Juan del Sur', 'Ometepe'],
  'El Salvador': ['San Salvador', 'Santa Ana', 'La Libertad', 'Suchitoto', 'El Tunco'],
  
  // South America
  'Peru': ['Lima', 'Cusco', 'Machu Picchu', 'Arequipa', 'Iquitos'],
  'Colombia': ['Bogota', 'Cartagena', 'Medellin', 'Cali', 'Santa Marta'],
  'Argentina': ['Buenos Aires', 'Mendoza', 'Bariloche', 'Salta', 'Cordoba'],
  'Brazil': ['Rio de Janeiro', 'Sao Paulo', 'Salvador', 'Brasilia', 'Florianopolis'],
  'Chile': ['Santiago', 'Valparaiso', 'Valdivia', 'Puerto Varas', 'Punta Arenas'],
  'Bolivia': ['La Paz', 'Uyuni', 'Sucre', 'Potosi', 'Copacabana'],
  'Ecuador': ['Quito', 'Guayaquil', 'Cuenca', 'Galapagos', 'Montanita'],
  'Uruguay': ['Montevideo', 'Punta del Este', 'Colonia', 'Salto', 'Piriapolis'],
  'Paraguay': ['Asuncion', 'Ciudad del Este', 'Encarnacion', 'San Bernardino', 'Villarrica'],
  'Venezuela': ['Caracas', 'Margarita Island', 'Los Roques', 'Merida', 'Canaima'],
  'Guyana': ['Georgetown', 'Kaieteur Falls', 'Lethem', 'New Amsterdam', 'Bartica'],
  'Suriname': ['Paramaribo', 'Nieuw Nickerie', 'Brokopondo', 'Albina', 'Moengo'],
  
  // Oceania
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Gold Coast'],
  'New Zealand': ['Auckland', 'Wellington', 'Queenstown', 'Christchurch', 'Rotorua'],
  'Fiji': ['Nadi', 'Suva', 'Coral Coast', 'Mamanuca Islands', 'Yasawa Islands'],
  'Samoa': ['Apia', 'Savaii', 'Upolu', 'Lalomanu', 'Manono'],
  'Tonga': ['Nukualofa', 'Vavau', 'Haapai', 'Eua', 'Tongatapu'],
  'Papua New Guinea': ['Port Moresby', 'Rabaul', 'Madang', 'Mount Hagen', 'Lae'],
  'Vanuatu': ['Port Vila', 'Luganville', 'Tanna', 'Espiritu Santo', 'Efate'],
  'New Caledonia': ['Noumea', 'Isle of Pines', 'Bourail', 'Hienghene', 'Mare'],
  'Solomon Islands': ['Honiara', 'Gizo', 'Munda', 'Auki', 'Guadalcanal'],
  'French Polynesia': ['Papeete', 'Bora Bora', 'Moorea', 'Tahiti', 'Huahine'],
  
  // Africa
  'Egypt': ['Cairo', 'Luxor', 'Aswan', 'Alexandria', 'Hurghada'],
  'Morocco': ['Marrakech', 'Casablanca', 'Fes', 'Rabat', 'Tangier'],
  'South Africa': ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth'],
  'Kenya': ['Nairobi', 'Mombasa', 'Masai Mara', 'Nakuru', 'Kisumu'],
  'Tanzania': ['Dar es Salaam', 'Zanzibar', 'Arusha', 'Serengeti', 'Kilimanjaro'],
  'Tunisia': ['Tunis', 'Sousse', 'Djerba', 'Hammamet', 'Carthage'],
  'Mauritius': ['Port Louis', 'Grand Baie', 'Flic en Flac', 'Belle Mare', 'Le Morne'],
  'Seychelles': ['Victoria', 'Mahe', 'Praslin', 'La Digue', 'Silhouette'],
  'Madagascar': ['Antananarivo', 'Nosy Be', 'Antsirabe', 'Toliara', 'Morondava'],
  'Rwanda': ['Kigali', 'Volcanoes National Park', 'Akagera', 'Nyungwe', 'Kibuye'],
  'Uganda': ['Kampala', 'Entebbe', 'Jinja', 'Murchison Falls', 'Bwindi'],
  'Botswana': ['Gaborone', 'Maun', 'Kasane', 'Okavango Delta', 'Chobe'],
  'Namibia': ['Windhoek', 'Swakopmund', 'Sossusvlei', 'Etosha', 'Walvis Bay'],
  'Zimbabwe': ['Harare', 'Victoria Falls', 'Bulawayo', 'Hwange', 'Kariba'],
  'Zambia': ['Lusaka', 'Livingstone', 'South Luangwa', 'Lower Zambezi', 'Kafue'],
  'Ethiopia': ['Addis Ababa', 'Lalibela', 'Gondar', 'Axum', 'Harar'],
  'Ghana': ['Accra', 'Kumasi', 'Cape Coast', 'Takoradi', 'Tamale'],
  'Senegal': ['Dakar', 'Saint-Louis', 'Goree Island', 'Saly', 'Casamance'],
  'Nigeria': ['Lagos', 'Abuja', 'Calabar', 'Port Harcourt', 'Kano'],
  
  // Caribbean
  'Dominican Republic': ['Punta Cana', 'Santo Domingo', 'Puerto Plata', 'La Romana', 'Samana'],
  'Jamaica': ['Kingston', 'Montego Bay', 'Negril', 'Ocho Rios', 'Port Antonio'],
  'Cuba': ['Havana', 'Varadero', 'Trinidad', 'Santiago de Cuba', 'Vinales'],
  'Bahamas': ['Nassau', 'Paradise Island', 'Freeport', 'Exuma', 'Eleuthera'],
  'Barbados': ['Bridgetown', 'Holetown', 'Oistins', 'Bathsheba', 'Speightstown'],
  'Saint Lucia': ['Castries', 'Soufriere', 'Rodney Bay', 'Vieux Fort', 'Marigot Bay'],
  'Trinidad and Tobago': ['Port of Spain', 'San Fernando', 'Scarborough', 'Chaguanas', 'Maracas'],
  'Aruba': ['Oranjestad', 'Palm Beach', 'Eagle Beach', 'San Nicolas', 'Noord'],
  'Curacao': ['Willemstad', 'Westpunt', 'Punda', 'Mambo Beach', 'Jan Thiel'],
  'Grenada': ['St. Georges', 'Grand Anse', 'Carriacou', 'Gouyave', 'Grenville'],
  'Antigua and Barbuda': ['St. Johns', 'English Harbour', 'Jolly Beach', 'Dickenson Bay', 'Codrington']
});

// Interfaces
interface RealPlace {
  title: string;
  link?: string;
  source?: "Google" | "GetYourGuide" | "TripAdvisor";
  placeId?: string;
  rating?: number;
  address?: string;
  photoUrl?: string;
}

interface TripSuggestion {
  destination: string;
  country: string;
  description: string;
  bestTimeToVisit: string;
  estimatedBudget: {
    low: number;
    high: number;
  };
  highlights: string[];
  travelStyle: string[];
  duration: string;
  startDate?: string;
  endDate?: string;
  realPlaces?: RealPlace[];
  destinationBreakdown?: {
    destination: string;
    country: string;
    description: string;
    highlights: string[];
    duration: string;
    dateRange?: string;
  }[];
  transportation?: {
    from: string;
    to: string;
    recommendations: string[];
    estimatedCost?: string;
    estimatedTime?: string;
  }[];
}

interface ItineraryDay {
  day: number;
  location: string;
  activities: string[];
  estimatedCost: number;
  tips: string[];
}

interface SavedTrip {
  id: number;
  title: string;
  destinations: any;
  description: string;
  budget: string;
  duration: string;
  travelStyle: string;
  createdAt: string;
}

// Translation function for bestTimeToVisit field
const translateBestTime = (text: string, targetLang: string): string => {
  if (!text) return text;
  
  const monthMappings: Record<string, Record<string, string>> = {
    'he': {
      'january': 'ינואר', 'february': 'פברואר', 'march': 'מרץ', 'april': 'אפריל',
      'may': 'מאי', 'june': 'יוני', 'july': 'יולי', 'august': 'אוגוסט',
      'september': 'ספטמבר', 'october': 'אוקטובר', 'november': 'נובמבר', 'december': 'דצמבר'
    },
    'en': {
      'ינואר': 'January', 'פברואר': 'February', 'מרץ': 'March', 'אפריל': 'April',
      'מאי': 'May', 'יוני': 'June', 'יולי': 'July', 'אוגוסט': 'August',
      'ספטמבר': 'September', 'אוקטובר': 'October', 'נובמבר': 'November', 'דצמבר': 'December'
    }
  };
  
  const wordMappings: Record<string, Record<string, string>> = {
    'he': { 'to': 'עד', 'until': 'עד', 'and': 'ו' },
    'en': { 'עד': 'to', 'ו': 'and' }
  };
  
  let result = text;
  const mappings = monthMappings[targetLang] || {};
  const words = wordMappings[targetLang] || {};
  
  // Replace months
  Object.entries(mappings).forEach(([key, value]) => {
    const regex = new RegExp(key, 'gi');
    result = result.replace(regex, value);
  });
  
  // Replace common words
  Object.entries(words).forEach(([key, value]) => {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    result = result.replace(regex, value);
  });
  
  return result;
};

// Helper function to detect if text is in Hebrew
const isHebrewText = (text: string): boolean => {
  if (!text) return false;
  // Count Hebrew characters
  const hebrewChars = text.match(/[\u0590-\u05FF]/g);
  return hebrewChars ? hebrewChars.length > text.length * 0.3 : false;
};

// Function to translate full sentences (titles, descriptions)
const translateFullText = async (text: string, targetLang: string): Promise<string> => {
  if (!text) return text;
  
  const textIsHebrew = isHebrewText(text);
  const needsTranslation = (targetLang === 'he' && !textIsHebrew) || (targetLang === 'en' && textIsHebrew);
  
  if (!needsTranslation) return text;
  
  try {
    const response = await apiRequest('/api/translate', {
      method: 'POST',
      body: JSON.stringify({
        text,
        targetLang
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.translatedText || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
};

// Function to format date ranges for Hebrew (DD/MM/YYYY)
const formatDateRange = (dateRange: string, lang: string): string => {
  if (!dateRange || lang !== 'he') return dateRange;
  
  // Parse date range like "November 4 - November 10, 2025" or "Dec 1 - Dec 3, 2025"
  const dateRangeRegex = /(\w+)\s+(\d+)\s*-\s*(\w+)\s+(\d+),?\s*(\d{4})/;
  const match = dateRange.match(dateRangeRegex);
  
  if (!match) {
    console.log('[formatDateRange] No match for:', dateRange);
    return dateRange;
  }
  
  const [, startMonth, startDay, endMonth, endDay, year] = match;
  
  const monthMap: { [key: string]: string } = {
    'January': '01', 'Jan': '01',
    'February': '02', 'Feb': '02',
    'March': '03', 'Mar': '03',
    'April': '04', 'Apr': '04',
    'May': '05',
    'June': '06', 'Jun': '06',
    'July': '07', 'Jul': '07',
    'August': '08', 'Aug': '08',
    'September': '09', 'Sep': '09',
    'October': '10', 'Oct': '10',
    'November': '11', 'Nov': '11',
    'December': '12', 'Dec': '12'
  };
  
  const startMonthNum = monthMap[startMonth] || '01';
  const endMonthNum = monthMap[endMonth] || '01';
  
  const startFormatted = `${startDay.padStart(2, '0')}/${startMonthNum}/${year}`;
  const endFormatted = `${endDay.padStart(2, '0')}/${endMonthNum}/${year}`;
  
  const result = `${startFormatted} - ${endFormatted}`;
  console.log('[formatDateRange] Input:', dateRange, '→ Output:', result);
  
  return result;
};

// Translation function for travel style tags and highlights
const translateText = (text: string, targetLang: string): string => {
  if (!text) return text;
  
  const translations: Record<string, Record<string, string>> = {
    'he': {
      // Travel styles
      'adventure': 'הרפתקאות',
      'culture': 'תרבות',
      'relaxation': 'רגיעה',
      'luxury': 'יוקרה',
      'budget': 'חיסכוני',
      'nature': 'טבע',
      'city': 'עירוני',
      'beach': 'חוף',
      'food': 'אוכל',
      'nightlife': 'חיי לילה',
      'shopping': 'קניות',
      'family': 'משפחתי',
      // Common words
      'expensive': 'יקר',
      'cheap': 'זול',
      'moderate': 'בינוני',
      'museum': 'מוזיאון',
      'park': 'פארק',
      'market': 'שוק',
      'restaurant': 'מסעדה',
      'hotel': 'מלון',
      'attractions': 'אטרקציות',
      'landmarks': 'ציוני דרך'
    },
    'en': {
      // Travel styles
      'הרפתקאות': 'Adventure',
      'תרבות': 'Culture',
      'רגיעה': 'Relaxation',
      'יוקרה': 'Luxury',
      'חיסכוני': 'Budget',
      'טבע': 'Nature',
      'עירוני': 'City',
      'חוף': 'Beach',
      'אוכל': 'Food',
      'חיי לילה': 'Nightlife',
      'קניות': 'Shopping',
      'משפחתי': 'Family',
      // Common nouns and places
      'מוזיאון': 'Museum',
      'המוזיאון': 'The Museum',
      'פארק': 'Park',
      'הפארק': 'The Park',
      'שוק': 'Market',
      'השוק': 'The Market',
      'מסעדה': 'Restaurant',
      'המסעדה': 'The Restaurant',
      'מלון': 'Hotel',
      'המלון': 'The Hotel',
      'קניון': 'Mall',
      'הקניון': 'The Mall',
      'אטרקציות': 'Attractions',
      'ציוני דרך': 'Landmarks',
      'כיכר': 'Plaza',
      'הכיכר': 'The Plaza',
      'רובע': 'Quarter',
      'הרובע': 'The Quarter',
      'נמל': 'Port',
      'הנמל': 'The Port',
      'גשר': 'Bridge',
      'הגשר': 'The Bridge',
      'מבצר': 'Fortress',
      'המבצר': 'The Fortress',
      'ארמון': 'Palace',
      'הארמון': 'The Palace',
      'גן': 'Garden',
      'הגן': 'The Garden',
      'קתדרלה': 'Cathedral',
      'הקתדרלה': 'The Cathedral',
      'כנסייה': 'Church',
      'הכנסייה': 'The Church',
      // Common words in descriptions
      'היא': 'is',
      'הוא': 'is',
      'עיר': 'city',
      'העיר': 'the city',
      'של': 'of',
      'עם': 'with',
      'יפה': 'beautiful',
      'יפה': 'beautiful',
      'עתיק': 'ancient',
      'עתיקה': 'ancient',
      'מודרני': 'modern',
      'מודרנית': 'modern',
      'מרשים': 'impressive',
      'מרשימה': 'impressive',
      'גדול': 'large',
      'גדולה': 'large',
      'קטן': 'small',
      'קטנה': 'small',
      'חדש': 'new',
      'חדשה': 'new',
      'ישן': 'old',
      'ישנה': 'old',
      'היסטורי': 'historic',
      'היסטורית': 'historic',
      'מפורסם': 'famous',
      'מפורסמת': 'famous',
      'יקר': 'expensive',
      'יקרה': 'expensive',
      'זול': 'cheap',
      'זולה': 'cheap',
      'בינוני': 'moderate',
      'בינונית': 'moderate',
      // Archaeology-related terms
      'ארכיאולוגיה': 'Archaeology',
      'לארכיאולוגיה': 'of Archaeology',
      'אנתרופולוגיה': 'Anthropology',
      'ואנתרופולוגיה': 'and Anthropology',
      // Love Park example
      'האהבה': 'of Love',
      'אהבה': 'Love',
      // Other common words
      'לארקו': 'Larco',
      'מרכז': 'center',
      'המרכז': 'the center',
      'היסטורי': 'historic',
      'ההיסטורי': 'the historic'
    }
  };
  
  const mappings = translations[targetLang] || {};
  let result = text;
  
  // Sort by length (longest first) to handle phrases before individual words
  const sortedEntries = Object.entries(mappings).sort((a, b) => b[0].length - a[0].length);
  
  // Replace each word/phrase
  sortedEntries.forEach(([key, value]) => {
    // Use word boundary for exact matches, but handle Hebrew which doesn't have word boundaries
    const regex = new RegExp(key, 'g');
    result = result.replace(regex, value);
  });
  
  return result;
};

export default function MyTripsNew() {
  const { t, i18n } = useTranslation();
  const { formatCurrency, formatDate } = useLocalizedFormatting();
  const { translateCity, translateCountry } = useLocalization();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, user, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState("preferences");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Check URL hash to open specific tab and scroll to specific trip
  useEffect(() => {
    const hash = window.location.hash.substring(1); // Remove the # character
    
    // Check if hash is a trip ID (format: trip-123)
    if (hash && hash.startsWith('trip-')) {
      setActiveTab('saved'); // Open the saved trips tab
      
      // Scroll to the specific trip after a short delay to ensure the tab content is rendered
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    } else if (hash && ['preferences', 'suggestions', 'itinerary', 'my-itineraries', 'saved'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  // Set localized page title
  useEffect(() => {
    document.title = `${t('trips.my_trips')} - GlobeMate`;
  }, [t]);

  // Localized constants - defined inside component to access t()
  const DURATIONS = [
    { value: "2-3 days", label: "2-3 ימים", days: 3 },
    { value: "4-7 days", label: "4-7 ימים", days: 7 },
    { value: "1-2 weeks", label: t('trips.duration_1_2_weeks'), days: 14 },
    { value: "2-4 weeks", label: t('trips.duration_2_4_weeks'), days: 28 },
    { value: "1-2 months", label: t('trips.duration_1_2_months'), days: 60 },
    { value: "3+ months", label: t('trips.duration_3_months'), days: 90 },
  ];

  // Helper function to calculate duration in days from dates
  const calculateDurationInDays = (start?: Date, end?: Date): number => {
    if (!start || !end) return 7; // default to 7 days if dates not set
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 7;
  };
  
  // Helper function to convert duration string to number of days (backward compatibility)
  const getDurationInDays = (durationString: string): number => {
    const duration = DURATIONS.find(d => d.value === durationString);
    return duration?.days || 7; // default to 7 days if not found
  };

  // Combined interests (previously Travel Styles + Interests)
  const ALL_INTERESTS = [
    { id: 'budget', icon: DollarSign, label: t('trips.budget_travel') },
    { id: 'luxury', icon: Sparkles, label: t('trips.luxury') },
    { id: 'history_culture', icon: Camera, label: t('trips.interests_list.history_culture') },
    { id: 'adventure_sports', icon: Mountain, label: t('trips.interests_list.adventure_sports') },
    { id: 'nature_wildlife', icon: Mountain, label: t('trips.interests_list.nature_wildlife') },
    { id: 'food_cuisine', icon: Utensils, label: t('trips.interests_list.food_cuisine') },
    { id: 'nightlife_entertainment', icon: GlassWater, label: t('trips.interests_list.nightlife_entertainment') },
    { id: 'photography', icon: Camera, label: t('trips.interests_list.photography') },
    { id: 'architecture', icon: Camera, label: t('trips.interests_list.architecture') },
    { id: 'local_markets', icon: MapPin, label: t('trips.interests_list.local_markets') },
    { id: 'beaches_coastlines', icon: Waves, label: t('trips.interests_list.beaches_coastlines') },
    { id: 'mountains_hiking', icon: Mountain, label: t('trips.interests_list.mountains_hiking') },
    { id: 'art_museums', icon: Camera, label: t('trips.interests_list.art_museums') },
    { id: 'music_festivals', icon: Music, label: t('trips.interests_list.music_festivals') },
    { id: 'shopping', icon: ShoppingBag, label: t('trips.interests_list.shopping') },
    { id: 'wellness_relaxation', icon: Clock, label: t('trips.interests_list.wellness_relaxation') },
    { id: 'language_learning', icon: Globe, label: t('trips.interests_list.language_learning') },
    { id: 'volunteering', icon: Heart, label: t('trips.interests_list.volunteering') }
  ];
  
  // Currency conversion rate (USD to ILS)
  const USD_TO_ILS = 3.7; // Average conversion rate
  
  // Logarithmic scale helpers for budget
  const MIN_BUDGET = 100;
  const MAX_BUDGET = 1000000;
  const logToLinear = (logValue: number): number => {
    const minLog = Math.log(MIN_BUDGET);
    const maxLog = Math.log(MAX_BUDGET);
    const scale = (maxLog - minLog) / 100;
    return Math.round(Math.exp(minLog + scale * logValue));
  };
  
  const linearToLog = (linearValue: number): number => {
    const minLog = Math.log(MIN_BUDGET);
    const maxLog = Math.log(MAX_BUDGET);
    const scale = (maxLog - minLog) / 100;
    return Math.round((Math.log(linearValue) - minLog) / scale);
  };
  
  // Form state
  const [budgetSliderValue, setBudgetSliderValue] = useState([linearToLog(MIN_BUDGET)]);
  const budget = logToLinear(budgetSliderValue[0]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedContinent, setSelectedContinent] = useState<Continent | "">("");
  const [specificCity, setSpecificCity] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [tripType, setTripType] = useState<string>("");
  
  const WORLD_DESTINATIONS = getWorldDestinations();
  
  // Results state - load from localStorage if available
  const [aiSuggestions, setAiSuggestions] = useState<TripSuggestion[]>(() => {
    try {
      const saved = localStorage.getItem('aiSuggestions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);

  // Save suggestions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('aiSuggestions', JSON.stringify(aiSuggestions));
    } catch (error) {
      console.error('Error saving suggestions to localStorage:', error);
    }
  }, [aiSuggestions]);

  // State for multi-city destinations
  const [destinations, setDestinations] = useState<Destination[]>([
    { country: "", city: "", startDate: undefined, endDate: undefined }
  ]);

  // State for search functionality in Select components
  const [countrySearchValues, setCountrySearchValues] = useState<string[]>([""]);
  const [citySearchValues, setCitySearchValues] = useState<string[]>([""]);

  // Create form with dynamic schema that uses current translations
  const form = useForm<TripFormData>({
    resolver: zodResolver(createTripFormSchema(t)),
    defaultValues: {
      destinations: [{ country: "", city: "", startDate: undefined, endDate: undefined }],
      destination: "",
      specificCity: "",
      travelStyle: [],
      budget: logToLinear(linearToLog(5000)),
      interests: [],
      adults: 2,
      children: 0,
      tripType: "",
    },
  });

  // Helper functions for managing destinations
  const addDestination = () => {
    const newDestinations = [...destinations, { country: "", city: "", startDate: undefined, endDate: undefined }];
    setDestinations(newDestinations);
    form.setValue('destinations', newDestinations);
    setCountrySearchValues([...countrySearchValues, ""]);
    setCitySearchValues([...citySearchValues, ""]);
  };

  const removeDestination = (index: number) => {
    if (destinations.length > 1) {
      const newDestinations = destinations.filter((_, i) => i !== index);
      setDestinations(newDestinations);
      form.setValue('destinations', newDestinations);
      setCountrySearchValues(countrySearchValues.filter((_, i) => i !== index));
      setCitySearchValues(citySearchValues.filter((_, i) => i !== index));
    }
  };

  const updateDestination = (index: number, field: keyof Destination, value: string | Date | undefined) => {
    const newDestinations = [...destinations];
    newDestinations[index] = { ...newDestinations[index], [field]: value };
    setDestinations(newDestinations);
    form.setValue('destinations', newDestinations);
  };

  // Calculate total days from all destinations
  const getTotalDays = () => {
    return destinations.reduce((sum, dest) => {
      if (dest.startDate && dest.endDate) {
        const diffTime = Math.abs(dest.endDate.getTime() - dest.startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }
      return sum;
    }, 0);
  };

  // Calculate overall trip start date (earliest start date from all destinations)
  const getOverallStartDate = (): Date | undefined => {
    const validDates = destinations
      .filter(dest => dest.startDate)
      .map(dest => dest.startDate!);
    
    if (validDates.length === 0) return undefined;
    
    return new Date(Math.min(...validDates.map(d => d.getTime())));
  };

  // Calculate overall trip end date (latest end date from all destinations)
  const getOverallEndDate = (): Date | undefined => {
    const validDates = destinations
      .filter(dest => dest.endDate)
      .map(dest => dest.endDate!);
    
    if (validDates.length === 0) return undefined;
    
    return new Date(Math.max(...validDates.map(d => d.getTime())));
  };

  // Helper function for toggling interests
  const toggleInterest = (interestId: string) => {
    const newInterests = selectedInterests.includes(interestId)
      ? selectedInterests.filter(i => i !== interestId)
      : [...selectedInterests, interestId];
    setSelectedInterests(newInterests);
    form.setValue('interests', newInterests);
    form.setValue('travelStyle', newInterests); // Keep for backward compatibility
  };

  const handleContinentChange = (continent: string) => {
    setSelectedContinent(continent as Continent);
    form.setValue('destination', ""); // Reset destination when continent changes
  };

  const availableCountries = selectedContinent 
    ? getCountriesByContinent(selectedContinent)
    : [];
  
  // Get available cities for selected country
  const availableCities = selectedCountry 
    ? (WORLD_DESTINATIONS[selectedCountry as keyof typeof WORLD_DESTINATIONS] || [])
    : [];

  // Auto-detect continent from existing destination (for backward compatibility)
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'destination' && value.destination && !selectedContinent) {
        const detectedContinent = getContinentByCountry(value.destination);
        if (detectedContinent) {
          setSelectedContinent(detectedContinent);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, selectedContinent]);

  // API calls
  const generateAISuggestionsMutation = useMutation({
    mutationFn: async (data: Omit<TripFormData, 'duration'> & { duration: number; startDate?: string; endDate?: string }) => {
      try {
        const response = await apiRequest('/api/ai/travel-suggestions', {
          method: 'POST',
          body: JSON.stringify({
            destination: data.destination,
            destinations: data.destinations, // CRITICAL: Send multi-city destinations
            travelStyle: data.travelStyle,
            budget: data.budget,
            duration: data.duration,
            startDate: data.startDate,
            endDate: data.endDate,
            interests: data.interests,
            language: i18n.language,
            adults: data.adults || 2,
            children: data.children || 0,
            tripType: data.tripType || 'family',
          }),
        });
        const jsonData = await response.json();
        console.log('API response received (original):', jsonData);
        
        // Fix country field for multi-city trips - should include all countries
        const fixedData = jsonData.map((suggestion: any) => {
          if (suggestion.destinationBreakdown && suggestion.destinationBreakdown.length > 1) {
            // Extract unique countries from destinationBreakdown
            const countries = [...new Set(suggestion.destinationBreakdown.map((dest: any) => dest.country))];
            const updatedSuggestion = {
              ...suggestion,
              country: countries.join(' & ') // Join with " & "
            };
            console.log('Fixed country field:', suggestion.country, '→', updatedSuggestion.country);
            return updatedSuggestion;
          }
          console.log('Not multi-city or single destination:', suggestion.destination);
          return suggestion;
        });
        
        console.log('API response received (fixed):', fixedData);
        return fixedData as TripSuggestion[];
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Success callback called with data:', data);
      setIsGenerating(false);
      if (data && Array.isArray(data)) {
        console.log('Setting AI suggestions state:', data);
        setAiSuggestions(data);
        setTimeout(() => {
          setActiveTab("suggestions");
        }, 100);
        toast({
          title: t('trips.ai_suggestions_generated'),
          description: t('trips.suggestions_count', { count: data.length }),
        });
      } else {
        console.error('Invalid data received:', data);
        toast({
          title: t('common.error'),
          description: t('trips.invalid_response_format'),
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Error generating AI suggestions:', error);
      setIsGenerating(false);
      toast({
        title: t('common.error'), 
        description: error?.message || t('trips.error_generating'),
        variant: "destructive",
      });
    },
  });

  const generateItineraryMutation = useMutation({
    mutationFn: async () => {
      const formData = form.getValues();
      
      // Validate data before sending
      if (!formData.destination) {
        throw new Error(i18n.language === 'he' ? 'צור הצעות טיול תחילה' : 'Create trip suggestions first');
      }
      
      if (selectedInterests.length === 0) {
        throw new Error(t('trips.please_select_interest'));
      }
      
      // If a specific city is selected, use it instead of the country
      const effectiveDestination = formData.specificCity && formData.specificCity !== "ANY"
        ? `${formData.specificCity}, ${formData.destination}`
        : formData.destination;

      const requestData = {
        destination: effectiveDestination,
        duration: calculateDurationInDays(startDate, endDate),
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        interests: selectedInterests,
        travelStyle: selectedInterests, // Use interests for travel style too
        budget: budget || 1000,
        adults: formData.adults || 2,
        children: formData.children || 0,
        tripType: formData.tripType || 'family',
      };
      
      console.log('Sending itinerary request with data:', requestData);
      
      const response = await apiRequest('/api/ai/itinerary', {
        method: 'POST',
        body: JSON.stringify({
          ...requestData,
          language: i18n.language,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Itinerary API error:', errorData);
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }
      
      const jsonData = await response.json();
      console.log('Received itinerary response:', jsonData);
      return jsonData as ItineraryDay[];
    },
    onSuccess: (data) => {
      setItinerary(data);
      setActiveTab("itinerary");
      toast({
        title: t('trips.itinerary_generated'),
        description: t('trips.itinerary_generated_desc', { count: data.length }),
      });
    },
    onError: (error) => {
      console.error('Error generating itinerary:', error);
      toast({
        title: t('common.error'),
        description: error?.message || t('trips.error_generating_itinerary'),
        variant: "destructive",
      });
    },
  });

  // Save trip suggestion mutation
  const saveTripMutation = useMutation({
    mutationFn: async (suggestion: TripSuggestion) => {
      if (!isAuthenticated) {
        throw new Error(t('trips.sign_in_required_save'));
      }
      
      const tripData = {
        title: `${suggestion.destination}, ${suggestion.country}`,
        destinations: JSON.stringify([{
          name: suggestion.destination,
          country: suggestion.country,
          description: suggestion.description,
          highlights: suggestion.highlights,
          bestTimeToVisit: suggestion.bestTimeToVisit
        }]),
        description: suggestion.description,
        budget: i18n.language === 'he' 
          ? `₪${Math.round(suggestion.estimatedBudget.low * USD_TO_ILS).toLocaleString('he-IL')} - ₪${Math.round(suggestion.estimatedBudget.high * USD_TO_ILS).toLocaleString('he-IL')}`
          : `$${suggestion.estimatedBudget.low.toLocaleString('en-US')} - $${suggestion.estimatedBudget.high.toLocaleString('en-US')}`,
        duration: suggestion.duration,
        travelStyle: suggestion.travelStyle.join(', '),
      };
      
      console.log('Saving trip with data:', tripData);
      
      const response = await apiRequest('/api/trips', {
        method: 'POST',
        body: JSON.stringify(tripData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Failed to save trip');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('trips.trip_saved'),
        description: t('trips.trip_saved_desc'),
      });
      // Refresh saved trips
      queryClient.invalidateQueries({ queryKey: ['/api/trips/user'] });
    },
    onError: (error) => {
      console.error('Error saving trip:', error);
      toast({
        title: t('common.error'),
        description: error.message || t('trips.error_saving_trip'),
        variant: "destructive",
      });
    },
  });

  // Delete trip mutation
  const deleteTripMutation = useMutation({
    mutationFn: async (tripId: number) => {
      const response = await apiRequest(`/api/trips/${tripId}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('trips.trip_deleted') || 'Trip deleted',
        description: t('trips.trip_deleted_desc') || 'Your trip has been deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/trips/user'] });
    },
    onError: (error) => {
      console.error('Error deleting trip:', error);
      toast({
        title: t('common.error'),
        description: t('trips.error_deleting_trip') || 'Failed to delete trip',
        variant: "destructive",
      });
    },
  });

  // Save itinerary mutation with Supabase
  const saveItineraryMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error(t('trips.sign_in_required_save'));
      }
      
      if (itinerary.length === 0) {
        throw new Error(t('trips.no_itinerary_to_save'));
      }
      
      const mainDestination = itinerary[0]?.location || t('common.unknown');
      const totalCost = itinerary.reduce((sum, day) => sum + day.estimatedCost, 0);
      
      const { data, error } = await supabase
        .from('itineraries')
        .insert({
          user_id: user.id,
          title: `${mainDestination} ${t('trips.itinerary')} - ${formatDate(new Date())}`,
          plan_json: {
            mainDestination,
            totalDays: itinerary.length,
            totalCost,
            generatedAt: new Date().toISOString(),
            itinerary: itinerary.map(day => ({
              day: day.day,
              location: day.location,
              activities: day.activities,
              estimatedCost: day.estimatedCost,
              tips: day.tips || []
            }))
          }
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Failed to save itinerary');
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: t('trips.itinerary_saved'),
        description: t('trips.itinerary_saved_desc'),
      });
      queryClient.invalidateQueries({ queryKey: ['my-itineraries'] });
    },
    onError: (error) => {
      console.error('Error saving itinerary:', error);
      toast({
        title: t('common.error'),
        description: error.message === t('trips.sign_in_required_save')
          ? t('trips.sign_in_required_save') 
          : t('trips.save_failed'),
        variant: "destructive",
      });
    },
  });

  // Fetch saved trips
  const { data: savedTrips = [], isLoading: isLoadingSavedTrips } = useQuery({
    queryKey: ['/api/trips/user'],
    queryFn: async () => {
      const response = await apiRequest('/api/trips/user');
      const data = await response.json() as SavedTrip[];
      console.log('[Trips] Fetched saved trips:', data.length, 'trips');
      return data;
    },
  });

  // State for translated trip content
  const [translatedTrips, setTranslatedTrips] = useState<Map<number, { title: string; description: string; highlights: string[] }>>(new Map());

  // Translate saved trips when language or trips change
  useEffect(() => {
    const translateTrips = async () => {
      if (!savedTrips.length) {
        console.log('[Translation] No saved trips to translate');
        return;
      }
      
      console.log(`[Translation] Starting translation for ${savedTrips.length} trips to ${i18n.language}`);
      const newTranslations = new Map<number, { title: string; description: string; highlights: string[] }>();
      
      // Translate all trips
      await Promise.all(
        savedTrips.map(async (trip) => {
          try {
            // Extract highlights from destinations
            let highlights: string[] = [];
            try {
              const destinations = typeof trip.destinations === 'string' 
                ? JSON.parse(trip.destinations) 
                : trip.destinations;
              if (Array.isArray(destinations) && destinations[0]) {
                highlights = destinations[0].highlights || [];
              }
            } catch (e) {
              // If parsing fails, highlights will remain empty
            }

            // Translate title, description, and highlights
            console.log(`[Translation] Translating trip ${trip.id}: "${trip.title}"`);
            const translatedTitle = await translateFullText(trip.title, i18n.language);
            const translatedDescription = await translateFullText(trip.description, i18n.language);
            console.log(`[Translation] Title translated: "${translatedTitle}"`);
            
            // Translate each highlight
            const translatedHighlights = await Promise.all(
              highlights.map(async (highlight) => {
                try {
                  const translated = await translateFullText(highlight, i18n.language);
                  console.log(`[Translation] Highlight: "${highlight}" → "${translated}"`);
                  return translated;
                } catch (error) {
                  console.error('Failed to translate highlight:', highlight, error);
                  return highlight; // Return original if translation fails
                }
              })
            );

            newTranslations.set(trip.id, {
              title: translatedTitle,
              description: translatedDescription,
              highlights: translatedHighlights
            });
            console.log(`[Translation] Completed translation for trip ${trip.id}`);
          } catch (error) {
            console.error('Failed to translate trip:', trip.id, error);
            // Keep original text if translation fails
            let highlights: string[] = [];
            try {
              const destinations = typeof trip.destinations === 'string' 
                ? JSON.parse(trip.destinations) 
                : trip.destinations;
              if (Array.isArray(destinations) && destinations[0]) {
                highlights = destinations[0].highlights || [];
              }
            } catch (e) {
              // ignore
            }
            newTranslations.set(trip.id, {
              title: trip.title,
              description: trip.description,
              highlights
            });
          }
        })
      );
      
      setTranslatedTrips(newTranslations);
    };
    
    translateTrips();
  }, [savedTrips, i18n.language]);

  const handleGenerateAITrips = async () => {
    try {
      const formData = form.getValues();
      console.log('Form data:', formData);
      console.log('Selected interests:', selectedInterests);
      console.log('Budget:', budget);
      console.log('Destinations:', destinations);
      
      // Validate at least one destination with country selected
      const validDestinations = destinations.filter(d => d.country);
      
      if (validDestinations.length === 0 || selectedInterests.length === 0) {
        console.log('Missing information check failed:', {
          validDestinations: validDestinations.length,
          interestsLength: selectedInterests.length
        });
        toast({
          title: t('trips.missing_info'),
          description: t('trips.missing_info_desc'),
          variant: "destructive",
        });
        return;
      }

      // Build destination string with all stops
      // Example: "Paris, France (01/05/2024 - 03/05/2024) → Rome, Italy (04/05/2024 - 08/05/2024)"
      const destinationString = validDestinations.map(dest => {
        const cityPart = dest.city ? `${dest.city}, ` : '';
        let datesPart = '';
        if (dest.startDate && dest.endDate) {
          const startFormatted = format(dest.startDate, i18n.language === 'he' ? "dd/MM/yyyy" : "PPP", { locale: i18n.language === 'he' ? he : enUS });
          const endFormatted = format(dest.endDate, i18n.language === 'he' ? "dd/MM/yyyy" : "PPP", { locale: i18n.language === 'he' ? he : enUS });
          datesPart = ` (${startFormatted} - ${endFormatted})`;
        }
        return `${cityPart}${dest.country}${datesPart}`;
      }).join(' → ');

      // Calculate total duration from all destinations
      const totalDays = getTotalDays();
      
      // Calculate overall trip dates from destinations
      const overallStartDate = getOverallStartDate();
      const overallEndDate = getOverallEndDate();

      const data = {
        ...formData,
        destinations: validDestinations,
        destination: destinationString, // Keep for backward compatibility
        travelStyle: selectedInterests,
        interests: selectedInterests,
        budget: budget,
        duration: totalDays,
        startDate: overallStartDate?.toISOString(),
        endDate: overallEndDate?.toISOString(),
      };

      console.log('Sending data to API:', data);
      setIsGenerating(true);
      
      // Use mutateAsync and wrap in try-catch to prevent unhandled rejection
      try {
        const result = await generateAISuggestionsMutation.mutateAsync(data);
        console.log('Mutation completed successfully:', result);
      } catch (mutationError) {
        console.error('Mutation failed:', mutationError);
        // Error is already handled in onError callback, no need to rethrow
      }
      
    } catch (error) {
      console.error('Error in handleGenerateAITrips:', error);
      setIsGenerating(false);
      toast({
        title: t('common.error'),
        description: t('trips.error_generating'),
        variant: "destructive",
      });
    }
  };

  const handleGenerateItinerary = async () => {
    try {
      setIsGeneratingItinerary(true);
      try {
        const result = await generateItineraryMutation.mutateAsync();
        console.log('Itinerary generation completed:', result);
      } catch (mutationError) {
        console.error('Itinerary mutation failed:', mutationError);
        // Error is handled in onError callback
      }
    } catch (error) {
      console.error('Error in handleGenerateItinerary:', error);
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  const handleGenerateItineraryForSuggestion = async (suggestion: TripSuggestion) => {
    try {
      setIsGeneratingItinerary(true);
      
      // Parse duration to get number of days
      const durationText = suggestion.duration.toLowerCase();
      let durationDays = 7; // default
      
      console.log('Parsing suggestion duration:', suggestion.duration);
      
      // Handle ranges like "20-25 days" or "2-3 weeks" (supports all dash types: - – —)
      const rangeMatch = durationText.match(/(\d+)\s*[-–—]\s*(\d+)/);
      if (rangeMatch) {
        const min = parseInt(rangeMatch[1]);
        const max = parseInt(rangeMatch[2]);
        
        console.log(`Found range: ${min}-${max}`);
        
        if (durationText.includes('week') || durationText.includes('שבוע')) {
          // Use the maximum number of weeks
          durationDays = max * 7;
          console.log(`Parsed as weeks: ${max} weeks = ${durationDays} days`);
        } else {
          // Use the maximum number of days
          durationDays = max;
          console.log(`Parsed as days: ${max} days`);
        }
      } else if (durationText.includes('week') || durationText.includes('שבוע')) {
        const weeks = parseInt(durationText) || 1;
        durationDays = weeks * 7;
        console.log(`Parsed single week value: ${weeks} weeks = ${durationDays} days`);
      } else if (durationText.includes('day') || durationText.includes('יום')) {
        durationDays = parseInt(durationText) || 7;
        console.log(`Parsed single day value: ${durationDays} days`);
      }
      
      console.log('Final duration in days:', durationDays);
      
      console.log('Generating itinerary for suggestion:', {
        destination: suggestion.destination,
        duration: durationDays,
        travelStyle: suggestion.travelStyle
      });
      
      const formData = form.getValues();
      const response = await apiRequest('/api/ai/itinerary', {
        method: 'POST',
        body: JSON.stringify({
          destination: suggestion.destination,
          duration: durationDays,
          interests: suggestion.highlights || [], // Use highlights as interests
          language: i18n.language,
          travelStyle: suggestion.travelStyle,
          budget: suggestion.estimatedBudget.low || 1000,
          adults: formData.adults || 2,
          children: formData.children || 0,
          tripType: formData.tripType || 'family',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Itinerary API error:', errorData);
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }
      
      const jsonData = await response.json();
      console.log('Received itinerary response:', jsonData);
      setItinerary(jsonData);
      setActiveTab('itinerary'); // Switch to itinerary tab
      
      toast({
        title: "Success!",
        description: `Generated ${durationDays}-day itinerary for ${suggestion.destination}`,
      });
      
    } catch (error) {
      console.error('Error generating itinerary for suggestion:', error);
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('trips.error_generating_itinerary'),
        variant: "destructive",
      });
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  const handleSaveItinerary = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    
    try {
      await saveItineraryMutation.mutateAsync();
    } catch (error) {
      console.error('Error saving itinerary:', error);
    }
  };

  // Handle auth modal Google sign-in
  const handleAuthModalSignIn = async () => {
    try {
      await signInWithGoogle();
      setIsAuthModalOpen(false);
      // Auto-save after successful login
      setTimeout(async () => {
        if (itinerary.length > 0) {
          await saveItineraryMutation.mutateAsync();
        }
      }, 1000);
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: t('auth.login_error'),
        description: t('auth.try_again_later'),
        variant: "destructive",
      });
    }
  };

  // Fetch saved itineraries from Supabase
  const { data: savedItineraries = [], isLoading: isLoadingItineraries } = useQuery({
    queryKey: ['my-itineraries'],
    queryFn: async () => {
      if (!isAuthenticated || !user) return [];
      
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching itineraries:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: isAuthenticated && !!user,
  });

  // Delete itinerary mutation
  const deleteItineraryMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isAuthenticated || !user) {
        throw new Error(t('auth.sign_in_required'));
      }
      
      const { error } = await supabase
        .from('itineraries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast({
        title: t('trips.deleted_successfully'),
        description: t('trips.itinerary_removed_from_list'),
      });
      queryClient.invalidateQueries({ queryKey: ['my-itineraries'] });
    },
    onError: (error) => {
      toast({
        title: t('trips.delete_error'),
        description: t('trips.failed_to_delete_try_again'),
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4">{t('trips.my_trip_planner')}</h1>
          <p className="text-lg text-gray-600">{t('trips.planner_subtitle')}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full sm:w-full justify-start sm:justify-evenly h-auto sm:h-10 gap-0.5 sm:gap-2 p-1">
              <TabsTrigger value="preferences" className="flex flex-col sm:flex-row items-center justify-center px-1 sm:px-4 py-1.5 sm:py-0 w-[19%] sm:w-auto h-auto sm:h-10" data-testid="tab-preferences">
                <Bot className="w-4 h-4 sm:mr-2 mb-0.5 sm:mb-0 flex-shrink-0" />
                <span className="text-[8px] sm:text-sm leading-[1.1] text-center w-full whitespace-normal break-words overflow-wrap-anywhere">{t('trips.preferences')}</span>
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="flex flex-col sm:flex-row items-center justify-center px-1 sm:px-4 py-1.5 sm:py-0 w-[19%] sm:w-auto h-auto sm:h-10" data-testid="tab-suggestions">
                <Sparkles className="w-4 h-4 sm:mr-2 mb-0.5 sm:mb-0 flex-shrink-0" />
                <span className="text-[8px] sm:text-sm leading-[1.1] text-center w-full whitespace-normal break-words overflow-wrap-anywhere">{t('trips.suggestions')}</span>
              </TabsTrigger>
              <TabsTrigger value="itinerary" className="flex flex-col sm:flex-row items-center justify-center px-1 sm:px-4 py-1.5 sm:py-0 w-[19%] sm:w-auto h-auto sm:h-10" data-testid="tab-itinerary">
                <Route className="w-4 h-4 sm:mr-2 mb-0.5 sm:mb-0 flex-shrink-0" />
                <span className="text-[8px] sm:text-sm leading-[1.1] text-center w-full whitespace-normal break-words overflow-wrap-anywhere">{t('trips.itinerary')}</span>
              </TabsTrigger>
              <TabsTrigger value="my-itineraries" className="flex flex-col sm:flex-row items-center justify-center px-1 sm:px-4 py-1.5 sm:py-0 w-[19%] sm:w-auto h-auto sm:h-10" data-testid="tab-my-itineraries">
                <Save className="w-4 h-4 sm:mr-2 mb-0.5 sm:mb-0 flex-shrink-0" />
                <span className="text-[8px] sm:text-sm leading-[1.1] text-center w-full whitespace-normal break-words overflow-wrap-anywhere">{t('trips.my_itineraries')}</span>
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex flex-col sm:flex-row items-center justify-center px-1 sm:px-4 py-1.5 sm:py-0 w-[19%] sm:w-auto h-auto sm:h-10" data-testid="tab-saved">
                <FolderOpen className="w-4 h-4 sm:mr-2 mb-0.5 sm:mb-0 flex-shrink-0" />
                <span className="text-[8px] sm:text-sm leading-[1.1] text-center w-full whitespace-normal break-words overflow-wrap-anywhere">{t('trips.saved_trips')}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Preferences */}
          <TabsContent value="preferences" className="mt-6">
            {/* Trip Type & Travelers Header */}
            <div className="mb-6">
              <div className="text-center mb-4">
                <h2 className={`text-2xl font-bold text-orange-500 mb-2 flex items-center gap-2 ${i18n.language === 'he' ? 'justify-center flex-row-reverse' : 'justify-center'}`}>
                  <Users className="w-6 h-6" />
                  {t('trips.travelers_and_trip_type')}
                </h2>
                <p className={`text-sm text-gray-600 ${i18n.language === 'he' ? 'text-center' : 'text-center'}`}>
                  {t('trips.travelers_and_trip_type_desc')}
                </p>
              </div>
              <Card className="shadow-lg bg-gradient-to-r from-orange-50 to-teal-50 border-none">
                <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Trip Type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 text-left block">
                      {t('trips.trip_type')}
                    </Label>
                    <Select 
                      value={tripType} 
                      onValueChange={(value) => {
                        setTripType(value);
                        form.setValue('tripType', value);
                      }}
                    >
                      <SelectTrigger className="w-full bg-white" data-testid="select-trip-type">
                        <SelectValue placeholder={t('trips.select_trip_type')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="family">{t('trips.trip_types.family')}</SelectItem>
                        <SelectItem value="couples">{t('trips.trip_types.couples')}</SelectItem>
                        <SelectItem value="bachelor_party">{t('trips.trip_types.bachelor_party')}</SelectItem>
                        <SelectItem value="bachelorette_party">{t('trips.trip_types.bachelorette_party')}</SelectItem>
                        <SelectItem value="friends">{t('trips.trip_types.friends')}</SelectItem>
                        <SelectItem value="solo">{t('trips.trip_types.solo')}</SelectItem>
                        <SelectItem value="business">{t('trips.trip_types.business')}</SelectItem>
                        <SelectItem value="adventure">{t('trips.trip_types.adventure')}</SelectItem>
                        <SelectItem value="romantic">{t('trips.trip_types.romantic')}</SelectItem>
                        <SelectItem value="group">{t('trips.trip_types.group')}</SelectItem>
                        <SelectItem value="honeymoon">{t('trips.trip_types.honeymoon')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Adults */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 text-left block">
                      {t('trips.adults')}
                    </Label>
                    <div className="flex items-center gap-3">
                      <Button 
                        type="button"
                        variant="outline" 
                        size="icon" 
                        className="h-10 w-10"
                        onClick={() => {
                          const current = form.watch('adults') || 2;
                          if (current > 1) form.setValue('adults', current - 1);
                        }}
                      >
                        -
                      </Button>
                      <div className="flex-1 text-center">
                        <span className="text-2xl font-bold text-orange-600">{form.watch('adults') || 2}</span>
                      </div>
                      <Button 
                        type="button"
                        variant="outline" 
                        size="icon" 
                        className="h-10 w-10"
                        onClick={() => {
                          const current = form.watch('adults') || 2;
                          if (current < 8) form.setValue('adults', current + 1);
                        }}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 text-left block">
                      {t('trips.children')}
                    </Label>
                    <div className="flex items-center gap-3">
                      <Button 
                        type="button"
                        variant="outline" 
                        size="icon" 
                        className="h-10 w-10"
                        onClick={() => {
                          const current = form.watch('children') || 0;
                          if (current > 0) form.setValue('children', current - 1);
                        }}
                      >
                        -
                      </Button>
                      <div className="flex-1 text-center">
                        <span className="text-2xl font-bold text-teal-600">{form.watch('children') || 0}</span>
                      </div>
                      <Button 
                        type="button"
                        variant="outline" 
                        size="icon" 
                        className="h-10 w-10"
                        onClick={() => {
                          const current = form.watch('children') || 0;
                          if (current < 10) form.setValue('children', current + 1);
                        }}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>

            <div className="text-center mb-4">
              <h2 className={`text-2xl font-bold text-orange-500 mb-2 flex items-center gap-2 ${i18n.language === 'he' ? 'justify-center flex-row-reverse' : 'justify-center'}`}>
                <Bot className="w-6 h-6" />
                {t('trips.trip_preferences')}
              </h2>
              <p className="text-sm text-gray-600">
                {t('trips.tell_us_preferences')}
              </p>
            </div>
            <Card className="shadow-lg bg-gradient-to-br from-orange-50 via-teal-50 to-blue-50 border-none">
              <CardContent className="space-y-6 p-6">
                {/* Multi-City Destinations */}
                <div className="space-y-4">
                  <div className={`flex items-center justify-between ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                    <Label className="text-sm font-medium text-slate-700">
                      {t('trips.select_destination')}
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDestination}
                      className={`flex items-center gap-2 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}
                      data-testid="add-destination"
                    >
                      <Plus className="w-4 h-4" />
                      {t('trips.add_destination')}
                    </Button>
                  </div>

                  {destinations.map((destination, index) => (
                    <Card key={index} className="p-4 bg-white border-2 border-blue-100">
                      <div className="space-y-4">
                        <div className={`flex items-center justify-between ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                          <h3 className="font-semibold text-blue-700">
                            {t('trips.destination_number', { number: index + 1 })}
                          </h3>
                          {destinations.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDestination(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              data-testid={`remove-destination-${index}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        {/* Country */}
                        <div className={`flex items-center gap-4 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                          <Label className={`text-sm text-slate-600 min-w-[180px] ${i18n.language === 'he' ? 'text-left' : 'text-right'}`}>
                            {t('trips.select_country')}
                          </Label>
                          <Select
                            value={destination.country}
                            onValueChange={(value) => {
                              updateDestination(index, 'country', value);
                              // Reset search when country is selected
                              const newSearchValues = [...countrySearchValues];
                              newSearchValues[index] = "";
                              setCountrySearchValues(newSearchValues);
                            }}
                          >
                            <SelectTrigger data-testid={`select-country-${index}`} className="flex-1">
                              <SelectValue placeholder={t('trips.select_country')} />
                            </SelectTrigger>
                            <SelectContent position="popper" className="max-h-[300px]">
                              <div className="px-2 pb-2 sticky top-0 bg-white z-10 border-b">
                                <Input
                                  placeholder={t('common.search')}
                                  className="h-8"
                                  value={countrySearchValues[index] || ""}
                                  onChange={(e) => {
                                    const newSearchValues = [...countrySearchValues];
                                    newSearchValues[index] = e.target.value;
                                    setCountrySearchValues(newSearchValues);
                                  }}
                                  onKeyDown={(e) => {
                                    e.stopPropagation();
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  autoFocus
                                />
                              </div>
                              {Object.keys(getWorldDestinations())
                                .filter((country) => {
                                  const searchValue = (countrySearchValues[index] || "").toLowerCase();
                                  if (!searchValue) return true;
                                  const translatedCountry = t(`trips.countries.${country}`) || country;
                                  return translatedCountry.toLowerCase().includes(searchValue) || 
                                         country.toLowerCase().includes(searchValue);
                                })
                                .map((country) => (
                                  <SelectItem key={country} value={country}>
                                    {t(`trips.countries.${country}`) || country}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* City */}
                        <div className={`flex items-center gap-4 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                          <Label className={`text-sm text-slate-600 min-w-[180px] ${i18n.language === 'he' ? 'text-left' : 'text-right'}`}>
                            {t('trips.select_specific_city')} ({t('trips.optional')})
                          </Label>
                          <Select
                            value={destination.city || ""}
                            onValueChange={(value) => {
                              updateDestination(index, 'city', value);
                              // Reset search when city is selected
                              const newSearchValues = [...citySearchValues];
                              newSearchValues[index] = "";
                              setCitySearchValues(newSearchValues);
                            }}
                            disabled={!destination.country}
                          >
                            <SelectTrigger data-testid={`select-city-${index}`} className="flex-1">
                              <SelectValue placeholder={t('trips.choose_city')} />
                            </SelectTrigger>
                            <SelectContent position="popper" className="max-h-[300px]">
                              <div className="px-2 pb-2 sticky top-0 bg-white z-10 border-b">
                                <Input
                                  placeholder={t('common.search')}
                                  className="h-8"
                                  value={citySearchValues[index] || ""}
                                  onChange={(e) => {
                                    const newSearchValues = [...citySearchValues];
                                    newSearchValues[index] = e.target.value;
                                    setCitySearchValues(newSearchValues);
                                  }}
                                  onKeyDown={(e) => {
                                    e.stopPropagation();
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  autoFocus
                                />
                              </div>
                              {destination.country && getWorldDestinations()[destination.country]
                                ?.filter((city: string) => {
                                  const searchValue = (citySearchValues[index] || "").toLowerCase();
                                  if (!searchValue) return true;
                                  const translatedCity = translateCity(city);
                                  return translatedCity.toLowerCase().includes(searchValue) || 
                                         city.toLowerCase().includes(searchValue);
                                })
                                .map((city: string) => (
                                  <SelectItem key={city} value={city}>
                                    {translateCity(city)}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* In Hebrew, show End Date first (on the right), otherwise Start Date first (on the left) */}
                          {i18n.language === 'he' ? (
                            <>
                              {/* End Date */}
                              <div className="flex items-center gap-4 flex-row-reverse">
                                <Label className="text-sm text-slate-600 min-w-[100px] text-left">
                                  {t('trips.end_date')}
                                </Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={`flex-1 font-normal ${!destination.endDate && "text-muted-foreground"} justify-start flex-row-reverse text-left`}
                                      data-testid={`select-end-date-${index}`}
                                    >
                                      {destination.endDate ? format(destination.endDate, "dd/MM/yyyy", { locale: he }) : <span>{t('trips.select_end_date')}</span>}
                                      <Calendar className="h-4 w-4 ml-2 flex-shrink-0" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent
                                      mode="single"
                                      selected={destination.endDate}
                                      onSelect={(date) => updateDestination(index, 'endDate', date)}
                                      disabled={(date) => date < new Date() || (destination.startDate && date < destination.startDate)}
                                      initialFocus
                                      locale={he}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              {/* Start Date */}
                              <div className="flex items-center gap-4 flex-row-reverse">
                                <Label className="text-sm text-slate-600 min-w-[100px] text-left">
                                  {t('trips.start_date')}
                                </Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={`flex-1 font-normal ${!destination.startDate && "text-muted-foreground"} justify-start flex-row-reverse text-left`}
                                      data-testid={`select-start-date-${index}`}
                                    >
                                      {destination.startDate ? format(destination.startDate, "dd/MM/yyyy", { locale: he }) : <span>{t('trips.select_start_date')}</span>}
                                      <Calendar className="h-4 w-4 ml-2 flex-shrink-0" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent
                                      mode="single"
                                      selected={destination.startDate}
                                      onSelect={(date) => updateDestination(index, 'startDate', date)}
                                      disabled={(date) => date < new Date() || (destination.endDate && date > destination.endDate)}
                                      initialFocus
                                      locale={he}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Start Date */}
                              <div className="flex items-center gap-4">
                                <Label className="text-sm text-slate-600 min-w-[100px] text-right">
                                  {t('trips.start_date')}
                                </Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={`flex-1 font-normal ${!destination.startDate && "text-muted-foreground"} justify-start text-left`}
                                      data-testid={`select-start-date-${index}`}
                                    >
                                      {destination.startDate ? format(destination.startDate, "PPP", { locale: enUS }) : <span>{t('trips.select_start_date')}</span>}
                                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent
                                      mode="single"
                                      selected={destination.startDate}
                                      onSelect={(date) => updateDestination(index, 'startDate', date)}
                                      disabled={(date) => date < new Date() || (destination.endDate && date > destination.endDate)}
                                      initialFocus
                                      locale={enUS}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              {/* End Date */}
                              <div className="flex items-center gap-4">
                                <Label className="text-sm text-slate-600 min-w-[100px] text-right">
                                  {t('trips.end_date')}
                                </Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={`flex-1 font-normal ${!destination.endDate && "text-muted-foreground"} justify-start text-left`}
                                      data-testid={`select-end-date-${index}`}
                                    >
                                      {destination.endDate ? format(destination.endDate, "PPP", { locale: enUS }) : <span>{t('trips.select_end_date')}</span>}
                                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent
                                      mode="single"
                                      selected={destination.endDate}
                                      onSelect={(date) => updateDestination(index, 'endDate', date)}
                                      disabled={(date) => date < new Date() || (destination.startDate && date < destination.startDate)}
                                      initialFocus
                                      locale={enUS}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}

                  {/* Total Days Summary */}
                  <div className={`p-3 bg-blue-50 rounded-lg ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}>
                    <p className="text-sm font-semibold text-blue-800">
                      {t('trips.total_trip_duration')}: {getTotalDays()} {t('trips.days')}
                    </p>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <Label className={`text-sm font-medium text-slate-700 mb-2 block ${i18n.language === 'he' ? 'text-left' : ''}`}>
                    {t('trips.budget_range')}
                  </Label>
                  <p className="text-xs text-gray-500 mb-3 text-left">
                    {i18n.language === 'he' 
                      ? 'כולל טיסות, לינה, אוכל, פעילויות ותחבורה'
                      : 'Includes flights, accommodation, food, activities and transportation'}
                  </p>
                  <div className="px-4">
                    <Slider
                      value={budgetSliderValue}
                      onValueChange={(value) => {
                        setBudgetSliderValue(value);
                        const actualBudget = logToLinear(value[0]);
                        form.setValue('budget', actualBudget);
                      }}
                      max={100}
                      min={0}
                      step={1}
                      className="mb-4"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{i18n.language === 'he' ? `₪${MIN_BUDGET.toLocaleString('he-IL')}` : `$${MIN_BUDGET.toLocaleString('en-US')}`}</span>
                      <span className="text-orange-500 font-bold text-xl">
                        {i18n.language === 'he' 
                          ? `₪${budget.toLocaleString('he-IL')}` 
                          : `$${budget.toLocaleString('en-US')}`}
                      </span>
                      <span>{i18n.language === 'he' ? `₪${MAX_BUDGET.toLocaleString('he-IL')}+` : `$${MAX_BUDGET.toLocaleString('en-US')}+`}</span>
                    </div>
                  </div>
                </div>

                {/* Interests (Combined Travel Styles + Interests) */}
                <div>
                  <Label className={`text-sm font-medium text-slate-700 mb-2 block ${i18n.language === 'he' ? 'text-left' : ''}`}>
                    {t('trips.interests')} <span className="text-xs text-gray-500">({t('trips.select_multiple')})</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2">
                    {ALL_INTERESTS.map((interest) => (
                      <div
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`p-4 rounded-lg border transition cursor-pointer min-h-[4rem] flex items-center ${
                          selectedInterests.includes(interest.id)
                            ? 'border-orange-500 bg-gradient-to-br from-orange-50 via-teal-50 to-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-gradient-to-br hover:from-orange-50/50 hover:via-teal-50/50 hover:to-blue-50/50 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-orange-400'
                        }`}
                      >
                        <div className={`flex items-center gap-3 w-full ${i18n.language === 'he' ? 'flex-row-reverse text-right' : ''}`}>
                          <interest.icon className="w-5 h-5 flex-shrink-0 text-orange-500" />
                          <p className="text-base font-medium leading-relaxed">{interest.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={handleGenerateAITrips}
                  disabled={isGenerating}
                  className="w-full h-12 text-lg font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
{t('trips.generating_perfect_trip')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
{t('trips.generate_ai_suggestions')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Suggestions */}
          <TabsContent value="suggestions" className="mt-6">
            <div className="text-center mb-4">
              <h2 className={`text-2xl font-bold text-orange-500 mb-2 flex items-center gap-2 ${i18n.language === 'he' ? 'justify-center flex-row-reverse' : 'justify-center'}`}>
                <Sparkles className="w-6 h-6" />
                {t('trips.ai_trip_suggestions')}
              </h2>
              <p className="text-sm text-gray-600">
                {t('trips.personalized_recommendations')}
              </p>
            </div>
            <Card className="shadow-lg bg-gradient-to-br from-orange-50 via-teal-50 to-blue-50 border-none">
              <CardContent>
                {isGenerating && (
                  <div className="py-8">
                    {i18n.language === 'he' ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-lg font-medium text-gray-700" dir="rtl">{t('trips.generating_perfect_trip')}</span>
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                        <p className="text-sm text-gray-500 text-center">זה עשוי לקחת כמה רגעים</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-12 h-12 mb-2 animate-spin text-primary" />
                        <p className="text-lg font-medium text-gray-700">Creating your perfect trip...</p>
                        <p className="text-sm text-gray-500">This may take a few moments</p>
                      </div>
                    )}
                  </div>
                )}

                {aiSuggestions.length === 0 && !isGenerating && (
                  <div className="text-center py-8">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-700 mb-2">{t('trips.no_suggestions_generated')}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {t('trips.create_suggestions_first')}
                    </p>
                    <Button onClick={() => setActiveTab("preferences")} variant="outline">
                      <Bot className="w-4 h-4 mr-2" />
                      {t('trips.go_to_preferences')}
                    </Button>
                  </div>
                )}

                {aiSuggestions.length > 0 && !isGenerating && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Button 
                        onClick={handleGenerateItinerary}
                        disabled={isGeneratingItinerary}
                        variant="outline"
                        size="sm"
                      >
                        {isGeneratingItinerary ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Route className="w-4 h-4 mr-2" />
                        )}
{t('trips.generate_itinerary')}
                      </Button>
                      <p className="text-sm text-gray-600">
{t('trips.found_suggestions', { count: aiSuggestions.length })}
                      </p>
                    </div>

                    {aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4 text-left" dir="ltr" data-testid={`suggestion-card-${index}`}>
                        <div>
                          <h3 className="text-xl font-bold text-slate-700 mb-1 text-left">
                            {translateCity(suggestion.destination)}, {translateCountry(suggestion.country)}
                          </h3>
                          <p className="text-gray-600 leading-relaxed text-left">
                            {suggestion.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex flex-col gap-2 items-end">
                              <div className="flex items-center flex-row-reverse gap-1">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span className="font-semibold text-blue-800 text-sm">{t('trips.duration')}</span>
                              </div>
                              {suggestion.startDate && suggestion.endDate ? (
                                <p className="text-blue-700 text-sm text-right">
                                  {format(new Date(suggestion.startDate), i18n.language === 'he' ? "dd/MM/yyyy" : "PPP", { locale: i18n.language === 'he' ? he : enUS })}
                                  {' - '}
                                  {format(new Date(suggestion.endDate), i18n.language === 'he' ? "dd/MM/yyyy" : "PPP", { locale: i18n.language === 'he' ? he : enUS })}
                                </p>
                              ) : (
                                <p className="text-blue-700 text-sm text-right">{suggestion.duration}</p>
                              )}
                            </div>
                          </div>

                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex flex-col gap-2 items-end">
                              <div className="flex items-center flex-row-reverse gap-1">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="font-semibold text-green-800 text-sm">{t('trips.budget')}</span>
                              </div>
                              <p className="text-green-700 text-sm font-bold text-right">
                                {i18n.language === 'he' 
                                  ? `₪${Math.round(suggestion.estimatedBudget.low * USD_TO_ILS).toLocaleString('he-IL')} - ₪${Math.round(suggestion.estimatedBudget.high * USD_TO_ILS).toLocaleString('he-IL')}`
                                  : `$${suggestion.estimatedBudget.low.toLocaleString('en-US')} - $${suggestion.estimatedBudget.high.toLocaleString('en-US')}`}
                              </p>
                            </div>
                          </div>

                          <div className="bg-orange-50 p-3 rounded-lg">
                            <div className="flex flex-col gap-2 items-end">
                              <div className="flex items-center flex-row-reverse gap-1">
                                <Calendar className="w-4 h-4 text-orange-600" />
                                <span className="font-semibold text-orange-800 text-sm">{t('trips.best_time_to_visit')}</span>
                              </div>
                              <p className="text-orange-700 text-sm text-right">{translateBestTime(suggestion.bestTimeToVisit, i18n.language)}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex flex-col gap-2 items-end">
                            <div className="flex items-center flex-row-reverse gap-2">
                              <Star className="w-4 h-4 text-yellow-600" />
                              <span className="font-semibold text-gray-800 text-sm">{t('trips.highlights')}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 w-full">
                              {suggestion.highlights.map((highlight, idx) => (
                                <div key={idx} className="flex items-center text-sm text-gray-700 text-right flex-row-reverse gap-2">
                                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                  <span>{translateText(highlight, i18n.language)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Multi-City Destination Breakdown */}
                        {suggestion.destinationBreakdown && suggestion.destinationBreakdown.length > 0 && (
                          <div className="space-y-4 border-t pt-4">
                            <div className={`flex items-center gap-2 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                              <MapPin className="w-5 h-5 text-purple-600" />
                              <h4 className="font-semibold text-gray-800">{t('trips.destination_breakdown')}</h4>
                            </div>
                            {suggestion.destinationBreakdown.map((dest, idx) => (
                              <div key={idx} className="bg-purple-50 p-4 rounded-lg space-y-2" dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>
                                <div>
                                  <h5 className="font-bold text-purple-900">
                                    {translateCity(dest.destination)}, {translateCountry(dest.country)}
                                  </h5>
                                  {dest.dateRange && (
                                    <p className="text-sm text-purple-700">{formatDateRange(dest.dateRange, i18n.language)}</p>
                                  )}
                                  <p className="text-sm text-purple-600">{dest.duration}</p>
                                </div>
                                <p className="text-sm text-gray-700">{dest.description}</p>
                                <div className="space-y-1">
                                  {dest.highlights.map((highlight, hIdx) => (
                                    <div key={hIdx} className="flex items-center text-sm text-gray-700 gap-2">
                                      <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></span>
                                      <span>{translateText(highlight, i18n.language)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Transportation Recommendations */}
                        {suggestion.transportation && suggestion.transportation.length > 0 && (
                          <div className="space-y-4 border-t pt-4">
                            <div className={`flex items-center gap-2 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                              <Plane className="w-5 h-5 text-blue-600" />
                              <h4 className="font-semibold text-gray-800">{t('trips.transportation')}</h4>
                            </div>
                            {suggestion.transportation.map((transport, idx) => (
                              <div key={idx} className="bg-blue-50 p-4 rounded-lg space-y-2" dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>
                                <div>
                                  <h5 className="font-bold text-blue-900" dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>
                                    {translateCity(transport.from)} {i18n.language === 'he' ? '←' : '→'} {translateCity(transport.to)}
                                  </h5>
                                  <div className="space-y-1 mt-2">
                                    {transport.estimatedCost && (
                                      <p className="text-sm text-blue-700">{t('trips.cost')}: {transport.estimatedCost}</p>
                                    )}
                                    {transport.estimatedTime && (
                                      <p className="text-sm text-blue-700">{t('trips.time')}: {transport.estimatedTime}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  {transport.recommendations.map((rec, rIdx) => (
                                    <div key={rIdx} className="flex items-center text-sm text-gray-700 gap-2">
                                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                      <span>{rec}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

{/* Temporarily disabled RealPlaceLinks to debug
                        {suggestion.realPlaces && suggestion.realPlaces.length > 0 && (
                          <RealPlaceLinks 
                            suggestion={suggestion}
                          />
                        )}
                        */}

                        <div className="flex flex-wrap gap-2 mb-4 justify-end">
                          {suggestion.travelStyle.map((style) => {
                            const interestConfig = ALL_INTERESTS.find(int => int.id === style.trim().toLowerCase());
                            return (
                              <Badge key={style} variant="secondary" className="text-xs">
                                {interestConfig ? interestConfig.label : style}
                              </Badge>
                            );
                          })}
                        </div>

                        <div className="flex items-center pt-4 border-t justify-between">
                          <Button 
                            onClick={() => handleGenerateItineraryForSuggestion(suggestion)}
                            disabled={isGeneratingItinerary}
                            variant="outline"
                            size="sm"
                            data-testid={`button-generate-itinerary-${index}`}
                          >
                            {isGeneratingItinerary ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Route className="w-4 h-4 mr-2" />
                            )}
{t('trips.generate_daily_itinerary')}
                          </Button>
                          
                          <Button 
                            onClick={() => saveTripMutation.mutate(suggestion)}
                            disabled={saveTripMutation.isPending}
                            variant="default"
                            size="sm"
                            data-testid={`button-save-trip-${index}`}
                          >
                            {saveTripMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Heart className="w-4 h-4 mr-2" />
                            )}
                            {t('trips.save_trip')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Itinerary */}
          <TabsContent value="itinerary" className="mt-6">
            <div className="text-center mb-4">
              <h2 className={`text-2xl font-bold text-orange-500 mb-2 flex items-center gap-2 ${i18n.language === 'he' ? 'justify-center flex-row-reverse' : 'justify-center'}`}>
                <Route className="w-6 h-6" />
                {t('trips.daily_itinerary')}
              </h2>
              <p className="text-sm text-gray-600">
                {t('trips.detailed_day_by_day_plan')}
              </p>
            </div>
            <Card className="shadow-lg bg-gradient-to-br from-orange-50 via-teal-50 to-blue-50 border-none">
              <CardContent>
                {isGeneratingItinerary && (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-lg font-medium text-gray-700">Creating your detailed itinerary...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                  </div>
                )}

                {itinerary.length === 0 && !isGeneratingItinerary && (
                  <div className="text-center py-8">
                    <Route className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-700 mb-2">{t('trips.no_itinerary_generated')}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {t('trips.generate_suggestions_first')}
                    </p>
                    <Button onClick={handleGenerateItinerary} variant="outline">
                      <Route className="w-4 h-4 mr-2" />
                      {t('trips.generate_itinerary')}
                    </Button>
                  </div>
                )}

                {itinerary.length > 0 && !isGeneratingItinerary && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-700">{t('trips.your_day_by_day_itinerary')}</h3>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                onClick={handleSaveItinerary}
                                disabled={saveItineraryMutation.isPending}
                                variant="default"
                                size="sm"
                              >
                                {saveItineraryMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Heart className="w-4 h-4 mr-2" />
                                )}
                                {t('trips.save_itinerary')}
                              </Button>
                            </TooltipTrigger>
                            {!isAuthenticated && (
                              <TooltipContent>
                                <p>{t('auth.need_to_sign_in_to_save')}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                        <Button onClick={handleGenerateItinerary} variant="outline" size="sm">
                          <Route className="w-4 h-4 mr-2" />
                          {t('trips.generate_new')}
                        </Button>
                      </div>
                    </div>
                    
                    {itinerary.map((day) => (
                      <Card key={day.day} className={`${i18n.language === 'he' ? 'border-r-4 border-r-primary' : 'border-l-4 border-l-primary'} ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}>
                        <CardHeader className="pb-3">
                          <CardTitle className={`flex items-center text-lg ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                            <Calendar className={`w-5 h-5 text-primary ${i18n.language === 'he' ? 'ml-2' : 'mr-2'}`} />
{t('trips.day')} {day.day} – {translateCity(day.location)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Activities */}
                          <div>
                            <div className={`flex items-center mb-2 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                              <ListChecks className={`w-4 h-4 text-blue-600 ${i18n.language === 'he' ? 'ml-2' : 'mr-2'}`} />
                              <span className="font-semibold text-blue-800 text-sm">{t('trips.activities')}</span>
                            </div>
                            <ul className="space-y-1">
                              {day.activities.map((activity, idx) => (
                                <li key={idx} className={`text-sm text-gray-700 flex items-start ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                                  <span className={`w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0 ${i18n.language === 'he' ? 'ml-3' : 'mr-3'}`}></span>
                                  <span dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>{activity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Cost */}
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className={`flex items-center mb-1 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                              <DollarSign className={`w-4 h-4 text-green-600 ${i18n.language === 'he' ? 'ml-2' : 'mr-2'}`} />
                              <span className="font-semibold text-green-800 text-sm">{t('trips.estimated_cost')}</span>
                            </div>
                            <p className="text-green-700 font-bold text-left">
                              {i18n.language === 'he' 
                                ? `₪${Math.round(day.estimatedCost * USD_TO_ILS).toLocaleString('he-IL')}` 
                                : `$${day.estimatedCost.toLocaleString('en-US')}`}
                            </p>
                          </div>

                          {/* Tips */}
                          <div>
                            <div className={`flex items-center mb-2 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                              <Lightbulb className={`w-4 h-4 text-yellow-600 ${i18n.language === 'he' ? 'ml-2' : 'mr-2'}`} />
                              <span className="font-semibold text-yellow-800 text-sm">{t('trips.local_tips')}</span>
                            </div>
                            <ul className="space-y-1">
                              {day.tips.map((tip, idx) => (
                                <li key={idx} className={`text-sm text-gray-700 flex items-start ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                                  <span className={`w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0 ${i18n.language === 'he' ? 'ml-3' : 'mr-3'}`}></span>
                                  <span dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: My Itineraries */}
          <TabsContent value="my-itineraries" className="mt-6">
            <div className="text-center mb-4">
              <h2 className={`text-2xl font-bold text-orange-500 mb-2 flex items-center gap-2 ${i18n.language === 'he' ? 'justify-center flex-row-reverse' : 'justify-center'}`}>
                <Save className="w-6 h-6" />
                {t('trips.my_saved_itineraries')}
              </h2>
              <p className="text-sm text-gray-600">
                {t('trips.view_manage_itineraries')}
              </p>
            </div>
            <Card className="shadow-lg bg-gradient-to-br from-orange-50 via-teal-50 to-blue-50 border-none">
              <CardContent>
                {!isAuthenticated ? (
                  <div className="text-center py-8">
                    <Save className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-700 mb-2">{t('auth.sign_in_to_view_itineraries')}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {t('auth.need_to_sign_in_to_access')}
                    </p>
                    <Button onClick={() => signInWithGoogle()} variant="outline">
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      {t('auth.sign_in_with_google')}
                    </Button>
                  </div>
                ) : isLoadingItineraries ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
                    <p className="text-sm text-gray-600">{t('trips.loading_saved_itineraries')}</p>
                  </div>
                ) : savedItineraries.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Save className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 mb-2">{t('auth.no_saved_itineraries_yet')}</p>
                    <p className="text-sm text-gray-500 mb-4">{t('auth.saved_itineraries_will_appear_here')}</p>
                    <Button onClick={() => setActiveTab("itinerary")} variant="outline">
                      <Route className="w-4 h-4 mr-2" />
                      {t('auth.create_new_itinerary')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 p-4 rounded-lg text-center">
                      <p className="text-lg font-semibold text-gray-800 flex items-center gap-2 justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        {t('trips.you_have_count_itineraries', { count: savedItineraries.length })}
                      </p>
                    </div>

                    {savedItineraries.map((itinerary) => {
                      const planData = itinerary.plan_json as any;
                      return (
                        <Card key={itinerary.id} className={`group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-white shadow-lg ${i18n.language === 'he' ? 'border-r-4 border-r-purple-500' : 'border-l-4 border-l-purple-500'}`}>
                          <CardContent className="p-6">
                            <div className="flex flex-col gap-4">
                              {/* Header with title and delete button */}
                              <div className={`flex items-start justify-between gap-8 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                                <div className={`flex-1 min-w-0 flex flex-col gap-2 ${i18n.language === 'he' ? 'items-end' : 'items-start'}`}>
                                  <Link href={`/itineraries/${itinerary.id}`} className="hover:text-purple-600 transition-colors">
                                    <h3 className={`text-2xl font-bold text-gray-900 hover:text-purple-600 transition-colors ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}>
                                      {itinerary.title}
                                    </h3>
                                  </Link>
                                  <p className={`text-sm text-gray-500 ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}>
                                    {t('common.created')} {formatDate(new Date(itinerary.created_at))}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteItineraryMutation.mutate(itinerary.id)}
                                  disabled={deleteItineraryMutation.isPending}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                >
                                  {deleteItineraryMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>

                              {/* Info Grid */}
                              <div className="grid grid-cols-3 gap-4">
                                <div className="bg-purple-50 p-4 rounded-lg">
                                  <div className={`flex flex-col gap-2 ${i18n.language === 'he' ? 'items-end' : 'items-start'}`}>
                                    <div className={`flex items-center gap-2 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                                      <MapPin className="w-5 h-5 text-purple-600" />
                                      <span className={`font-semibold text-purple-800 text-sm ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}>
                                        {t('trips.destination')}
                                      </span>
                                    </div>
                                    <p className={`text-purple-700 font-medium text-sm ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}>
                                      {planData?.mainDestination || t('trips.unknown_destination')}
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <div className={`flex flex-col gap-2 ${i18n.language === 'he' ? 'items-end' : 'items-start'}`}>
                                    <div className={`flex items-center gap-2 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                                      <Calendar className="w-5 h-5 text-blue-600" />
                                      <span className={`font-semibold text-blue-800 text-sm ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}>
                                        {t('trips.duration')}
                                      </span>
                                    </div>
                                    <p 
                                      className={`text-blue-700 font-medium ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}
                                      dir={i18n.language === 'he' ? 'rtl' : 'ltr'}
                                      style={i18n.language === 'he' ? { unicodeBidi: 'plaintext' } : undefined}
                                    >
                                      {t('trips.days_count', { count: planData?.totalDays || 0 })}
                                    </p>
                                  </div>
                                </div>

                                {planData?.totalCost && (
                                  <div className="bg-green-50 p-4 rounded-lg">
                                    <div className={`flex flex-col gap-2 ${i18n.language === 'he' ? 'items-end' : 'items-start'}`}>
                                      <div className={`flex items-center gap-2 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                        <span className={`font-semibold text-green-800 text-sm ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}>
                                          {t('trips.estimated_cost')}
                                        </span>
                                      </div>
                                      <p className={`text-green-700 font-medium text-sm ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}>
                                        {i18n.language === 'he' 
                                          ? `₪${Math.round(planData.totalCost * USD_TO_ILS).toLocaleString('he-IL')}` 
                                          : `$${planData.totalCost.toLocaleString('en-US')}`}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Days Preview */}
                              {planData?.itinerary && planData.itinerary.length > 0 && (
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
                                  <div className={`flex flex-col gap-2 ${i18n.language === 'he' ? 'items-end' : 'items-start'}`}>
                                    <div className={`flex items-center gap-2 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                                      <Route className="w-4 h-4 text-gray-600" />
                                      <span 
                                        className={`font-semibold text-gray-800 ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}
                                        dir={i18n.language === 'he' ? 'rtl' : 'ltr'}
                                      >
                                        {t('trips.activity_days_count', { count: planData.itinerary.length })}
                                      </span>
                                    </div>
                                  </div>
                                  <div className={`space-y-2 mt-3 ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}>
                                    {planData.itinerary.slice(0, 2).map((day: any, idx: number) => (
                                      <div key={idx} className={`flex items-center gap-2 text-sm text-gray-700 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                                        <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></span>
                                        <span className={i18n.language === 'he' ? 'text-right' : 'text-left'}>
                                          {t('trips.day_number', { day: day.day })}: {day.location}
                                        </span>
                                      </div>
                                    ))}
                                    {planData.itinerary.length > 2 && (
                                      <div className={`flex items-center gap-2 text-xs text-gray-500 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                                        <span className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></span>
                                        <span 
                                          className={i18n.language === 'he' ? 'text-right' : 'text-left'}
                                          dir={i18n.language === 'he' ? 'rtl' : 'ltr'}
                                        >
                                          {t('trips.and_more_days', { count: planData.itinerary.length - 2 })}...
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: My Trips */}
          <TabsContent value="saved" className="mt-6">
            <div className="text-center mb-4">
              <h2 className={`text-2xl font-bold text-orange-500 mb-2 flex items-center gap-2 ${i18n.language === 'he' ? 'justify-center flex-row-reverse' : 'justify-center'}`}>
                <FolderOpen className="w-6 h-6" />
                {t('trips.my_saved_trips')}
              </h2>
              <p className="text-sm text-gray-600">
                {t('trips.view_manage_trips')}
              </p>
            </div>
            <Card className="shadow-lg bg-gradient-to-br from-orange-50 via-teal-50 to-blue-50 border-none">
              <CardContent>
                {isLoadingSavedTrips && (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-lg font-medium text-gray-700">{t('trips.loading_trips')}</p>
                  </div>
                )}

                {savedTrips.length === 0 && !isLoadingSavedTrips && (
                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-700 mb-2">{t('trips.no_saved_trips')}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {t('trips.create_first_trip_ai')}
                    </p>
                    <Button onClick={() => setActiveTab("preferences")} variant="outline">
                      <Bot className="w-4 h-4 mr-2" />
                      {t('trips.start_planning')}
                    </Button>
                  </div>
                )}

                {savedTrips.length > 0 && !isLoadingSavedTrips && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-4 rounded-lg mb-6 text-center">
                      <p className="text-lg font-semibold text-gray-800 flex items-center gap-2 justify-center">
                        <Heart className="w-5 h-5 text-orange-600" />
                        {t('trips.you_have_trips', { count: savedTrips.length })}
                      </p>
                    </div>

                    {savedTrips.map((trip) => {
                      // Parse destinations to extract highlights and bestTimeToVisit
                      let highlights: string[] = [];
                      let bestTimeToVisit: string = '';
                      try {
                        const destinations = typeof trip.destinations === 'string' 
                          ? JSON.parse(trip.destinations) 
                          : trip.destinations;
                        if (Array.isArray(destinations) && destinations[0]) {
                          highlights = destinations[0].highlights || [];
                          bestTimeToVisit = destinations[0].bestTimeToVisit || '';
                        }
                      } catch (e) {
                        // If parsing fails, highlights will remain empty
                      }

                      return (
                        <Card 
                          key={trip.id}
                          id={`trip-${trip.id}`}
                          className={`group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-white shadow-lg ${i18n.language === 'he' ? 'border-r-4 border-r-orange-500' : 'border-l-4 border-l-orange-500'}`}
                          data-testid={`card-saved-trip-${trip.id}`}
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col gap-4">
                              {/* Header with title, subtitle, description, and budget */}
                              <div className={`flex items-start justify-between gap-8 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                                <div className={`flex-1 min-w-0 flex flex-col gap-2 ${i18n.language === 'he' ? 'items-end' : 'items-start'}`}>
                                  <h3 className={`text-2xl font-bold text-gray-900 ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}>
                                    {translatedTrips.get(trip.id)?.title || trip.title}
                                  </h3>
                                  <div className={`flex items-center gap-2 text-gray-600 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                                    <MapPin className="w-4 h-4 flex-shrink-0 text-orange-500" />
                                    <span className={i18n.language === 'he' ? 'text-right' : 'text-left'}>{typeof trip.destinations === 'object' && trip.destinations?.name ? trip.destinations.name : t('trips.multiple_destinations')}</span>
                                  </div>
                                  <p 
                                    className={`text-gray-600 leading-relaxed ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}
                                    dir={i18n.language === 'he' ? 'rtl' : 'ltr'}
                                    style={i18n.language === 'he' ? { unicodeBidi: 'plaintext', textAlign: 'right', width: '100%' } : undefined}
                                  >
                                    {normalizeRtlText(translatedTrips.get(trip.id)?.description || trip.description, i18n.language === 'he')}
                                  </p>
                                </div>
                                <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-lg text-base px-4 py-2 whitespace-nowrap flex-shrink-0">
                                  {i18n.language === 'he' 
                                    ? `₪${Math.round(parseFloat(trip.budget) * USD_TO_ILS).toLocaleString('he-IL')}`
                                    : `$${trip.budget}`}
                                </Badge>
                              </div>

                              {/* Info Cards Grid */}
                              <div className="grid grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <div className={`flex flex-col gap-2 ${i18n.language === 'he' ? 'items-end' : 'items-start'}`}>
                                    <div className={`flex items-center gap-2 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                                      <Calendar className={`w-5 h-5 text-blue-600 ${i18n.language === 'he' ? 'ml-1' : 'mr-1'}`} />
                                      <span className={`font-semibold text-blue-800 text-sm ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}>
                                        {t('trips.duration')}
                                      </span>
                                    </div>
                                    <p 
                                      className={`text-blue-700 font-medium ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}
                                      dir={i18n.language === 'he' ? 'rtl' : 'ltr'}
                                      style={i18n.language === 'he' ? { unicodeBidi: 'plaintext' } : undefined}
                                    >
                                      {trip.duration || (i18n.language === 'he' ? '7 ימים' : '7 days')}
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-green-50 p-4 rounded-lg">
                                  <div className={`flex flex-col gap-2 ${i18n.language === 'he' ? 'items-end' : 'items-start'}`}>
                                    <div className={`flex items-center gap-2 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                                      <DollarSign className={`w-5 h-5 text-green-600 ${i18n.language === 'he' ? 'ml-1' : 'mr-1'}`} />
                                      <span className={`font-semibold text-green-800 text-sm ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}>
                                        {t('trips.total_budget')}
                                      </span>
                                    </div>
                                    <p className={`text-green-700 font-medium text-sm ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}>
                                      {i18n.language === 'he' 
                                        ? `₪${Math.round(parseFloat(trip.budget) * USD_TO_ILS).toLocaleString('he-IL')}`
                                        : `$${trip.budget}`}
                                    </p>
                                  </div>
                                </div>

                                {bestTimeToVisit && (
                                  <div className="bg-orange-50 p-4 rounded-lg">
                                    <div className={`flex flex-col gap-2 ${i18n.language === 'he' ? 'items-end' : 'items-start'}`}>
                                      <div className={`flex items-center gap-2 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                                        <Calendar className={`w-5 h-5 text-orange-600 ${i18n.language === 'he' ? 'ml-1' : 'mr-1'}`} />
                                        <span className={`font-semibold text-orange-800 text-sm ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}>
                                          {t('trips.best_time_to_visit')}
                                        </span>
                                      </div>
                                      <p className={`text-orange-700 font-medium text-sm ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}>
                                        {translateBestTime(bestTimeToVisit, i18n.language)}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Highlights */}
                              {(() => {
                                const translatedHighlights = translatedTrips.get(trip.id)?.highlights || highlights;
                                return translatedHighlights && translatedHighlights.length > 0 && (
                                  <div>
                                    <div className={`flex items-center gap-2 mb-3 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                                      <Star className="w-4 h-4 text-yellow-600" />
                                      <span className={`font-semibold text-gray-800 text-sm ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}>{t('trips.highlights')}</span>
                                    </div>
                                    <div className={`flex flex-col gap-3 md:flex-row md:flex-wrap md:gap-6 ${i18n.language === 'he' ? 'md:flex-row-reverse' : ''}`}>
                                      {translatedHighlights.map((highlight, idx) => (
                                        <div key={idx} className={`flex items-center text-sm text-gray-700 gap-2 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                                          <span className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></span>
                                          <span className={i18n.language === 'he' ? 'text-right' : 'text-left'}>{highlight}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Tags */}
                              {trip.travelStyle && (
                                <div>
                                  <div className={`flex items-center gap-2 mb-3 ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                                    <Star className="w-4 h-4 text-yellow-600" />
                                    <span className={`font-semibold text-gray-800 text-sm ${i18n.language === 'he' ? 'text-right' : 'text-left'}`}>{t('trips.tags')}</span>
                                  </div>
                                  <div className={`flex flex-wrap gap-2 ${i18n.language === 'he' ? 'justify-end' : ''}`}>
                                    {(() => {
                                      // Handle both string and array formats
                                      let styles: string[] = [];
                                      if (typeof trip.travelStyle === 'string') {
                                        styles = trip.travelStyle.split(',').map(s => s.trim());
                                      } else if (Array.isArray(trip.travelStyle)) {
                                        styles = trip.travelStyle;
                                      }
                                      
                                      return styles.map((style, idx) => {
                                        const trimmedStyle = style.trim();
                                        const interestConfig = ALL_INTERESTS.find(int => int.id === trimmedStyle.toLowerCase());
                                        return (
                                          <Badge key={idx} variant="secondary" className="bg-gradient-to-r from-orange-100 to-teal-100 text-gray-800 border-0">
                                            {interestConfig ? interestConfig.label : translateText(trimmedStyle, i18n.language)}
                                          </Badge>
                                        );
                                      });
                                    })()}
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className={`flex gap-3 pt-4 border-t ${i18n.language === 'he' ? 'flex-row-reverse' : ''}`}>
                                {(() => {
                                  // Check if there's an existing itinerary for this trip
                                  const existingItinerary = savedItineraries.find((itin: any) => {
                                    const planData = itin.plan_json as any;
                                    // Match by title or destination
                                    return itin.title === trip.title || planData?.mainDestination === trip.title;
                                  });

                                  if (existingItinerary) {
                                    // Show "View Itinerary" button if itinerary exists
                                    return (
                                      <Button 
                                        asChild
                                        className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                                        data-testid={`button-view-itinerary-${trip.id}`}
                                      >
                                        <Link href={`/itineraries/${existingItinerary.id}`}>
                                          {i18n.language === 'he' ? (
                                            <>
                                              צפה במסלול היומי
                                              <Calendar className="w-4 h-4 mr-2" />
                                            </>
                                          ) : (
                                            <>
                                              <Calendar className="w-4 h-4 mr-2" />
                                              View Daily Itinerary
                                            </>
                                          )}
                                        </Link>
                                      </Button>
                                    );
                                  } else {
                                    // Show "Create Itinerary" button if no itinerary exists
                                    return (
                                      <Button 
                                        variant="outline"
                                        className="flex-1 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border-orange-200"
                                        onClick={async () => {
                                          // Convert saved trip to suggestion format
                                          const suggestion = {
                                            destination: trip.title,
                                            description: trip.description,
                                            duration: trip.duration || '7 days',
                                            estimatedBudget: {
                                              low: typeof trip.budget === 'string' ? parseFloat(trip.budget.replace(/[^0-9.]/g, '')) : trip.budget,
                                              high: typeof trip.budget === 'string' ? parseFloat(trip.budget.replace(/[^0-9.]/g, '')) : trip.budget
                                            },
                                            highlights: highlights,
                                            travelStyle: trip.travelStyle ? trip.travelStyle.split(',').map(s => s.trim()) : []
                                          };
                                          
                                          // Generate itinerary
                                          await handleGenerateItineraryForSuggestion(suggestion);
                                        }}
                                        disabled={isGeneratingItinerary}
                                        data-testid={`button-generate-itinerary-${trip.id}`}
                                      >
                                        {isGeneratingItinerary ? (
                                          <Loader2 className={`w-4 h-4 animate-spin ${i18n.language === 'he' ? 'ml-2' : 'mr-2'}`} />
                                        ) : (
                                          <Calendar className={`w-4 h-4 ${i18n.language === 'he' ? 'ml-2' : 'mr-2'}`} />
                                        )}
                                        {i18n.language === 'he' ? 'צור מסלול יומי' : t('trips.generate_daily_itinerary')}
                                      </Button>
                                    );
                                  }
                                })()}
                                <Button 
                                  asChild
                                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                                  data-testid={`button-book-flight-${trip.id}`}
                                >
                                  <Link href="/flights">
                                    {i18n.language === 'he' ? (
                                      <>
                                        סגור טיסה
                                        <Plane className="w-4 h-4 mr-2" />
                                      </>
                                    ) : (
                                      <>
                                        <Plane className="w-4 h-4 mr-2" />
                                        Book Flight
                                      </>
                                    )}
                                  </Link>
                                </Button>
                                <Button 
                                  variant="outline"
                                  className="border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600"
                                  onClick={() => {
                                    if (confirm(t('trips.confirm_delete') || 'Are you sure you want to delete this trip?')) {
                                      deleteTripMutation.mutate(trip.id);
                                    }
                                  }}
                                  disabled={deleteTripMutation.isPending}
                                  data-testid={`button-delete-trip-${trip.id}`}
                                >
                                  {deleteTripMutation.isPending ? (
                                    <Loader2 className={`w-4 h-4 animate-spin ${i18n.language === 'he' ? 'ml-2' : 'mr-2'}`} />
                                  ) : (
                                    <Trash2 className={`w-4 h-4 ${i18n.language === 'he' ? 'ml-2' : 'mr-2'}`} />
                                  )}
                                  {t('common.delete')}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Auth Modal */}
        <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">{t('trips.sign_in_to_save_itinerary')}</DialogTitle>
              <DialogDescription className="text-center">
                {t('trips.sign_in_to_save_and_access_description')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Button
                onClick={handleAuthModalSignIn}
                className="w-full"
                size="lg"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t('auth.sign_in_with_google')}
              </Button>
            </div>
            <DialogFooter className="flex justify-center">
              <Button variant="outline" onClick={() => setIsAuthModalOpen(false)}>
                {t('common.cancel')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}