import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  X
} from "lucide-react";

const DESTINATIONS = [
  "Peru", "Colombia", "Bolivia", "Chile", "Argentina", "Brazil", "Ecuador", "Uruguay", "All Destinations"
];

export default function Community() {
  const [selectedDestination, setSelectedDestination] = useState("All Destinations");
  const [newReview, setNewReview] = useState({ destination: "", rating: 5, comment: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showChatRooms, setShowChatRooms] = useState(false);
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
      setNewReview({ destination: "", rating: 5, comment: "" });
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

        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4">
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

        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reviews">Reviews & Tips</TabsTrigger>
            <TabsTrigger value="travelers">Active Travelers</TabsTrigger>
            <TabsTrigger value="connections">My Connections</TabsTrigger>
          </TabsList>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            {/* New Review Form */}
            {showReviewForm && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Share Your Experience</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowReviewForm(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Select 
                      value={newReview.destination} 
                      onValueChange={(value) => setNewReview(prev => ({ ...prev, destination: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {DESTINATIONS.filter(d => d !== "All Destinations").map((dest) => (
                          <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">Rating:</span>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Star
                          key={rating}
                          className={`w-5 h-5 cursor-pointer ${
                            rating <= newReview.rating 
                              ? "text-accent fill-current" 
                              : "text-gray-300"
                          }`}
                          onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <Textarea
                    placeholder="Share your experience, tips, and recommendations..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    className="min-h-[120px]"
                  />
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSubmitReview}
                      disabled={createReviewMutation.isPending}
                      className="bg-primary hover:bg-orange-600"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Post Review
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowReviewForm(false)}
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
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <Card key={review.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={review.user?.profileImageUrl} />
                          <AvatarFallback>
                            {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-slate-700">
                                {review.user?.firstName} {review.user?.lastName}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <MapPin className="w-3 h-3" />
                                {review.destination}
                                <Clock className="w-3 h-3 ml-2" />
                                {new Date(review.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-accent fill-current" />
                              ))}
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-3">{review.comment}</p>
                          
                          {review.tags && review.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {review.tags.map((tag: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <button className="flex items-center gap-1 hover:text-primary">
                              <ThumbsUp className="w-4 h-4" />
                              Helpful ({review.helpfulCount || 0})
                            </button>
                            <button className="flex items-center gap-1 hover:text-primary">
                              <MessageCircle className="w-4 h-4" />
                              Reply
                            </button>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-secondary" />
                  Currently Traveling
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
                      profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop&crop=face"
                    },
                    {
                      id: "2",
                      name: "Carlos R.",
                      location: "Rio de Janeiro, Brazil",
                      status: "online",
                      message: "Just finished an amazing favela tour! Happy to share recommendations.",
                      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face"
                    },
                    {
                      id: "3",
                      name: "Lisa K.",
                      location: "Quito, Ecuador",
                      status: "offline",
                      message: "Heading to Galápagos tomorrow! Any last-minute tips?",
                      profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=48&h=48&fit=crop&crop=face"
                    }
                  ].map((traveler) => (
                    <div key={traveler.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={traveler.profileImage} />
                          <AvatarFallback>{traveler.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-700">{traveler.name}</h4>
                            <div className="flex items-center space-x-1">
                              <span 
                                className={`w-2 h-2 rounded-full ${
                                  traveler.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                                }`}
                              ></span>
                              <span className={`text-xs ${
                                traveler.status === 'online' ? 'text-green-600' : 'text-gray-500'
                              }`}>
                                {traveler.status === 'online' ? 'Online' : '2h ago'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {traveler.location}
                          </div>
                          <p className="text-sm text-gray-600">{traveler.message}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConnect(traveler.id)}
                          disabled={createConnectionMutation.isPending}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Connect
                        </Button>
                        <Button 
                          size="sm"
                          className="bg-secondary hover:bg-teal-600"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  My Travel Connections
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
                ) : connections.length > 0 ? (
                  <div className="space-y-4">
                    {connections.map((connection: any) => (
                      <div key={connection.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={connection.requester?.profileImageUrl} />
                            <AvatarFallback>
                              {connection.requester?.firstName?.[0]}{connection.requester?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-slate-700">
                              {connection.requester?.firstName} {connection.requester?.lastName}
                            </h4>
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="w-3 h-3 mr-1" />
                              {connection.requester?.currentLocation || "Location not set"}
                            </div>
                            {connection.message && (
                              <p className="text-sm text-gray-600 mt-1">{connection.message}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {connection.status === 'pending' ? (
                            <>
                              <Badge variant="outline">Pending</Badge>
                              <Button size="sm" className="bg-success hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                            </>
                          ) : connection.status === 'accepted' ? (
                            <>
                              <Badge className="bg-success text-white">Connected</Badge>
                              <Button size="sm" className="bg-secondary hover:bg-teal-600">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                Chat
                              </Button>
                            </>
                          ) : (
                            <Badge variant="secondary">Declined</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No connections yet</h3>
                    <p className="text-gray-500">Start connecting with fellow travelers!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
