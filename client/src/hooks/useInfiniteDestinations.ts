import { useState, useEffect, useCallback, useRef } from 'react';

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
}

interface DestinationsResponse {
  results: PlaceResult[];
  nextPageToken: string | null;
  meta: {
    provider: string;
    page: number;
    hasNext: boolean;
    cacheHit: boolean;
    latencyMs: number;
  };
}

interface UseInfiniteDestinationsParams {
  lat: number;
  lng: number;
  radius?: number;
  type?: string;
  lang?: string;
  enabled?: boolean;
}

interface UseInfiniteDestinationsReturn {
  places: PlaceResult[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  reload: () => void;
  meta: {
    totalLoaded: number;
    currentPage: number;
    latencyMs: number;
    cacheHit: boolean;
  } | null;
}

export function useInfiniteDestinations({
  lat,
  lng,
  radius = 5000,
  type,
  lang = 'en',
  enabled = true
}: UseInfiniteDestinationsParams): UseInfiniteDestinationsReturn {
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [meta, setMeta] = useState<UseInfiniteDestinationsReturn['meta']>(null);
  
  const loadingRef = useRef(false);
  const apiKey = import.meta.env.VITE_INTERNAL_API_KEY;

  const fetchPlaces = useCallback(async (pageToken?: string) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    const isFirstPage = !pageToken;
    
    if (isFirstPage) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    setError(null);

    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString(),
        ...(type && { type }),
        lang,
        ...(pageToken && { pageToken })
      });

      const response = await fetch(`/api/destinations/places?${params}`, {
        headers: {
          'x-globemate-key': apiKey || ''
        }
      });

      if (!response.ok) {
        if (response.status === 503) {
          const data = await response.json();
          throw new Error(data.message || 'Service temporarily unavailable');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DestinationsResponse = await response.json();
      
      if (isFirstPage) {
        setPlaces(data.results);
      } else {
        setPlaces(prev => [...prev, ...data.results]);
      }
      
      setNextPageToken(data.nextPageToken);
      setMeta({
        totalLoaded: isFirstPage ? data.results.length : places.length + data.results.length,
        currentPage: data.meta.page,
        latencyMs: data.meta.latencyMs,
        cacheHit: data.meta.cacheHit
      });

      // Telemetry
      if (isFirstPage) {
        console.log('[Telemetry] destinations_page_view', {
          page: data.meta.page,
          itemsLoaded: data.results.length,
          hasNext: data.meta.hasNext,
          latencyMs: data.meta.latencyMs,
          cacheHit: data.meta.cacheHit
        });
      } else {
        console.log('[Telemetry] load_more_clicked', {
          page: data.meta.page,
          itemsLoaded: data.results.length,
          hasNext: data.meta.hasNext,
          latencyMs: data.meta.latencyMs,
          cacheHit: data.meta.cacheHit
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      loadingRef.current = false;
    }
  }, [lat, lng, radius, type, lang, apiKey, places.length]);

  const loadMore = useCallback(() => {
    if (nextPageToken && !loadingRef.current) {
      fetchPlaces(nextPageToken);
    }
  }, [nextPageToken, fetchPlaces]);

  const reload = useCallback(() => {
    setPlaces([]);
    setNextPageToken(null);
    setMeta(null);
    fetchPlaces();
  }, [fetchPlaces]);

  useEffect(() => {
    if (enabled && lat && lng) {
      setPlaces([]);
      setNextPageToken(null);
      setMeta(null);
      fetchPlaces();
    }
  }, [lat, lng, radius, type, lang, enabled]); // Intentionally not including fetchPlaces

  return {
    places,
    isLoading,
    isLoadingMore,
    error,
    hasMore: !!nextPageToken,
    loadMore,
    reload,
    meta
  };
}
