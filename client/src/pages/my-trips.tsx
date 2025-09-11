import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TripEditor } from "@/components/TripEditor";
import { Loader2, MapPin, DollarSign, Calendar, Star, Users, ExternalLink, Camera, Mountain, Utensils, Save, Eye, Merge, Edit, Trash2 } from "lucide-react";
import { RealPlaceLinks } from "@/components/RealPlaceLinks";
import { SOUTH_AMERICAN_COUNTRIES } from "@/lib/constants";

interface RealPlace {
  title: string;
  link?: string;
  source?: "Google" | "GetYourGuide" | "TripAdvisor";
  placeId?: string;
  rating?: number;
  address?: string;
  photoUrl?: string;
}

interface TripSuggestion {
  destination: string;
  country: string;
  description: string;
  bestTimeToVisit: string;
  estimatedBudget: {
    low: number;
    high: number;
  };
  highlights: string[];
  travelStyle: string[];
  duration: string;
  realPlaces?: RealPlace[];
}

interface SavedTrip {
  id: number;
  title: string;
  destinations: any; // JSONB object with structured destination data
  description: string;
  budget: string;
  duration: string;
  travelStyle: string; // This is stored as a string in the database
  createdAt: string;
}

interface SavedTripWithItems {
  id: string;
  userId: string;
  title: string;
  startDate?: string;
  endDate?: string;
  source?: string;
  sourceRef?: string;
  planJson?: any;
  createdAt: string;
  updatedAt: string;
  items: any[];
  itemCount: number;
  dayCount: number;
}

interface TripFormData {
  destination: string;
  dailyBudget: number;
  travelStyle: string[];
  interests: string[];
  duration: string;
}

const travelStyles = [
  "Adventure", "Cultural", "Budget Backpacking", "Luxury", "Nature & Wildlife",
  "Food & Culinary", "Historical", "Beach & Coastal", "Urban Exploration"
];

const interests = [
  "History & Culture", "Adventure Sports", "Nature & Wildlife", "Food & Cuisine",
  "Art & Museums", "Music & Nightlife", "Photography", "Local Markets",
  "Spiritual & Wellness", "Architecture", "Festivals & Events", "Beaches"
];

