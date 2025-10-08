import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, MapPin, Loader2, AlertCircle, Hotel, UtensilsCrossed, Landmark, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInfiniteDestinations } from "@/hooks/useInfiniteDestinations";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

// Popular world destinations with coordinates
const POPULAR_DESTINATIONS = [
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, flag: "🇫🇷" },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, flag: "🇯🇵" },
  { name: "New York", country: "USA", lat: 40.7128, lng: -74.0060, flag: "🇺🇸" },
  { name: "London", country: "UK", lat: 51.5074, lng: -0.1278, flag: "🇬🇧" },
  { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708, flag: "🇦🇪" },
  { name: "Barcelona", country: "Spain", lat: 41.3851, lng: 2.1734, flag: "🇪🇸" },
  { name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964, flag: "🇮🇹" },
  { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093, flag: "🇦🇺" },
  { name: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784, flag: "🇹🇷" },
  { name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018, flag: "🇹🇭" },
];

export default function DestinationsHub() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";

  const [activeTab, setActiveTab] = useState<string>("destinations");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState(POPULAR_DESTINATIONS[0]);
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(true);

  // Map tab to Google Places type
  const getPlaceType = (tab: string) => {
    switch (tab) {
      case "accommodations":
        return "lodging";
      case "restaurants":
        return "restaurant";
      case "attractions":
        return "tourist_attraction";
      default:
        return undefined;
    }
  };

  const { places, isLoading, isLoadingMore, error, hasMore, loadMore, meta } = 
    useInfiniteDestinations({
      lat: selectedDestination.lat,
      lng: selectedDestination.lng,
      radius: 10000, // 10km around selected destination
      type: getPlaceType(activeTab),
      lang: i18n.language,
      enabled: activeTab !== "destinations"
    });

  // Intersection observer for infinite scroll
  const sentinelRef = useIntersectionObserver({
    onIntersect: () => {
      if (infiniteScrollEnabled && hasMore && !isLoadingMore && activeTab !== "destinations") {
        loadMore();
        console.log('[Telemetry] infinite_scroll_page_loaded', {
          tab: activeTab,
          page: meta?.currentPage ? meta.currentPage + 1 : 2,
          totalLoaded: meta?.totalLoaded || 0,
          hasNext: hasMore
        });
      }
    },
    enabled: infiniteScrollEnabled && hasMore && !isLoadingMore && activeTab !== "destinations",
    threshold: 0.1,
    rootMargin: '200px'
  });

  // Client-side filtering for search query
  const filteredPlaces = useMemo(() => {
    // Ensure places is an array before filtering
    if (!Array.isArray(places)) return [];
    if (!searchQuery) return places;
    
    const query = searchQuery.toLowerCase();
    return places.filter((place) =>
      place.name.toLowerCase().includes(query) ||
      place.types.some((type) => type.toLowerCase().includes(query))
    );
  }, [places, searchQuery]);

  // Get place image URL
  const getPlaceImageUrl = (placeName: string, photoRefs: string[]) => {
    if (photoRefs && photoRefs.length > 0) {
      const params = new URLSearchParams({
        source: 'google',
        ref: photoRefs[0],
        maxwidth: '600',
        lang: i18n.language,
      });
      return `/api/media/proxy?${params}`;
    }
    
    // Fallback to Unsplash
    const params = new URLSearchParams({
      source: 'unsplash',
      query: `${placeName} landmark`,
      maxwidth: '600',
      lang: i18n.language,
    });
    return `/api/media/proxy?${params}`;
  };

  useEffect(() => {
    console.log('[Telemetry] destinations_hub_tab_change', {
      tab: activeTab,
      destination: selectedDestination.name
    });
  }, [activeTab, selectedDestination]);

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            {t("destinations.hub_title", "Explore Destinations")}
          </h1>
          <p className="text-lg text-gray-600">
            {t("destinations.hub_subtitle", "Discover amazing places around the world")}
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8" dir={isRTL ? "rtl" : "ltr"}>
            <TabsTrigger value="destinations" className="flex items-center gap-2" data-testid="tab-destinations">
              <Globe className="h-4 w-4" />
              {t("destinations.tabs.destinations", "יעדים")}
            </TabsTrigger>
            <TabsTrigger value="accommodations" className="flex items-center gap-2" data-testid="tab-accommodations">
              <Hotel className="h-4 w-4" />
              {t("destinations.tabs.accommodations", "לינה")}
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="flex items-center gap-2" data-testid="tab-restaurants">
              <UtensilsCrossed className="h-4 w-4" />
              {t("destinations.tabs.restaurants", "מסעדות")}
            </TabsTrigger>
            <TabsTrigger value="attractions" className="flex items-center gap-2" data-testid="tab-attractions">
              <Landmark className="h-4 w-4" />
              {t("destinations.tabs.attractions", "אטרקציות")}
            </TabsTrigger>
          </TabsList>

          {/* Destinations Tab - Popular Cities */}
          <TabsContent value="destinations" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">
                {t("destinations.popular_destinations", "יעדים פופולריים מרחבי העולם")}
              </h2>
              <p className="text-gray-600">
                {t("destinations.select_destination", "בחר יעד כדי לראות לינה, מסעדות ואטרקציות")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {POPULAR_DESTINATIONS.map((dest) => (
                <Card
                  key={dest.name}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedDestination.name === dest.name ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => {
                    setSelectedDestination(dest);
                    setActiveTab("accommodations");
                  }}
                  data-testid={`card-destination-${dest.name.toLowerCase()}`}
                >
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={getPlaceImageUrl(dest.name, [])}
                      alt={dest.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute top-4 right-4 text-4xl">
                      {dest.flag}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{dest.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{dest.country}</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline">
                      <MapPin className="h-4 w-4 mr-2" />
                      {t("destinations.explore", "גלה")}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Other Tabs - Places from API */}
          {["accommodations", "restaurants", "attractions"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-6">
              {/* Current Destination Banner */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedDestination.flag}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedDestination.name}</h3>
                    <p className="text-sm text-gray-600">{selectedDestination.country}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("destinations")}
                  data-testid="button-change-destination"
                >
                  {t("destinations.change_destination", "שנה יעד")}
                </Button>
              </div>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-3 h-5 w-5 text-gray-400`} />
                  <Input
                    type="text"
                    placeholder={t("destinations.search_placeholder", "חפש...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${isRTL ? "pr-10" : "pl-10"} py-6 text-lg`}
                    data-testid={`input-search-${tab}`}
                  />
                </div>
              </div>

              {/* Results Count & Stats */}
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  {filteredPlaces.length}{" "}
                  {filteredPlaces.length === 1 ? t("destinations.result", "תוצאה") : t("destinations.results", "תוצאות")}
                  {meta && meta.totalLoaded > filteredPlaces.length && ` (${t("destinations.filtered_from", "מסונן מתוך")} ${meta.totalLoaded})`}
                </p>
                {meta && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      {t("destinations.stats.page", "עמוד")}: <span className="font-medium">{meta.currentPage}</span>
                    </span>
                    <Badge variant={meta.cacheHit ? "default" : "secondary"}>
                      {meta.cacheHit ? t("destinations.stats.cache_hit", "מטמון") : t("destinations.stats.cache_miss", "טרי")}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Loading State */}
              {isLoading && filteredPlaces.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <div className="h-48 bg-gray-200 animate-pulse" />
                      <CardHeader>
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-full mb-2" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Places Grid */}
              {!isLoading || filteredPlaces.length > 0 ? (
                <>
                  {filteredPlaces.length === 0 && !isLoading ? (
                    <Card className="p-12 text-center">
                      <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {t("destinations.states.no_results", "לא נמצאו תוצאות")}
                      </h3>
                      <p className="text-gray-500">
                        {t("destinations.states.no_results_desc", "נסה לחפש משהו אחר או שנה יעד")}
                      </p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredPlaces.map((place) => (
                        <Card
                          key={place.placeId}
                          className="overflow-hidden hover:shadow-lg transition-shadow"
                          data-testid={`card-place-${place.placeId}`}
                        >
                          <div className="h-48 relative overflow-hidden">
                            <img
                              src={getPlaceImageUrl(place.name, place.photoRefs)}
                              alt={place.name}
                              className="absolute inset-0 w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/20" />
                            <div className="absolute top-4 right-4">
                              {place.rating && (
                                <Badge className="bg-white/90 text-gray-800">
                                  ⭐ {place.rating}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <CardHeader>
                            <CardTitle className="text-lg">{place.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {place.types.slice(0, 2).map((type) => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {type.replace(/_/g, " ")}
                                </Badge>
                              ))}
                            </div>
                            {place.userRatingsTotal && (
                              <p className="text-sm text-gray-500">
                                {place.userRatingsTotal.toLocaleString()} {t("destinations.reviews", "ביקורות")}
                              </p>
                            )}
                          </CardContent>
                          <CardFooter>
                            <Button className="w-full" variant="outline" data-testid={`button-view-${place.placeId}`}>
                              <MapPin className="h-4 w-4 mr-2" />
                              {t("destinations.card.view_details", "פרטים")}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Infinite Scroll Sentinel */}
                  {infiniteScrollEnabled && hasMore && (
                    <div ref={sentinelRef} className="h-20 flex items-center justify-center">
                      {isLoadingMore && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>{t("destinations.loading_more", "טוען עוד...")}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Manual Load More Button */}
                  {!infiniteScrollEnabled && hasMore && (
                    <div className="flex justify-center">
                      <Button
                        onClick={() => {
                          loadMore();
                          console.log('[Telemetry] load_more_clicked', {
                            tab: activeTab,
                            page: meta?.currentPage ? meta.currentPage + 1 : 2,
                            totalLoaded: meta?.totalLoaded || 0
                          });
                        }}
                        disabled={isLoadingMore}
                        size="lg"
                        data-testid="button-load-more"
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("destinations.loading", "טוען...")}
                          </>
                        ) : (
                          t("destinations.load_more", "טען עוד")
                        )}
                      </Button>
                    </div>
                  )}

                  {/* End of Results */}
                  {!hasMore && filteredPlaces.length > 0 && (
                    <div className="text-center text-gray-500 py-4">
                      {t("destinations.no_more_results", "אין עוד תוצאות")}
                    </div>
                  )}
                </>
              ) : null}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
