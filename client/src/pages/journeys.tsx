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
  priceMin: number;
  priceMax: number;
  season: string[];
  tags: string[];
  audienceTags: string[];
  rating: number;
  popularity: number;
  heroImage: string;
}

export default function JourneysPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  
  const [filters, setFilters] = useState({
    season: "all",
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
    const arrow = '←';
    const cities = destinations.map(d => translateCityName(d.name));
    return cities.join(` ${arrow} `);
  };

  const formatPrice = (min: number | string | undefined, max: number | string | undefined) => {
    // Check if values are undefined, null, or both zero
    if (min === undefined || max === undefined || min === null || max === null) return 'N/A';
    if (min === 0 && max === 0) return 'N/A';
    
    const currency = isRTL ? '₪' : '$';
    const minVal = typeof min === 'string' ? parseFloat(min) : min;
    const maxVal = typeof max === 'string' ? parseFloat(max) : max;
    
    // Check for NaN after parsing
    if (isNaN(minVal) || isNaN(maxVal)) return 'N/A';
    
    const minNum = isRTL ? Math.round(minVal * 3.5) : minVal;
    const maxNum = isRTL ? Math.round(maxVal * 3.5) : maxVal;
    
    // In RTL (Hebrew), reverse the order so it reads correctly right-to-left
    return isRTL 
      ? `${currency}${maxNum.toLocaleString('he-IL')} - ${currency}${minNum.toLocaleString('he-IL')}`
      : `${currency}${minNum.toLocaleString('he-IL')} - ${currency}${maxNum.toLocaleString('he-IL')}`;
  };

  const translateTag = (tag: string) => {
    const translations: Record<string, { he: string; en: string }> = {
      nature: { he: 'טבע', en: 'Nature' },
      food: { he: 'אוכל', en: 'Food' },
      culture: { he: 'תרבות', en: 'Culture' },
      nightlife: { he: 'חיי לילה', en: 'Nightlife' },
      adventure: { he: 'הרפתקאות', en: 'Adventure' },
      art: { he: 'אמנות', en: 'Art' },
      '12+': { he: '12+', en: '12+' },
      couple: { he: 'זוגות', en: 'Couple' },
      solo: { he: 'יחידים', en: 'Solo' },
      friends: { he: 'חברים', en: 'Friends' },
      family: { he: 'משפחות', en: 'Family' },
    };
    return translations[tag]?.[isRTL ? 'he' : 'en'] || tag;
  };

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
      'Barcelona': { he: 'ברצלונה', en: 'Barcelona' },
      'Nice': { he: 'ניס', en: 'Nice' },
      'Rome': { he: 'רומא', en: 'Rome' },
      'Bangkok': { he: 'בנגקוק', en: 'Bangkok' },
      'Chiang Mai': { he: 'צ\'יאנג מאי', en: 'Chiang Mai' },
      'Phuket': { he: 'פוקט', en: 'Phuket' },
      'Bali': { he: 'באלי', en: 'Bali' },
      'Singapore': { he: 'סינגפור', en: 'Singapore' },
      'New York': { he: 'ניו יורק', en: 'New York' },
      'Philadelphia': { he: 'פילדלפיה', en: 'Philadelphia' },
      'Washington DC': { he: 'וושינגטון', en: 'Washington DC' },
      'Boston': { he: 'בוסטון', en: 'Boston' },
    };
    return cityTranslations[cityName]?.[isRTL ? 'he' : 'en'] || cityName;
  };

  const translateJourneyTitle = (title: string) => {
    const titleTranslations: Record<string, { he: string; en: string }> = {
      'Classic Japan Circuit': { he: 'מסע יפן הקלאסי', en: 'Classic Japan Circuit' },
      'European Highlights Tour': { he: 'סיור דגשי אירופה', en: 'European Highlights Tour' },
      'European Capital Tour': { he: 'סיור בירות אירופה', en: 'European Capital Tour' },
      'Southeast Asia Adventure': { he: 'הרפתקה בדרום מזרח אסיה', en: 'Southeast Asia Adventure' },
      'Mediterranean Dream': { he: 'חלום ים תיכוני', en: 'Mediterranean Dream' },
      'East Coast USA Explorer': { he: 'סיור החוף המזרחי של ארה"ב', en: 'East Coast USA Explorer' },
      'Japan Extended Discovery': { he: 'לחקור את יפן המורחבת', en: 'Japan Extended Discovery' },
      'Grand European Journey': { he: 'מסע אירופי גדול', en: 'Grand European Journey' },
      'Southeast Asia Multi-Country': { he: 'הרפתקה בדרום מזרח אסיה (מרובת מדינות)', en: 'Southeast Asia Multi-Country' },
    };
    return titleTranslations[title]?.[isRTL ? 'he' : 'en'] || title;
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
        <div className={`max-w-7xl mx-auto ${isRTL ? 'text-right' : ''}`}>
          <div className={`flex items-start justify-between gap-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link href="/my-journeys">
              <Button 
                variant="secondary" 
                className="bg-white text-orange-600 hover:bg-orange-50 shadow-lg whitespace-nowrap"
                data-testid="button-my-journeys-nav"
              >
                <Users className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span dir={isRTL ? 'rtl' : 'ltr'}>
                  {isRTL ? 'המסעות השמורים שלי' : 'My Saved Journeys'}
                </span>
              </Button>
            </Link>
            <h1 className={`text-4xl font-bold ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
              {isRTL ? 'מסעות מתוכננים ברחבי העולם' : 'Multi-Destination Journeys'}
            </h1>
          </div>
          <div className="flex justify-start">
            <p className={`text-xl opacity-90 mt-4 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
              {isRTL ? 'גלה מסלולי טיול מושלמים עם מספר יעדים' : 'Discover perfect travel routes across multiple destinations'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Season Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-left" dir={isRTL ? 'rtl' : 'ltr'}>
                  {isRTL ? 'עונה' : 'Season'}
                </label>
                <Select value={filters.season} onValueChange={(val) => setFilters(prev => ({ ...prev, season: val }))}>
                  <SelectTrigger className={isRTL ? 'text-right' : ''} dir={isRTL ? 'rtl' : 'ltr'}>
                    <SelectValue placeholder={isRTL ? 'כל העונות' : 'All Seasons'} />
                  </SelectTrigger>
                  <SelectContent dir={isRTL ? 'rtl' : 'ltr'}>
                    <SelectItem value="all">
                      <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'כל העונות' : 'All Seasons'}</span>
                    </SelectItem>
                    <SelectItem value="spring">
                      <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'אביב' : 'Spring'}</span>
                    </SelectItem>
                    <SelectItem value="summer">
                      <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'קיץ' : 'Summer'}</span>
                    </SelectItem>
                    <SelectItem value="fall">
                      <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'סתיו' : 'Fall'}</span>
                    </SelectItem>
                    <SelectItem value="winter">
                      <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'חורף' : 'Winter'}</span>
                    </SelectItem>
                    <SelectItem value="year-round">
                      <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'כל השנה' : 'Year-round'}</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Budget Filter */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-left" dir={isRTL ? 'rtl' : 'ltr'}>
                  {isRTL ? 'תקציב' : 'Budget'}: {(() => {
                    const currency = isRTL ? '₪' : '$';
                    const minNum = isRTL ? Math.round(filters.minBudget * 3.5) : filters.minBudget;
                    const maxNum = isRTL ? Math.round(filters.maxBudget * 3.5) : filters.maxBudget;
                    return isRTL
                      ? `${currency}${maxNum.toLocaleString('he-IL')} - ${currency}${minNum.toLocaleString('he-IL')}`
                      : `${currency}${minNum.toLocaleString('he-IL')} - ${currency}${maxNum.toLocaleString('he-IL')}`;
                  })()}
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
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                <Calendar className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-gray-600" dir={isRTL ? 'rtl' : 'ltr'}>
                  {journeys.length} {isRTL ? 'מסעות זמינים' : 'journeys available'}
                </span>
              </div>
            </div>

            {/* Tags Filter */}
            <div className="mt-6" dir={isRTL ? 'rtl' : 'ltr'}>
              <label className={`block text-sm font-medium mb-3 ${isRTL ? 'text-left' : 'text-left'}`}>
                {isRTL ? 'תגיות' : 'Tags'}
              </label>
              <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-start' : 'justify-start'}`}>
                {tagFilters.map(tag => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer ${filters.tags.includes(tag) ? 'bg-orange-500 hover:bg-orange-600' : 'hover:bg-gray-100'}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {translateTag(tag)}
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
              <Link key={journey.id} href={`/journeys/${journey.id}`} className="h-full flex">
                <Card className="h-full w-full flex flex-col overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={journey.heroImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828'}
                      alt={journey.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{journey.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <CardContent className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold mb-2" dir={isRTL ? 'rtl' : 'ltr'}>{translateJourneyTitle(journey.title)}</h3>
                    
                    {/* Destination Chain */}
                    <div className={`flex items-center gap-2 mb-3 text-orange-600 font-medium ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
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
                      <div className="flex flex-col">
                        <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold" dir={isRTL ? 'rtl' : 'ltr'}>{formatPrice(journey.priceMin, journey.priceMax)}</span>
                        </div>
                        <span className="text-xs text-gray-500 mt-0.5" dir={isRTL ? 'rtl' : 'ltr'}>
                          {isRTL ? 'כולל: מלונות, טיסות, אטרקציות' : 'Includes: Hotels, Flights, Attractions'}
                        </span>
                      </div>
                    </div>

                    {/* Audience Tags */}
                    <div className={`flex flex-wrap gap-2 mb-4 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                      {journey.audienceTags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs" dir={isRTL ? 'rtl' : 'ltr'}>
                          {translateTag(tag)}
                        </Badge>
                      ))}
                    </div>

                    <Button className="w-full mt-auto bg-orange-500 hover:bg-orange-600" data-testid={`view-journey-${journey.id}`}>
                      <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'הצג מסלול' : 'View Journey'}</span>
                      <ArrowLeft className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
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
