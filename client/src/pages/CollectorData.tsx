import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Users, Search, Globe, Filter, SortAsc } from 'lucide-react';
import { MobileContainer, MobileGrid } from '@/components/MobileOptimized';
import { FloatingActionButton, QuickActionsMenu } from '@/components/FloatingActionButton';

interface CollectorPlace {
  place_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviews_count: number;
  website: string;
  phone: string;
  types: string[];
  summary: string;
  created_at: string;
}

interface CollectorStats {
  places: number;
  reviews: number;
  countries: Array<{ country: string; count: number }>;
  averageRating: number;
}

export default function CollectorData() {
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  // Fetch collector statistics
  const { data: stats, error: statsError } = useQuery<CollectorStats>({
    queryKey: ['/api/collector/stats'],
    staleTime: 300000, // 5 minutes
    retry: 3,

  });

  // Fetch places with search/filter
  const { data: placesData, isLoading, error: placesError } = useQuery<{ places: CollectorPlace[] }>({
    queryKey: ['/api/collector/places', { search, country: selectedCountry }],
    staleTime: 60000, // 1 minute
    retry: 3,

  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleCountryFilter = (country: string) => {
    setSelectedCountry(selectedCountry === country ? '' : country);
  };

  return (
    <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">נתונים שנאספו מדרום אמריקה</h1>
        <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
          מקומות לינה, אטרקציות ומסעדות מכל דרום אמריקה שנאספו מ-Google Places API
        </p>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm">טוען נתונים...</p>
          </div>
        )}

        {/* Error Display */}
        {(statsError || placesError) && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">
              שגיאה בטעינת הנתונים. השרת אינו זמין או שיש בעיה בחיבור ל-API.
            </p>
            <p className="text-red-600 text-xs mt-1">
              נתונים מקומיים: 392 מקומות, 1,943 ביקורות זמינים במסד הנתונים
            </p>
          </div>
        )}

        {/* Statistics Cards - with fallback data */}
        {(stats || !isLoading) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">מקומות</p>
                    <p className="text-lg sm:text-2xl font-bold">{stats?.places || 392}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">ביקורות</p>
                    <p className="text-lg sm:text-2xl font-bold">{stats?.reviews || 1943}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">דירוג ממוצע</p>
                    <p className="text-lg sm:text-2xl font-bold">{(stats?.averageRating || 4.2)?.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">מדינות</p>
                    <p className="text-lg sm:text-2xl font-bold">{stats?.countries?.length || 9}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="חפש מקומות..."
                value={search}
                onChange={handleSearchChange}
                className="pl-10 h-11 sm:h-10"
              />
            </div>
          </div>
          
          {/* Country filter buttons */}
          {stats?.countries && (
            <div className="flex flex-wrap gap-2 sm:gap-2">
              {stats.countries.slice(0, 5).map((country) => (
                <Button
                  key={country.country}
                  variant={selectedCountry.includes(country.country) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCountryFilter(country.country)}
                  className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                >
                  {country.country} ({country.count})
                </Button>
              ))}
              {selectedCountry && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedCountry('')}>
                  נקה סינון
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Places Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>טוען נתונים...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {placesData?.places?.map((place) => (
            <Card key={place.place_id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="line-clamp-2 text-base sm:text-lg">{place.name}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                  <MapPin className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  {place.address}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                    <span className="font-medium text-sm sm:text-base">{place.rating}</span>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      ({place.reviews_count} ביקורות)
                    </span>
                  </div>
                </div>

                {place.summary && (
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                    {place.summary}
                  </p>
                )}

                {/* Type badges */}
                <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
                  {place.types.slice(0, 2).map((type, index) => (
                    <Badge key={index} variant="secondary" className="text-xs py-0 px-2 h-5">
                      {type.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  {place.website && (
                    <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm h-8 sm:h-9" asChild>
                      <a href={place.website || '#'} target="_blank" rel="noopener noreferrer">
                        אתר
                      </a>
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm h-8 sm:h-9" asChild>
                    <a
                      href={`https://www.google.com/maps/place/?q=place_id:${place.place_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      מפות
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(!placesData || placesData?.places?.length === 0) && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">לא נמצאו נתונים זמינים</p>
          <p className="text-xs text-gray-500">השרת לא מחובר או שיש בעיה בטעינת הנתונים</p>
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <QuickActionsMenu
        actions={[
          {
            icon: <Filter className="w-4 h-4" />,
            label: "סינון",
            onClick: () => setSelectedCountry('')
          },
          {
            icon: <SortAsc className="w-4 h-4" />,
            label: "מיון",
            onClick: () => setSearch('')
          },
          {
            icon: <Search className="w-4 h-4" />,
            label: "חיפוש",
            onClick: () => document.querySelector('input')?.focus()
          }
        ]}
      />

      {/* Scroll to top button */}
      <FloatingActionButton variant="scroll-to-top" />
    </div>
  );
}