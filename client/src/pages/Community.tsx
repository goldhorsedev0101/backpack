import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MessageCircle, Users, MapPin, Calendar, ThumbsUp, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface PlaceReview {
  id: number;
  userId: string;
  placeId: string;
  placeName: string;
  placeType: string;
  location: string;
  overallRating: number;
  ratings: {
    cleanliness?: number;
    location?: number;
    value?: number;
    service?: number;
    facilities?: number;
  };
  title: string;
  comment: string;
  photos: string[];
  tags: string[];
  visitedDate: string;
  tripDuration: string;
  travelStyle: string;
  helpfulCount: number;
  isVerified: boolean;
  createdAt: string;
}

interface ChatRoom {
  id: number;
  name: string;
  description: string;
  type: string;
  destination: string;
  memberCount: number;
  maxMembers: number;
  tags: string[];
  languages: string[];
  isPrivate: boolean;
  lastActivity: string;
  createdAt: string;
}

interface TravelBuddyPost {
  id: number;
  userId: string;
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  groupSize: number;
  currentMembers: number;
  budget: string;
  travelStyle: string[];
  activities: string[];
  requirements: string;
  isActive: boolean;
  createdAt: string;
}

const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-${size/4} h-${size/4} ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">({rating})</span>
    </div>
  );
};

