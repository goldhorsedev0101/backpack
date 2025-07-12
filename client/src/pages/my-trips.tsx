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
import { Loader2, MapPin, DollarSign, Calendar, Star, Users, ExternalLink, Camera, Mountain, Utensils } from "lucide-react";
import { RealPlaceLinks } from "@/components/RealPlaceLinks";

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

  // Fetch saved trips
  const { data: savedTrips, isLoading: tripsLoading } = useQuery({
    queryKey: ['/api/my-trips/guest'],
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

  // Save trip mutation using the new endpoint
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">
              <Users className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="suggestions">
              <Star className="w-4 h-4 mr-2" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="saved">
              <MapPin className="w-4 h-4 mr-2" />
              My Trips
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Trip Generation Form */}
          <TabsContent value="generate" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <form onSubmit={handleGenerateTrip} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="destination" className="text-sm font-medium text-slate-700">
                          Where do you want to go?
                        </Label>
                        <Input
                          id="destination"
                          placeholder="e.g., Colombia, Peru, Bolivia"
                          value={formData.destination}
                          onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration" className="text-sm font-medium text-slate-700">
                          Trip Duration
                        </Label>
                        <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                          <SelectTrigger className="h-12">
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
                          <span className="text-xl font-bold text-orange-500">${formData.dailyBudget * 10}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-slate-700">
                        Travel Style
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        {travelStyles.slice(0, 4).map((style) => (
                          <button
                            key={style}
                            type="button"
                            onClick={() => handleStyleChange(style, !formData.travelStyle.includes(style))}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                              formData.travelStyle.includes(style)
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {style === 'Adventure' && <Mountain className="w-5 h-5" />}
                              {style === 'Cultural' && <Camera className="w-5 h-5" />}
                              {style === 'Food & Cuisine' && <Utensils className="w-5 h-5" />}
                              {style === 'Nightlife' && <Users className="w-5 h-5" />}
                              <span className="font-medium">{style}</span>
                            </div>
                          </button>
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

                        <div className="pt-2 space-y-2">
                          <Button 
                            onClick={() => saveTrip.mutate(suggestion)}
                            disabled={saveTrip.isPending}
                            className="w-full"
                          >
                            {saveTrip.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Star className="w-4 h-4 mr-2" />
                                Save This Trip
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
          </TabsContent>

          {/* Tab 3: Saved Trips */}
          <TabsContent value="saved" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-primary" />
                  My Saved Trips
                  {savedTrips && savedTrips.length > 0 && (
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
                ) : !savedTrips || savedTrips.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-700 mb-2">No Saved Trips</p>
                    <p className="text-sm text-gray-500">
                      Save trip suggestions to build your personal travel collection
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedTrips.map((trip: SavedTrip) => (
                      <div key={trip.id} className="border rounded-lg p-4 space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-700 mb-1">
                            {trip.title || trip.destinations}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Saved on {new Date(trip.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-gray-600 leading-relaxed mt-2">
                            {trip.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center mb-1">
                              <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                              <span className="font-semibold text-green-800 text-sm">Budget</span>
                            </div>
                            <p className="text-green-700 text-sm font-bold">${trip.budget}</p>
                          </div>

                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center mb-1">
                              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                              <span className="font-semibold text-blue-800 text-sm">Duration</span>
                            </div>
                            <p className="text-blue-700 text-sm">{trip.duration}</p>
                          </div>
                        </div>

                        {trip.destinations && (
                          <div>
                            <h4 className="font-semibold text-slate-700 mb-2 text-sm">Destination</h4>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="text-xs">
                                <MapPin className="w-3 h-3 mr-1" />
                                {Array.isArray(trip.destinations) 
                                  ? trip.destinations.join(', ') 
                                  : typeof trip.destinations === 'string'
                                    ? trip.destinations
                                    : 'Unknown destination'}
                              </Badge>
                            </div>
                          </div>
                        )}

                        {trip.travelStyle && (
                          <div>
                            <h4 className="font-semibold text-slate-700 mb-2 text-sm">Travel Style</h4>
                            <div className="flex flex-wrap gap-2">
                              {trip.travelStyle.split(', ').map((style, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {style.trim()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
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