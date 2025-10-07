import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Search, MapPin, Calendar, Thermometer, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CONTINENTS, CONTINENT_COUNTRY_MAP, type Continent } from "@/lib/constants";

interface Destination {
  id: string;
  name: string;
  country: string;
  continent: Continent;
  type: string[];
  description: string;
  rating: number;
  trending: boolean;
  bestSeason: string[];
  imageUrl?: string;
  flag: string;
}

// Sample destinations data
const SAMPLE_DESTINATIONS: Destination[] = [
  { id: "paris", name: "Paris", country: "France", continent: "Europe", type: ["city", "culture"], description: "The City of Light offers iconic landmarks, world-class art, and exquisite cuisine", rating: 4.8, trending: true, bestSeason: ["spring", "autumn"], flag: "🇫🇷" },
  { id: "tokyo", name: "Tokyo", country: "Japan", continent: "Asia", type: ["city", "culture"], description: "A fascinating blend of ancient tradition and cutting-edge modernity", rating: 4.9, trending: true, bestSeason: ["spring", "autumn"], flag: "🇯🇵" },
  { id: "barcelona", name: "Barcelona", country: "Spain", continent: "Europe", type: ["city", "beach", "culture"], description: "Stunning architecture, beautiful beaches, and vibrant culture", rating: 4.7, trending: true, bestSeason: ["spring", "summer", "autumn"], flag: "🇪🇸" },
  { id: "bali", name: "Bali", country: "Indonesia", continent: "Asia", type: ["beach", "nature", "culture"], description: "Tropical paradise with stunning beaches, temples, and rice terraces", rating: 4.6, trending: true, bestSeason: ["spring", "summer", "autumn"], flag: "🇮🇩" },
  { id: "newyork", name: "New York", country: "United States", continent: "North America", type: ["city", "culture"], description: "The city that never sleeps, iconic skyline and diverse culture", rating: 4.7, trending: false, bestSeason: ["spring", "autumn"], flag: "🇺🇸" },
  { id: "rome", name: "Rome", country: "Italy", continent: "Europe", type: ["city", "culture"], description: "The Eternal City filled with ancient history and Renaissance art", rating: 4.8, trending: false, bestSeason: ["spring", "autumn"], flag: "🇮🇹" },
  { id: "dubai", name: "Dubai", country: "United Arab Emirates", continent: "Asia", type: ["city", "beach"], description: "Futuristic city with luxury shopping and modern architecture", rating: 4.5, trending: true, bestSeason: ["winter", "spring"], flag: "🇦🇪" },
  { id: "sydney", name: "Sydney", country: "Australia", continent: "Oceania", type: ["city", "beach"], description: "Harbor city known for the Opera House and beautiful beaches", rating: 4.7, trending: false, bestSeason: ["spring", "summer", "autumn"], flag: "🇦🇺" },
  { id: "capetown", name: "Cape Town", country: "South Africa", continent: "Africa", type: ["city", "beach", "nature"], description: "Stunning landscapes, Table Mountain, and vibrant culture", rating: 4.6, trending: false, bestSeason: ["summer", "autumn"], flag: "🇿🇦" },
  { id: "rio", name: "Rio de Janeiro", country: "Brazil", continent: "South America", type: ["city", "beach", "nature"], description: "Iconic beaches, Christ the Redeemer, and Carnival celebrations", rating: 4.5, trending: false, bestSeason: ["summer", "autumn"], flag: "🇧🇷" },
  { id: "puntacana", name: "Punta Cana", country: "Dominican Republic", continent: "Caribbean", type: ["beach", "nature"], description: "Paradise beaches and all-inclusive resorts", rating: 4.4, trending: true, bestSeason: ["winter", "spring"], flag: "🇩🇴" },
  { id: "reykjavik", name: "Reykjavik", country: "Iceland", continent: "Europe", type: ["city", "nature", "adventure"], description: "Gateway to natural wonders like Northern Lights and hot springs", rating: 4.6, trending: true, bestSeason: ["summer", "winter"], flag: "🇮🇸" },
];

export default function DestinationsHub() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContinent, setSelectedContinent] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("trending");

  // Filter destinations
  const filteredDestinations = useMemo(() => {
    let results = SAMPLE_DESTINATIONS;

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
      results = results.filter((d) => d.type.includes(selectedType));
    }

    // Season filter
    if (selectedSeason !== "all") {
      results = results.filter((d) => d.bestSeason.includes(selectedSeason));
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
  }, [searchQuery, selectedContinent, selectedCountry, selectedType, selectedSeason, sortBy]);

  const availableCountries = useMemo(() => {
    if (selectedContinent === "all") return [];
    return CONTINENT_COUNTRY_MAP[selectedContinent as Continent] || [];
  }, [selectedContinent]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedContinent("all");
    setSelectedCountry("all");
    setSelectedType("all");
    setSelectedSeason("all");
  };

  const hasActiveFilters =
    searchQuery || selectedContinent !== "all" || selectedCountry !== "all" || selectedType !== "all" || selectedSeason !== "all";

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

                {/* Season Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("destinations.filters.season")}</label>
                  <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                    <SelectTrigger data-testid="select-season-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("destinations.all_seasons")}</SelectItem>
                      <SelectItem value="spring">{t("destinations.seasons.spring")}</SelectItem>
                      <SelectItem value="summer">{t("destinations.seasons.summer")}</SelectItem>
                      <SelectItem value="autumn">{t("destinations.seasons.autumn")}</SelectItem>
                      <SelectItem value="winter">{t("destinations.seasons.winter")}</SelectItem>
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
                {filteredDestinations.length} {filteredDestinations.length === 1 ? t("destinations.destination") : t("destinations.destinations_count")}
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

            {/* Destinations Grid */}
            {filteredDestinations.length === 0 ? (
              <Card className="p-12 text-center">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t("destinations.states.no_results")}</h3>
                <p className="text-gray-500">{t("destinations.states.no_results_desc")}</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDestinations.map((destination) => (
                  <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-destination-${destination.id}`}>
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative">
                      <div className="absolute top-4 right-4 flex gap-2">
                        {destination.trending && (
                          <Badge className="bg-red-500 text-white">
                            {t("destinations.sort.trending")}
                          </Badge>
                        )}
                        <Badge className="bg-white/90 text-gray-800">
                          {t(`trips.continents.${destination.continent}`)}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <span className="text-6xl">{destination.flag}</span>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{destination.name}</span>
                        <span className="text-sm font-normal text-gray-500">⭐ {destination.rating}</span>
                      </CardTitle>
                      <CardDescription>{t(`trips.countries.${destination.country}`) || destination.country}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{destination.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {destination.type.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {t(`destinations.types.${type}`)}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {destination.bestSeason
                            .map((s) => t(`destinations.seasons.${s}`))
                            .join(", ")}
                        </span>
                      </div>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
