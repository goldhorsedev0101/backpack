import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, DollarSign, Users, Star, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Journey {
  id: number;
  title: string;
  description: string;
  destinations: Array<{
    name: string;
    country: string;
    nights: number;
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
}

export default function JourneysPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  
  const [filters, setFilters] = useState({
    season: "",
    minBudget: 0,
    maxBudget: 10000,
    tags: [] as string[],
    limit: 12,
    offset: 0,
  });

  const { data: journeys = [], isLoading } = useQuery<Journey[]>({
    queryKey: ["/api/journeys", filters],
    enabled: true,
  });

  const formatDestinationChain = (destinations: Journey['destinations']) => {
    const arrow = isRTL ? '→' : '←';
    return destinations.map(d => d.name).join(` ${arrow} `);
  };

  const formatPrice = (min: string, max: string) => {
    const currency = isRTL ? '₪' : '$';
    const minNum = isRTL ? Math.round(parseFloat(min) * 3.5) : parseInt(min);
    const maxNum = isRTL ? Math.round(parseFloat(max) * 3.5) : parseInt(max);
    return `${currency}${minNum.toLocaleString()} - ${currency}${maxNum.toLocaleString()}`;
  };

  const formatDuration = (nights: number) => {
    const weeks = Math.floor(nights / 7);
    const days = nights % 7;
    if (weeks > 0 && days > 0) {
      return isRTL ? `${weeks} שבועות ו-${days} ימים` : `${weeks} weeks ${days} days`;
    } else if (weeks > 0) {
      return isRTL ? `${weeks} שבועות` : `${weeks} weeks`;
    } else {
      return isRTL ? `${nights} לילות` : `${nights} nights`;
    }
  };

  const tagFilters = ["nature", "food", "culture", "nightlife", "adventure", "art"];
  
  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <div className={`min-h-screen bg-gray-50 pb-20 md:pb-0 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-teal-500 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {isRTL ? 'מסעות מתוכננים ברחבי העולם' : 'Multi-Destination Journeys'}
          </h1>
          <p className="text-xl opacity-90" dir={isRTL ? 'rtl' : 'ltr'}>
            {isRTL ? 'גלה מסלולי טיול מושלמים עם מספר יעדים' : 'Discover perfect travel routes across multiple destinations'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Season Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
                  {isRTL ? 'עונה' : 'Season'}
                </label>
                <Select value={filters.season} onValueChange={(val) => setFilters(prev => ({ ...prev, season: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? 'כל העונות' : 'All Seasons'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      {isRTL ? 'כל העונות' : 'All Seasons'}
                    </SelectItem>
                    <SelectItem value="spring">{isRTL ? 'אביב' : 'Spring'}</SelectItem>
                    <SelectItem value="summer">{isRTL ? 'קיץ' : 'Summer'}</SelectItem>
                    <SelectItem value="fall">{isRTL ? 'סתיו' : 'Fall'}</SelectItem>
                    <SelectItem value="winter">{isRTL ? 'חורף' : 'Winter'}</SelectItem>
                    <SelectItem value="year-round">{isRTL ? 'כל השנה' : 'Year-round'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Budget Filter */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
                  {isRTL ? 'תקציב' : 'Budget'}: {formatPrice(filters.minBudget.toString(), filters.maxBudget.toString())}
                </label>
                <Slider
                  value={[filters.minBudget, filters.maxBudget]}
                  min={0}
                  max={10000}
                  step={100}
                  onValueChange={([min, max]) => setFilters(prev => ({ ...prev, minBudget: min, maxBudget: max }))}
                  className="mt-2"
                />
              </div>

              {/* Duration Info */}
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-gray-600" dir={isRTL ? 'rtl' : 'ltr'}>
                  {journeys.length} {isRTL ? 'מסעות זמינים' : 'journeys available'}
                </span>
              </div>
            </div>

            {/* Tags Filter */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-3" dir={isRTL ? 'rtl' : 'ltr'}>
                {isRTL ? 'תגיות' : 'Tags'}
              </label>
              <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {tagFilters.map(tag => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer ${filters.tags.includes(tag) ? 'bg-orange-500 hover:bg-orange-600' : 'hover:bg-gray-100'}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Journeys Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : journeys.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journeys.map((journey) => (
              <Link key={journey.id} href={`/journeys/${journey.id}`}>
                <Card className="h-full overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={journey.heroImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828'}
                      alt={journey.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{parseFloat(journey.rating || '0').toFixed(1)}</span>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2" dir={isRTL ? 'rtl' : 'ltr'}>{journey.title}</h3>
                    
                    {/* Destination Chain */}
                    <div className={`flex items-center gap-2 mb-3 text-orange-600 font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                        {formatDestinationChain(journey.destinations)}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 mb-4 text-sm text-gray-600">
                      <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Calendar className="w-4 h-4" />
                        <span dir={isRTL ? 'rtl' : 'ltr'}>{formatDuration(journey.totalNights)}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <DollarSign className="w-4 h-4" />
                        <span dir={isRTL ? 'rtl' : 'ltr'}>{formatPrice(journey.priceMin, journey.priceMax)}</span>
                      </div>
                    </div>

                    {/* Audience Tags */}
                    <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {journey.audienceTags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600" data-testid={`view-journey-${journey.id}`}>
                      <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'הצג מסלול' : 'View Journey'}</span>
                      <ArrowLeft className={`w-4 h-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
              {isRTL ? 'לא נמצאו מסעות' : 'No journeys found'}
            </h3>
            <p className="text-gray-500" dir={isRTL ? 'rtl' : 'ltr'}>
              {isRTL ? 'נסה לשנות את הפילטרים' : 'Try adjusting your filters'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
