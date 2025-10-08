import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Loader2, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface PlaceResult {
  placeId: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating?: number;
  userRatingsTotal?: number;
  types: string[];
  photoRefs: string[];
  openingHours?: boolean;
}

interface NearbySearchResponse {
  results: PlaceResult[];
  nextPageToken: string | null;
  meta: {
    provider: string;
    cacheHit: boolean;
    latencyMs: number;
    page: number;
    hasNext: boolean;
  };
}

export default function IntegrationsDemoPlacesPagination() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const apiKey = import.meta.env.VITE_INTERNAL_API_KEY;

  const [lat, setLat] = useState('32.0853'); // Tel Aviv
  const [lng, setLng] = useState('34.7818');
  const [radius, setRadius] = useState('5000');
  const [type, setType] = useState('');
  
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMeta, setSearchMeta] = useState<any>(null);
  const [totalLoaded, setTotalLoaded] = useState(0);

  const searchNearby = async (pageToken?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        lat,
        lng,
        radius,
        ...(type && { type }),
        lang: i18n.language,
        ...(pageToken && { pageToken })
      });

      const response = await fetch(`/api/places/nearby?${params}`, {
        headers: {
          'x-globemate-key': apiKey || ''
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Valid x-globemate-key required');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: NearbySearchResponse = await response.json();
      
      if (pageToken) {
        // Append to existing results
        setPlaces(prev => [...prev, ...data.results]);
        setTotalLoaded(prev => prev + data.results.length);
      } else {
        // New search - replace results
        setPlaces(data.results);
        setTotalLoaded(data.results.length);
      }
      
      setNextPageToken(data.nextPageToken);
      setSearchMeta(data.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPlaces([]);
    setNextPageToken(null);
    setTotalLoaded(0);
    searchNearby();
  };

  const handleLoadMore = () => {
    if (nextPageToken) {
      searchNearby(nextPageToken);
    }
  };

  const getPhotoUrl = (photoRef: string) => {
    const params = new URLSearchParams({
      source: 'google',
      ref: photoRef,
      maxwidth: '200',
      lang: i18n.language,
    });
    return `/api/media/proxy?${params}`;
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'} p-8`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {t('Places Pagination Demo', 'Places Pagination Demo')}
          </h1>
          <p className="text-gray-600">
            {t('Demo page showcasing Google Places API with pagination support', 'Demo page showcasing Google Places API with pagination support')}
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('Search Parameters', 'Search Parameters')}</CardTitle>
            <CardDescription>
              {t('Enter coordinates and search radius to find nearby places', 'Enter coordinates and search radius to find nearby places')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t('Latitude', 'Latitude')}
                </label>
                <Input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLat(e.target.value)}
                  placeholder="32.0853"
                  data-testid="input-latitude"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t('Longitude', 'Longitude')}
                </label>
                <Input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLng(e.target.value)}
                  placeholder="34.7818"
                  data-testid="input-longitude"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t('Radius (meters)', 'Radius (meters)')}
                </label>
                <Input
                  type="number"
                  value={radius}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRadius(e.target.value)}
                  placeholder="5000"
                  data-testid="input-radius"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t('Type (optional)', 'Type (optional)')}
                </label>
                <Input
                  type="text"
                  value={type}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setType(e.target.value)}
                  placeholder="restaurant, cafe..."
                  data-testid="input-type"
                />
              </div>
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isLoading || !lat || !lng}
              className="w-full md:w-auto"
              data-testid="button-search"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('Searching...', 'Searching...')}
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  {t('Search Nearby Places', 'Search Nearby Places')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('Error', 'Error')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search Meta */}
        {searchMeta && (
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant="outline">
              {t('Provider', 'Provider')}: {searchMeta.provider}
            </Badge>
            <Badge variant={searchMeta.cacheHit ? 'default' : 'secondary'}>
              {searchMeta.cacheHit ? (
                <>
                  <Check className="mr-1 h-3 w-3" />
                  {t('Cache Hit', 'Cache Hit')}
                </>
              ) : (
                t('API Call', 'API Call')
              )}
            </Badge>
            <Badge variant="outline">
              {t('Latency', 'Latency')}: {searchMeta.latencyMs}ms
            </Badge>
            <Badge variant="outline">
              {t('Page', 'Page')}: {searchMeta.page}
            </Badge>
            <Badge variant="outline">
              {t('Total Loaded', 'Total Loaded')}: {totalLoaded}
            </Badge>
          </div>
        )}

        {/* Results */}
        {places.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              {t('Results', 'Results')} ({places.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {places.map((place) => (
                <Card key={place.placeId} className="overflow-hidden" data-testid={`card-place-${place.placeId}`}>
                  {place.photoRefs.length > 0 && (
                    <div className="h-40 relative overflow-hidden">
                      <img
                        src={getPhotoUrl(place.photoRefs[0])}
                        alt={place.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start justify-between gap-2">
                      <span className="flex-1">{place.name}</span>
                      {place.rating && (
                        <span className="text-sm font-normal text-yellow-600 flex items-center gap-1 shrink-0">
                          ⭐ {place.rating}
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {place.coordinates.lat.toFixed(4)}, {place.coordinates.lng.toFixed(4)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {place.types.slice(0, 3).map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                    {place.userRatingsTotal && (
                      <p className="text-sm text-gray-500">
                        {place.userRatingsTotal} {t('reviews', 'reviews')}
                      </p>
                    )}
                    {place.openingHours !== undefined && (
                      <p className="text-sm mt-1">
                        {place.openingHours ? (
                          <span className="text-green-600">{t('Open now', 'Open now')}</span>
                        ) : (
                          <span className="text-red-600">{t('Closed', 'Closed')}</span>
                        )}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            {nextPageToken && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  size="lg"
                  data-testid="button-load-more"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('Loading...', 'Loading...')}
                    </>
                  ) : (
                    t('Load More Places', 'Load More Places')
                  )}
                </Button>
              </div>
            )}

            {!nextPageToken && places.length > 0 && (
              <div className="text-center text-gray-500 mt-8">
                {t('No more results available', 'No more results available')}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {places.length === 0 && !isLoading && !error && (
          <Card className="p-12 text-center">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('No results yet', 'No results yet')}
            </h3>
            <p className="text-gray-500">
              {t('Enter search parameters and click Search to find nearby places', 'Enter search parameters and click Search to find nearby places')}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
