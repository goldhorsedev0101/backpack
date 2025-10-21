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
  Bot,
  Globe,
  Sparkles,
  Zap,
  Shield,
  Heart,
  Compass,
  Award,
  TrendingDown,
  Plane
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
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-teal-500 text-white py-20 px-4 sm:px-6 lg:px-8">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">AI-Powered Travel Planning</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
              {welcomeMessage}
            </h1>
            <p className="text-xl md:text-2xl opacity-95 mb-8 max-w-3xl mx-auto animate-fade-in-up delay-100">
              {t('home.welcome_message')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
              <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <Link href="/my-trips">
                  <Plus className="w-5 h-5 mr-2" />
                  {t('home.new_trip')}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <Link href="/destinations">
                  <Globe className="w-5 h-5 mr-2" />
                  {t('navigation.destinations')}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="#f9fafb" fillOpacity="1" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard icon={Globe} value="70+" label={t('home.countries_available') || "Countries"} gradient="from-orange-400 to-red-500" />
          <StatsCard icon={Users} value="10K+" label={t('home.happy_travelers') || "Happy Travelers"} gradient="from-teal-400 to-cyan-500" />
          <StatsCard icon={MapPin} value="500+" label={t('home.destinations') || "Destinations"} gradient="from-blue-400 to-indigo-500" />
          <StatsCard icon={Star} value="4.9/5" label={t('home.average_rating') || "Average Rating"} gradient="from-purple-400 to-pink-500" />
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            {t('home.why_choose_us') || "Why Choose GlobeMate?"}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('home.features_subtitle') || "Everything you need for the perfect trip, all in one place"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={Bot} 
            title={t('home.ai_planning') || "AI-Powered Planning"}
            description={t('home.ai_planning_desc') || "Get personalized itineraries tailored to your preferences"}
            gradient="from-orange-50 to-orange-100"
            iconColor="text-orange-600"
          />
          <FeatureCard 
            icon={DollarSign} 
            title={t('home.budget_tracking') || "Smart Budget Tracking"}
            description={t('home.budget_tracking_desc') || "Track expenses and stay within your budget effortlessly"}
            gradient="from-teal-50 to-teal-100"
            iconColor="text-teal-600"
          />
          <FeatureCard 
            icon={Users} 
            title={t('home.community') || "Global Community"}
            description={t('home.community_desc') || "Connect with travelers and share experiences"}
            gradient="from-blue-50 to-blue-100"
            iconColor="text-blue-600"
          />
          <FeatureCard 
            icon={Plane} 
            title={t('home.verified_places') || "Unbeatable Prices"}
            description={t('home.verified_places_desc') || "Book hotels, flights and vacation packages at the best prices"}
            gradient="from-purple-50 to-purple-100"
            iconColor="text-purple-600"
          />
          <FeatureCard 
            icon={Compass} 
            title={t('home.curated_journeys') || "Curated Journeys"}
            description={t('home.curated_journeys_desc') || "Pre-planned multi-city adventures"}
            gradient="from-pink-50 to-pink-100"
            iconColor="text-pink-600"
          />
          <FeatureCard 
            icon={Zap} 
            title={t('home.real_time') || "Real-Time Updates"}
            description={t('home.real_time_desc') || "Live weather data and travel recommendations"}
            gradient="from-amber-50 to-amber-100"
            iconColor="text-amber-600"
          />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Trips */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-orange-600" />
                  {t('trips.my_trips')}
                </h2>
                <Button asChild className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all">
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
                <Card className="border-dashed border-2 border-gray-300 bg-gradient-to-br from-orange-50 via-teal-50 to-blue-50 hover:shadow-lg transition-all">
                  <CardContent className="p-8 text-center">
                    <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-md">
                      <MapPin className="w-10 h-10 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('home.no_trips_yet')}</h3>
                    <p className="text-gray-600 mb-4">{t('home.start_first_adventure')}</p>
                    <Button asChild className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all">
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
                <h2 className="text-2xl font-bold text-slate-700 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-teal-600" />
                  {t('home.popular_routes')}
                </h2>
                <Button variant="outline" className="hover:bg-teal-50 hover:border-teal-500 hover:text-teal-700 transition-all">
                  {t('home.view_all')}
                </Button>
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
            {/* AI Travel Assistant */}
            <div>
              <AiChat />
              <div className="mt-3 px-3">
                <Button asChild variant="outline" size="sm" className="w-full hover:bg-orange-50 hover:border-orange-500 hover:text-orange-700 transition-all">
                  <Link href="/ai-assistant">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {t('navigation.chat_history')}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <Card className="border-t-4 border-t-orange-500 shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
                  {t('home.your_stats')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
                  <span className="text-gray-700 font-medium">{t('home.trips_planned')}</span>
                  <Badge className="bg-orange-600 text-white">{userTrips.length}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-teal-50 hover:bg-teal-100 transition-colors">
                  <span className="text-gray-700 font-medium">{t('home.countries_visited')}</span>
                  <Badge className="bg-teal-600 text-white">
                    {new Set(userTrips.flatMap((trip: any) => 
                      trip.destinations?.map((d: any) => d.country) || []
                    )).size}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                  <span className="text-gray-700 font-medium">{t('home.reviews_written')}</span>
                  <Badge className="bg-blue-600 text-white">
                    {reviews.filter((r: any) => r.userId === (user?.id || 'demo-user')).length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Community Activity */}
            <Card className="border-t-4 border-t-teal-500 shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-teal-600" />
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
                      <div key={review.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0 hover:bg-gray-50 p-2 rounded transition-colors">
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
                              <Star key={i} className="w-3 h-3 text-amber-500 fill-current" />
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
                
                <Button asChild variant="outline" size="sm" className="w-full mt-4 hover:bg-teal-50 hover:border-teal-500 hover:text-teal-700 transition-all">
                  <Link href="/community">
                    {t('home.view_all_activity')}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-t-4 border-t-blue-500 shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-blue-600" />
                  {t('home.quick_actions')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start hover:bg-orange-50 hover:border-orange-500 hover:text-orange-700 transition-all">
                  <Link href="/my-trips" className="block">
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('home.new_trip')}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start hover:bg-purple-50 hover:border-purple-500 hover:text-purple-700 transition-all">
                  <Link href="/ai-assistant" className="block">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {t('navigation.chat_history')}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start hover:bg-teal-50 hover:border-teal-500 hover:text-teal-700 transition-all">
                  <Link href="/budget-tracker" className="block">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {t('home.track_expenses')}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 transition-all">
                  <Link href="/community" className="block">
                    <Users className="w-4 h-4 mr-2" />
                    {t('home.find_travel_buddies')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ icon: Icon, value, label, gradient }: { 
  icon: any; 
  value: string; 
  label: string; 
  gradient: string;
}) {
  return (
    <Card className={`bg-gradient-to-br ${gradient} text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer`}>
      <CardContent className="p-6 text-center">
        <Icon className="w-8 h-8 mx-auto mb-3 opacity-90" />
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-sm opacity-90">{label}</div>
      </CardContent>
    </Card>
  );
}

// Feature Card Component
function FeatureCard({ icon: Icon, title, description, gradient, iconColor }: {
  icon: any;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
}) {
  return (
    <Card className={`bg-gradient-to-br ${gradient} border-0 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer group`}>
      <CardContent className="p-6">
        <div className={`${iconColor} mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}

// Popular Journeys Section Component
function PopularJourneysSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  
  // Journey translations
  const journeyTranslations: Record<string, { title: string; description: string }> = {
    'Southeast Asia Adventure': {
      title: 'הרפתקה בדרום מזרח אסיה',
      description: 'מבנגקוק התוססת למקדשים שלווים וחופים גן עדן - חוויית תאילנד האולטימטיבית'
    },
    'Japan Extended Discovery': {
      title: 'מסע מורחב ביפן',
      description: 'מסע סוחף דרך הערים האייקוניות של יפן, מאורות הניאון של טוקיו להירושימה'
    },
    'Classic Japan Circuit': {
      title: 'מעגל יפן קלאסי',
      description: 'גלו את השילוב המושלם של מסורות עתיקות וחדשנות מודרנית בערים האייקוניות של יפן'
    },
    'Grand European Journey': {
      title: 'מסע אירופי גדול',
      description: 'חוויה אירופית מקיפה דרך חמש ערים אגדיות, מהרומנטיקה של פריז לקסם של ברלין'
    }
  };
  
  const translateJourney = (journey: any) => {
    if (!isRTL) return { title: journey.title, description: journey.description };
    const translation = journeyTranslations[journey.title];
    return translation || { title: journey.title, description: journey.description };
  };

  const { data: journeys = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/journeys", { limit: 4 }],
    enabled: true,
  });

  const translateCityName = (cityName: string) => {
    const cityTranslations: Record<string, { he: string; en: string }> = {
      'Tokyo': { he: 'טוקיו', en: 'Tokyo' },
      'Kyoto': { he: 'קיוטו', en: 'Kyoto' },
      'Osaka': { he: 'אוסקה', en: 'Osaka' },
      'Hiroshima': { he: 'הירושימה', en: 'Hiroshima' },
      'Paris': { he: 'פריז', en: 'Paris' },
      'Amsterdam': { he: 'אמסטרדם', en: 'Amsterdam' },
      'Berlin': { he: 'ברלין', en: 'Berlin' },
      'Vienna': { he: 'וינה', en: 'Vienna' },
      'Prague': { he: 'פראג', en: 'Prague' },
      'Bangkok': { he: 'בנגקוק', en: 'Bangkok' },
      'Phuket': { he: 'פוקט', en: 'Phuket' },
      'Chiang Mai': { he: 'צ\'יאנג מאי', en: 'Chiang Mai' },
      'Krabi': { he: 'קראבי', en: 'Krabi' },
      'Athens': { he: 'אתונה', en: 'Athens' },
      'Santorini': { he: 'סנטוריני', en: 'Santorini' },
      'Mykonos': { he: 'מיקונוס', en: 'Mykonos' },
      'Crete': { he: 'כרתים', en: 'Crete' },
      'New York': { he: 'ניו יורק', en: 'New York' },
      'Las Vegas': { he: 'לאס וגאס', en: 'Las Vegas' },
      'Los Angeles': { he: 'לוס אנג\'לס', en: 'Los Angeles' },
      'San Francisco': { he: 'סן פרנסיסקו', en: 'San Francisco' },
    };
    const currentLang = i18n.language as 'he' | 'en';
    return cityTranslations[cityName]?.[currentLang] || cityName;
  };

  const formatDestinations = (destinations: any) => {
    if (!destinations || destinations.length === 0) return '';
    // Handle both string arrays and object arrays
    const cityNames = Array.isArray(destinations) 
      ? destinations.map(d => typeof d === 'string' ? d : d.city || d.name || d)
      : [];
    const translatedDests = cityNames.map(d => translateCityName(d));
    return isRTL 
      ? translatedDests.join(' ← ')  // Hebrew: left to right visually
      : translatedDests.join(' → ');  // English: left to right
  };

  if (isLoading) {
    return (
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-700">{t('journeys.popular_journeys')}</h2>
        </div>
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
      </section>
    );
  }

  if (journeys.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-700 flex items-center gap-2">
          <Compass className="w-6 h-6 text-purple-600" />
          {t('journeys.popular_journeys')}
        </h2>
        <Button asChild variant="outline" className="hover:bg-purple-50 hover:border-purple-500 hover:text-purple-700 transition-all">
          <Link href="/journeys">
            {t('home.view_all')}
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {journeys.slice(0, 4).map((journey: any) => {
          const translated = translateJourney(journey);
          return (
          <Link key={journey.id} href={`/journeys/${journey.id}`}>
            <Card className="hover:shadow-xl transition-all cursor-pointer group border-t-4 border-t-purple-500 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-purple-700 transition-colors" dir={isRTL ? 'rtl' : 'ltr'}>
                    {translated.title}
                  </h3>
                  <Badge className="bg-purple-600 text-white">
                    {journey.totalNights || journey.total_nights} {t('journeys.nights')}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2" dir={isRTL ? 'rtl' : 'ltr'}>
                  {translated.description}
                </p>
                
                <div className="text-sm font-medium text-slate-700 mb-3" dir={isRTL ? 'rtl' : 'ltr'}>
                  {formatDestinations(journey.destinations)}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-amber-600">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    <span className="font-medium">{journey.rating || '4.8'}</span>
                  </div>
                  {(journey.priceMin || journey.price_min) && (journey.priceMax || journey.price_max) && (
                    <span className="text-slate-600 font-semibold" dir={isRTL ? 'rtl' : 'ltr'}>
                      {isRTL 
                        ? `₪${Math.round((journey.priceMax || journey.price_max) * 3.5)} - ₪${Math.round((journey.priceMin || journey.price_min) * 3.5)}` 
                        : `$${journey.priceMin || journey.price_min} - $${journey.priceMax || journey.price_max}`
                      }
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
          );
        })}
      </div>
    </section>
  );
}