const PlaceReviewCard = ({ review }: { review: PlaceReview }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const voteOnReview = useMutation({
    mutationFn: async (voteType: 'helpful' | 'not_helpful') => {
      return apiRequest(`/api/review-votes`, {
        method: 'POST',
        body: JSON.stringify({
          reviewId: review.id,
          voteType
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/place-reviews'] });
      toast({
        title: "Vote recorded",
        description: "Thank you for your feedback!",
      });
    }
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{review.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4" />
              {review.placeName} • {review.location}
              <Badge variant="outline" className="ml-2">
                {review.placeType}
              </Badge>
              {review.isVerified && (
                <Badge className="bg-green-100 text-green-800">Verified</Badge>
              )}
            </CardDescription>
          </div>
          <StarRating rating={review.overallRating} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">{review.comment}</p>
        
        {/* Detailed Ratings */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.entries(review.ratings).map(([category, rating]) => (
            <div key={category} className="flex justify-between text-sm">
              <span className="capitalize">{category}:</span>
              <StarRating rating={rating || 0} size={12} />
            </div>
          ))}
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {review.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        {/* Trip Details */}
        <div className="text-sm text-gray-600 mb-4">
          <p>Visited: {new Date(review.visitedDate).toLocaleDateString()}</p>
          <p>Trip Duration: {review.tripDuration}</p>
          <p>Travel Style: {review.travelStyle}</p>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => voteOnReview.mutate('helpful')}
          className="text-green-600 hover:text-green-700"
        >
          <ThumbsUp className="w-4 h-4 mr-1" />
          Helpful ({review.helpfulCount})
        </Button>
        <span className="text-xs text-gray-500">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </CardFooter>
    </Card>
  );
};

const ChatRoomCard = ({ room }: { room: ChatRoom }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const joinRoom = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/chat-rooms/${room.id}/join`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat-rooms'] });
      toast({
        title: "Joined chat room!",
        description: `You've successfully joined ${room.name}`,
      });
    }
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{room.name}</CardTitle>
            <CardDescription className="mt-1">
              {room.description}
            </CardDescription>
          </div>
          <Badge variant={room.isPrivate ? "destructive" : "default"}>
            {room.isPrivate ? "Private" : "Public"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {room.memberCount}/{room.maxMembers}
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {room.destination || 'General'}
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {room.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        {/* Languages */}
        <div className="text-sm text-gray-600">
          Languages: {room.languages.join(', ')}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Button
          variant="default"
          size="sm"
          onClick={() => joinRoom.mutate()}
          disabled={!isAuthenticated || joinRoom.isPending}
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          Join Chat
        </Button>
        <span className="text-xs text-gray-500">
          Last active: {new Date(room.lastActivity).toLocaleDateString()}
        </span>
      </CardFooter>
    </Card>
  );
};

const TravelBuddyCard = ({ post }: { post: TravelBuddyPost }) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [applicationMessage, setApplicationMessage] = useState('');
  
  const applyForBuddy = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest('/api/travel-buddy-applications', {
        method: 'POST',
        body: JSON.stringify({
          postId: post.id,
          message
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Application sent!",
        description: "Your travel buddy application has been submitted.",
      });
      setApplicationMessage('');
    }
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{post.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4" />
              {post.destination}
              <Badge variant="outline" className="ml-2">
                {post.budget} budget
              </Badge>
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              {post.currentMembers}/{post.groupSize} members
            </div>
            <Badge variant={post.isActive ? "default" : "secondary"}>
              {post.isActive ? "Active" : "Closed"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">{post.description}</p>
        
        {/* Trip Details */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(post.startDate).toLocaleDateString()} - {new Date(post.endDate).toLocaleDateString()}
          </div>
        </div>
        
        {/* Travel Styles */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.travelStyle.map((style) => (
            <Badge key={style} variant="secondary" className="text-xs">
              {style}
            </Badge>
          ))}
        </div>
        
        {/* Activities */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Planned Activities:</h4>
          <div className="flex flex-wrap gap-2">
            {post.activities.map((activity) => (
              <Badge key={activity} variant="outline" className="text-xs">
                {activity}
              </Badge>
            ))}
          </div>
        </div>
        
        {post.requirements && (
          <div className="text-sm text-gray-600">
            <strong>Requirements:</strong> {post.requirements}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="default" 
              className="w-full"
              disabled={!isAuthenticated || !post.isActive || post.currentMembers >= post.groupSize}
            >
              Apply to Join Trip
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply to Join "{post.title}"</DialogTitle>
              <DialogDescription>
                Send a message to the trip organizer explaining why you'd like to join.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Hi! I'd love to join your trip because..."
              value={applicationMessage}
              onChange={(e) => setApplicationMessage(e.target.value)}
              rows={4}
            />
            <DialogFooter>
              <Button
                onClick={() => applyForBuddy.mutate(applicationMessage)}
                disabled={!applicationMessage.trim() || applyForBuddy.isPending}
              >
                Send Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default function Community() {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Fetch place reviews
  const { data: placeReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['/api/place-reviews', selectedLocation, searchTerm],
    queryFn: () => apiRequest(`/api/place-reviews?${new URLSearchParams({
      ...(selectedLocation !== 'all' && { location: selectedLocation }),
      ...(searchTerm && { search: searchTerm }),
      limit: '20'
    })}`),
    enabled: true
  });

  // Fetch chat rooms
  const { data: chatRooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['/api/chat-rooms', searchTerm],
    queryFn: () => apiRequest(`/api/chat-rooms?${new URLSearchParams({
      ...(searchTerm && { search: searchTerm })
    })}`),
    enabled: true
  });

  // Fetch travel buddy posts
  const { data: travelBuddyPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['/api/travel-buddy-posts', selectedLocation],
    queryFn: () => apiRequest(`/api/travel-buddy-posts?${new URLSearchParams({
      ...(selectedLocation !== 'all' && { destination: selectedLocation })
    })}`),
    enabled: true
  });

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
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {placeReviews.map((review: PlaceReview) => (
                <PlaceReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
          
          {placeReviews.length === 0 && !reviewsLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No reviews found. Be the first to share your experience!</p>
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
          
          {roomsLoading ? (
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
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {chatRooms.map((room: ChatRoom) => (
                <ChatRoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
          
          {chatRooms.length === 0 && !roomsLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No chat rooms found. Create one to start a conversation!</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="buddies" className="mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Find Travel Companions</h2>
            <p className="text-gray-600">
              Connect with like-minded travelers planning similar trips
            </p>
          </div>
          
          {postsLoading ? (
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
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {travelBuddyPosts.map((post: TravelBuddyPost) => (
                <TravelBuddyCard key={post.id} post={post} />
              ))}
            </div>
          )}
          
          {travelBuddyPosts.length === 0 && !postsLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No travel buddy posts found. Create one to find your travel companion!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}