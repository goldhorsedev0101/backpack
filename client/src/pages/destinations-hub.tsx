import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Search, MapPin, Filter, X, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useInfiniteDestinations } from "@/hooks/useInfiniteDestinations";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

// Default center: Tel Aviv, Israel
const DEFAULT_LAT = 32.0853;
const DEFAULT_LNG = 34.7818;
const DEFAULT_RADIUS = 50000; // 50km

export default function DestinationsHub() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [radius, setRadius] = useState<number>(DEFAULT_RADIUS);
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(true);

  const { places, isLoading, isLoadingMore, error, hasMore, loadMore, meta } = 
    useInfiniteDestinations({
      lat: DEFAULT_LAT,
      lng: DEFAULT_LNG,
      radius,
      type: selectedType !== 'all' ? selectedType : undefined,
      lang: i18n.language,
      enabled: true
    });

  // Intersection observer for infinite scroll
  const sentinelRef = useIntersectionObserver({
    onIntersect: () => {
      if (infiniteScrollEnabled && hasMore && !isLoadingMore) {
        loadMore();
        console.log('[Telemetry] infinite_scroll_page_loaded', {
          page: meta?.currentPage ? meta.currentPage + 1 : 2,
          totalLoaded: meta?.totalLoaded || 0,
          hasNext: hasMore
        });
      }
    },
    enabled: infiniteScrollEnabled && hasMore && !isLoadingMore,
    threshold: 0.1,
    rootMargin: '200px'
  });

  // Client-side filtering for search query
  const filteredPlaces = useMemo(() => {
    if (!searchQuery) return places;
    
    const query = searchQuery.toLowerCase();
    return places.filter((place: typeof places[0]) =>
      place.name.toLowerCase().includes(query) ||
      place.types.some((type: string) => type.toLowerCase().includes(query))
    );
  }, [places, searchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setRadius(DEFAULT_RADIUS);
  };

  const hasActiveFilters = searchQuery || selectedType !== "all" || radius !== DEFAULT_RADIUS;

  // Get place image URL
  const getPlaceImageUrl = (placeName: string, photoRefs: string[]) => {
    if (photoRefs.length > 0) {
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
    console.log('[Telemetry] destinations_page_view', {
      page: 1,
      itemsLoaded: places.length,
      hasNext: hasMore
    });
  }, []); // Only on mount

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">{t("destinations.hub_title", "Explore Destinations")}</h1>
          <p className="text-lg text-gray-600">{t("destinations.hub_subtitle", "Discover amazing places around the world")}</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-3 h-5 w-5 text-gray-400`} />
            <Input
              type="text"
              placeholder={t("destinations.search_placeholder", "Search destinations...")}
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className={`${isRTL ? "pr-10" : "pl-10"} py-6 text-lg`}
              data-testid="input-search-destinations"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-64 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    {t("destinations.filters.title", "Filters")}
                  </span>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Type Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("destinations.filters.type", "Type")}</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger data-testid="select-type-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("destinations.all_types", "All Types")}</SelectItem>
                      <SelectItem value="tourist_attraction">{t("destinations.types.tourist_attraction", "Tourist Attraction")}</SelectItem>
                      <SelectItem value="museum">{t("destinations.types.museum", "Museum")}</SelectItem>
                      <SelectItem value="park">{t("destinations.types.park", "Park")}</SelectItem>
                      <SelectItem value="restaurant">{t("destinations.types.restaurant", "Restaurant")}</SelectItem>
                      <SelectItem value="cafe">{t("destinations.types.cafe", "Cafe")}</SelectItem>
                      <SelectItem value="shopping_mall">{t("destinations.types.shopping_mall", "Shopping Mall")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Radius Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("destinations.filters.radius", "Search Radius")}
                  </label>
                  <Select value={radius.toString()} onValueChange={(val) => setRadius(parseInt(val))}>
                    <SelectTrigger data-testid="select-radius-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5000">5 km</SelectItem>
                      <SelectItem value="10000">10 km</SelectItem>
                      <SelectItem value="25000">25 km</SelectItem>
                      <SelectItem value="50000">50 km</SelectItem>
                      <SelectItem value="100000">100 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Infinite Scroll Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {t("destinations.filters.infinite_scroll", "Infinite Scroll")}
                  </label>
                  <Button
                    variant={infiniteScrollEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInfiniteScrollEnabled(!infiniteScrollEnabled)}
                    data-testid="button-toggle-infinite-scroll"
                  >
                    {infiniteScrollEnabled ? t("destinations.filters.on", "ON") : t("destinations.filters.off", "OFF")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            {meta && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t("destinations.stats.title", "Stats")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("destinations.stats.loaded", "Loaded")}:</span>
                    <span className="font-medium">{meta.totalLoaded}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("destinations.stats.page", "Page")}:</span>
                    <span className="font-medium">{meta.currentPage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("destinations.stats.cache", "Cache")}:</span>
                    <Badge variant={meta.cacheHit ? "default" : "secondary"} className="h-5">
                      {meta.cacheHit ? t("destinations.stats.hit", "HIT") : t("destinations.stats.miss", "MISS")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {filteredPlaces.length} {filteredPlaces.length === 1 ? t("destinations.result", "result") : t("destinations.results", "results")}
                {meta && meta.totalLoaded > filteredPlaces.length && ` (${t("destinations.filtered_from", "filtered from")} ${meta.totalLoaded})`}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {isLoading && places.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

            {/* Destinations Grid */}
            {!isLoading || places.length > 0 ? (
              <>
                {filteredPlaces.length === 0 && !isLoading ? (
                  <Card className="p-12 text-center">
                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t("destinations.states.no_results", "No results found")}</h3>
                    <p className="text-gray-500">{t("destinations.states.no_results_desc", "Try adjusting your filters or search query")}</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPlaces.map((place) => (
                      <Card key={place.placeId} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-destination-${place.placeId}`}>
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
                            {place.types.slice(0, 3).map((type) => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {type.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                          {place.userRatingsTotal && (
                            <p className="text-sm text-gray-500">
                              {place.userRatingsTotal.toLocaleString()} {t("destinations.reviews", "reviews")}
                            </p>
                          )}
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full" variant="outline" data-testid={`button-view-${place.placeId}`}>
                            <MapPin className="h-4 w-4 mr-2" />
                            {t("destinations.card.view_location", "View Location")}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Infinite Scroll Sentinel */}
                {infiniteScrollEnabled && hasMore && (
                  <div ref={sentinelRef} className="h-20 flex items-center justify-center mt-8">
                    {isLoadingMore && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>{t("destinations.loading_more", "Loading more...")}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Manual Load More Button */}
                {!infiniteScrollEnabled && hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={() => {
                        loadMore();
                        console.log('[Telemetry] load_more_clicked', {
                          page: meta?.currentPage ? meta.currentPage + 1 : 2,
                          totalLoaded: meta?.totalLoaded || 0,
                          hasNext: hasMore
                        });
                      }}
                      disabled={isLoadingMore}
                      size="lg"
                      data-testid="button-load-more"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("destinations.loading", "Loading...")}
                        </>
                      ) : (
                        t("destinations.load_more", "Load More")
                      )}
                    </Button>
                  </div>
                )}

                {/* End of Results */}
                {!hasMore && places.length > 0 && (
                  <div className="text-center text-gray-500 mt-8 py-4">
                    {t("destinations.no_more_results", "No more results available")}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
