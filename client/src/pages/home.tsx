import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.js";
import { Button } from "../components/ui/button.js";
import { Badge } from "../components/ui/badge.js";
// import { useAuth } from "@/hooks/useAuth"; // Demo mode
import TripCard from "../components/trip-card.js";
import AiChat from "../components/ai-chat.js";
import PersonalizedRecommendations from "../components/personalized-recommendations.js";
import { Link } from "wouter";
import { 
  Plus, 
  MapPin, 
  TrendingUp, 
  Users, 
  Star,
  MessageCircle,
  Calendar,
  DollarSign,
  Bot
} from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  const user = null as any; // Demo mode - no auth

  const { data: trips = [], isLoading: tripsLoading } = useQuery<any[]>({
    queryKey: ["/api/trips"]
  });

  const { data: userTrips = [], isLoading: userTripsLoading } = useQuery<any[]>({
    queryKey: ["/api/trips/user"]
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<any[]>({
    queryKey: ["/api/reviews"]
  });

  const welcomeMessage = t('home.welcome_title');

  return (
    <div className="bg-gray-50 pb-20 md:pb-0">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{welcomeMessage}</h1>
            <p className="text-xl opacity-90 mb-6">{t('home.welcome_message')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button asChild className="bg-white text-primary hover:bg-gray-100 px-6 py-3">
                <Link href="/my-trips">
                  <Plus className="w-5 h-5 mr-2" />
                  {t('home.new_trip')}
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-6 py-3">
                <Link href="/community">
                  <Users className="w-5 h-5 mr-2" />
                  {t('navigation.community')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Trips */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-700">{t('trips.my_trips')}</h2>
                <Button asChild className="bg-primary hover:bg-orange-600">
                  <Link href="/my-trips">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('home.new_trip')}
                  </Link>
                </Button>
              </div>
              
              {userTripsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : userTrips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userTrips.slice(0, 4).map((trip: any) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 border-gray-300">
                  <CardContent className="p-8 text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('home.no_trips_yet')}</h3>
                    <p className="text-gray-500 mb-4">{t('home.start_first_adventure')}</p>
                    <Button asChild className="bg-primary hover:bg-orange-600">
                      <Link href="/my-trips">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('home.create_first_trip')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Personalized Recommendations */}
            <PersonalizedRecommendations className="mb-12" />

            {/* Popular Journeys */}
            <PopularJourneysSection />

            {/* Popular Routes */}
            <section className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-700">{t('home.popular_routes')}</h2>
                <Button variant="outline">{t('home.view_all')}</Button>
              </div>
              
              {tripsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trips.slice(0, 4).map((trip: any) => (
                    <TripCard key={trip.id} trip={trip} showUser />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                  {t('home.your_stats')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t('home.trips_planned')}</span>
                  <Badge variant="secondary">{userTrips.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t('home.countries_visited')}</span>
                  <Badge variant="secondary">
                    {new Set(userTrips.flatMap((trip: any) => 
                      trip.destinations?.map((d: any) => d.country) || []
                    )).size}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t('home.reviews_written')}</span>
                  <Badge variant="secondary">
                    {reviews.filter((r: any) => r.userId === (user?.id || 'demo-user')).length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Community Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-secondary" />
                  {t('home.community_activity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="h-3 bg-gray-200 rounded flex-1"></div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review: any) => (
                      <div key={review.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <img 
                            src={review.user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"} 
                            alt="User" 
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-sm font-medium text-slate-700">
                            {review.user?.firstName} {review.user?.lastName}
                          </span>
                          <div className="flex">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-accent fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          {review.destination}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">{t('home.no_recent_activity')}</p>
                )}
                
                <Button asChild variant="outline" size="sm" className="w-full mt-4">
                  <Link href="/community">
                    {t('home.view_all_activity')}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('home.quick_actions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/my-trips" className="block">
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('home.new_trip')}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/budget-tracker" className="block">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {t('home.track_expenses')}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/community" className="block">
                    <Users className="w-4 h-4 mr-2" />
                    {t('home.find_travel_buddies')}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* AI Travel Assistant */}
            <AiChat className="mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Popular Journeys Section Component
function PopularJourneysSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  const { data: journeys = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/journeys", { limit: 4 }],
    enabled: true,
  });

  const formatDestinationChain = (destinations: any[]) => {
    if (!destinations || destinations.length === 0) return '';
    const arrow = isRTL ? '→' : '←';
    return destinations.map(d => d.name).join(` ${arrow} `);
  };

  return (
    <section className="mb-12">
      <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-orange-600" dir={isRTL ? 'rtl' : 'ltr'}>
            <MapPin className="inline w-6 h-6 mr-2 mb-1" />
            {isRTL ? 'מסעות פופולריים ברחבי העולם' : 'Popular Multi-Destination Journeys'}
          </h2>
        </div>
        <Button asChild variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
          <Link href="/journeys">
            <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'כל המסעות →' : 'All Journeys →'}</span>
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse overflow-hidden">
              <div className="h-32 bg-gray-200"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-3"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : journeys.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {journeys.slice(0, 4).map((journey) => (
            <Link key={journey.id} href={`/journeys/${journey.id}`}>
              <Card className="h-full overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={journey.heroImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828'}
                    alt={journey.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-2 line-clamp-1" dir={isRTL ? 'rtl' : 'ltr'}>{journey.title}</h3>
                  <div className={`flex items-center gap-1 text-xs text-orange-600 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate" dir={isRTL ? 'rtl' : 'ltr'}>
                      {formatDestinationChain(journey.destinations)}
                    </span>
                  </div>
                  <div className={`flex items-center gap-3 text-xs text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Calendar className="w-3 h-3" />
                      <span>{journey.totalNights} {isRTL ? 'לילות' : 'nights'}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{parseFloat(journey.rating || '0').toFixed(1)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
