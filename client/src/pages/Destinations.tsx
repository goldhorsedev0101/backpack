import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Globe, Camera, Clock } from 'lucide-react';

interface DestinationPhoto {
  location_id: string;
  photo_url: string;
  thumbnail_url?: string;
  caption?: string;
  width?: number;
  height?: number;
}

interface Destination {
  id: number;
  location_id: string;
  name: string;
  latitude?: string;
  longitude?: string;
  city?: string;
  state?: string;
  country: string;
  address_string?: string;
  web_url?: string;
  photo_count?: number;
  created_at: string;
  photos: DestinationPhoto[];
  mainPhoto?: string;
  coordinates?: { lat: number; lng: number } | null;
}

interface DestinationsResponse {
  success: boolean;
  count: number;
  destinations: Destination[];
}

export default function Destinations() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: response, isLoading, error } = useQuery<DestinationsResponse>({
    queryKey: ['/api/destinations'],
    queryFn: async () => {
      const res = await fetch('/api/destinations');
      if (!res.ok) {
        throw new Error('Failed to fetch destinations');
      }
      return res.json();
    }
  });

  const destinations = response?.destinations || [];
  
  // Filter destinations based on search query
  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Unable to Load Destinations</h2>
          <p>Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Discover South America
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Explore amazing destinations across South America, from ancient ruins to vibrant cities and natural wonders.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search destinations, cities, or countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Stats */}
      {response && (
        <div className="text-center mb-8">
          <p className="text-gray-600 dark:text-gray-300">
            {searchQuery ? 
              `Found ${filteredDestinations.length} destinations matching "${searchQuery}"` :
              `Showing ${response.count} amazing destinations`
            }
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-t-lg"></div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-b-lg">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Destinations Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && filteredDestinations.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No destinations found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Try adjusting your search terms or browse all destinations.
          </p>
        </div>
      )}
    </div>
  );
}

function DestinationCard({ destination }: { destination: Destination }) {
  const hasPhotos = destination.photos.length > 0;
  const mainPhoto = destination.mainPhoto || '/placeholder-destination.jpg';
  
  const location = [destination.city, destination.state, destination.country]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      {/* Photo */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
        {hasPhotos ? (
          <img
            src={mainPhoto}
            alt={destination.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-destination.jpg';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Photo Count Badge */}
        {destination.photo_count && destination.photo_count > 0 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm flex items-center">
            <Camera className="h-3 w-3 mr-1" />
            {destination.photo_count}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {destination.name}
        </h3>
        
        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-sm truncate">{location}</span>
        </div>

        {destination.address_string && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {destination.address_string}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          {destination.web_url && (
            <a
              href={destination.web_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
            >
              <Globe className="h-4 w-4 mr-1" />
              Visit Website
            </a>
          )}
          
          <div className="flex items-center text-gray-400 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(destination.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}