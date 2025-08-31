import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Star, Users, Camera, MessageSquare } from "lucide-react";

export default function TripAdvisorData() {
  const [activeTab, setActiveTab] = useState("destinations");

  // Fetch data for each category
  const { data: destinations, isLoading: destinationsLoading } = useQuery({
    queryKey: ["/api/destinations"],
    enabled: activeTab === "destinations"
  });

  const { data: accommodations, isLoading: accommodationsLoading } = useQuery({
    queryKey: ["/api/accommodations"],
    enabled: activeTab === "accommodations"
  });

  const { data: attractions, isLoading: attractionsLoading } = useQuery({
    queryKey: ["/api/attractions"],
    enabled: activeTab === "attractions"
  });

  const { data: restaurants, isLoading: restaurantsLoading } = useQuery({
    queryKey: ["/api/ta-restaurants"],
    enabled: activeTab === "restaurants"
  });

  const { data: recentReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/location-reviews/recent"],
    enabled: activeTab === "reviews"
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const formatCoordinates = (lat: string, lng: string) => {
    return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">TripAdvisor Database Explorer</h1>
        <p className="text-gray-600">
          Browse South American travel data including destinations, accommodations, attractions, restaurants, and reviews.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="accommodations">Hotels</TabsTrigger>
          <TabsTrigger value="attractions">Attractions</TabsTrigger>
          <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="destinations" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {destinationsLoading ? (
              <p>Loading destinations...</p>
            ) : destinations?.map((destination: any) => (
              <Card key={destination.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    {destination.name}
                  </CardTitle>
                  <CardDescription>{destination.country}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>Location:</strong> {destination.addressString}
                    </p>
                    {destination.latitude && destination.longitude && (
                      <p className="text-sm text-gray-600">
                        <strong>Coordinates:</strong> {formatCoordinates(destination.latitude, destination.longitude)}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      <span className="text-sm">{destination.photoCount} photos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="accommodations" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {accommodationsLoading ? (
              <p>Loading accommodations...</p>
            ) : accommodations?.map((accommodation: any) => (
              <Card key={accommodation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{accommodation.name}</span>
                    <Badge variant="secondary">{accommodation.priceLevel}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {accommodation.city}, {accommodation.country}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {renderStars(parseFloat(accommodation.rating))}
                      <span className="text-sm font-medium">{accommodation.rating}</span>
                      <span className="text-sm text-gray-500">({accommodation.numReviews} reviews)</span>
                    </div>
                    
                    {accommodation.rankingString && (
                      <p className="text-sm text-green-600 font-medium">
                        {accommodation.rankingString}
                      </p>
                    )}
                    
                    {accommodation.amenities && accommodation.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {accommodation.amenities.slice(0, 4).map((amenity: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {accommodation.amenities.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{accommodation.amenities.length - 4} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Camera className="w-4 h-4" />
                        {accommodation.photoCount} photos
                      </div>
                      {accommodation.isBookable && (
                        <Badge variant="default" className="text-xs">Bookable</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="attractions" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {attractionsLoading ? (
              <p>Loading attractions...</p>
            ) : attractions?.map((attraction: any) => (
              <Card key={attraction.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{attraction.name}</CardTitle>
                  <CardDescription>
                    {attraction.city}, {attraction.country}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {renderStars(parseFloat(attraction.rating))}
                      <span className="text-sm font-medium">{attraction.rating}</span>
                      <span className="text-sm text-gray-500">({attraction.numReviews} reviews)</span>
                    </div>
                    
                    {attraction.rankingString && (
                      <p className="text-sm text-green-600 font-medium">
                        {attraction.rankingString}
                      </p>
                    )}
                    
                    {attraction.attractionTypes && attraction.attractionTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {attraction.attractionTypes.map((type: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Camera className="w-4 h-4" />
                      {attraction.photoCount} photos
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="restaurants" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {restaurantsLoading ? (
              <p>Loading restaurants...</p>
            ) : restaurants?.map((restaurant: any) => (
              <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{restaurant.name}</span>
                    <Badge variant="secondary">{restaurant.priceLevel}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {restaurant.city}, {restaurant.country}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {renderStars(parseFloat(restaurant.rating))}
                      <span className="text-sm font-medium">{restaurant.rating}</span>
                      <span className="text-sm text-gray-500">({restaurant.numReviews} reviews)</span>
                    </div>
                    
                    {restaurant.rankingString && (
                      <p className="text-sm text-green-600 font-medium">
                        {restaurant.rankingString}
                      </p>
                    )}
                    
                    {restaurant.cuisine && restaurant.cuisine.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {restaurant.cuisine.map((cuisine: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cuisine}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {restaurant.dietaryRestrictions && restaurant.dietaryRestrictions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {restaurant.dietaryRestrictions.map((restriction: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700">
                            {restriction}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Camera className="w-4 h-4" />
                      {restaurant.photoCount} photos
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="space-y-4">
            {reviewsLoading ? (
              <p>Loading reviews...</p>
            ) : recentReviews?.map((review: any) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="font-medium">{review.rating}/5</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MessageSquare className="w-4 h-4" />
                        {review.locationCategory}
                      </div>
                    </div>
                    
                    {review.title && (
                      <h3 className="font-semibold text-lg">{review.title}</h3>
                    )}
                    
                    <p className="text-gray-700">{review.text}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        {review.user && (
                          <span>
                            {review.user.firstName} {review.user.lastName}
                          </span>
                        )}
                        {review.tripType && (
                          <Badge variant="outline" className="text-xs">
                            {review.tripType}
                          </Badge>
                        )}
                      </div>
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}