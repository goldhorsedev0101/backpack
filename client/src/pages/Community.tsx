import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Star, MessageCircle, Users, MapPin, Calendar, ThumbsUp, Search, Plus, Loader2, RefreshCw } from "lucide-react";
import { apiRequest } from "../lib/queryClient";
import { supabase } from "../lib/supabase";
import { ChatSidebar } from "../components/community/ChatSidebar";
import { RoomView } from "../components/community/RoomView";
import { SidebarDMs } from "../components/community/SidebarDMs";
import { TravelBuddyList } from "../components/community/TravelBuddyList";
import { NewBuddyPostModal } from "../components/community/NewBuddyPostModal";
import { useToast } from "../hooks/use-toast";
import { ReviewsTab } from "../components/community/ReviewsTab";

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
  
  // Chat state
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string>('');
  const [selectedRoomDescription, setSelectedRoomDescription] = useState<string>('');
  const [selectedRoomIsPrivate, setSelectedRoomIsPrivate] = useState<boolean>(false);
  
  // DM state
  const [selectedDMRoom, setSelectedDMRoom] = useState<number | null>(null);
  const [selectedDMUser, setSelectedDMUser] = useState<string>('');
  
  // Travel Buddy state
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  
  // Create Room state
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full justify-evenly h-10">
            <TabsTrigger value="reviews" className="whitespace-nowrap">
              Place Reviews
            </TabsTrigger>
            <TabsTrigger value="chat" className="whitespace-nowrap">
              Chat Rooms
            </TabsTrigger>
            <TabsTrigger value="dms" className="whitespace-nowrap">
              Direct Messages
            </TabsTrigger>
            <TabsTrigger value="buddies" className="whitespace-nowrap">
              Travel Buddies
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="reviews" className="mt-6">
          <ReviewsTab />
        </TabsContent>
        
        <TabsContent value="old-reviews" className="mt-6 hidden">
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
          <div className="flex h-[600px] gap-4">
            <ChatSidebar 
              selectedRoom={selectedRoom}
              onRoomSelect={(roomId, roomName, roomDescription, roomType) => {
                setSelectedRoom(roomId);
                setSelectedRoomName(roomName || `Room ${roomId}`);
                setSelectedRoomDescription(roomDescription || '');
                setSelectedRoomIsPrivate(roomType === 'private');
              }}
              onCreateRoom={() => setShowCreateRoomModal(true)}
            />
            <RoomView 
              roomId={selectedRoom}
              roomName={selectedRoomName}
              roomDescription={selectedRoomDescription}
              isPrivate={selectedRoomIsPrivate}
              onNavigateToDM={(dmRoomId) => {
                setSelectedDMRoom(dmRoomId);
                setSelectedDMUser('');
              }}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="dms" className="mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Direct Messages</h2>
            <p className="text-gray-600">
              Private conversations with fellow travelers
            </p>
          </div>
          <div className="flex h-[600px] gap-4">
            <SidebarDMs 
              selectedDMRoom={selectedDMRoom}
              onDMSelect={(roomId, userName) => {
                setSelectedDMRoom(roomId);
                setSelectedDMUser(userName);
              }}
            />
            <RoomView 
              roomId={selectedDMRoom}
              roomName={selectedDMUser ? `${selectedDMUser}` : undefined}
              roomDescription={selectedDMUser ? `Direct message with ${selectedDMUser}` : undefined}
              isPrivate={true}
              onNavigateToDM={(dmRoomId) => {
                setSelectedDMRoom(dmRoomId);
                setSelectedDMUser('');
              }}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="buddies" className="mt-6">
          <TravelBuddyList onCreatePost={() => setShowNewPostModal(true)} />
        </TabsContent>
      </Tabs>

      {/* New Travel Buddy Post Modal */}
      <NewBuddyPostModal 
        open={showNewPostModal} 
        onOpenChange={setShowNewPostModal} 
      />

      {/* Create Room Modal */}
      <CreateRoomModal 
        open={showCreateRoomModal}
        onOpenChange={setShowCreateRoomModal}
        onRoomCreated={(roomId, roomName, roomType) => {
          setSelectedRoom(roomId);
          setSelectedRoomName(roomName);
          setSelectedRoomDescription('');
          setSelectedRoomIsPrivate(roomType === 'private');
          setShowCreateRoomModal(false);
        }}
      />
    </div>
  );
}

