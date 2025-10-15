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
  Camera
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">
                {isRTL ? 'מסע לא נמצא' : 'Journey Not Found'}
              </h2>
              <p className="text-gray-600 mb-4">
                {isRTL ? 'לא הצלחנו למצוא את המסע המבוקש' : 'We could not find the requested journey'}
              </p>
              <Link href="/my-trips">
                <Button>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link href="/my-trips">
              <Button variant="ghost" size="sm" className={isRTL ? 'flex-row-reverse' : ''}>
                <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
                <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'חזרה לטיולים שלי' : 'Back to My Trips'}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex-1" dir={isRTL ? 'rtl' : 'ltr'}>
              <h1 className="text-4xl font-bold mb-4">{trip.title}</h1>
              {trip.description && (
                <p className="text-white/90 text-lg mb-6">{trip.description}</p>
              )}
              
              {/* Quick Info */}
              <div className={`flex flex-wrap gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Users className="w-5 h-5" />
                  <span dir={isRTL ? 'rtl' : 'ltr'}>
                    {trip.adults} {isRTL ? 'מבוגרים' : 'adults'}
                    {trip.children > 0 && `, ${trip.children} ${isRTL ? 'ילדים' : 'children'}`}
                  </span>
                </div>
                {trip.travelStyle && (
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Heart className="w-5 h-5" />
                    <span dir={isRTL ? 'rtl' : 'ltr'}>{translateTripType(trip.travelStyle)}</span>
                  </div>
                )}
                {trip.startDate && (
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Calendar className="w-5 h-5" />
                    <span dir={isRTL ? 'rtl' : 'ltr'}>{formatDate(trip.startDate)}</span>
                  </div>
                )}
                {trip.budget && (
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <DollarSign className="w-5 h-5" />
                    <span dir={isRTL ? 'rtl' : 'ltr'}>
                      {isRTL ? `₪${(parseFloat(trip.budget) * 3.5).toFixed(0)}` : `$${parseFloat(trip.budget).toFixed(0)}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button variant="secondary" size="sm" className={isRTL ? 'flex-row-reverse' : ''}>
                <Share2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'שתף' : 'Share'}
              </Button>
              <Button variant="secondary" size="sm" className={isRTL ? 'flex-row-reverse' : ''}>
                <Edit className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'ערוך' : 'Edit'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="itinerary" dir={isRTL ? 'rtl' : 'ltr'}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="itinerary" className={isRTL ? 'flex-row-reverse' : ''}>
              <Calendar className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'לוח זמנים יומי' : 'Daily Schedule'}
            </TabsTrigger>
            <TabsTrigger value="destinations" className={isRTL ? 'flex-row-reverse' : ''}>
              <MapPin className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'יעדים' : 'Destinations'}
            </TabsTrigger>
            <TabsTrigger value="overview" className={isRTL ? 'flex-row-reverse' : ''}>
              <Camera className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'סקירה כללית' : 'Overview'}
            </TabsTrigger>
          </TabsList>

          {/* Daily Itinerary Tab */}
          <TabsContent value="itinerary" className="mt-6">
            <div className="space-y-4">
              {trip.itinerary && trip.itinerary.length > 0 ? (
                trip.itinerary.map((day: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
                        <Clock className="w-5 h-5 text-orange-500" />
                        {isRTL ? `יום ${index + 1}` : `Day ${index + 1}`}
                        {day.location && ` - ${day.location}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
                        {day.activities && day.activities.map((activity: string, actIdx: number) => (
                          <div key={actIdx} className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                            <p className="flex-1">{activity}</p>
                          </div>
                        ))}
                        {day.meals && (
                          <div className={`flex items-center gap-2 text-sm text-gray-600 mt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <UtensilsCrossed className="w-4 h-4" />
                            <span dir={isRTL ? 'rtl' : 'ltr'}>{day.meals}</span>
                          </div>
                        )}
                        {day.accommodation && (
                          <div className={`flex items-center gap-2 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Hotel className="w-4 h-4" />
                            <span dir={isRTL ? 'rtl' : 'ltr'}>{day.accommodation}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600" dir={isRTL ? 'rtl' : 'ltr'}>
                      {isRTL ? 'אין לוח זמנים זמין כרגע' : 'No itinerary available yet'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Destinations Tab */}
          <TabsContent value="destinations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle dir={isRTL ? 'rtl' : 'ltr'}>
                  {isRTL ? 'יעדי המסע' : 'Journey Destinations'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`flex flex-wrap gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {trip.destinations && trip.destinations.length > 0 ? (
                    trip.destinations.map((dest: any, index: number) => (
                      <Badge key={index} variant="secondary" className="text-base px-4 py-2">
                        <MapPin className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {dest.name || dest}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-600" dir={isRTL ? 'rtl' : 'ltr'}>
                      {isRTL ? 'אין יעדים זמינים' : 'No destinations available'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle dir={isRTL ? 'rtl' : 'ltr'}>
                  {isRTL ? 'סקירת המסע' : 'Journey Overview'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
                  <div>
                    <h3 className="font-semibold mb-2">{isRTL ? 'תיאור' : 'Description'}</h3>
                    <p className="text-gray-700">{trip.description || (isRTL ? 'אין תיאור זמין' : 'No description available')}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{isRTL ? 'פרטי המסע' : 'Trip Details'}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">{isRTL ? 'סוג טיול' : 'Trip Type'}</p>
                        <p className="font-medium">{translateTripType(trip.travelStyle || 'family')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{isRTL ? 'מטיילים' : 'Travelers'}</p>
                        <p className="font-medium">{totalTravelers} {isRTL ? 'אנשים' : 'people'}</p>
                      </div>
                      {trip.budget && (
                        <div>
                          <p className="text-sm text-gray-600">{isRTL ? 'תקציב' : 'Budget'}</p>
                          <p className="font-medium">
                            {isRTL ? `₪${(parseFloat(trip.budget) * 3.5).toFixed(0)}` : `$${parseFloat(trip.budget).toFixed(0)}`}
                          </p>
                        </div>
                      )}
                      {trip.startDate && (
                        <div>
                          <p className="text-sm text-gray-600">{isRTL ? 'תאריך התחלה' : 'Start Date'}</p>
                          <p className="font-medium">{formatDate(trip.startDate)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
