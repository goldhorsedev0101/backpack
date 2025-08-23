import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MessageCircle, Users, MapPin, Calendar, ThumbsUp, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">({rating})</span>
    </div>
  );
};

export default function Community() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Fetch place reviews (simplified version without authentication requirement)
  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError } = useQuery({
    queryKey: ['/api/place-reviews', selectedLocation, searchTerm],
    retry: false,
    enabled: true
  });

  // Handle new API response format { items: [], total: 0 }
  const placeReviews = (reviewsData as any)?.items || [];
  const totalReviews = (reviewsData as any)?.total || 0;
  const isDatabaseInitializing = reviewsData && typeof reviewsData === 'object' && 'message' in reviewsData && 
    typeof (reviewsData as any).message === 'string' && (reviewsData as any).message.includes('being loaded');
  
  // Show error message if API fails but continue with empty array
  if (reviewsError && !reviewsLoading) {
    console.warn('Reviews API error:', reviewsError);
  }

  // Use only authentic API data
  const displayReviews = placeReviews;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          TripWise Community
        </h1>
        <p className="text-gray-600">
          Connect with fellow travelers, share experiences, and find travel companions
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search reviews, chat rooms, or destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="Peru">Peru</SelectItem>
            <SelectItem value="Colombia">Colombia</SelectItem>
            <SelectItem value="Bolivia">Bolivia</SelectItem>
            <SelectItem value="Chile">Chile</SelectItem>
            <SelectItem value="Argentina">Argentina</SelectItem>
            <SelectItem value="Brazil">Brazil</SelectItem>
            <SelectItem value="Ecuador">Ecuador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reviews">Place Reviews</TabsTrigger>
          <TabsTrigger value="chat">Chat Rooms</TabsTrigger>
          <TabsTrigger value="buddies">Travel Buddies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reviews" className="mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Authentic Place Reviews</h2>
            <p className="text-gray-600">
              Real reviews from travelers who've been there, with detailed ratings and tips
            </p>
          </div>
          
          {reviewsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isDatabaseInitializing ? (
            <div className="text-center py-12">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Setting up the database...
                </h3>
                <p className="text-blue-700">
                  The community features are being initialized. This happens when the database is first set up.
                  Your data will appear here once the setup is complete.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayReviews && displayReviews.length > 0 ? (displayReviews || []).map((review: any) => (
                <Card key={review.id} className="w-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{review.title || 'Review'}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4" />
                          {review.place_name || review.placeName} • {review.location}
                          <Badge variant="outline" className="ml-2">
                            {review.place_type || review.placeType}
                          </Badge>
                          {review.is_verified && (
                            <Badge className="bg-green-100 text-green-800">Verified</Badge>
                          )}
                        </CardDescription>
                      </div>
                      <StarRating rating={review.overall_rating || review.overallRating || 0} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{review.comment}</p>
                    
                    {/* Tags */}
                    {review.tags && review.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {review.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Trip Details */}
                    <div className="text-sm text-gray-600">
                      {review.visited_date && (
                        <p>Visited: {new Date(review.visited_date).toLocaleDateString()}</p>
                      )}
                      {review.trip_duration && <p>Trip Duration: {review.trip_duration}</p>}
                      {review.travel_style && <p>Travel Style: {review.travel_style}</p>}
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No reviews found. Be the first to share your experience!</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="chat" className="mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Community Chat Rooms</h2>
            <p className="text-gray-600">
              Join conversations with travelers sharing similar interests and destinations
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Sample chat rooms */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg">Peru Backpackers 2024</CardTitle>
                <CardDescription>
                  Planning trips around Peru, sharing tips and experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    15/50
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Peru
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">backpacking</Badge>
                  <Badge variant="outline" className="text-xs">budget-travel</Badge>
                  <Badge variant="outline" className="text-xs">machu-picchu</Badge>
                </div>
                <Button variant="default" size="sm">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Join Chat
                </Button>
              </CardContent>
            </Card>
            
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg">Colombia Adventure Group</CardTitle>
                <CardDescription>
                  For adventurous travelers exploring Colombia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    8/30
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Colombia
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">hiking</Badge>
                  <Badge variant="outline" className="text-xs">adventure</Badge>
                  <Badge variant="outline" className="text-xs">cartagena</Badge>
                </div>
                <Button variant="default" size="sm">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Join Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="buddies" className="mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Find Travel Companions</h2>
            <p className="text-gray-600">
              Connect with like-minded travelers planning similar trips
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Sample travel buddy posts */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg">Looking for hiking buddies in Patagonia!</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  Patagonia (Chile/Argentina)
                  <Badge variant="outline" className="ml-2">mid budget</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Planning an epic 3-week trek through Torres del Paine and Los Glaciares. Looking for experienced hikers.
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Nov 15 - Dec 6
                  </div>
                  <div>2/4 members</div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="text-xs">adventure</Badge>
                  <Badge variant="secondary" className="text-xs">hiking</Badge>
                  <Badge variant="secondary" className="text-xs">camping</Badge>
                </div>
                
                <Button variant="default" className="w-full">
                  Apply to Join Trip
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}