// Create Room Modal Component
function CreateRoomModal({ 
  open, 
  onOpenChange, 
  onRoomCreated 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onRoomCreated: (roomId: number, roomName: string, roomType?: string) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    destination: '',
    visibility: 'public',
    guestName: '',
    inviteGuests: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get guest name from localStorage
  const storedGuestName = localStorage.getItem('tripwise_guest_name') || '';

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: async (roomData: typeof formData) => {
      const currentGuestName = roomData.guestName || storedGuestName;
      
      if (!currentGuestName) {
        throw new Error('Guest name is required');
      }

      // Save guest name to localStorage
      localStorage.setItem('tripwise_guest_name', currentGuestName);

      const isPrivate = roomData.visibility === 'private';
      
      // Create room data
      const roomPayload = {
        name: roomData.name.trim(),
        description: roomData.description.trim() || null,
        type: isPrivate ? 'private' : 'public',
        destination: roomData.destination.trim() || null,
        is_private: isPrivate,
        created_by: 'guest', // Fallback for guest mode
        is_active: true,
        metadata: { type: isPrivate ? 'private' : 'public' }
      };

      // Insert room using Supabase client
      const { data: room, error } = await supabase
        .from('chat_rooms')
        .insert([roomPayload])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Prepare members list
      const members = [{
        room_id: room.id,
        guest_name: currentGuestName,
        role: 'admin'
      }];
      
      // Add invited guests if any
      if (isPrivate && roomData.inviteGuests.trim()) {
        const invitedGuests = roomData.inviteGuests
          .split(',')
          .map(name => name.trim())
          .filter(name => name && name !== currentGuestName);
        
        invitedGuests.forEach(guestName => {
          members.push({
            room_id: room.id,
            guest_name: guestName,
            role: 'member'
          });
        });
      }
      
      // Add all members if chat_room_members table exists
      try {
        if (members.length > 0) {
          await supabase
            .from('chat_room_members')
            .insert(members);
        }
      } catch (memberError) {
        // Ignore if table doesn't exist - not critical
        console.warn('Could not add room members:', memberError);
      }

      return room;
    },
    onSuccess: (room) => {
      // Refresh chat rooms list
      queryClient.invalidateQueries({ queryKey: ['/api/chat-rooms'] });
      
      // Clear form
      setFormData({ name: '', description: '', destination: '', visibility: 'public', guestName: '', inviteGuests: '' });
      
      // Close modal
      onOpenChange(false);
      
      // Open the new room
      onRoomCreated(room.id, room.name, room.type);
      
      toast({
        title: "Room Created",
        description: `Successfully created "${room.name}"`,
      });
    },
    onError: (error: any) => {
      console.error('Create room error:', error);
      
      if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
        toast({
          title: "Permission Denied",
          description: "No permission to create rooms in current environment. Check docs/community-rls.md for DEV policy setup.",
          variant: "destructive",
        });
      } else if (error.code === '23505' || error.message?.includes('unique')) {
        toast({
          title: "Room Name Taken",
          description: "A room with this name already exists. Please choose a different name.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to Create Room",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Room Name Required",
        description: "Please enter a name for the room",
        variant: "destructive",
      });
      return;
    }

    if (formData.name.length < 2 || formData.name.length > 60) {
      toast({
        title: "Invalid Room Name",
        description: "Room name must be between 2-60 characters",
        variant: "destructive",
      });
      return;
    }

    if (formData.description.length > 200) {
      toast({
        title: "Description Too Long",
        description: "Description must be under 200 characters",
        variant: "destructive",
      });
      return;
    }
    
    // Private room validation
    if (formData.visibility === 'private') {
      const invitedGuests = formData.inviteGuests.trim();
      if (!invitedGuests) {
        toast({
          title: "Participants Required",
          description: "Private rooms must have at least one invited participant",
          variant: "destructive",
        });
        return;
      }
    }

    const guestName = formData.guestName || storedGuestName;
    if (!guestName) {
      toast({
        title: "Your Name Required",
        description: "Please enter your name to create a room",
        variant: "destructive",
      });
      return;
    }

    createRoomMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Chat Room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="room-name">Room Name *</Label>
            <Input
              id="room-name"
              placeholder="e.g., Peru Travel Planning"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              maxLength={60}
              disabled={createRoomMutation.isPending}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.name.length}/60 characters</p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of what this room is for..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              maxLength={200}
              disabled={createRoomMutation.isPending}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.description.length}/200 characters</p>
          </div>

          <div>
            <Label htmlFor="destination">Location/Country</Label>
            <Input
              id="destination"
              placeholder="e.g., Peru, Colombia, Chile"
              value={formData.destination}
              onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
              disabled={createRoomMutation.isPending}
            />
          </div>

          <div>
            <Label>Room Visibility</Label>
            <RadioGroup
              value={formData.visibility}
              onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}
              disabled={createRoomMutation.isPending}
              className="flex gap-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="cursor-pointer">Public - Anyone can join</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="cursor-pointer">🔒 Private - Invite only</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.visibility === 'private' && (
            <div>
              <Label htmlFor="invite-guests">Invite Participants *</Label>
              <Input
                id="invite-guests"
                placeholder="Guest names separated by commas (e.g., Alice, Bob, Charlie)"
                value={formData.inviteGuests}
                onChange={(e) => setFormData(prev => ({ ...prev, inviteGuests: e.target.value }))}
                disabled={createRoomMutation.isPending}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter guest names separated by commas. They will be added to the private room.
              </p>
            </div>
          )}

          {!storedGuestName && (
            <div>
              <Label htmlFor="guest-name">Your Name *</Label>
              <Input
                id="guest-name"
                placeholder="Enter your name"
                value={formData.guestName}
                onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                disabled={createRoomMutation.isPending}
              />
            </div>
          )}

          {storedGuestName && (
            <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
              Creating as: <strong>{storedGuestName}</strong>
              {formData.visibility === 'private' && formData.inviteGuests && (
                <div className="mt-1 text-xs">
                  Inviting: {formData.inviteGuests.split(',').map(name => name.trim()).filter(Boolean).join(', ')}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={createRoomMutation.isPending}
              className="flex-1"
            >
              {createRoomMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Room'
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={createRoomMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}