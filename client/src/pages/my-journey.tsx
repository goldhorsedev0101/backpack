import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation, Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  Clock,
  Heart,
  Share2,
  Edit,
  Plane,
  Hotel,
  UtensilsCrossed,
  Camera,
  Sun,
  Moon,
  Coffee,
  Navigation
} from 'lucide-react';

interface Trip {
  id: number;
  title: string;
  description: string;
  destinations: any[];
  startDate: string | null;
  endDate: string | null;
  budget: string | null;
  travelStyle: string;
  itinerary: any[];
  adults: number;
  children: number;
  isPublic: boolean;
  createdAt: string;
}

export default function MyJourneyPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [, setLocation] = useLocation();

  const { data: trip, isLoading } = useQuery<Trip>({
    queryKey: [`/api/trips/${id}`],
    enabled: !!id,
  });

  const translateTripType = (type: string) => {
    const types: Record<string, { he: string; en: string }> = {
      'couple': { he: 'זוגות', en: 'Couple' },
      'family': { he: 'משפחה', en: 'Family' },
      'solo': { he: 'סולו', en: 'Solo' },
      'friends': { he: 'חברים', en: 'Friends' },
      'honeymoon': { he: 'ירח דבש', en: 'Honeymoon' },
      'adventure': { he: 'הרפתקאות', en: 'Adventure' },
    };
    return types[type]?.[isRTL ? 'he' : 'en'] || type;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return isRTL ? 'לא נבחר' : 'Not selected';
    const date = new Date(dateStr);
    return date.toLocaleDateString(isRTL ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const translateCityName = (cityName: string) => {
    const cityTranslations: Record<string, string> = {
      // European cities
      'Paris': 'פריז',
      'Amsterdam': 'אמסטרדם',
      'Berlin': 'ברלין',
      'Prague': 'פראג',
      'Vienna': 'וינה',
      'Rome': 'רומא',
      'Barcelona': 'ברצלונה',
      'Madrid': 'מדריד',
      'London': 'לונדון',
      'Venice': 'ונציה',
      'Florence': 'פירנצה',
      'Athens': 'אתונה',
      'Budapest': 'בודפשט',
      'Warsaw': 'ורשה',
      'Krakow': 'קרקוב',
      'Lisbon': 'ליסבון',
      'Dublin': 'דבלין',
      'Copenhagen': 'קופנהגן',
      'Stockholm': 'סטוקהולם',
      'Oslo': 'אוסלו',
      'Helsinki': 'הלסינקי',
      'Brussels': 'בריסל',
      'Munich': 'מינכן',
      'Hamburg': 'המבורג',
      'Frankfurt': 'פרנקפורט',
      // Asian cities
      'Tokyo': 'טוקיו',
      'Kyoto': 'קיוטו',
      'Osaka': 'אוסקה',
      'Hiroshima': 'הירושימה',
      'Nara': 'נארה',
      'Bangkok': 'בנגקוק',
      'Chiang Mai': 'צ\'יאנג מאי',
      'Phuket': 'פוקט',
      'Pattaya': 'פטאיה',
      'Krabi': 'קראבי',
      'Koh Samui': 'קוֹ סָמוּי',
      'Singapore': 'סינגפור',
      'Hong Kong': 'הונג קונג',
      'Seoul': 'סיאול',
      'Beijing': 'בייג\'ינג',
      'Shanghai': 'שנחאי',
      'Dubai': 'דובאי',
      'Abu Dhabi': 'אבו דאבי',
      'Mumbai': 'מומבאי',
      'Delhi': 'דלהי',
      'Bali': 'באלי',
      // American cities
      'New York': 'ניו יורק',
      'Los Angeles': 'לוס אנג\'לס',
      'San Francisco': 'סן פרנסיסקו',
      'Las Vegas': 'לאס וגאס',
      'Miami': 'מיאמי',
      'Chicago': 'שיקגו',
      'Boston': 'בוסטון',
      'Washington': 'וושינגטון',
      'Seattle': 'סיאטל',
      // Other
      'Sydney': 'סידני',
      'Melbourne': 'מלבורן',
      'Auckland': 'אוקלנד',
      'Cairo': 'קהיר',
      'Istanbul': 'איסטנבול',
      'Jerusalem': 'ירושלים',
      'Tel Aviv': 'תל אביב',
      'Haifa': 'חיפה',
    };
    
    return isRTL ? (cityTranslations[cityName] || cityName) : cityName;
  };

  const calculateDuration = () => {
    if (!trip?.startDate || !trip?.endDate) return null;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-teal-50 to-blue-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-teal-50 to-blue-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
                {isRTL ? 'מסע לא נמצא' : 'Journey Not Found'}
              </h2>
              <p className="text-gray-600 mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
                {isRTL ? 'לא הצלחנו למצוא את המסע המבוקש' : 'We could not find the requested journey'}
              </p>
              <Link href="/my-trips">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  {isRTL ? 'חזרה לטיולים שלי' : 'Back to My Trips'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalTravelers = trip.adults + trip.children;
  const duration = calculateDuration();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-teal-50 to-blue-50">
      {/* Header with Back Button */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link href="/my-trips">
              <Button variant="ghost" size="sm" className={`hover:bg-orange-100 ${isRTL ? 'flex-row-reverse' : ''}`} data-testid="button-back-to-trips">
                <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
                <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'חזרה לטיולים שלי' : 'Back to My Trips'}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <div className={`flex flex-col gap-8 ${isRTL ? 'items-end' : 'items-start'}`}>
            <div className="flex-1 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-1">
                  {translateTripType(trip.travelStyle || 'family')}
                </Badge>
              </div>
              
              <h1 className="text-5xl font-bold text-white mb-4 leading-tight" data-testid="text-trip-title">
                {trip.title}
              </h1>
              
              {trip.description && (
                <p className="text-white/90 text-xl mb-8 max-w-3xl leading-relaxed" data-testid="text-trip-description">
                  {trip.description}
                </p>
              )}
              
              {/* Quick Info Cards */}
              <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Users className="w-5 h-5 text-white/80" />
                    <span className="text-white/80 text-sm">{isRTL ? 'מטיילים' : 'Travelers'}</span>
                  </div>
                  <p className="text-2xl font-bold text-white" dir={isRTL ? 'rtl' : 'ltr'} data-testid="text-travelers-count">
                    {totalTravelers}
                  </p>
                  <p className="text-white/70 text-xs mt-1" dir={isRTL ? 'rtl' : 'ltr'}>
                    {trip.adults} {isRTL ? 'מבוגרים' : 'adults'}
                    {trip.children > 0 && `, ${trip.children} ${isRTL ? 'ילדים' : 'children'}`}
                  </p>
                </div>

                {duration && (
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Calendar className="w-5 h-5 text-white/80" />
                      <span className="text-white/80 text-sm">{isRTL ? 'משך' : 'Duration'}</span>
                    </div>
                    <p className="text-2xl font-bold text-white" data-testid="text-trip-duration">
                      {duration}
                    </p>
                    <p className="text-white/70 text-xs mt-1">
                      {isRTL ? 'ימים' : 'days'}
                    </p>
                  </div>
                )}

                {trip.destinations && trip.destinations.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <MapPin className="w-5 h-5 text-white/80" />
                      <span className="text-white/80 text-sm">{isRTL ? 'יעדים' : 'Destinations'}</span>
                    </div>
                    <p className="text-2xl font-bold text-white" data-testid="text-destinations-count">
                      {trip.destinations.length}
                    </p>
                    <p className="text-white/70 text-xs mt-1 truncate" dir={isRTL ? 'rtl' : 'ltr'}>
                      {trip.destinations[0]?.name || trip.destinations[0]}
                    </p>
                  </div>
                )}

                {trip.budget && (
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <DollarSign className="w-5 h-5 text-white/80" />
                      <span className="text-white/80 text-sm">{isRTL ? 'תקציב' : 'Budget'}</span>
                    </div>
                    <p className="text-2xl font-bold text-white" dir={isRTL ? 'rtl' : 'ltr'} data-testid="text-trip-budget">
                      {isRTL ? `₪${(parseFloat(trip.budget) * 3.5).toFixed(0)}` : `$${parseFloat(trip.budget).toFixed(0)}`}
                    </p>
                    <p className="text-white/70 text-xs mt-1">
                      {isRTL ? 'כולל' : 'total'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button 
                variant="secondary" 
                size="lg" 
                className={`bg-white hover:bg-gray-100 text-gray-900 shadow-lg ${isRTL ? 'flex-row-reverse' : ''}`}
                data-testid="button-share-trip"
              >
                <Share2 className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'שתף מסע' : 'Share'}
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                className={`bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30 ${isRTL ? 'flex-row-reverse' : ''}`}
                data-testid="button-edit-trip"
              >
                <Edit className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'ערוך' : 'Edit'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Tabs defaultValue="itinerary" dir={isRTL ? 'rtl' : 'ltr'}>
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg rounded-xl p-1 mb-8">
            <TabsTrigger 
              value="itinerary" 
              className={`rounded-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              data-testid="tab-itinerary"
            >
              <Calendar className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'לוח זמנים יומי' : 'Daily Schedule'}
            </TabsTrigger>
            <TabsTrigger 
              value="destinations" 
              className={`rounded-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              data-testid="tab-destinations"
            >
              <MapPin className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'יעדים' : 'Destinations'}
            </TabsTrigger>
            <TabsTrigger 
              value="overview" 
              className={`rounded-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              data-testid="tab-overview"
            >
              <Camera className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'סקירה כללית' : 'Overview'}
            </TabsTrigger>
          </TabsList>

          {/* Daily Itinerary Tab */}
          <TabsContent value="itinerary" className="mt-0">
            <div className="space-y-6">
              {trip.itinerary && trip.itinerary.length > 0 ? (
                trip.itinerary.map((day: any, index: number) => (
                  <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow border-0 overflow-hidden" data-testid={`card-day-${index + 1}`}>
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6">
                      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Sun className="w-6 h-6 text-white" />
                          </div>
                          <div className={isRTL ? 'text-right' : 'text-left'} dir={isRTL ? 'rtl' : 'ltr'}>
                            <h3 className="text-2xl font-bold text-white">
                              {isRTL ? `יום ${index + 1}` : `Day ${index + 1}`}
                            </h3>
                            {day.location && (
                              <p className={`text-white/80 text-sm flex items-center gap-1 mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <MapPin className="w-3 h-3" />
                                {translateCityName(day.location)}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                          {isRTL ? `${day.activities?.length || 0} פעילויות` : `${day.activities?.length || 0} activities`}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {day.activities && day.activities.map((activity: string, actIdx: number) => (
                          <div 
                            key={actIdx} 
                            className="flex items-start p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl hover:shadow-md transition-shadow"
                            data-testid={`activity-${index}-${actIdx}`}
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {actIdx + 1}
                            </div>
                            <p className={`flex-1 text-gray-700 leading-relaxed pt-1 ${isRTL ? 'pr-2 text-right' : 'pl-4 text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                              {activity}
                            </p>
                          </div>
                        ))}
                        
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t ${isRTL ? 'text-right' : 'text-left'}`}>
                          {day.meals && (
                            <div className={`flex items-center gap-3 p-4 bg-teal-50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                                <UtensilsCrossed className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1" dir={isRTL ? 'rtl' : 'ltr'}>
                                <p className="text-xs text-teal-600 font-medium mb-1">{isRTL ? 'ארוחות' : 'Meals'}</p>
                                <p className="text-gray-800 font-medium">{day.meals}</p>
                              </div>
                            </div>
                          )}
                          {day.accommodation && (
                            <div className={`flex items-center gap-3 p-4 bg-blue-50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                <Hotel className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1" dir={isRTL ? 'rtl' : 'ltr'}>
                                <p className="text-xs text-blue-600 font-medium mb-1">{isRTL ? 'לינה' : 'Accommodation'}</p>
                                <p className="text-gray-800 font-medium">{day.accommodation}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="shadow-lg border-0">
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-lg" dir={isRTL ? 'rtl' : 'ltr'}>
                      {isRTL ? 'אין לוח זמנים זמין כרגע' : 'No itinerary available yet'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Destinations Tab */}
          <TabsContent value="destinations" className="mt-0">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                <CardTitle className={`text-2xl ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                  {isRTL ? 'יעדי המסע שלך' : 'Your Journey Destinations'}
                </CardTitle>
                <CardDescription className="text-white/80" dir={isRTL ? 'rtl' : 'ltr'}>
                  {isRTL ? 'כל המקומות המדהימים שתבקר בהם' : 'All the amazing places you\'ll visit'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {trip.destinations && trip.destinations.length > 0 ? (
                    trip.destinations.map((dest: any, index: number) => (
                      <div 
                        key={index} 
                        className="group relative bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-orange-300"
                        data-testid={`destination-${index}`}
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                          <div className={`flex-1 ${isRTL ? 'pr-3 text-right' : 'pl-3 text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                            <p className="font-bold text-gray-800 text-lg">
                              {translateCityName(dest.name || dest)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {isRTL ? 'יעד' : 'Destination'} {index + 1}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full">
                      <div className="text-center p-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MapPin className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-600 text-lg" dir={isRTL ? 'rtl' : 'ltr'}>
                          {isRTL ? 'אין יעדים זמינים' : 'No destinations available'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info Card */}
              <Card className="lg:col-span-2 shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <CardTitle className="text-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
                    {isRTL ? 'סקירת המסע' : 'Journey Overview'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-purple-500" />
                        {isRTL ? 'תיאור המסע' : 'Journey Description'}
                      </h3>
                      <p className="text-gray-700 leading-relaxed bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                        {trip.description || (isRTL ? 'אין תיאור זמין' : 'No description available')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-teal-500 text-white">
                  <CardTitle dir={isRTL ? 'rtl' : 'ltr'}>
                    {isRTL ? 'פרטי המסע' : 'Trip Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl">
                      <p className="text-sm text-orange-600 font-medium mb-1">{isRTL ? 'סוג טיול' : 'Trip Type'}</p>
                      <p className="font-bold text-gray-800 text-lg">{translateTripType(trip.travelStyle || 'family')}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-xl">
                      <p className="text-sm text-teal-600 font-medium mb-1">{isRTL ? 'מטיילים' : 'Travelers'}</p>
                      <p className="font-bold text-gray-800 text-lg">{totalTravelers} {isRTL ? 'אנשים' : 'people'}</p>
                    </div>
                    
                    {trip.budget && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                        <p className="text-sm text-green-600 font-medium mb-1">{isRTL ? 'תקציב' : 'Budget'}</p>
                        <p className="font-bold text-gray-800 text-lg">
                          {isRTL ? `₪${(parseFloat(trip.budget) * 3.5).toFixed(0)}` : `$${parseFloat(trip.budget).toFixed(0)}`}
                        </p>
                      </div>
                    )}
                    
                    {trip.startDate && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                        <p className="text-sm text-purple-600 font-medium mb-1">{isRTL ? 'תאריך התחלה' : 'Start Date'}</p>
                        <p className="font-bold text-gray-800">{formatDate(trip.startDate)}</p>
                      </div>
                    )}

                    {trip.endDate && (
                      <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-xl">
                        <p className="text-sm text-pink-600 font-medium mb-1">{isRTL ? 'תאריך סיום' : 'End Date'}</p>
                        <p className="font-bold text-gray-800">{formatDate(trip.endDate)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
