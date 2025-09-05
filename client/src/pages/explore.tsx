import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase, fetchPhotosForEntities, type LocationPhoto } from "../../../src/lib/supabaseClient.js";
import { MapPin, Star, Phone, Globe, Clock, DollarSign, Users, Camera, CloudSun, Eye } from "lucide-react";
import DestinationWeather from "@/components/DestinationWeather";
import { BestTimeInfo } from "@/components/BestTimeInfo";


interface Accommodation {
  id: number;
  locationId: string;
  name: string;
  rating?: string;
  numReviews?: number;
  priceLevel?: string;
  category?: string;
  city?: string;
  country: string;
  addressString?: string;
  webUrl?: string;
  amenities?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Attraction {
  id: number;
  locationId: string;
  name: string;
  rating?: string;
  numReviews?: number;
  category?: string;
  city?: string;
  country: string;
  addressString?: string;
  webUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Restaurant {
  id: number;
  locationId: string;
  name: string;
  rating?: string;
  numReviews?: number;
  priceLevel?: string;
  category?: string;
  cuisine?: string[];
  city?: string;
  country: string;
  addressString?: string;
  webUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Photo state management
interface PhotoState {
  accommodations: Map<string, LocationPhoto>;
  attractions: Map<string, LocationPhoto>;
  restaurants: Map<string, LocationPhoto>;
}

// Detail modal state
interface DetailModalState {
  isOpen: boolean;
  type: 'destination' | 'accommodation' | 'attraction' | 'restaurant' | null;
  item: any;
  photos: LocationPhoto[];
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [weatherFilter, setWeatherFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("accommodations");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [photos, setPhotos] = useState<PhotoState>({
    accommodations: new Map(),
    attractions: new Map(),
    restaurants: new Map()
  });
  const [detailModal, setDetailModal] = useState<DetailModalState>({
    isOpen: false,
    type: null,
    item: null,
    photos: []
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const ITEMS_PER_PAGE = 20;
  const isDev = process.env.NODE_ENV !== 'production';
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [photoCache, setPhotoCache] = useState<Map<string, LocationPhoto>>(new Map());


  // Fetch accommodations from Supabase
  const { data: accommodations = [], isLoading: accommodationsLoading } = useQuery({
    queryKey: ['supabase-accommodations', currentPage, searchQuery],
    queryFn: async () => {
      const pageStart = currentPage * ITEMS_PER_PAGE;
      const pageEnd = pageStart + ITEMS_PER_PAGE - 1;
      
      let query = supabase
        .from('accommodations')
        .select('*', { count: 'exact', head: false })
        .order('updated_at', { ascending: false })
        .range(pageStart, pageEnd);
      
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      const { data, error, count } = await query;
      if (error) {
        console.error('Accommodations query error:', error);
        throw error;
      }
      
      setTotalCount(count || 0);
      setDebugInfo((prev: any) => ({ ...prev, accommodations: { count, rows: data?.length || 0 } }));
      return data as Accommodation[];
    },
    enabled: activeTab === 'accommodations'
  });

  // Fetch attractions from Supabase
  const { data: attractions = [], isLoading: attractionsLoading } = useQuery({
    queryKey: ['supabase-attractions', currentPage, searchQuery],
    queryFn: async () => {
      const pageStart = currentPage * ITEMS_PER_PAGE;
      const pageEnd = pageStart + ITEMS_PER_PAGE - 1;
      
      let query = supabase
        .from('attractions')
        .select('*', { count: 'exact', head: false })
        .order('updated_at', { ascending: false })
        .range(pageStart, pageEnd);
      
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      const { data, error, count } = await query;
      if (error) {
        console.error('Attractions query error:', error);
        throw error;
      }
      
      setTotalCount(count || 0);
      setDebugInfo((prev: any) => ({ ...prev, attractions: { count, rows: data?.length || 0 } }));
      return data as Attraction[];
    },
    enabled: activeTab === 'attractions'
  });

  // Fetch restaurants from Supabase
  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery({
    queryKey: ['supabase-restaurants', currentPage, searchQuery],
    queryFn: async () => {
      const pageStart = currentPage * ITEMS_PER_PAGE;
      const pageEnd = pageStart + ITEMS_PER_PAGE - 1;
      
      let query = supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: false })
        .order('updated_at', { ascending: false })
        .range(pageStart, pageEnd);
      
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      const { data, error, count } = await query;
      if (error) {
        console.error('Restaurants query error:', error);
        throw error;
      }
      
      setTotalCount(count || 0);
      setDebugInfo((prev: any) => ({ ...prev, restaurants: { count, rows: data?.length || 0 } }));
      return data as Restaurant[];
    },
    enabled: activeTab === 'restaurants'
  });

  // Load photos for current tab items (two-stage fetch)
  useEffect(() => {
    const loadPhotosForCurrentTab = async () => {
      let items: any[] = [];
      let entityType: LocationPhoto['entity_type'] | null = null;
      
      switch (activeTab) {
        case 'accommodations':
          items = accommodations;
          entityType = 'accommodation';
          break;
        case 'attractions':
          items = attractions;
          entityType = 'attraction';
          break;
        case 'restaurants':
          items = restaurants;
          entityType = 'restaurant';
          break;
      }
      
      if (items.length > 0 && entityType) {
        const cacheKey = `${entityType}-${currentPage}`;
        if (photoCache.has(cacheKey)) {
          return; // Use cached photos
        }
        
        const entityIds = items.map(item => item.id);
        const photoMap = await fetchPhotosForEntities(entityType, entityIds);
        
        // Cache the photos
        setPhotoCache((prev: Map<string, LocationPhoto>) => {
          const newMap = new Map(prev)
          newMap.set(cacheKey, Array.from(photoMap.values())[0] || {} as LocationPhoto)
          return newMap
        });
        
        setDebugInfo((prev: any) => ({
          ...prev,
          photos: {
            [`${entityType}_loaded`]: photoMap.size,
            [`${entityType}_entities`]: entityIds.length
          }
        }));
        
        setPhotos(prev => ({
          ...prev,
          [activeTab]: photoMap
        }));
      }
    };
    
    loadPhotosForCurrentTab();
  }, [activeTab, accommodations, attractions, restaurants, currentPage]);

  const countries = [];

  const renderStars = (rating: string | number | undefined) => {
    const numRating = typeof rating === 'string' ? parseFloat(rating) : (rating || 0);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(numRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const handleSearch = () => {
    setCurrentPage(0); // Reset to first page
    setSearchQuery(searchQuery.trim());
    queryClient.invalidateQueries({ queryKey: [`supabase-${activeTab}`] });
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCountry('all');
    setCurrentPage(0);
    queryClient.invalidateQueries({ queryKey: [`supabase-${activeTab}`] });
  };
  
  const runSupabaseHealth = async () => {
    try {
      const { runSupabaseHealthCheck } = await import('../../../src/health/supabaseCheck.js');
      console.log('=== Running Supabase Health Check ===');
      await runSupabaseHealthCheck();
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  const openDetailModal = async (type: DetailModalState['type'], item: any) => {
    // Fetch all photos for this specific item
    const { data: itemPhotos } = await supabase
      .from('location_photos')
      .select('*')
      .eq('locationCategory', type)
      .eq('locationId', item.locationId)
      .order('createdAt', { ascending: false })
      .limit(6);
    
    setDetailModal({
      isOpen: true,
      type,
      item,
      photos: itemPhotos || []
    });
  };

  const closeDetailModal = () => {
    setDetailModal({ isOpen: false, type: null, item: null, photos: [] });
  };

  const renderPhoto = (locationId: string, alt: string) => {
    const tabPhotos = photos[activeTab as keyof PhotoState];
    const photo = tabPhotos.get(locationId);
    
    if (photo) {
      const imageUrl = photo.thumbnailUrl || photo.photoUrl;
      return (
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-150px object-cover rounded-md mb-4"
          style={{ height: '150px' }}
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
      );
    }
    
    return (
      <div className="w-full h-150px bg-gray-200 dark:bg-gray-700 rounded-md mb-4 flex items-center justify-center" style={{ height: '150px' }}>
        <Camera className="w-8 h-8 text-gray-400" />
      </div>
    );
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setCurrentPage(0);
  };

  const nextPage = () => {
    if ((currentPage + 1) * ITEMS_PER_PAGE < totalCount) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Explore South America</h1>
        <p className="text-muted-foreground mb-6">
          Discover amazing destinations across South America with real-time weather conditions and travel timing recommendations to help plan your perfect trip.
        </p>

        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex flex-1 gap-2">
            <Input
              placeholder="Search destinations, places..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              variant="outline"
            >
              Search
            </Button>
          </div>
          
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {totalCount > 0 && (
              <span>
                Showing {currentPage * ITEMS_PER_PAGE + 1} to {Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalCount)} of {totalCount} items
              </span>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accommodations">Accommodations (Hotels)</TabsTrigger>
          <TabsTrigger value="attractions">Attractions</TabsTrigger>
          <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
        </TabsList>


        <TabsContent value="accommodations" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accommodationsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : accommodations.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No accommodations found matching your criteria.</p>
              </div>
            ) : (
              accommodations.map((accommodation: Accommodation) => (
                <Card key={accommodation.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openDetailModal('accommodation', accommodation)}>
                  <CardContent className="p-4">
                    {renderPhoto(accommodation.locationId, accommodation.name)}
                    
                    <CardTitle className="text-lg mb-2">{accommodation.name}</CardTitle>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">{renderStars(accommodation.rating)}</div>
                      {accommodation.numReviews && (
                        <span className="text-sm text-muted-foreground">
                          ({accommodation.numReviews} reviews)
                        </span>
                      )}
                      {accommodation.priceLevel && (
                        <Badge variant="outline">{accommodation.priceLevel}</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{accommodation.city && `${accommodation.city}, `}{accommodation.country}</span>
                      </div>
                      
                      {accommodation.category && (
                        <Badge variant="secondary" className="text-xs">
                          {accommodation.category}
                        </Badge>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          {accommodation.amenities && accommodation.amenities.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {accommodation.amenities.slice(0, 2).join(", ")}
                              {accommodation.amenities.length > 2 && " ..."}
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="outline" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          More Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          {totalCount > ITEMS_PER_PAGE && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button onClick={prevPage} disabled={currentPage === 0} variant="outline">Previous</Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {Math.ceil(totalCount / ITEMS_PER_PAGE)}
              </span>
              <Button onClick={nextPage} disabled={(currentPage + 1) * ITEMS_PER_PAGE >= totalCount} variant="outline">Next</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="attractions" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attractionsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : attractions.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No attractions found matching your criteria.</p>
              </div>
            ) : (
              attractions.map((attraction: Attraction) => (
                <Card key={attraction.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openDetailModal('attraction', attraction)}>
                  <CardContent className="p-4">
                    {renderPhoto(attraction.locationId, attraction.name)}
                    
                    <CardTitle className="text-lg mb-2">{attraction.name}</CardTitle>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">{renderStars(attraction.rating)}</div>
                      {attraction.numReviews && (
                        <span className="text-sm text-muted-foreground">
                          ({attraction.numReviews} reviews)
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{attraction.city && `${attraction.city}, `}{attraction.country}</span>
                      </div>
                      
                      {attraction.category && (
                        <Badge variant="secondary" className="text-xs">
                          {attraction.category}
                        </Badge>
                      )}
                      
                      <div className="flex items-center justify-end pt-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          More Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          {totalCount > ITEMS_PER_PAGE && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button onClick={prevPage} disabled={currentPage === 0} variant="outline">Previous</Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {Math.ceil(totalCount / ITEMS_PER_PAGE)}
              </span>
              <Button onClick={nextPage} disabled={(currentPage + 1) * ITEMS_PER_PAGE >= totalCount} variant="outline">Next</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="restaurants" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurantsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : restaurants.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No restaurants found matching your criteria.</p>
              </div>
            ) : (
              restaurants.map((restaurant: Restaurant) => (
                <Card key={restaurant.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openDetailModal('restaurant', restaurant)}>
                  <CardContent className="p-4">
                    {renderPhoto(restaurant.locationId, restaurant.name)}
                    
                    <CardTitle className="text-lg mb-2">{restaurant.name}</CardTitle>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">{renderStars(restaurant.rating)}</div>
                      {restaurant.numReviews && (
                        <span className="text-sm text-muted-foreground">
                          ({restaurant.numReviews} reviews)
                        </span>
                      )}
                      {restaurant.priceLevel && (
                        <Badge variant="outline">{restaurant.priceLevel}</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{restaurant.city && `${restaurant.city}, `}{restaurant.country}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {restaurant.cuisine?.slice(0, 3).map((cuisineType, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {cuisineType}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-end pt-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          More Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          {totalCount > ITEMS_PER_PAGE && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button onClick={prevPage} disabled={currentPage === 0} variant="outline">Previous</Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {Math.ceil(totalCount / ITEMS_PER_PAGE)}
              </span>
              <Button onClick={nextPage} disabled={(currentPage + 1) * ITEMS_PER_PAGE >= totalCount} variant="outline">Next</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={detailModal.isOpen} onOpenChange={closeDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {detailModal.item && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  {detailModal.item.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Photos Gallery */}
                {detailModal.photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {detailModal.photos.map((photo, idx) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.thumbnailUrl || photo.photoUrl}
                          alt={photo.caption || `${detailModal.item.name} ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105"
                          onClick={() => window.open(photo.photoUrl, '_blank')}
                        />
                        {photo.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 rounded-b-lg">
                            {photo.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Location Details</h3>
                    
                    <div className="space-y-2 text-sm">
                      {detailModal.item.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{detailModal.item.city}, {detailModal.item.country}</span>
                        </div>
                      )}
                      
                      {detailModal.item.addressString && (
                        <div className="text-muted-foreground">
                          {detailModal.item.addressString}
                        </div>
                      )}
                      
                      {detailModal.item.webUrl && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <a 
                            href={detailModal.item.webUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                      
                      {detailModal.item.latitude && detailModal.item.longitude && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <a
                            href={`https://www.google.com/maps?q=${detailModal.item.latitude},${detailModal.item.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View on Maps
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Additional Info</h3>
                    
                    <div className="space-y-3 text-sm">
                      {detailModal.item.rating && (
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(detailModal.item.rating)}</div>
                          <span className="text-muted-foreground">
                            {parseFloat(detailModal.item.rating).toFixed(1)} stars
                          </span>
                          {detailModal.item.numReviews && (
                            <span className="text-muted-foreground">
                              ({detailModal.item.numReviews} reviews)
                            </span>
                          )}
                        </div>
                      )}
                      
                      {detailModal.item.priceLevel && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <Badge variant="outline">{detailModal.item.priceLevel}</Badge>
                        </div>
                      )}
                      
                      {detailModal.item.category && (
                        <div>
                          <Badge variant="secondary">{detailModal.item.category}</Badge>
                        </div>
                      )}
                      
                      {detailModal.item.cuisine && detailModal.item.cuisine.length > 0 && (
                        <div className="space-y-1">
                          <span className="font-medium">Cuisine:</span>
                          <div className="flex flex-wrap gap-1">
                            {detailModal.item.cuisine.map((cuisineType: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {cuisineType}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {detailModal.item.amenities && detailModal.item.amenities.length > 0 && (
                        <div className="space-y-1">
                          <span className="font-medium">Amenities:</span>
                          <div className="flex flex-wrap gap-1">
                            {detailModal.item.amenities.map((amenity: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground pt-2">
                        Last updated: {new Date(detailModal.item.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}