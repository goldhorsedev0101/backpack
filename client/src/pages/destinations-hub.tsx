import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Search, MapPin, Calendar, Thermometer, Filter, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CONTINENTS, CONTINENT_COUNTRY_MAP, type Continent } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

interface Destination {
  id: string;
  name: string;
  country: string;
  continent: Continent;
  types: string[];
  description: string;
  rating: number;
  userRatingsTotal: number;
  trending: boolean;
  flag: string;
  lat: number;
  lng: number;
  photoRefs: string[];
  placeId: string;
}

export default function DestinationsHub() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContinent, setSelectedContinent] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("trending");

  // Fetch destinations from database (with fallback to Google Places for live data)
  const { data: destinations = [], isLoading, error } = useQuery<Destination[]>({
    queryKey: ['/api/destinations'],
  });

  // Filter destinations
  const filteredDestinations = useMemo(() => {
    let results = destinations;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.country.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query)
      );
    }

    // Continent filter
    if (selectedContinent !== "all") {
      results = results.filter((d) => d.continent === selectedContinent);
    }

    // Country filter
    if (selectedCountry !== "all") {
      results = results.filter((d) => d.country === selectedCountry);
    }

    // Type filter
    if (selectedType !== "all") {
      results = results.filter((d) => d.types.includes(selectedType));
    }

    // Sort
    switch (sortBy) {
      case "trending":
        results = [...results].sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
        break;
      case "rating":
        results = [...results].sort((a, b) => b.rating - a.rating);
        break;
      case "a_z":
        results = [...results].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "z_a":
        results = [...results].sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return results;
  }, [destinations, searchQuery, selectedContinent, selectedCountry, selectedType, sortBy]);

  const availableCountries = useMemo(() => {
    if (selectedContinent === "all") return [];
    return CONTINENT_COUNTRY_MAP[selectedContinent as Continent] || [];
  }, [selectedContinent]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedContinent("all");
    setSelectedCountry("all");
    setSelectedType("all");
  };

  const hasActiveFilters =
    searchQuery || selectedContinent !== "all" || selectedCountry !== "all" || selectedType !== "all";

  // Get destination image URL - intelligent fallback for DB entities, Google Places for live data
  const getDestinationImageUrl = (destination: Destination) => {
    // Check if this is a database entity (UUID format) vs Google Places entity (ChIJ... format)
    // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 chars with dashes at positions 8, 13, 18, 23)
    const isDbEntity = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(destination.id);
    
    if (isDbEntity) {
      // Use intelligent fallback system for database destinations
      const params = new URLSearchParams({
        entityType: 'destination',
        entityId: destination.id,
        entityName: destination.name,
      });
      if (destination.country) {
        params.set('country', destination.country);
      }
      return `/api/media/location-photo?${params}`;
    } else {
      // Use Google Places proxy for live destinations
      const params = new URLSearchParams({
        source: 'googleplaces',
        query: destination.name,
        maxwidth: '600',
      });
      return `/api/media/proxy?${params}`;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">{t("destinations.hub_title")}</h1>
          <p className="text-lg text-gray-600">{t("destinations.hub_subtitle")}</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-3 h-5 w-5 text-gray-400`} />
            <Input
              type="text"
              placeholder={t("destinations.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${isRTL ? "pr-10" : "pl-10"} py-6 text-lg`}
              data-testid="input-search-destinations"
            />
          </div>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-600">{t("destinations.error_loading", "Error loading destinations. Please try again.")}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-64 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    {t("destinations.filters.title")}
                  </span>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Continent Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("destinations.filters.region")}</label>
                  <Select value={selectedContinent} onValueChange={setSelectedContinent}>
                    <SelectTrigger data-testid="select-continent-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("destinations.all_continents")}</SelectItem>
                      {CONTINENTS.map((continent) => (
                        <SelectItem key={continent} value={continent}>
                          {t(`trips.continents.${continent}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Country Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("destinations.filters.country")}</label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry} disabled={selectedContinent === "all"}>
                    <SelectTrigger data-testid="select-country-filter">
                      <SelectValue placeholder={t("destinations.select_country")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("destinations.all_countries")}</SelectItem>
                      {availableCountries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {t(`trips.countries.${country}`) || country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Type Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("destinations.filters.type")}</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger data-testid="select-type-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("destinations.all_types")}</SelectItem>
                      <SelectItem value="city">{t("destinations.types.city")}</SelectItem>
                      <SelectItem value="beach">{t("destinations.types.beach")}</SelectItem>
                      <SelectItem value="nature">{t("destinations.types.nature")}</SelectItem>
                      <SelectItem value="culture">{t("destinations.types.culture")}</SelectItem>
                      <SelectItem value="adventure">{t("destinations.types.adventure")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("destinations.loading", "Loading...")}
                  </span>
                ) : (
                  <>
                    {filteredDestinations.length} {filteredDestinations.length === 1 ? t("destinations.destination") : t("destinations.destinations_count")}
                  </>
                )}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{t("destinations.sort.label")}:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trending">{t("destinations.sort.trending")}</SelectItem>
                    <SelectItem value="rating">{t("destinations.sort.rating")}</SelectItem>
                    <SelectItem value="a_z">{t("destinations.sort.a_z")}</SelectItem>
                    <SelectItem value="z_a">{t("destinations.sort.z_a")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
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
            {!isLoading && filteredDestinations.length === 0 ? (
              <Card className="p-12 text-center">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t("destinations.states.no_results")}</h3>
                <p className="text-gray-500">{t("destinations.states.no_results_desc")}</p>
              </Card>
            ) : !isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDestinations.map((destination) => (
                  <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-destination-${destination.id}`}>
                    <div className="h-48 relative overflow-hidden">
                      <img 
                        src={getDestinationImageUrl(destination)}
                        alt={destination.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute top-4 right-4 flex gap-2">
                        {destination.trending && (
                          <Badge className="bg-red-500 text-white">
                            {t("destinations.sort.trending")}
                          </Badge>
                        )}
                        <Badge className="bg-white/90 text-gray-800">
                          {t(`trips.continents.${destination.continent}`, destination.continent)}
                        </Badge>
                      </div>
                      <div className="absolute top-4 left-4 text-3xl">
                        {destination.flag}
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{t(`destinations.cities.${destination.id}`, destination.name)}</span>
                        <span className="text-sm font-normal text-gray-500">⭐ {destination.rating.toFixed(1)}</span>
                      </CardTitle>
                      <CardDescription>{t(`trips.countries.${destination.country}`, destination.country)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{t(`destinations.city_descriptions.${destination.id}`, destination.description)}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {destination.types.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {t(`destinations.types.${type}`)}
                          </Badge>
                        ))}
                      </div>
                      {destination.userRatingsTotal > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Thermometer className="h-4 w-4" />
                          <span>{destination.userRatingsTotal.toLocaleString()} {t("destinations.reviews", "reviews")}</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Link href={`/destinations/${destination.id}`} className="flex-1">
                        <Button className="w-full" data-testid={`button-view-${destination.id}`}>
                          {t("destinations.card.view_details")}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
