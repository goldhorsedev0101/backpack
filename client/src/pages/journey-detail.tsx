import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Plane,
  Train,
  Star,
  Heart,
  Share2,
  Sparkles
} from "lucide-react";
import { useTranslation } from "react-i18next";

// RTL support for Hebrew - Updated Oct 13, 2025
interface Journey {
  id: number;
  title: string;
  description: string;
  destinations: Array<{
    name: string;
    country: string;
    nights: number;
    transport?: { type: string; cost: number; duration: string };
  }>;
  total_nights: number;
  price_min: number;
  price_max: number;
  season: string[];
  tags: string[];
  audience_tags: string[];
  rating: number;
  popularity: number;
  hero_image: string;
  images: string[];
  daily_itinerary: Record<string, Array<{
    day: number;
    activities: string[];
    duration: string;
    estimatedCost: number;
  }>>;
  costs_breakdown: {
    transport: { min: number; max: number };
    activities: { min: number; max: number };
    lodging: { min: number; max: number };
  };
}

export default function JourneyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  const { data: journey, isLoading } = useQuery<Journey>({
    queryKey: [`/api/journeys/${id}`],
    enabled: !!id,
  });

  const formatPrice = (min: string | number, max: string | number) => {
    const currency = isRTL ? '₪' : '$';
    const minNum = isRTL ? Math.round(parseFloat(min.toString()) * 3.5) : parseInt(min.toString());
    const maxNum = isRTL ? Math.round(parseFloat(max.toString()) * 3.5) : parseInt(max.toString());
    return `${currency}${minNum.toLocaleString()} - ${currency}${maxNum.toLocaleString()}`;
  };

  const translateCityName = (cityName: string) => {
    const cityTranslations: Record<string, { he: string; en: string }> = {
      'Tokyo': { he: 'טוקיו', en: 'Tokyo' },
      'Kyoto': { he: 'קיוטו', en: 'Kyoto' },
      'Osaka': { he: 'אוסקה', en: 'Osaka' },
      'Paris': { he: 'פריז', en: 'Paris' },
      'Amsterdam': { he: 'אמסטרדם', en: 'Amsterdam' },
      'Berlin': { he: 'ברלין', en: 'Berlin' },
      'Barcelona': { he: 'ברצלונה', en: 'Barcelona' },
      'Nice': { he: 'ניס', en: 'Nice' },
      'Rome': { he: 'רומא', en: 'Rome' },
      'Bangkok': { he: 'בנגקוק', en: 'Bangkok' },
      'Chiang Mai': { he: 'צ\'יאנג מאי', en: 'Chiang Mai' },
      'Phuket': { he: 'פוקט', en: 'Phuket' },
      'New York': { he: 'ניו יורק', en: 'New York' },
      'Philadelphia': { he: 'פילדלפיה', en: 'Philadelphia' },
      'Washington DC': { he: 'וושינגטון', en: 'Washington DC' },
      'Boston': { he: 'בוסטון', en: 'Boston' },
    };
    return cityTranslations[cityName]?.[isRTL ? 'he' : 'en'] || cityName;
  };

  const translateJourneyTitle = (title: string) => {
    const titleTranslations: Record<string, { he: string; en: string }> = {
      'Classic Japan Circuit': { he: 'מסע יפן הקלאסי', en: 'Classic Japan Circuit' },
      'European Highlights Tour': { he: 'סיור דגשי אירופה', en: 'European Highlights Tour' },
      'European Capital Tour': { he: 'סיור בירות אירופה', en: 'European Capital Tour' },
      'Southeast Asia Adventure': { he: 'הרפתקה בדרום מזרח אסיה', en: 'Southeast Asia Adventure' },
      'Mediterranean Dream': { he: 'חלום ים תיכוני', en: 'Mediterranean Dream' },
      'East Coast USA Explorer': { he: 'סיור החוף המזרחי של ארה"ב', en: 'East Coast USA Explorer' },
    };
    return titleTranslations[title]?.[isRTL ? 'he' : 'en'] || title;
  };

  const translateTag = (tag: string) => {
    const translations: Record<string, { he: string; en: string }> = {
      nature: { he: 'טבע', en: 'Nature' },
      food: { he: 'אוכל', en: 'Food' },
      culture: { he: 'תרבות', en: 'Culture' },
      nightlife: { he: 'חיי לילה', en: 'Nightlife' },
      adventure: { he: 'הרפתקאות', en: 'Adventure' },
      art: { he: 'אמנות', en: 'Art' },
      '12+': { he: '12+', en: '12+' },
      couple: { he: 'זוגות', en: 'Couple' },
      solo: { he: 'יחידים', en: 'Solo' },
      friends: { he: 'חברים', en: 'Friends' },
      family: { he: 'משפחות', en: 'Family' },
      group: { he: 'קבוצות', en: 'Group' },
    };
    return translations[tag]?.[isRTL ? 'he' : 'en'] || tag;
  };

  const translateTransportType = (type: string) => {
    const translations: Record<string, { he: string; en: string }> = {
      flight: { he: 'טיסה', en: 'Flight' },
      bullet_train: { he: 'רכבת מהירה', en: 'Bullet Train' },
      train: { he: 'רכבת', en: 'Train' },
      bus: { he: 'אוטובוס', en: 'Bus' },
      'Start point': { he: 'נקודת התחלה', en: 'Start point' },
    };
    return translations[type]?.[isRTL ? 'he' : 'en'] || type;
  };

  const translateCountry = (country: string) => {
    const translations: Record<string, { he: string; en: string }> = {
      'Japan': { he: 'יפן', en: 'Japan' },
      'France': { he: 'צרפת', en: 'France' },
      'Netherlands': { he: 'הולנד', en: 'Netherlands' },
      'Germany': { he: 'גרמניה', en: 'Germany' },
      'Spain': { he: 'ספרד', en: 'Spain' },
      'Italy': { he: 'איטליה', en: 'Italy' },
      'Thailand': { he: 'תאילנד', en: 'Thailand' },
      'USA': { he: 'ארה"ב', en: 'USA' },
    };
    return translations[country]?.[isRTL ? 'he' : 'en'] || country;
  };

  const translateDescription = (title: string) => {
    const descriptions: Record<string, { he: string; en: string }> = {
      'Classic Japan Circuit': { 
        he: 'גלה את היופי של יפן המסורתית והמודרנית - ממקדשים עתיקים למסעדות רובוטים', 
        en: 'Discover the beauty of traditional and modern Japan - from ancient temples to robot restaurants' 
      },
      'European Capital Tour': { 
        he: 'בקר בשלוש מהערים היפות ביותר באירופה - פריז, אמסטרדם וברלין', 
        en: 'Visit three of Europe\'s most beautiful cities - Paris, Amsterdam and Berlin' 
      },
      'European Highlights Tour': { 
        he: 'חווה את הטוב שבים התיכון - מחופי ברצלונה לרומא העתיקה', 
        en: 'Experience the best of the Mediterranean - from Barcelona\'s beaches to ancient Rome' 
      },
      'Southeast Asia Adventure': { 
        he: 'מבנגקוק התוססת למקדשים שלווים וחופים גן עדן - החוויה התאילנדית האולטימטיבית', 
        en: 'From bustling Bangkok to serene temples and paradise beaches - the ultimate Thai experience' 
      },
      'Mediterranean Dream': { 
        he: 'חקור את הריביירה הצרפתית ואת רומא ההיסטורית במסע ים תיכוני בלתי נשכח', 
        en: 'Explore the French Riviera and historic Rome in an unforgettable Mediterranean journey' 
      },
      'East Coast USA Explorer': { 
        he: 'גלה את הערים האייקוניות של החוף המזרחי - מניו יורק לבוסטון', 
        en: 'Discover the iconic cities of the East Coast - from New York to Boston' 
      },
    };
    return descriptions[title]?.[isRTL ? 'he' : 'en'] || '';
  };

  const formatCost = (cost: number) => {
    const currency = isRTL ? '₪' : '$';
    const amount = isRTL ? Math.round(cost * 3.5) : cost;
    return `${currency}${amount}`;
  };

  const translateActivity = (activity: string) => {
    const activityTranslations: Record<string, { he: string; en: string }> = {
      'Grand Palace': { he: 'ארמון המלך', en: 'Grand Palace' },
      'Wat Pho temple': { he: 'מקדש וואט פו', en: 'Wat Pho temple' },
      'Khao San Road': { he: 'רחוב קאו סאן', en: 'Khao San Road' },
      'Floating markets': { he: 'שווקים צפים', en: 'Floating markets' },
      'Wat Arun': { he: 'מקדש וואט ארון', en: 'Wat Arun' },
      'Rooftop bar evening': { he: 'ערב בבר על הגג', en: 'Rooftop bar evening' },
      'Chatuchak Market': { he: 'שוק צ\'אטוצ\'ק', en: 'Chatuchak Market' },
      'Jim Thompson House': { he: 'בית ג\'ים תומפסון', en: 'Jim Thompson House' },
      'Thai cooking class': { he: 'שיעור בישול תאילנדי', en: 'Thai cooking class' },
      'Eiffel Tower': { he: 'מגדל אייפל', en: 'Eiffel Tower' },
      'Louvre Museum': { he: 'מוזיאון הלובר', en: 'Louvre Museum' },
      'Seine River cruise': { he: 'שיט בנהר הסיין', en: 'Seine River cruise' },
      'Anne Frank House': { he: 'בית אנה פרנק', en: 'Anne Frank House' },
      'Van Gogh Museum': { he: 'מוזיאון ואן גוך', en: 'Van Gogh Museum' },
      'Canal boat tour': { he: 'סיור בסירה בתעלות', en: 'Canal boat tour' },
      'Brandenburg Gate': { he: 'שער ברנדנבורג', en: 'Brandenburg Gate' },
      'Berlin Wall Memorial': { he: 'אנדרטת חומת ברלין', en: 'Berlin Wall Memorial' },
      'Museum Island': { he: 'אי המוזיאונים', en: 'Museum Island' },
      'Sensoji Temple': { he: 'מקדש סנסוג\'י', en: 'Sensoji Temple' },
      'Tokyo Tower': { he: 'מגדל טוקיו', en: 'Tokyo Tower' },
      'Shibuya Crossing': { he: 'מעבר חציה שיבויה', en: 'Shibuya Crossing' },
      'Fushimi Inari Shrine': { he: 'מקדש פושימי אינרי', en: 'Fushimi Inari Shrine' },
      'Bamboo Grove': { he: 'יער הבמבוק', en: 'Bamboo Grove' },
      'Traditional tea ceremony': { he: 'טקס תה מסורתי', en: 'Traditional tea ceremony' },
      'Osaka Castle': { he: 'טירת אוסקה', en: 'Osaka Castle' },
      'Dotonbori district': { he: 'רובע דוטונבורי', en: 'Dotonbori district' },
      'Street food tour': { he: 'סיור אוכל רחוב', en: 'Street food tour' },
    };
    return activityTranslations[activity]?.[isRTL ? 'he' : 'en'] || activity;
  };

  const formatDuration = (duration: string) => {
    if (!isRTL) return duration;
    
    // Convert "Start point" to "נקודת התחלה"
    if (duration === "Start point") {
      return "נקודת התחלה";
    }
    
    // Convert "hours 8" to "8 שעות"
    const hoursMatch = duration.match(/hours?\s+(\d+)/i);
    if (hoursMatch) {
      return `${hoursMatch[1]} שעות`;
    }
    
    // Convert "1h 20m" to "1 שעה 20 דקות"
    const timeMatch = duration.match(/(\d+)h\s*(\d+)m/i);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      return `${hours} שעה ${minutes} דקות`;
    }
    
    // Convert "2h" to "2 שעות"
    const hoursOnlyMatch = duration.match(/(\d+)h/i);
    if (hoursOnlyMatch) {
      const hours = parseInt(hoursOnlyMatch[1]);
      return hours === 1 ? `שעה אחת` : `${hours} שעות`;
    }
    
    return duration;
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'flight':
      case 'bullet_train':
        return <Plane className="w-4 h-4" />;
      case 'train':
        return <Train className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Skeleton className="h-96 w-full" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-24 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {isRTL ? 'מסע לא נמצא' : 'Journey not found'}
          </h2>
          <Link href="/journeys">
            <Button variant="outline">
              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
              <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'חזרה למסעות' : 'Back to Journeys'}</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 pb-20 md:pb-0 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={journey.hero_image}
          alt={journey.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <Link href="/journeys">
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20 mb-4">
                <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
                <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'חזרה למסעות' : 'Back to Journeys'}</span>
              </Button>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" dir={isRTL ? 'rtl' : 'ltr'}>{translateJourneyTitle(journey.title)}</h1>
            <div className={`flex items-center gap-4 text-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span>{journey.rating.toFixed(1)}</span>
              </div>
              <span>•</span>
              <span dir={isRTL ? 'rtl' : 'ltr'}>{formatPrice(journey.price_min, journey.price_max)}</span>
              <span>•</span>
              <span dir={isRTL ? 'rtl' : 'ltr'}>{journey.total_nights} {isRTL ? 'לילות' : 'nights'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Description */}
        <p className="text-lg text-gray-700 mb-8" dir={isRTL ? 'rtl' : 'ltr'}>{translateDescription(journey.title)}</p>

        {/* Tags */}
        <div className={`flex flex-wrap gap-2 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {journey.tags?.map((tag) => (
            <Badge key={tag} className="bg-gradient-to-r from-orange-100 to-teal-100 text-gray-800 border-0">
              {translateTag(tag)}
            </Badge>
          ))}
          {journey.audience_tags?.map((tag) => (
            <Badge key={tag} variant="outline" className="border-orange-500 text-orange-600">
              {translateTag(tag)}
            </Badge>
          ))}
        </div>

        {/* CTAs */}
        <div className={`flex gap-4 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button className="bg-orange-500 hover:bg-orange-600" data-testid="build-similar-journey">
            <Sparkles className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'בנה לי מסע דומה' : 'Build me a similar journey'}</span>
          </Button>
          <Button variant="outline" data-testid="save-journey">
            <Heart className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'שמור למסעות שלי' : 'Save to my trips'}</span>
          </Button>
          <Button variant="outline" data-testid="share-journey">
            <Share2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'שתף' : 'Share'}</span>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
          <TabsList className={`grid w-full grid-cols-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <TabsTrigger value="overview">{isRTL ? 'סקירה' : 'Overview'}</TabsTrigger>
            <TabsTrigger value="nights">{isRTL ? 'לילות לכל יעד' : 'Nights per Destination'}</TabsTrigger>
            <TabsTrigger value="schedule">{isRTL ? 'לוח זמנים יומי' : 'Daily Schedule'}</TabsTrigger>
            <TabsTrigger value="costs">{isRTL ? 'עלויות' : 'Costs'}</TabsTrigger>
            <TabsTrigger value="map">{isRTL ? 'מפה' : 'Map'}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-4 text-orange-600" dir={isRTL ? 'rtl' : 'ltr'}>
                  <MapPin className={`inline w-6 h-6 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'שביל היעדים' : 'Destination Trail'}
                </h3>
                <div className="space-y-4">
                  {journey.destinations.map((dest, idx) => (
                    <div key={idx} className={`flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-teal-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                        <h4 className="font-bold text-lg" dir={isRTL ? 'rtl' : 'ltr'}>{translateCityName(dest.name)}, {translateCountry(dest.country)}</h4>
                        <p className="text-sm text-gray-600" dir={isRTL ? 'rtl' : 'ltr'}>
                          {dest.nights} {isRTL ? 'לילות' : 'nights'}
                        </p>
                      </div>
                      {dest.transport && (
                        <div className={`flex items-center gap-2 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {getTransportIcon(dest.transport.type)}
                          <span dir={isRTL ? 'rtl' : 'ltr'}>{translateTransportType(dest.transport.type)}</span>
                          <span dir={isRTL ? 'rtl' : 'ltr'}>{formatDuration(dest.transport.duration)}</span>
                          <span dir={isRTL ? 'rtl' : 'ltr'}>{formatCost(dest.transport.cost)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nights Tab */}
          <TabsContent value="nights" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className={`py-3 font-semibold ${isRTL ? 'text-right pr-4' : 'text-left pl-4'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                          {isRTL ? 'יעד' : 'Destination'}
                        </th>
                        <th className={`py-3 font-semibold ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                          {isRTL ? 'לילות' : 'Nights'}
                        </th>
                        <th className={`py-3 font-semibold ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                          {isRTL ? 'תחבורה' : 'Transport'}
                        </th>
                        <th className={`py-3 font-semibold ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                          {isRTL ? 'זמן מעבר' : 'Travel Time'}
                        </th>
                        <th className={`py-3 font-semibold ${isRTL ? 'text-right pr-4' : 'text-left pl-4'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                          {isRTL ? 'עלות' : 'Cost'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {journey.destinations.map((dest, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className={`py-4 ${isRTL ? 'pr-4 text-right' : 'pl-4 text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                            <span className="font-medium">{translateCityName(dest.name)}</span>, {translateCountry(dest.country)}
                          </td>
                          <td className={`py-4 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>{dest.nights}</td>
                          <td className={`py-4 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>{translateTransportType(dest.transport?.type || '-')}</td>
                          <td className={`py-4 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>{dest.transport?.duration ? formatDuration(dest.transport.duration) : '-'}</td>
                          <td className={`py-4 ${isRTL ? 'pr-4 text-right' : 'pl-4 text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                            {dest.transport?.cost ? formatCost(dest.transport.cost) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Schedule Tab */}
          <TabsContent value="schedule" className="mt-6">
            <div className="space-y-6">
              {Object.entries(journey.daily_itinerary || {}).map(([destIdx, days]) => (
                <Card key={destIdx}>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-orange-600" dir={isRTL ? 'rtl' : 'ltr'}>
                      {translateCityName(journey.destinations[parseInt(destIdx)]?.name || `Destination ${parseInt(destIdx) + 1}`)}
                    </h3>
                    <div className="space-y-4">
                      {days.map((day, idx) => (
                        <div key={idx} className={`${isRTL ? 'border-r-4 pr-4' : 'border-l-4 pl-4'} border-orange-500`}>
                          <div className="flex justify-between items-start mb-2">
                            {isRTL ? (
                              <>
                                <h4 className="font-semibold" dir="rtl">
                                  יום {day.day}
                                </h4>
                                <Badge variant="secondary" className="bg-teal-500 text-white" dir="rtl">
                                  {formatCost(day.estimatedCost)}
                                </Badge>
                              </>
                            ) : (
                              <>
                                <h4 className="font-semibold">
                                  Day {day.day}
                                </h4>
                                <Badge variant="secondary" className="bg-teal-500 text-white">
                                  {formatCost(day.estimatedCost)}
                                </Badge>
                              </>
                            )}
                          </div>
                          <ul className={`space-y-1 text-gray-700 ${isRTL ? 'text-right' : ''}`}>
                            {day.activities.map((activity, actIdx) => (
                              <li key={actIdx} className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                                <span className="text-orange-500 mt-1">•</span>
                                <span dir={isRTL ? 'rtl' : 'ltr'}>{translateActivity(activity)}</span>
                              </li>
                            ))}
                          </ul>
                          <p className={`text-sm text-gray-500 mt-2 ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
                            <Clock className="inline w-3 h-3 mr-1" />
                            {formatDuration(day.duration)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Costs Tab */}
          <TabsContent value="costs" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-6 text-orange-600" dir={isRTL ? 'rtl' : 'ltr'}>
                  <DollarSign className={`inline w-6 h-6 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'פירוט עלויות משוער' : 'Estimated Cost Breakdown'}
                </h3>
                <div className={`space-y-4 ${isRTL ? 'text-right' : ''}`}>
                  {journey.costs_breakdown && (
                    <>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="font-semibold" dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'תחבורה' : 'Transport'}</span>
                          <span className="text-lg font-bold" dir={isRTL ? 'rtl' : 'ltr'}>
                            {formatCost(journey.costs_breakdown.transport.min)} - {formatCost(journey.costs_breakdown.transport.max)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="font-semibold" dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'פעילויות' : 'Activities'}</span>
                          <span className="text-lg font-bold" dir={isRTL ? 'rtl' : 'ltr'}>
                            {formatCost(journey.costs_breakdown.activities.min)} - {formatCost(journey.costs_breakdown.activities.max)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="font-semibold" dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'לינה' : 'Lodging'}</span>
                          <span className="text-lg font-bold" dir={isRTL ? 'rtl' : 'ltr'}>
                            {formatCost(journey.costs_breakdown.lodging.min)} - {formatCost(journey.costs_breakdown.lodging.max)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-orange-100 rounded-lg border-2 border-orange-500">
                        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="font-bold text-lg" dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'סה"כ משוער' : 'Total Estimated'}</span>
                          <span className="text-2xl font-bold text-orange-600" dir={isRTL ? 'rtl' : 'ltr'}>
                            {formatPrice(journey.price_min, journey.price_max)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500" dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'מפה אינטראקטיבית בקרוב' : 'Interactive map coming soon'}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