export default function MyTripsScreen() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("generate");
  const [formData, setFormData] = useState<TripFormData>({
    destination: "",
    dailyBudget: 50,
    travelStyle: [],
    interests: [],
    duration: ""
  });
  const [suggestions, setSuggestions] = useState<TripSuggestion[]>([]);
  const [selectedTripForEditor, setSelectedTripForEditor] = useState<string | null>(null);
  const [selectedTripForMerge, setSelectedTripForMerge] = useState<TripSuggestion | null>(null);

  // Fetch user trips from new endpoint (public.trips with string user_id)
  const { data: savedTrips = [], isLoading: tripsLoading } = useQuery<SavedTrip[]>({
    queryKey: ['/api/trips/my-trips'],
    enabled: activeTab === "saved"
  });

  // Fetch saved itineraries (advanced planning features) 
  const { data: savedItineraries = [], isLoading: itinerariesLoading } = useQuery<SavedTripWithItems[]>({
    queryKey: ['/api/itineraries'],
    queryFn: async () => {
      const response = await apiRequest('/api/itineraries?userId=guest-user');
      const result = await response.json();
      return result.itineraries || [];
    },
    enabled: activeTab === "saved"
  });

  // Generate trip suggestions mutation
  const generateTripMutation = useMutation({
    mutationFn: async (data: TripFormData) => {
      const response = await apiRequest('/api/get-suggestions', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSuggestions(data.suggestions || []);
      setActiveTab("suggestions");
      toast({
        title: "Trip Suggestions Generated!",
        description: `Found ${data.suggestions?.length || 0} amazing suggestions for your trip.`,
      });
    },
    onError: (error) => {
      console.error('Generate trip error:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate trip suggestions. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Save trip mutation using the new trips table endpoint
  const saveItineraryMutation = useMutation({
    mutationFn: async (suggestion: TripSuggestion) => {
      const response = await apiRequest('/api/trips/save-suggestion', {
        method: 'POST',
        body: JSON.stringify({ 
          suggestion 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.requiresAuth) {
          // TODO: Trigger Google sign-in, then retry
          throw new Error('Please sign in to save trips');
        }
        throw new Error(errorData.message || 'Failed to save trip');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate both old and new query keys
      queryClient.invalidateQueries({ queryKey: ['/api/trips/my-trips'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-trips/guest'] });
      queryClient.invalidateQueries({ queryKey: ['/api/itineraries'] });
      
      toast({
        title: "Saved to My Trips",
        description: "Your trip suggestion has been saved successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Save trip error:', error);
      
      // Friendly English error messages
      let errorMessage = "Could not save trip. Please try again.";
      if (error?.message?.includes('sign in')) {
        errorMessage = "Please sign in to save trips";
      } else if (error?.message?.includes('Database setup incomplete')) {
        errorMessage = "Database setup incomplete. Please contact support.";
      } else if (error?.message?.includes('Database temporarily unavailable')) {
        errorMessage = "Database temporarily unavailable. Please try again.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  // Merge trip mutation 
  const mergeItineraryMutation = useMutation({
    mutationFn: async ({ existingTripId, suggestion }: { existingTripId: string; suggestion: TripSuggestion }) => {
      const response = await apiRequest(`/api/itineraries/${existingTripId}/merge`, {
        method: 'POST',
        body: JSON.stringify({ 
          userId: 'guest-user',
          suggestion 
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/itineraries'] });
      setSelectedTripForMerge(null);
      toast({
        title: "Trip Merged!",
        description: "The suggestion has been added to your existing trip.",
      });
    },
    onError: (error) => {
      console.error('Merge itinerary error:', error);
      toast({
        title: "Merge Error",
        description: "Failed to merge trip. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete itinerary mutation
  const deleteItineraryMutation = useMutation({
    mutationFn: async (itineraryId: string) => {
      const response = await apiRequest(`/api/itineraries/${itineraryId}?userId=guest-user`, {
        method: 'DELETE'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/itineraries'] });
      toast({
        title: "Trip Deleted",
        description: "The trip has been removed from your itineraries.",
      });
    },
    onError: (error) => {
      console.error('Delete itinerary error:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete trip. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Save trip mutation using the old endpoint (kept for backward compatibility)
  const saveTrip = useMutation({
    mutationFn: async (suggestion: TripSuggestion) => {
      const tripData = {
        destination: `${suggestion.destination}, ${suggestion.country}`,
        description: suggestion.description,
        duration: suggestion.duration,
        estimatedBudget: suggestion.estimatedBudget,
        travelStyle: suggestion.travelStyle,
        highlights: suggestion.highlights,
        bestTimeToVisit: suggestion.bestTimeToVisit
      };
      
      const response = await apiRequest('/api/my-trips/guest/save', {
        method: 'POST',
        body: JSON.stringify(tripData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-trips/guest'] });
      toast({
        title: "Trip Saved!",
        description: "Your trip has been saved to My Trips.",
      });
    },
    onError: (error) => {
      console.error('Save trip error:', error);
      toast({
        title: "Save Error",
        description: "Failed to save trip. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleGenerateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.destination || !formData.duration || formData.travelStyle.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in destination, duration, and select at least one travel style.",
        variant: "destructive"
      });
      return;
    }
    
    generateTripMutation.mutate(formData);
  };

  const handleStyleChange = (style: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      travelStyle: checked 
        ? [...prev.travelStyle, style]
        : prev.travelStyle.filter(s => s !== style)
    }));
  };

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interest]
        : prev.interests.filter(i => i !== interest)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4">AI Trip Builder</h1>
          <p className="text-lg text-gray-600">Tell us your preferences and let our AI create the perfect itinerary</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-auto min-w-full justify-evenly h-10">
              <TabsTrigger value="generate" className="whitespace-nowrap">
                <Users className="w-4 h-4 mr-2" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="whitespace-nowrap">
                <Star className="w-4 h-4 mr-2" />
                Suggestions
              </TabsTrigger>
              <TabsTrigger value="saved" className="whitespace-nowrap">
                <MapPin className="w-4 h-4 mr-2" />
                My Trips
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Trip Generation Form */}
          <TabsContent value="generate" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <form onSubmit={handleGenerateTrip} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="destination" className="text-sm font-medium text-slate-700">
                          Where do you want to go?
                        </Label>
                        <Select value={formData.destination} onValueChange={(value: string) => setFormData(prev => ({ ...prev, destination: value }))}>
                          <SelectTrigger className="w-full p-3 h-12">
                            <SelectValue placeholder="Select destination" />
                          </SelectTrigger>
                          <SelectContent>
                            {SOUTH_AMERICAN_COUNTRIES.map((destination: string) => (
                              <SelectItem key={destination} value={destination}>
                                {destination}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration" className="text-sm font-medium text-slate-700">
                          Trip Duration
                        </Label>
                        <Select value={formData.duration} onValueChange={(value: string) => setFormData(prev => ({ ...prev, duration: value }))}>
                          <SelectTrigger className="w-full p-3 h-12">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                            <SelectItem value="2-4 weeks">2-4 weeks</SelectItem>
                            <SelectItem value="1-2 months">1-2 months</SelectItem>
                            <SelectItem value="3+ months">3+ months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-slate-700">
                        Budget Range
                      </Label>
                      <div className="px-4">
                        <div className="flex items-center space-x-4 mb-4">
                          <span className="text-sm text-gray-600">$500</span>
                          <div className="flex-1 relative">
                            <input
                              type="range"
                              min="500"
                              max="5000"
                              step="100"
                              value={formData.dailyBudget * 10}
                              onChange={(e) => setFormData(prev => ({ ...prev, dailyBudget: parseInt(e.target.value) / 10 }))}
                              className="w-full h-2 bg-gradient-to-r from-orange-400 to-teal-400 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                          <span className="text-sm text-gray-600">$5000</span>
                        </div>
                        <div className="text-center">
                          <span className="text-orange-500 font-bold text-xl">${formData.dailyBudget * 10}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-slate-700">
                        Travel Style
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { name: 'Adventure', icon: Mountain, description: 'Hiking, trekking, extreme sports' },
                          { name: 'Cultural', icon: Camera, description: 'Museums, local traditions, history' },
                          { name: 'Food & Cuisine', icon: Utensils, description: 'Local restaurants, cooking classes' },
                          { name: 'Nightlife', icon: Users, description: 'Bars, clubs, social experiences' }
                        ].map((style) => (
                          <div
                            key={style.name}
                            onClick={() => handleStyleChange(style.name, !formData.travelStyle.includes(style.name))}
                            className={`p-4 rounded-lg border hover:bg-accent transition cursor-pointer ${
                              formData.travelStyle.includes(style.name)
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <style.icon className="w-5 h-5 flex-shrink-0 mt-1" />
                              <div>
                                <h4 className="font-medium">{style.name}</h4>
                                <p className="text-sm text-muted-foreground">{style.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={generateTripMutation.isPending} 
                      className="w-full h-14 text-lg bg-orange-500 hover:bg-orange-600"
                    >
                      {generateTripMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Calendar className="w-5 h-5 mr-2" />
                          Generate My Trip
                        </>
                      )}
                    </Button>

                    <p className="text-center text-sm text-gray-500">
                      Ready to plan your next adventure!
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 2: Trip Suggestions */}
          <TabsContent value="suggestions" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-6 h-6 mr-2 text-primary" />
                  AI Trip Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>

                {suggestions.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-700 mb-2">Ready to plan your South American adventure?</p>
                    <p className="text-sm text-gray-500">
                      Fill in your preferences and click "Generate My Trip" to get personalized recommendations
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-700 mb-1">
                            {suggestion.destination}, {suggestion.country}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {suggestion.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center mb-1">
                              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                              <span className="font-semibold text-blue-800 text-sm">Duration</span>
                            </div>
                            <p className="text-blue-700 text-sm">{suggestion.duration}</p>
                          </div>

                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center mb-1">
                              <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                              <span className="font-semibold text-green-800 text-sm">Budget</span>
                            </div>
                            <p className="text-green-700 text-sm font-bold">
                              ${suggestion.estimatedBudget.low} - ${suggestion.estimatedBudget.high}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-700 mb-2 text-sm">Best Time to Visit</h4>
                          <p className="text-sm text-gray-600">{suggestion.bestTimeToVisit}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-700 mb-2 text-sm">Highlights</h4>
                          <div className="flex flex-wrap gap-2">
                            {suggestion.highlights?.map((highlight, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-700 mb-2 text-sm">Travel Style</h4>
                          <div className="flex flex-wrap gap-2">
                            {suggestion.travelStyle?.map((style, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {style}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Real Places Links Component */}
                        <RealPlaceLinks suggestion={suggestion} />

                        {/* Action Buttons */}
                        <div className="pt-4 space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <Button 
                              onClick={() => saveItineraryMutation.mutate(suggestion)}
                              disabled={saveItineraryMutation.isPending}
                              variant="default"
                              size="sm"
                              className="flex items-center justify-center"
                            >
                              {saveItineraryMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <Save className="w-3 h-3 mr-1" />
                                  Save
                                </>
                              )}
                            </Button>
                            
                            <Button 
                              onClick={() => {
                                saveItineraryMutation.mutate(suggestion, {
                                  onSuccess: (data) => {
                                    // Open editor after saving
                                    setSelectedTripForEditor(data.itinerary.id);
                                  }
                                });
                              }}
                              disabled={saveItineraryMutation.isPending}
                              variant="outline"
                              size="sm"
                              className="flex items-center justify-center"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Save & Open
                            </Button>
                            
                            <Button 
                              onClick={() => setSelectedTripForMerge(suggestion)}
                              variant="secondary"
                              size="sm"
                              className="flex items-center justify-center"
                            >
                              <Merge className="w-3 h-3 mr-1" />
                              Merge
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Saved Trips */}
          <TabsContent value="saved" className="mt-6">
            {/* Editable Itineraries Section */}
            <Card className="shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit className="w-6 h-6 mr-2 text-primary" />
                  Editable Itineraries
                  {savedItineraries && savedItineraries.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">{savedItineraries.length} itineraries</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {itinerariesLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-lg font-medium text-gray-700">Loading your itineraries...</p>
                  </div>
                ) : savedItineraries.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-700 mb-2">No Saved Itineraries</p>
                    <p className="text-sm text-gray-500">
                      Save trip suggestions as editable itineraries to plan day-by-day
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {savedItineraries.map((itinerary) => (
                      <div key={itinerary.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {itinerary.title}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              <span>{itinerary.itemCount} items</span>
                              <span>{itinerary.dayCount} days</span>
                              {itinerary.source && (
                                <Badge variant="outline" className="text-xs">
                                  {itinerary.source}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => setSelectedTripForEditor(itinerary.id)}
                              className="flex items-center"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this itinerary?')) {
                                  deleteItineraryMutation.mutate(itinerary.id);
                                }
                              }}
                              disabled={deleteItineraryMutation.isPending}
                              className="flex items-center text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600">
                          Created {new Date(itinerary.createdAt).toLocaleDateString()}
                          {itinerary.updatedAt !== itinerary.createdAt && 
                            ` • Updated ${new Date(itinerary.updatedAt).toLocaleDateString()}`
                          }
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legacy Saved Trips Section */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-primary" />
                  Legacy Saved Trips
                  {savedTrips && Array.isArray(savedTrips) && savedTrips.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">{savedTrips.length} trips</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>

                {tripsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-lg font-medium text-gray-700">Loading your trips...</p>
                  </div>
                ) : !savedTrips || (Array.isArray(savedTrips) && savedTrips.length === 0) ? (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-700 mb-2">No Saved Trips</p>
                    <p className="text-sm text-gray-500">
                      Save trip suggestions to build your personal travel collection
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(savedTrips) && (savedTrips || []).map((trip: SavedTrip) => (
                      <div key={trip.id} className="border rounded-lg p-6 space-y-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div>
                          <h3 className="text-xl font-bold text-slate-700 mb-2">
                            {trip.title || trip.destinations}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            Created {new Date(trip.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-gray-600 leading-relaxed">
                            {trip.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center mb-1">
                              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                              <span className="font-semibold text-blue-800 text-sm">Duration</span>
                            </div>
                            <p className="text-blue-700 text-sm font-medium">{trip.duration}</p>
                          </div>

                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center mb-1">
                              <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                              <span className="font-semibold text-green-800 text-sm">Budget</span>
                            </div>
                            <p className="text-green-700 text-sm font-bold">${trip.budget}</p>
                          </div>
                        </div>

                        {/* Best Time to Visit */}
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <div className="flex items-center mb-1">
                            <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                            <span className="font-semibold text-orange-800 text-sm">Best Time to Visit</span>
                          </div>
                          <p className="text-orange-700 text-sm">May to October</p>
                        </div>

                        {/* Highlights Section */}
                        <div>
                          <div className="flex items-center mb-2">
                            <Star className="w-4 h-4 mr-2 text-yellow-500" />
                            <h4 className="font-semibold text-slate-700 text-sm">Highlights</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="flex items-center text-xs text-gray-700">
                              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                              Multiple destinations
                            </span>
                            {trip.destinations && typeof trip.destinations === 'string' && (
                              <span className="flex items-center text-xs text-gray-700">
                                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                                Visit {trip.destinations}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Travel Style with Colorful Tags */}
                        {trip.travelStyle && (
                          <div>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {trip.travelStyle.split(', ').map((style, idx) => {
                                const styleColors = {
                                  'adventure': 'bg-teal-100 text-teal-700 border-teal-200',
                                  'luxury': 'bg-purple-100 text-purple-700 border-purple-200', 
                                  'nature': 'bg-green-100 text-green-700 border-green-200',
                                  'cultural': 'bg-blue-100 text-blue-700 border-blue-200',
                                  'budget': 'bg-orange-100 text-orange-700 border-orange-200'
                                };
                                const colorClass = styleColors[style.trim().toLowerCase() as keyof typeof styleColors] || 'bg-gray-100 text-gray-700 border-gray-200';
                                
                                return (
                                  <span 
                                    key={idx} 
                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}
                                  >
                                    {style.trim()}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center"
                            data-testid={`button-view-trip-${trip.id}`}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex items-center"
                            data-testid={`button-delete-trip-${trip.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Trip Editor Dialog */}
      <Dialog 
        open={!!selectedTripForEditor} 
        onOpenChange={() => setSelectedTripForEditor(null)}
      >
        <DialogContent className="max-w-[95vw] h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Trip Planner</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {selectedTripForEditor && (
              <TripEditor 
                itineraryId={selectedTripForEditor} 
                onClose={() => setSelectedTripForEditor(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Merge Trip Dialog */}
      <Dialog 
        open={!!selectedTripForMerge} 
        onOpenChange={() => setSelectedTripForMerge(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Merge with Existing Trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select an existing itinerary to merge this suggestion into:
            </p>
            
            {savedItineraries.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">
                  No existing itineraries to merge with. Save your first trip to enable merging.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {savedItineraries.map((itinerary) => (
                  <Button
                    key={itinerary.id}
                    variant="outline"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => {
                      if (selectedTripForMerge) {
                        mergeItineraryMutation.mutate({
                          existingTripId: itinerary.id,
                          suggestion: selectedTripForMerge
                        });
                      }
                    }}
                    disabled={mergeItineraryMutation.isPending}
                  >
                    <div>
                      <div className="font-medium">{itinerary.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {itinerary.itemCount} items • {itinerary.dayCount} days
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
            
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedTripForMerge(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}