import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Place {
  placeId: string;
  name: string;
  types: string[];
  rating?: number;
  userRatingsTotal?: number;
  photoRefs: string[];
  vicinity?: string;
  formattedAddress?: string;
}

interface UseInfiniteDestinationsParams {
  lat: number;
  lng: number;
  radius?: number;
  type?: string;
  lang?: string;
  enabled?: boolean;
}

interface Meta {
  currentPage: number;
  totalLoaded: number;
  cacheHit: boolean;
}

export function useInfiniteDestinations({
  lat,
  lng,
  radius = 10000,
  type,
  lang = 'en',
  enabled = true
}: UseInfiniteDestinationsParams) {
  const [currentPage, setCurrentPage] = useState(1);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const queryKey = ['places', 'nearby', lat, lng, radius, type, lang, currentPage];

  const { data, isLoading, error, isFetching } = useQuery<{ results: any[] }>({
    queryKey,
    enabled: enabled && hasMore,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Update all places when new data arrives
  useEffect(() => {
    if (data?.results) {
      const newPlaces = data.results.map((place: any) => ({
        placeId: place.place_id,
        name: place.name,
        types: place.types || [],
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        photoRefs: place.photos?.map((p: any) => p.photo_reference) || [],
        vicinity: place.vicinity,
        formattedAddress: place.formatted_address
      }));

      if (currentPage === 1) {
        setAllPlaces(newPlaces);
      } else {
        setAllPlaces(prev => [...prev, ...newPlaces]);
      }

      // If we got less than 20 results (typical page size), no more results
      if (newPlaces.length < 20) {
        setHasMore(false);
      }
    }
  }, [data, currentPage]);

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, isFetching]);

  const meta: Meta = {
    currentPage,
    totalLoaded: allPlaces.length,
    cacheHit: false // Could be enhanced with actual cache hit detection
  };

  return {
    places: allPlaces,
    isLoading: isLoading && currentPage === 1,
    isLoadingMore: isFetching && currentPage > 1,
    error: error ? 'Failed to load places' : null,
    hasMore,
    loadMore,
    meta
  };
}
