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

interface Attraction {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  types: string[];
}

export default function DestinationDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";

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

  // Fetch attractions from Google Places
  const { data: attractions, isLoading: attractionsLoading } = useQuery<Attraction[]>({
    queryKey: ["/api/places/search", { query: destination.name, limit: 6 }],
    enabled: !!destination.name,
  });

  // Fetch feature flags
  const { data: featureFlags } = useQuery<{
    googlePlaces: boolean;
    openWeather: boolean;
    geoNames: boolean;
    tripAdvisor: boolean;
    tbo: boolean;
  }>({
    queryKey: ["/api/destinations/feature-flags"],
  });

  // Fetch weather data
  const { data: weatherData, isLoading: weatherLoading } = useQuery({
    queryKey: ["/api/destinations/weather", { lat: destination.lat, lon: destination.lon }],
    enabled: !!destination.lat && !!destination.lon && featureFlags?.openWeather === true,
  });

  // Default weather data for display
  const displayWeather = weatherData || {
    temperature: 22,
    description: "Partly cloudy",
    humidity: 65,
    wind_speed: 12,
  };

  const forecastData = [
    { day: "Today", high: 24, low: 18, icon: "☀️" },
    { day: "Tomorrow", high: 23, low: 17, icon: "🌤️" },
    { day: "Day 3", high: 25, low: 19, icon: "☁️" },
  ];

  // Provider status (default to false when flags not loaded)
  const providers = {
    googlePlaces: featureFlags?.googlePlaces ?? false,
    weather: featureFlags?.openWeather ?? false,
    tripadvisor: featureFlags?.tripAdvisor ?? false,
    booking: featureFlags?.tbo ?? false,
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <div className="relative h-[400px] bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="absolute inset-0 bg-black/20" />
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
                        <div className="h-20 w-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-3xl">
                          📍
                        </div>
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
              </CardHeader>
              <CardContent>
                {weatherLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">Loading weather...</p>
                  </div>
                ) : !providers.weather ? (
                  <div className="text-center py-12">
                    <Cloud className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">{t("destinations.states.soon_badge")}</p>
                    <p className="text-sm text-gray-400 mt-1">Weather data will be available soon</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-6 mb-6">
                      <div className="text-5xl">☀️</div>
                      <div>
                        <div className="text-4xl font-bold">{displayWeather.temperature}°C</div>
                        <p className="text-gray-600">{displayWeather.description}</p>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Humidity</p>
                          <p className="font-medium">{displayWeather.humidity}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Wind</p>
                          <p className="font-medium">{displayWeather.wind_speed} km/h</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {forecastData.map((day, idx) => (
                        <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-2">{day.day}</p>
                          <div className="text-2xl mb-2">{day.icon}</div>
                          <p className="text-sm">
                            <span className="font-medium">{day.high}°</span>
                            <span className="text-gray-400"> / {day.low}°</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
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
