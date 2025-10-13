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
  totalNights: number;
  priceMin: string;
  priceMax: string;
  season: string[];
  tags: string[];
  audienceTags: string[];
  rating: string;
  popularity: number;
  heroImage: string;
  images: string[];
  dailyItinerary: Record<string, Array<{
    day: number;
    activities: string[];
    duration: string;
    estimatedCost: number;
  }>>;
  costsBreakdown: {
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
          src={journey.heroImage}
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4" dir={isRTL ? 'rtl' : 'ltr'}>{journey.title}</h1>
            <div className={`flex items-center gap-4 text-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span>{parseFloat(journey.rating).toFixed(1)}</span>
              </div>
              <span>•</span>
              <span dir={isRTL ? 'rtl' : 'ltr'}>{formatPrice(journey.priceMin, journey.priceMax)}</span>
              <span>•</span>
              <span dir={isRTL ? 'rtl' : 'ltr'}>{journey.totalNights} {isRTL ? 'לילות' : 'nights'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Description */}
        <p className="text-lg text-gray-700 mb-8" dir={isRTL ? 'rtl' : 'ltr'}>{journey.description}</p>

        {/* Tags */}
        <div className={`flex flex-wrap gap-2 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {journey.tags?.map((tag) => (
            <Badge key={tag} className="bg-gradient-to-r from-orange-100 to-teal-100 text-gray-800 border-0">
              {tag}
            </Badge>
          ))}
          {journey.audienceTags?.map((tag) => (
            <Badge key={tag} variant="outline" className="border-orange-500 text-orange-600">
              {tag}
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
                      <div className="flex-1">
                        <h4 className="font-bold text-lg" dir={isRTL ? 'rtl' : 'ltr'}>{dest.name}, {dest.country}</h4>
                        <p className="text-sm text-gray-600" dir={isRTL ? 'rtl' : 'ltr'}>
                          {dest.nights} {isRTL ? 'לילות' : 'nights'}
                        </p>
                      </div>
                      {dest.transport && (
                        <div className={`flex items-center gap-2 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {getTransportIcon(dest.transport.type)}
                          <span dir={isRTL ? 'rtl' : 'ltr'}>{dest.transport.duration}</span>
                          <span dir={isRTL ? 'rtl' : 'ltr'}>${dest.transport.cost}</span>
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
                          <td className={`py-4 ${isRTL ? 'pr-4' : 'pl-4'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                            <span className="font-medium">{dest.name}</span>, {dest.country}
                          </td>
                          <td className="py-4" dir={isRTL ? 'rtl' : 'ltr'}>{dest.nights}</td>
                          <td className="py-4" dir={isRTL ? 'rtl' : 'ltr'}>{dest.transport?.type || '-'}</td>
                          <td className="py-4" dir={isRTL ? 'rtl' : 'ltr'}>{dest.transport?.duration || '-'}</td>
                          <td className={`py-4 ${isRTL ? 'pr-4' : 'pl-4'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                            ${dest.transport?.cost || 0}
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
              {Object.entries(journey.dailyItinerary || {}).map(([destIdx, days]) => (
                <Card key={destIdx}>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-orange-600" dir={isRTL ? 'rtl' : 'ltr'}>
                      {journey.destinations[parseInt(destIdx)]?.name || `Destination ${parseInt(destIdx) + 1}`}
                    </h3>
                    <div className="space-y-4">
                      {days.map((day, idx) => (
                        <div key={idx} className="border-l-4 border-orange-500 pl-4">
                          <div className={`flex justify-between items-start mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <h4 className="font-semibold" dir={isRTL ? 'rtl' : 'ltr'}>
                              {isRTL ? `יום ${day.day}` : `Day ${day.day}`}
                            </h4>
                            <Badge variant="secondary" dir={isRTL ? 'rtl' : 'ltr'}>
                              ${day.estimatedCost}
                            </Badge>
                          </div>
                          <ul className={`space-y-1 text-gray-700 ${isRTL ? 'pr-4' : 'pl-4'}`}>
                            {day.activities.map((activity, actIdx) => (
                              <li key={actIdx} className="flex items-start gap-2">
                                <span className="text-orange-500 mt-1">•</span>
                                <span dir={isRTL ? 'rtl' : 'ltr'}>{activity}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="text-sm text-gray-500 mt-2" dir={isRTL ? 'rtl' : 'ltr'}>
                            <Clock className="inline w-3 h-3 mr-1" />
                            {day.duration}
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
                <div className="space-y-4">
                  {journey.costsBreakdown && (
                    <>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="font-semibold" dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'תחבורה' : 'Transport'}</span>
                          <span className="text-lg font-bold" dir={isRTL ? 'rtl' : 'ltr'}>
                            ${journey.costsBreakdown.transport.min} - ${journey.costsBreakdown.transport.max}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="font-semibold" dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'פעילויות' : 'Activities'}</span>
                          <span className="text-lg font-bold" dir={isRTL ? 'rtl' : 'ltr'}>
                            ${journey.costsBreakdown.activities.min} - ${journey.costsBreakdown.activities.max}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="font-semibold" dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'לינה' : 'Lodging'}</span>
                          <span className="text-lg font-bold" dir={isRTL ? 'rtl' : 'ltr'}>
                            ${journey.costsBreakdown.lodging.min} - ${journey.costsBreakdown.lodging.max}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-orange-100 rounded-lg border-2 border-orange-500">
                        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="font-bold text-lg" dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'סה"כ משוער' : 'Total Estimated'}</span>
                          <span className="text-2xl font-bold text-orange-600" dir={isRTL ? 'rtl' : 'ltr'}>
                            {formatPrice(journey.priceMin, journey.priceMax)}
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
