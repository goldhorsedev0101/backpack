import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Cloud, Star, Calendar, DollarSign, Languages, Clock, ArrowLeft, Bookmark, Share2, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import DestinationGallery from "@/components/DestinationGallery";

interface Attraction {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  types: string[];
  photos?: Array<{ photo_reference: string }>;
}

export default function DestinationDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');

  // Mock destination data (in real app, fetch from API)
  const destination = {
    id: slug,
    name: slug === "paris" ? "Paris" : slug === "tokyo" ? "Tokyo" : slug === "barcelona" ? "Barcelona" : "Destination",
    country: slug === "paris" ? "France" : slug === "tokyo" ? "Japan" : slug === "barcelona" ? "Spain" : "Country",
    continent: slug === "paris" ? "Europe" : slug === "tokyo" ? "Asia" : slug === "barcelona" ? "Europe" : "Unknown",
    description: "An amazing travel destination with rich culture and beautiful sights",
    flag: slug === "paris" ? "🇫🇷" : slug === "tokyo" ? "🇯🇵" : slug === "barcelona" ? "🇪🇸" : "🌍",
    currency: slug === "paris" ? "EUR (€)" : slug === "tokyo" ? "JPY (¥)" : slug === "barcelona" ? "EUR (€)" : "USD",
    languages: slug === "paris" ? ["French"] : slug === "tokyo" ? ["Japanese"] : slug === "barcelona" ? ["Spanish", "Catalan"] : ["English"],
    timezone: slug === "paris" ? "UTC+1" : slug === "tokyo" ? "UTC+9" : slug === "barcelona" ? "UTC+1" : "UTC",
    bestTime: slug === "paris" ? "April-June, September-October" : slug === "tokyo" ? "March-May, September-November" : "May-June, September-October",
    lat: slug === "paris" ? 48.8566 : slug === "tokyo" ? 35.6762 : slug === "barcelona" ? 41.3874 : 0,
    lon: slug === "paris" ? 2.3522 : slug === "tokyo" ? 139.6503 : slug === "barcelona" ? 2.1686 : 0,
  };

  // Fetch feature flags (must be first!)
  const { data: featureFlags } = useQuery<{
    googlePlaces: boolean;
    openWeather: boolean;
    geoNames: boolean;
    tripAdvisor: boolean;
    tbo: boolean;
  }>({
    queryKey: ["/api/destinations/feature-flags"],
  });

  // Fetch attractions from Google Places
  const { data: attractions, isLoading: attractionsLoading } = useQuery<Attraction[]>({
    queryKey: ["/api/places/search", destination.name],
    queryFn: async () => {
      // Search for tourist attractions instead of the city itself
      const searchQuery = `tourist attractions in ${destination.name}`;
      const response = await fetch(`/api/places/search?query=${encodeURIComponent(searchQuery)}&type=tourist_attraction`);
      if (!response.ok) throw new Error('Failed to fetch attractions');
      const data = await response.json();
      // Filter to show only actual attractions (not the city itself)
      const filtered = (data.results || [])
        .filter((place: Attraction) => 
          !place.types.includes('locality') && 
          !place.types.includes('political') &&
          (place.types.includes('tourist_attraction') || 
           place.types.includes('point_of_interest') ||
           place.types.includes('museum') ||
           place.types.includes('art_gallery') ||
           place.types.includes('park'))
        )
        .slice(0, 3);
      return filtered;
    },
    enabled: !!destination.name && featureFlags?.googlePlaces === true,
  });

  // Fetch weather data
  const { data: weatherData, isLoading: weatherLoading } = useQuery({
    queryKey: ["/api/destinations/weather", destination.lat, destination.lon, units, i18n.language],
    queryFn: async () => {
      const response = await fetch(
        `/api/destinations/weather?lat=${destination.lat}&lon=${destination.lon}&units=${units}&lang=${i18n.language}`
      );
      if (!response.ok) throw new Error('Failed to fetch weather');
      return response.json();
    },
    enabled: !!destination.lat && !!destination.lon && featureFlags?.openWeather === true,
  });

  // Provider status (default to false when flags not loaded)
  const providers = {
    googlePlaces: featureFlags?.googlePlaces ?? false,
    weather: featureFlags?.openWeather ?? false,
    tripadvisor: featureFlags?.tripAdvisor ?? false,
    booking: featureFlags?.tbo ?? false,
  };

  // Get hero image URL
  const getHeroImageUrl = () => {
    const params = new URLSearchParams({
      source: 'unsplash',
      query: `${destination.name} cityscape`,
      maxwidth: '1920',
      lang: i18n.language,
    });
    return `/api/media/proxy?${params}`;
  };

  // Get attraction image URL
  const getAttractionImageUrl = (photoRef: string) => {
    const params = new URLSearchParams({
      source: 'google',
      ref: photoRef,
      maxwidth: '200',
      lang: i18n.language,
    });
    return `/api/media/proxy?${params}`;
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero Section with Background Image */}
      <div className="relative h-[400px] bg-gradient-to-br from-blue-500 to-purple-600">
        <img 
          src={getHeroImageUrl()} 
          alt={destination.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="container mx-auto px-4 h-full flex flex-col justify-between py-8 relative z-10">
          {/* Back Button */}
          <div>
            <Link href="/destinations">
              <Button variant="ghost" className="text-white hover:bg-white/20" data-testid="button-back">
                <ArrowLeft className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("destinations.hub_title")}
              </Button>
            </Link>
          </div>

          {/* Title */}
          <div className="text-white">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-8xl">{destination.flag}</span>
              <div>
                <h1 className="text-5xl font-bold mb-2">{t(`destinations.cities.${slug}`)}</h1>
                <p className="text-xl opacity-90">
                  {t(`trips.countries.${destination.country}`) || destination.country} • {t(`trips.continents.${destination.continent}`)}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" data-testid="button-save">
              <Bookmark className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("destinations.card.save")}
            </Button>
            <Button variant="secondary" size="sm" data-testid="button-add-trip">
              <MapPin className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("destinations.card.add_to_trip")}
            </Button>
            <Button variant="secondary" size="sm" data-testid="button-share">
              <Share2 className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("destinations.card.share")}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle>{t("destinations.detail.overview")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{t(`destinations.city_descriptions.${slug}`)}</p>
              </CardContent>
            </Card>

            {/* Photo Gallery */}
            <Card>
              <CardHeader>
                <CardTitle>{t("destinations.detail.gallery.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <DestinationGallery
                  destinationName={destination.name}
                  heroImages={[
                    { source: 'unsplash', query: `${destination.name} cityscape`, alt: destination.name },
                    { source: 'pexels', query: destination.name, alt: `${destination.name} view` }
                  ]}
                  poiImages={
                    attractions
                      ?.filter(attr => attr.photos && attr.photos.length > 0)
                      .slice(0, 3)
                      .map((attr) => ({
                        source: 'google' as const,
                        ref: attr.photos![0].photo_reference,
                        alt: attr.name
                      })) || []
                  }
                  isLoading={attractionsLoading}
                />
              </CardContent>
            </Card>

            {/* Top Attractions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    {t("destinations.detail.top_attractions")}
                  </CardTitle>
                  {providers.googlePlaces && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {t("destinations.states.live_badge")}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {attractionsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-20 w-20 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : attractions && attractions.length > 0 ? (
                  <div className="space-y-4">
                    {attractions.slice(0, 5).map((attraction) => (
                      <div key={attraction.place_id} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition" data-testid={`attraction-${attraction.place_id}`}>
                        {attraction.photos && attraction.photos.length > 0 ? (
                          <img 
                            src={getAttractionImageUrl(attraction.photos[0].photo_reference)}
                            alt={attraction.name}
                            className="h-20 w-20 rounded-lg object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-20 w-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-3xl">
                            📍
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-lg mb-1">{attraction.name}</h4>
                          <p className="text-sm text-gray-500 mb-2">{attraction.formatted_address}</p>
                          {attraction.rating && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="flex items-center gap-1">
                                ⭐ {attraction.rating}
                              </span>
                              {attraction.user_ratings_total && (
                                <span className="text-gray-400">({attraction.user_ratings_total} reviews)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">{t("destinations.states.no_results")}</p>
                )}
              </CardContent>
            </Card>

            {/* Weather */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    {t("destinations.detail.weather")}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {providers.weather && weatherData && (
                      <div className="flex items-center gap-1 text-xs bg-gray-100 rounded-full p-1">
                        <button
                          onClick={() => setUnits('metric')}
                          className={`px-2 py-1 rounded-full transition ${
                            units === 'metric' ? 'bg-white shadow-sm' : 'text-gray-500'
                          }`}
                          data-testid="button-celsius"
                        >
                          °C
                        </button>
                        <button
                          onClick={() => setUnits('imperial')}
                          className={`px-2 py-1 rounded-full transition ${
                            units === 'imperial' ? 'bg-white shadow-sm' : 'text-gray-500'
                          }`}
                          data-testid="button-fahrenheit"
                        >
                          °F
                        </button>
                      </div>
                    )}
                    {providers.weather ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {t("destinations.states.live_badge")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        {t("destinations.states.soon_badge")}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {weatherLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">{t("destinations.detail.loading_weather")}</p>
                  </div>
                ) : !providers.weather ? (
                  <div className="text-center py-12">
                    <Cloud className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">{t("destinations.states.soon_badge")}</p>
                    <p className="text-sm text-gray-400 mt-1">{t("destinations.detail.weather_unavailable")}</p>
                  </div>
                ) : !destination.lat || !destination.lon ? (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">{t("destinations.detail.no_location")}</p>
                  </div>
                ) : weatherData ? (
                  <>
                    <div className="flex items-center gap-6 mb-6">
                      <div className="text-5xl">
                        <img 
                          src={`https://openweathermap.org/img/wn/${weatherData.current.icon}@2x.png`}
                          alt={weatherData.current.description}
                          className="w-20 h-20"
                        />
                      </div>
                      <div>
                        <div className="text-4xl font-bold">
                          {weatherData.current.temp}°{units === 'metric' ? 'C' : 'F'}
                        </div>
                        <p className="text-gray-600 capitalize">{weatherData.current.description}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {t("destinations.detail.feels_like")} {weatherData.current.feelsLike}°
                        </p>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">{t("destinations.detail.humidity")}</p>
                          <p className="font-medium">{weatherData.current.humidity}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">{t("destinations.detail.wind")}</p>
                          <p className="font-medium">
                            {weatherData.current.windSpeed} {units === 'metric' ? 'm/s' : 'mph'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">{t("destinations.detail.pressure")}</p>
                          <p className="font-medium">{weatherData.current.pressure} hPa</p>
                        </div>
                        <div>
                          <p className="text-gray-500">{t("destinations.detail.visibility")}</p>
                          <p className="font-medium">{(weatherData.current.visibility / 1000).toFixed(1)} km</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">{t("destinations.detail.forecast")}</h4>
                      <div className="grid grid-cols-5 gap-2">
                        {weatherData.forecast.map((day: any, idx: number) => (
                          <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-2">
                              {new Date(day.dt * 1000).toLocaleDateString(i18n.language, { weekday: 'short' })}
                            </p>
                            <img 
                              src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                              alt={day.description}
                              className="w-10 h-10 mx-auto"
                            />
                            <p className="text-sm mt-1">
                              <span className="font-medium">{day.tempMax}°</span>
                              <span className="text-gray-400"> / {day.tempMin}°</span>
                            </p>
                            {day.pop > 0 && (
                              <p className="text-xs text-blue-600 mt-1">💧 {day.pop}%</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Basics */}
            <Card>
              <CardHeader>
                <CardTitle>{t("destinations.detail.basics")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">{t("destinations.detail.currency")}</p>
                    <p className="text-sm text-gray-600">{destination.currency}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Languages className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">{t("destinations.detail.languages")}</p>
                    <p className="text-sm text-gray-600">{destination.languages.join(", ")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">{t("destinations.detail.timezone")}</p>
                    <p className="text-sm text-gray-600">{destination.timezone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">{t("destinations.detail.best_time")}</p>
                    <p className="text-sm text-gray-600">{destination.bestTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t("destinations.detail.view_on_map")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Map view</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {destination.lat.toFixed(4)}, {destination.lon.toFixed(4)}
                    </p>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline" data-testid="button-directions">
                  <Navigation className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                  {t("destinations.detail.get_directions")}
                </Button>
              </CardContent>
            </Card>

            {/* Booking (Stub) */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("destinations.detail.booking")}</CardTitle>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    {t("destinations.states.soon_badge")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline" disabled>
                  {t("destinations.detail.hotels")}
                </Button>
                <Button className="w-full" variant="outline" disabled>
                  {t("destinations.detail.flights")}
                </Button>
                <Button className="w-full" variant="outline" disabled>
                  {t("destinations.detail.packages")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
