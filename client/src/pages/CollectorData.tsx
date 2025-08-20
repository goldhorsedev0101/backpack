import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Users, Search, Globe } from 'lucide-react';

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
  const { data: stats } = useQuery<CollectorStats>({
    queryKey: ['/api/collector/stats'],
    staleTime: 300000, // 5 minutes
  });

  // Fetch places with search/filter
  const { data: placesData, isLoading } = useQuery<{ places: CollectorPlace[] }>({
    queryKey: ['/api/collector/places', { search, country: selectedCountry }],
    staleTime: 60000, // 1 minute
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleCountryFilter = (country: string) => {
    setSelectedCountry(selectedCountry === country ? '' : country);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">נתונים שנאספו מדרום אמריקה</h1>
        <p className="text-muted-foreground mb-6">
          מקומות לינה, אטרקציות ומסעדות מכל דרום אמריקה שנאספו מ-Google Places API
        </p>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">מקומות</p>
                    <p className="text-2xl font-bold">{stats.places}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">ביקורות</p>
                    <p className="text-2xl font-bold">{stats.reviews}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">דירוג ממוצע</p>
                    <p className="text-2xl font-bold">{stats.averageRating?.toFixed(1) || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">מדינות</p>
                    <p className="text-2xl font-bold">{stats.countries?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="חפש מקומות..."
                value={search}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Country filter buttons */}
          {stats?.countries && (
            <div className="flex flex-wrap gap-2">
              {stats.countries.slice(0, 5).map((country) => (
                <Button
                  key={country.country}
                  variant={selectedCountry.includes(country.country) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCountryFilter(country.country)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {placesData?.places?.map((place) => (
            <Card key={place.place_id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-2">{place.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  {place.address}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{place.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({place.reviews_count} ביקורות)
                    </span>
                  </div>
                </div>

                {place.summary && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {place.summary}
                  </p>
                )}

                {/* Type badges */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {place.types.slice(0, 3).map((type, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {type.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  {place.website && (
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={place.website} target="_blank" rel="noopener noreferrer">
                        אתר
                      </a>
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm" className="flex-1" asChild>
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

      {placesData?.places?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">לא נמצאו מקומות התואמים לחיפוש שלך</p>
        </div>
      )}
    </div>
  );
}