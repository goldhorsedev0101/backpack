import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Database, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface DemoDestination {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

const DEMO_DESTINATIONS: DemoDestination[] = [
  { id: "barcelona", name: "Barcelona", country: "Spain", lat: 41.3874, lon: 2.1686 },
  { id: "tokyo", name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
  { id: "newyork", name: "New York", country: "United States", lat: 40.7128, lon: -74.0060 },
  { id: "telaviv", name: "Tel Aviv", country: "Israel", lat: 32.0853, lon: 34.7818 },
];

export default function IntegrationsDemoDestinations() {
  const { t, i18n } = useTranslation();
  const [_, navigate] = useLocation();
  const isRTL = i18n.language === "he";

  const [selectedDestination, setSelectedDestination] = useState<DemoDestination>(DEMO_DESTINATIONS[0]);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [cacheHit, setCacheHit] = useState<boolean>(false);

  // Fetch attractions mutation
  const attractionsMutation = useMutation({
    mutationFn: async (dest: DemoDestination) => {
      const startTime = Date.now();
      
      const response = await fetch(`/api/places/search?query=${encodeURIComponent(dest.name)}&limit=5`);
      
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      
      // Check if from cache (simplified - in real app check headers)
      setCacheHit(response.headers.get('x-cache') === 'HIT');
      
      if (!response.ok) {
        throw new Error('Failed to fetch attractions');
      }
      
      return response.json();
    },
  });

  const handleFetchAttractions = () => {
    attractionsMutation.mutate(selectedDestination);
  };

  const handleOpenDestinationPage = () => {
    navigate(`/destinations/${selectedDestination.id}`);
  };

  return (
    <div className={`min-h-screen bg-gray-50 py-8 px-4 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">{t("destinations.demo.title")}</h1>
          <p className="text-lg text-gray-600">{t("destinations.demo.subtitle")}</p>
        </div>

        {/* Demo Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("destinations.demo.query_label")}</CardTitle>
            <CardDescription>Select a destination to test Google Places API integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={selectedDestination.id}
              onValueChange={(id) => {
                const dest = DEMO_DESTINATIONS.find((d) => d.id === id);
                if (dest) setSelectedDestination(dest);
              }}
            >
              <SelectTrigger data-testid="select-demo-destination">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEMO_DESTINATIONS.map((dest) => (
                  <SelectItem key={dest.id} value={dest.id}>
                    {dest.name}, {dest.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-3">
              <Button
                onClick={handleFetchAttractions}
                disabled={attractionsMutation.isPending}
                className="flex-1"
                data-testid="button-fetch-attractions"
              >
                {attractionsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("destinations.demo.fetch_attractions")}
              </Button>
              <Button
                onClick={handleOpenDestinationPage}
                variant="outline"
                className="flex-1"
                data-testid="button-open-destination"
              >
                <MapPin className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("destinations.demo.open_page")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Metrics */}
        {responseTime !== null && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{t("destinations.demo.response_time")}</p>
                  <p className="text-2xl font-bold text-blue-700">{responseTime}ms</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{t("destinations.demo.cache_hit")}</p>
                  <p className="text-2xl font-bold text-purple-700">{cacheHit ? "Yes" : "No"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Provider Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {t("destinations.demo.provider")} Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Google Places API</span>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                  {t("destinations.states.live_badge")}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-amber-600" />
                  <span className="font-medium">OpenWeather API</span>
                </div>
                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                  {t("destinations.states.soon_badge")}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-amber-600" />
                  <span className="font-medium">TripAdvisor API</span>
                </div>
                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                  {t("destinations.states.soon_badge")}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-amber-600" />
                  <span className="font-medium">TBO Booking API</span>
                </div>
                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                  {t("destinations.states.soon_badge")}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {attractionsMutation.isSuccess && attractionsMutation.data && (
          <Card>
            <CardHeader>
              <CardTitle>API Response - Attractions</CardTitle>
              <CardDescription>
                Found {attractionsMutation.data.length} attractions in {selectedDestination.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attractionsMutation.data.map((attraction: any) => (
                  <div
                    key={attraction.place_id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <h4 className="font-medium text-lg mb-1">{attraction.name}</h4>
                    <p className="text-sm text-gray-500 mb-2">{attraction.formatted_address}</p>
                    {attraction.rating && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="flex items-center gap-1">⭐ {attraction.rating}</span>
                        {attraction.user_ratings_total && (
                          <span className="text-gray-400">({attraction.user_ratings_total} reviews)</span>
                        )}
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {attraction.types?.slice(0, 3).map((type: string) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {attractionsMutation.isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-700">
                <XCircle className="h-6 w-6" />
                <div>
                  <p className="font-medium">Error fetching attractions</p>
                  <p className="text-sm">{attractionsMutation.error?.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Separator className="my-8" />

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>This demo page tests the Destinations Hub integrations</p>
          <p className="mt-2">
            <Link href="/destinations" className="text-blue-600 hover:underline">
              Go to Destinations Hub →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
