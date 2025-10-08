import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface GooglePlacePhoto {
  photo_reference: string;
  height: number;
  width: number;
}

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types: string[];
  photos?: GooglePlacePhoto[];
  vicinity?: string;
  business_status?: string;
}

interface PlacesResponse {
  results: GooglePlaceResult[];
  next_page_token?: string;
}

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

  const { data, isLoading, error, isFetching } = useQuery<PlacesResponse>({
    queryKey,
    enabled: enabled && hasMore,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Update all places when new data arrives
  useEffect(() => {
    if (data?.results) {
      const newPlaces = data.results.map((place) => ({
        placeId: place.place_id,
        name: place.name,
        types: place.types || [],
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        photoRefs: place.photos?.map((p) => p.photo_reference) || [],
        vicinity: place.vicinity,
        formattedAddress: place.formatted_address
      }));

      if (currentPage === 1) {
        setAllPlaces(newPlaces);
      } else {
        setAllPlaces(prev => [...prev, ...newPlaces]);
      }

      // If we got less than expected or no next_page_token, no more results
      if (!data.next_page_token || newPlaces.length === 0) {
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
