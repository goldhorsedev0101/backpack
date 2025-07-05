import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import ChatInterface from "@/components/chat-interface";
import { 
  Star, 
  MapPin, 
  MessageCircle, 
  Users, 
  Plus,
  Send,
  ThumbsUp,
  Clock,
  Search,
  Filter,
  UserPlus,
  CheckCircle,
  X,
  Heart,
  Share2,
  BookOpen,
  Globe,
  TrendingUp,
  Calendar,
  Eye,
  Edit,
  MoreHorizontal,
  Camera,
  Route,
  Plane
} from "lucide-react";

const DESTINATIONS = [
  "Peru", "Colombia", "Bolivia", "Chile", "Argentina", "Brazil", "Ecuador", "Uruguay", "All Destinations"
];

export default function Community() {
  const [selectedDestination, setSelectedDestination] = useState("All Destinations");
  const [newReview, setNewReview] = useState({ 
    destination: "", 
    rating: 5, 
    comment: "", 
    tags: [], 
    photos: [] 
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showChatRooms, setShowChatRooms] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");
  const [activeTab, setActiveTab] = useState("reviews");
  const [selectedTraveler, setSelectedTraveler] = useState(null);
  const [likedReviews, setLikedReviews] = useState(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/reviews", selectedDestination === "All Destinations" ? "" : selectedDestination],
  });

  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ["/api/connections"],
  });

  const { data: chatRooms = [], isLoading: chatRoomsLoading } = useQuery({
    queryKey: ["/api/chat/rooms"],
  });

  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      return await apiRequest("POST", "/api/reviews", reviewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      setNewReview({ destination: "", rating: 5, comment: "", tags: [], photos: [] });
      setShowReviewForm(false);
      toast({
        title: "Review Posted!",
        description: "Your review has been shared with the community.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Post Failed",
        description: "Could not post review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createConnectionMutation = useMutation({
    mutationFn: async (connectionData: any) => {
      return await apiRequest("POST", "/api/connections", connectionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      toast({
        title: "Connection Request Sent!",
        description: "Your connection request has been sent.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Request Failed",
        description: "Could not send connection request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = () => {
    if (!newReview.destination || !newReview.comment) {
      toast({
        title: "Missing Information",
        description: "Please fill in destination and comment.",
        variant: "destructive",
      });
      return;
    }

    createReviewMutation.mutate(newReview);
  };

  const handleConnect = (userId: string) => {
    createConnectionMutation.mutate({
      receiverId: userId,
      message: "Hi! I'd love to connect and share travel experiences."
    });
  };

  const handleLikeReview = (reviewId: string) => {
    setLikedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const handleShareReview = (review: any) => {
    if (navigator.share) {
      navigator.share({
        title: `Travel Review: ${review.destination}`,
        text: review.comment,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Review link copied to clipboard.",
      });
    }
  };

  const filteredReviews = (reviews: any[]) => {
    if (!reviews) return [];
    
    let filtered = reviews;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(review => 
        review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by rating
    if (filterBy !== "all") {
      const minRating = parseInt(filterBy);
      filtered = filtered.filter(review => review.rating >= minRating);
    }
    
    // Sort reviews
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "helpful":
          return (b.helpfulCount || 0) - (a.helpfulCount || 0);
        case "recent":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    return filtered;
  };

  const getAvailableTags = () => [
    "Budget-friendly", "Luxury", "Adventure", "Cultural", "Nature", "Food", 
    "Nightlife", "Family-friendly", "Solo travel", "Backpacking", "Photography", 
    "Historical", "Beach", "Mountains", "Cities", "Remote"
  ];

  if (showChatRooms) {
    return <ChatInterface onBack={() => setShowChatRooms(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4">Travel Community</h1>
          <p className="text-lg text-gray-600">Connect with fellow backpackers and share your experiences</p>
        </div>

        {/* Enhanced Search and Filter Section */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search reviews, destinations, or travelers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DESTINATIONS.map((dest) => (
                    <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="helpful">Most Helpful</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowChatRooms(true)}
                variant="outline"
                className="whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat Rooms
              </Button>
              <Button 
                onClick={() => setShowReviewForm(true)}
                className="bg-primary hover:bg-orange-600 whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                Write Review
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{(reviews as any[])?.length || 0} reviews</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{(connections as any[])?.length || 0} connections</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span>8 countries covered</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reviews">Reviews & Tips</TabsTrigger>
            <TabsTrigger value="travelers">Active Travelers</TabsTrigger>
            <TabsTrigger value="connections">My Connections</TabsTrigger>
          </TabsList>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            {/* Enhanced Review Form */}
            {showReviewForm && (
              <Card className="border-2 border-primary/20 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Edit className="w-5 h-5 text-primary" />
                      <span>Share Your Travel Experience</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowReviewForm(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                  <p className="text-sm text-gray-600">Help fellow travelers with your insights and recommendations</p>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Destination Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Destination
                    </label>
                    <Select 
                      value={newReview.destination} 
                      onValueChange={(value) => setNewReview(prev => ({ ...prev, destination: value }))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select the country you visited" />
                      </SelectTrigger>
                      <SelectContent>
                        {DESTINATIONS.filter(d => d !== "All Destinations").map((dest) => (
                          <SelectItem key={dest} value={dest} className="py-3">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-gray-400" />
                              {dest}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Rating System */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      Overall Rating
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Star
                            key={rating}
                            className={`w-8 h-8 cursor-pointer transition-all hover:scale-110 ${
                              rating <= newReview.rating 
                                ? "text-accent fill-current" 
                                : "text-gray-300 hover:text-gray-400"
                            }`}
                            onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        {newReview.rating === 1 && "Poor"}
                        {newReview.rating === 2 && "Fair"}
                        {newReview.rating === 3 && "Good"}
                        {newReview.rating === 4 && "Very Good"}
                        {newReview.rating === 5 && "Excellent"}
                      </div>
                    </div>
                  </div>
                  
                  {/* Review Content */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-primary" />
                      Your Experience
                    </label>
                    <Textarea
                      placeholder="Share your experience... What did you love? Any tips for future travelers? What should people know before visiting?"
                      value={newReview.comment}
                      onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                      className="min-h-[140px] resize-none"
                    />
                    <div className="text-xs text-gray-500 text-right">
                      {newReview.comment.length}/1000 characters
                    </div>
                  </div>

                  {/* Travel Tags */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Travel Style Tags (Optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {getAvailableTags().map((tag) => (
                        <Badge
                          key={tag}
                          variant={newReview.tags.includes(tag) ? "default" : "outline"}
                          className={`cursor-pointer transition-all hover:scale-105 ${
                            newReview.tags.includes(tag) 
                              ? "bg-primary text-white" 
                              : "hover:bg-primary/10"
                          }`}
                          onClick={() => {
                            setNewReview(prev => ({
                              ...prev,
                              tags: prev.tags.includes(tag)
                                ? prev.tags.filter(t => t !== tag)
                                : [...prev.tags, tag]
                            }));
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Select tags that describe your travel style and experience
                    </p>
                  </div>

                  {/* Photo Upload Placeholder */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Camera className="w-4 h-4 text-primary" />
                      Photos (Coming Soon)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Photo upload feature coming soon!</p>
                      <p className="text-xs text-gray-400">Share your amazing travel photos with the community</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      onClick={handleSubmitReview}
                      disabled={createReviewMutation.isPending || !newReview.destination || !newReview.comment}
                      className="bg-primary hover:bg-orange-600 flex-1"
                    >
                      {createReviewMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Posting...
                        </div>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Share Experience
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowReviewForm(false)}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (filteredReviews(reviews as any[]) || []).length > 0 ? (
              <div className="space-y-4">
                {filteredReviews(reviews as any[]).map((review: any) => (
                  <Card key={review.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12 ring-2 ring-primary/10">
                          <AvatarImage src={review.user?.profileImageUrl} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-slate-700">
                                  {review.user?.firstName} {review.user?.lastName}
                                </h4>
                                {review.user?.isVerified && (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                    Verified Traveler
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {review.destination}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {review.viewCount || 0} views
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${
                                      i < review.rating 
                                        ? "text-accent fill-current" 
                                        : "text-gray-300"
                                    }`} 
                                  />
                                ))}
                              </div>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                          </div>
                          
                          {review.tags && review.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {review.tags.map((tag: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs bg-primary/5 hover:bg-primary/10 cursor-pointer">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Photo Gallery Preview */}
                          {review.photos && review.photos.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              {review.photos.slice(0, 3).map((photo: string, i: number) => (
                                <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                                  <Camera className="w-8 h-8 text-gray-400 mx-auto mt-4" />
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-4">
                              <button 
                                onClick={() => handleLikeReview(review.id)}
                                className={`flex items-center gap-1 text-sm transition-colors ${
                                  likedReviews.has(review.id) 
                                    ? "text-red-500 hover:text-red-600" 
                                    : "text-gray-500 hover:text-primary"
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${likedReviews.has(review.id) ? 'fill-current' : ''}`} />
                                <span>{(review.helpfulCount || 0) + (likedReviews.has(review.id) ? 1 : 0)}</span>
                              </button>
                              
                              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors">
                                <MessageCircle className="w-4 h-4" />
                                <span>{review.replyCount || 0} replies</span>
                              </button>
                              
                              <button 
                                onClick={() => handleShareReview(review)}
                                className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
                              >
                                <Share2 className="w-4 h-4" />
                                Share
                              </button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" className="text-xs">
                                <Route className="w-3 h-3 mr-1" />
                                View Trip
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs">
                                <UserPlus className="w-3 h-3 mr-1" />
                                Connect
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No reviews yet</h3>
                  <p className="text-gray-500 mb-4">Be the first to share your experience!</p>
                  <Button 
                    onClick={() => setShowReviewForm(true)}
                    className="bg-primary hover:bg-orange-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Write First Review
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Active Travelers Tab */}
          <TabsContent value="travelers" className="space-y-6">
            {/* Quick Filters for Travelers */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button variant="outline" size="sm" className="text-xs">
                <Plane className="w-3 h-3 mr-1" />
                All Travelers
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                Looking for Buddies
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <MessageCircle className="w-3 h-3 mr-1" />
                Available to Chat
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                Same Location
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Currently Traveling Card */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Active Now
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        id: "1",
                        name: "Emma L.",
                        location: "La Paz, Bolivia",
                        status: "online",
                        message: "Looking for travel buddies for the Salar de Uyuni tour next week!",
                        joinedAgo: "2 days",
                        travelStyle: "Adventure",
                        languages: ["English", "Spanish"]
                      },
                      {
                        id: "2", 
                        name: "Carlos R.",
                        location: "Rio de Janeiro, Brazil",
                        status: "online",
                        message: "Just finished an amazing favela tour! Happy to share recommendations.",
                        joinedAgo: "1 week",
                        travelStyle: "Cultural",
                        languages: ["Spanish", "Portuguese"]
                      }
                    ].map((traveler) => (
                      <div key={traveler.id} className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <Avatar className="w-10 h-10 ring-2 ring-green-200">
                              <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                                {traveler.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-slate-700">{traveler.name}</h4>
                                <div className="flex items-center space-x-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                  <span className="text-xs text-green-600 font-medium">Online</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {traveler.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Joined {traveler.joinedAgo} ago
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-700 mb-2 line-clamp-2">{traveler.message}</p>
                              
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                  {traveler.travelStyle}
                                </Badge>
                                {traveler.languages.map((lang, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {lang}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleConnect(traveler.id)}
                                  disabled={createConnectionMutation.isPending}
                                  className="text-xs h-7"
                                >
                                  <UserPlus className="w-3 h-3 mr-1" />
                                  Connect
                                </Button>
                                <Button 
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-xs h-7"
                                >
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                  Chat
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-xs h-7">
                                      <Eye className="w-3 h-3 mr-1" />
                                      Profile
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <Avatar className="w-8 h-8">
                                          <AvatarFallback className="bg-primary/10 text-primary">
                                            {traveler.name[0]}
                                          </AvatarFallback>
                                        </Avatar>
                                        {traveler.name}
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="text-sm text-gray-600">
                                        <p><strong>Current Location:</strong> {traveler.location}</p>
                                        <p><strong>Travel Style:</strong> {traveler.travelStyle}</p>
                                        <p><strong>Languages:</strong> {traveler.languages.join(", ")}</p>
                                        <p><strong>Status:</strong> {traveler.message}</p>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button className="flex-1" size="sm">
                                          <UserPlus className="w-4 h-4 mr-2" />
                                          Connect
                                        </Button>
                                        <Button variant="outline" className="flex-1" size="sm">
                                          <MessageCircle className="w-4 h-4 mr-2" />
                                          Message
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Travelers Card */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                    Recently Active
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        id: "3",
                        name: "Lisa K.",
                        location: "Quito, Ecuador", 
                        status: "offline",
                        message: "Heading to Galápagos tomorrow! Any last-minute tips?",
                        lastSeen: "2h ago",
                        travelStyle: "Nature",
                        tripDuration: "3 weeks"
                      },
                      {
                        id: "4",
                        name: "Miguel S.", 
                        location: "Cusco, Peru",
                        status: "offline",
                        message: "Just completed the Inca Trail - absolutely incredible experience!",
                        lastSeen: "5h ago",
                        travelStyle: "Adventure", 
                        tripDuration: "2 months"
                      }
                    ].map((traveler) => (
                      <div key={traveler.id} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                                {traveler.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-slate-700">{traveler.name}</h4>
                                <span className="text-xs text-gray-500">Last seen {traveler.lastSeen}</span>
                              </div>
                              
                              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {traveler.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {traveler.tripDuration} trip
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{traveler.message}</p>
                              
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="text-xs">
                                  {traveler.travelStyle}
                                </Badge>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleConnect(traveler.id)}
                                  className="text-xs h-7"
                                >
                                  <UserPlus className="w-3 h-3 mr-1" />
                                  Connect
                                </Button>
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7"
                                >
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                  Message
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Travel Groups / Meetups Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  Travel Groups & Meetups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      id: "group1",
                      name: "Machu Picchu Trek",
                      location: "Cusco, Peru",
                      date: "Dec 15-18",
                      members: 4,
                      maxMembers: 8,
                      organizer: "Sarah M.",
                      description: "Classic 4-day Inca Trail with experienced guide"
                    },
                    {
                      id: "group2", 
                      name: "Patagonia Hiking",
                      location: "El Calafate, Argentina",
                      date: "Jan 5-12",
                      members: 2,
                      maxMembers: 6,
                      organizer: "Tom K.",
                      description: "Torres del Paine and glacier trekking adventure"
                    }
                  ].map((group) => (
                    <div key={group.id} className="border rounded-lg p-4 bg-gradient-to-br from-primary/5 to-secondary/5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-700">{group.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {group.location}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {group.date}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-gray-500">
                          Organized by <span className="font-medium">{group.organizer}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {group.members}/{group.maxMembers} members
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <UserPlus className="w-3 h-3 mr-1" />
                          Join Group
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Chat
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-6">
            {/* Connection Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{(connections as any[])?.length || 0}</div>
                  <div className="text-sm text-blue-600">Total Connections</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {(connections as any[])?.filter((c: any) => c.status === 'accepted').length || 0}
                  </div>
                  <div className="text-sm text-green-600">Active</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {(connections as any[])?.filter((c: any) => c.status === 'pending').length || 0}
                  </div>
                  <div className="text-sm text-yellow-600">Pending</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">24</div>
                  <div className="text-sm text-purple-600">Countries Covered</div>
                </CardContent>
              </Card>
            </div>

            {/* Connection Management */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Active Connections */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Users className="w-5 h-5 mr-2 text-green-600" />
                        Active Connections
                      </span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {(connections as any[])?.filter((c: any) => c.status === 'accepted').length || 0} active
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {connectionsLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (connections as any[])?.filter((c: any) => c.status === 'accepted').length > 0 ? (
                      <div className="space-y-4">
                        {(connections as any[]).filter((c: any) => c.status === 'accepted').map((connection: any) => (
                          <div key={connection.id} className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4 flex-1">
                                <Avatar className="w-12 h-12 ring-2 ring-green-200">
                                  <AvatarImage src={connection.requester?.profileImageUrl} />
                                  <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                                    {connection.requester?.firstName?.[0]}{connection.requester?.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-slate-700">
                                      {connection.requester?.firstName} {connection.requester?.lastName}
                                    </h4>
                                    <Badge className="bg-green-600 text-white text-xs">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Connected
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {connection.requester?.currentLocation || "Location not set"}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      Connected {new Date(connection.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                  {connection.message && (
                                    <p className="text-sm text-gray-600 mb-3 bg-white/50 p-2 rounded text-italic">
                                      "{connection.message}"
                                    </p>
                                  )}
                                  <div className="flex gap-2">
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs h-7">
                                      <MessageCircle className="w-3 h-3 mr-1" />
                                      Message
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-xs h-7">
                                      <Eye className="w-3 h-3 mr-1" />
                                      View Profile
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-xs h-7">
                                      <Route className="w-3 h-3 mr-1" />
                                      Trip Plans
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No active connections</h3>
                        <p className="text-gray-500 mb-4">Connect with travelers to build your network!</p>
                        <Button 
                          onClick={() => setActiveTab("travelers")}
                          className="bg-primary hover:bg-orange-600"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Find Travelers
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Pending Requests Sidebar */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                        Pending Requests
                      </span>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                        {(connections as any[])?.filter((c: any) => c.status === 'pending').length || 0}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {(connections as any[])?.filter((c: any) => c.status === 'pending').length > 0 ? (
                          (connections as any[]).filter((c: any) => c.status === 'pending').map((connection: any) => (
                            <div key={connection.id} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                              <div className="flex items-start space-x-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={connection.requester?.profileImageUrl} />
                                  <AvatarFallback className="bg-yellow-100 text-yellow-700 text-xs">
                                    {connection.requester?.firstName?.[0]}{connection.requester?.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h5 className="font-medium text-sm text-slate-700">
                                    {connection.requester?.firstName} {connection.requester?.lastName}
                                  </h5>
                                  <div className="text-xs text-gray-500 mb-2">
                                    <MapPin className="w-3 h-3 inline mr-1" />
                                    {connection.requester?.currentLocation || "Location not set"}
                                  </div>
                                  {connection.message && (
                                    <p className="text-xs text-gray-600 mb-2 bg-white/70 p-2 rounded">
                                      "{connection.message}"
                                    </p>
                                  )}
                                  <div className="flex gap-1">
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs h-6 px-2">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Accept
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-xs h-6 px-2">
                                      <X className="w-3 h-3" />
                                      Decline
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6">
                            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No pending requests</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-sm"
                      onClick={() => setActiveTab("travelers")}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Find New Travelers
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-sm"
                      onClick={() => setShowChatRooms(true)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Join Chat Rooms
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-sm"
                      onClick={() => setShowReviewForm(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Write Review
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
