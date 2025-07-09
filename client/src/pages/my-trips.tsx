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
import { Loader2, MapPin, DollarSign, Calendar, Star, Users } from "lucide-react";

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
}

interface SavedTrip {
  id: number;
  destination: string;
  description: string;
  estimatedBudget: number;
  duration: string;
  highlights: string[];
  travelStyle: string[];
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
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Trips</h1>
          <p className="text-muted-foreground mt-2">Plan, discover, and manage your South American adventures</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">Generate Trip</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="saved">My Trips</TabsTrigger>
          </TabsList>

          {/* Tab 1: Trip Generation Form */}
          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan Your Next Adventure</CardTitle>
                <CardDescription>
                  Tell us about your dream trip and we'll create personalized suggestions for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateTrip} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="destination">Destination</Label>
                      <Input
                        id="destination"
                        placeholder="e.g., Peru, Colombia, Argentina"
                        value={formData.destination}
                        onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Trip Duration</Label>
                      <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-3 days">1-3 days</SelectItem>
                          <SelectItem value="4-7 days">4-7 days</SelectItem>
                          <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                          <SelectItem value="2-3 weeks">2-3 weeks</SelectItem>
                          <SelectItem value="1 month">1 month</SelectItem>
                          <SelectItem value="2+ months">2+ months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dailyBudget">Daily Budget (USD)</Label>
                      <Input
                        id="dailyBudget"
                        type="number"
                        min="10"
                        max="500"
                        value={formData.dailyBudget}
                        onChange={(e) => setFormData(prev => ({ ...prev, dailyBudget: parseInt(e.target.value) || 50 }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Travel Style (Select all that apply)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {travelStyles.map((style) => (
                        <div key={style} className="flex items-center space-x-2">
                          <Checkbox
                            id={style}
                            checked={formData.travelStyle.includes(style)}
                            onCheckedChange={(checked) => handleStyleChange(style, !!checked)}
                          />
                          <Label htmlFor={style} className="text-sm">{style}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Interests (Optional)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {interests.map((interest) => (
                        <div key={interest} className="flex items-center space-x-2">
                          <Checkbox
                            id={interest}
                            checked={formData.interests.includes(interest)}
                            onCheckedChange={(checked) => handleInterestChange(interest, !!checked)}
                          />
                          <Label htmlFor={interest} className="text-sm">{interest}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" disabled={generateTripMutation.isPending} className="w-full">
                    {generateTripMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Suggestions...
                      </>
                    ) : (
                      "Generate Trip Suggestions"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Trip Suggestions */}
          <TabsContent value="suggestions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Trip Suggestions</h2>
              {suggestions.length > 0 && (
                <Badge variant="secondary">{suggestions.length} suggestions</Badge>
              )}
            </div>

            {suggestions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Suggestions Yet</h3>
                  <p className="text-muted-foreground text-center">
                    Generate your first trip suggestion using the form in the "Generate Trip" tab
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="h-fit">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{suggestion.destination}</CardTitle>
                          <CardDescription>{suggestion.country}</CardDescription>
                        </div>
                        <Badge variant="outline">{suggestion.duration}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{suggestion.description}</p>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span>${suggestion.estimatedBudget.low}-${suggestion.estimatedBudget.high}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-xs">{suggestion.bestTimeToVisit}</span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Highlights</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {suggestion.highlights.slice(0, 3).map((highlight, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Travel Style</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {suggestion.travelStyle.map((style, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {style}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button 
                        onClick={() => saveTrip.mutate(suggestion)}
                        disabled={saveTrip.isPending}
                        className="w-full"
                        size="sm"
                      >
                        {saveTrip.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Star className="w-4 h-4 mr-2" />
                        )}
                        Save Trip
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab 3: Saved Trips */}
          <TabsContent value="saved" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">My Saved Trips</h2>
              {savedTrips && (
                <Badge variant="secondary">{savedTrips.length} saved trips</Badge>
              )}
            </div>

            {tripsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : !savedTrips || savedTrips.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Saved Trips</h3>
                  <p className="text-muted-foreground text-center">
                    Save trip suggestions to build your personal travel collection
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedTrips.map((trip: SavedTrip) => (
                  <Card key={trip.id} className="h-fit">
                    <CardHeader>
                      <CardTitle className="text-lg">{trip.destination}</CardTitle>
                      <CardDescription>
                        Saved on {new Date(trip.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{trip.description}</p>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span>${trip.estimatedBudget}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>{trip.duration}</span>
                        </div>
                      </div>

                      {trip.highlights && trip.highlights.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Highlights</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {trip.highlights.slice(0, 3).map((highlight, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {trip.travelStyle && trip.travelStyle.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Travel Style</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {trip.travelStyle.map((style, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {style}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}