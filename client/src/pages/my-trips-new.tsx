import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
// import { RealPlaceLinks } from "@/components/RealPlaceLinks";
import { SOUTH_AMERICAN_COUNTRIES } from "@/lib/constants";
import { 
  Bot, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Mountain, 
  Camera, 
  Utensils, 
  GlassWater,
  Loader2,
  Sparkles,
  Clock,
  Users,
  CheckCircle,
  Route,
  ListChecks,
  Lightbulb,
  Star,
  ExternalLink,
  FolderOpen,
  BookOpen
} from "lucide-react";

// Form schema
const tripFormSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  travelStyle: z.array(z.string()).min(1, "Select at least one travel style"),
  budget: z.number().min(100, "Budget must be at least $100"),
  duration: z.string().min(1, "Duration is required"),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
});

type TripFormData = z.infer<typeof tripFormSchema>;

// Interfaces
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

interface ItineraryDay {
  day: number;
  location: string;
  activities: string[];
  estimatedCost: number;
  tips: string[];
}

interface SavedTrip {
  id: number;
  title: string;
  destinations: any;
  description: string;
  budget: string;
  duration: string;
  travelStyle: string;
  createdAt: string;
}

// Constants
const DURATIONS = [
  { value: "1-2 weeks", label: "1-2 weeks" },
  { value: "2-4 weeks", label: "2-4 weeks" },
  { value: "1-2 months", label: "1-2 months" },
  { value: "3+ months", label: "3+ months" },
];

const TRAVEL_STYLES = [
  { id: 'adventure', icon: Mountain, label: 'Adventure', description: 'Hiking, trekking, extreme sports' },
  { id: 'cultural', icon: Camera, label: 'Cultural', description: 'Museums, history, local traditions' },
  { id: 'budget', icon: DollarSign, label: 'Budget', description: 'Backpacking, hostels, local transport' },
  { id: 'luxury', icon: Sparkles, label: 'Luxury', description: 'Premium accommodations, fine dining' },
  { id: 'nature', icon: Mountain, label: 'Nature', description: 'Wildlife, national parks, eco-tours' },
  { id: 'food', icon: Utensils, label: 'Food', description: 'Local cuisine, food tours, cooking classes' },
  { id: 'nightlife', icon: GlassWater, label: 'Nightlife', description: 'Bars, clubs, social events' },
  { id: 'relaxation', icon: Clock, label: 'Relaxation', description: 'Beaches, wellness, slow travel' }
];

const INTERESTS = [
  'History & Culture', 'Adventure Sports', 'Nature & Wildlife', 'Food & Cuisine', 
  'Nightlife & Entertainment', 'Photography', 'Architecture', 'Local Markets',
  'Beaches & Coastlines', 'Mountains & Hiking', 'Art & Museums', 'Music & Festivals',
  'Shopping', 'Wellness & Relaxation', 'Language Learning', 'Volunteering'
];

export default function MyTripsNew() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("preferences");
  
  // Form state
  const [budget, setBudget] = useState([1000]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  // Results state
  const [aiSuggestions, setAiSuggestions] = useState<TripSuggestion[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);

  const form = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      destination: "",
      travelStyle: [],
      budget: 1000,
      duration: "",
      interests: [],
    },
  });

  // Helper functions
  const toggleStyle = (styleId: string) => {
    const newStyles = selectedStyles.includes(styleId)
      ? selectedStyles.filter(s => s !== styleId)
      : [...selectedStyles, styleId];
    setSelectedStyles(newStyles);
    form.setValue('travelStyle', newStyles);
  };

  const toggleInterest = (interest: string) => {
    const newInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest];
    setSelectedInterests(newInterests);
    form.setValue('interests', newInterests);
  };

  // API calls
  const generateAISuggestionsMutation = useMutation({
    mutationFn: async (data: TripFormData) => {
      try {
        const response = await apiRequest<TripSuggestion[]>('/api/ai/travel-suggestions', {
          method: 'POST',
          body: JSON.stringify({
            destination: data.destination,
            travelStyle: data.travelStyle,
            budget: data.budget,
            duration: data.duration,
            interests: data.interests,
          }),
        });
        console.log('API response received:', response);
        return response;
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Success callback called with data:', data);
      setIsGenerating(false);
      if (data && Array.isArray(data)) {
        console.log('Setting AI suggestions state:', data);
        setAiSuggestions(data);
        setTimeout(() => {
          setActiveTab("suggestions");
        }, 100);
        toast({
          title: "AI Suggestions Generated!",
          description: `Generated ${data.length} personalized trip suggestions`,
        });
      } else {
        console.error('Invalid data received:', data);
        toast({
          title: "Error",
          description: "Invalid response format from server",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Error generating AI suggestions:', error);
      setIsGenerating(false);
      toast({
        title: "Error", 
        description: error?.message || "Failed to generate trip suggestions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateItineraryMutation = useMutation({
    mutationFn: async () => {
      const formData = form.getValues();
      const response = await apiRequest<ItineraryDay[]>('/api/ai/itinerary', {
        method: 'POST',
        body: JSON.stringify({
          destination: formData.destination,
          duration: formData.duration,
          interests: formData.interests,
          travelStyle: formData.travelStyle,
          budget: formData.budget,
        }),
      });
      return response;
    },
    onSuccess: (data) => {
      setItinerary(data);
      setActiveTab("itinerary");
      toast({
        title: "Itinerary Generated!",
        description: `Created ${data.length}-day detailed itinerary`,
      });
    },
    onError: (error) => {
      console.error('Error generating itinerary:', error);
      toast({
        title: "Error",
        description: "Failed to generate itinerary. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Fetch saved trips
  const { data: savedTrips = [], isLoading: isLoadingSavedTrips } = useQuery({
    queryKey: ['/api/trips/user'],
    queryFn: () => apiRequest<SavedTrip[]>('/api/trips/user'),
  });

  const handleGenerateAITrips = async () => {
    try {
      const formData = form.getValues();
      console.log('Form data:', formData);
      console.log('Selected styles:', selectedStyles);
      console.log('Selected interests:', selectedInterests);
      console.log('Budget:', budget[0]);
      
      if (!formData.destination || selectedStyles.length === 0 || selectedInterests.length === 0) {
        console.log('Missing information check failed:', {
          destination: formData.destination,
          stylesLength: selectedStyles.length,
          interestsLength: selectedInterests.length
        });
        toast({
          title: "Missing Information",
          description: "Please fill in destination, travel styles, and interests",
          variant: "destructive",
        });
        return;
      }

      const data: TripFormData = {
        ...formData,
        travelStyle: selectedStyles,
        interests: selectedInterests,
        budget: budget[0],
      };

      console.log('Sending data to API:', data);
      setIsGenerating(true);
      
      // Use the mutation but handle the result manually
      generateAISuggestionsMutation.mutate(data);
      
    } catch (error) {
      console.error('Error in handleGenerateAITrips:', error);
      setIsGenerating(false);
      toast({
        title: "Error",
        description: "Failed to generate trip suggestions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateItinerary = async () => {
    try {
      setIsGeneratingItinerary(true);
      await generateItineraryMutation.mutateAsync();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4">My Trip Planner</h1>
          <p className="text-lg text-gray-600">Plan, explore, and save your perfect South American adventure</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="preferences" className="flex items-center">
              <Bot className="w-4 h-4 mr-2" />
              🧠 Preferences
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              ✨ Suggestions
            </TabsTrigger>
            <TabsTrigger value="itinerary" className="flex items-center">
              <Route className="w-4 h-4 mr-2" />
              📅 Itinerary
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center">
              <FolderOpen className="w-4 h-4 mr-2" />
              📁 My Trips
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Preferences */}
          <TabsContent value="preferences" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="w-6 h-6 mr-2 text-primary" />
                  Trip Preferences
                </CardTitle>
                <CardDescription>
                  Tell us your travel preferences to get personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Destination */}
                <div>
                  <Label htmlFor="destination" className="text-sm font-medium text-slate-700 mb-2 block">
                    Destination
                  </Label>
                  <Select onValueChange={(value) => {
                    form.setValue('destination', value);
                    console.log('Destination set to:', value);
                  }}>
                    <SelectTrigger className="w-full p-3">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOUTH_AMERICAN_COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div>
                  <Label htmlFor="duration" className="text-sm font-medium text-slate-700 mb-2 block">
                    Trip Duration
                  </Label>
                  <Select onValueChange={(value) => {
                    form.setValue('duration', value);
                    console.log('Duration set to:', value);
                  }}>
                    <SelectTrigger className="w-full p-3">
                      <SelectValue placeholder="How long do you want to travel?" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATIONS.map((duration) => (
                        <SelectItem key={duration.value} value={duration.value}>
                          {duration.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget */}
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Budget Range
                  </Label>
                  <div className="px-4">
                    <Slider
                      value={budget}
                      onValueChange={(value) => {
                        setBudget(value);
                        form.setValue('budget', value[0]);
                      }}
                      max={5000}
                      min={500}
                      step={100}
                      className="mb-4"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>$500</span>
                      <span className="text-orange-500 font-bold text-xl">${budget[0]}</span>
                      <span>$5000</span>
                    </div>
                  </div>
                </div>

                {/* Travel Style */}
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Travel Style <span className="text-xs text-gray-500">(select multiple)</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    {TRAVEL_STYLES.map((style) => (
                      <div
                        key={style.id}
                        onClick={() => toggleStyle(style.id)}
                        className={`p-4 rounded-lg border hover:bg-accent transition cursor-pointer ${
                          selectedStyles.includes(style.id)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <style.icon className="w-5 h-5 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-medium">{style.label}</h4>
                            <p className="text-sm text-muted-foreground">{style.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Interests <span className="text-xs text-gray-500">(select multiple)</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {INTERESTS.map((interest) => (
                      <Button
                        key={interest}
                        type="button"
                        variant={selectedInterests.includes(interest) ? "default" : "outline"}
                        onClick={() => toggleInterest(interest)}
                        className="justify-start h-8 text-xs"
                      >
                        {interest}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={handleGenerateAITrips}
                  disabled={isGenerating}
                  className="w-full h-12 text-lg font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Your Perfect Trip...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate AI Trip Suggestions
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Suggestions */}
          <TabsContent value="suggestions" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="w-6 h-6 mr-2 text-primary" />
                  AI Trip Suggestions
                </CardTitle>
                <CardDescription>
                  Personalized recommendations based on your preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isGenerating && (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-lg font-medium text-gray-700">Creating your perfect trip suggestions...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                  </div>
                )}

                {aiSuggestions.length === 0 && !isGenerating && (
                  <div className="text-center py-8">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-700 mb-2">No suggestions generated yet</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Set your preferences and click "Generate AI Trip Suggestions" to get started
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      Debug: isGenerating={String(isGenerating)}, suggestions length={aiSuggestions.length}
                    </p>
                    <Button onClick={() => setActiveTab("preferences")} variant="outline">
                      <Bot className="w-4 h-4 mr-2" />
                      Go to Preferences
                    </Button>
                  </div>
                )}

                {aiSuggestions.length > 0 && !isGenerating && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Found {aiSuggestions.length} suggestions for you
                      </p>
                      <Button 
                        onClick={handleGenerateItinerary}
                        disabled={isGeneratingItinerary}
                        variant="outline"
                        size="sm"
                      >
                        {isGeneratingItinerary ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Route className="w-4 h-4 mr-2" />
                        )}
                        Generate Itinerary
                      </Button>
                    </div>

                    {aiSuggestions.map((suggestion, index) => (
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

                        <div className="bg-orange-50 p-3 rounded-lg">
                          <div className="flex items-center mb-1">
                            <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                            <span className="font-semibold text-orange-800 text-sm">Best Time to Visit</span>
                          </div>
                          <p className="text-orange-700 text-sm">{suggestion.bestTimeToVisit}</p>
                        </div>

                        <div>
                          <div className="flex items-center mb-2">
                            <Star className="w-4 h-4 mr-2 text-yellow-600" />
                            <span className="font-semibold text-gray-800 text-sm">Highlights</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {suggestion.highlights.map((highlight, idx) => (
                              <div key={idx} className="flex items-center text-sm text-gray-700">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                {highlight}
                              </div>
                            ))}
                          </div>
                        </div>

{/* Temporarily disabled RealPlaceLinks to debug
                        {suggestion.realPlaces && suggestion.realPlaces.length > 0 && (
                          <RealPlaceLinks 
                            suggestion={suggestion}
                          />
                        )}
                        */}

                        <div className="flex flex-wrap gap-2">
                          {suggestion.travelStyle.map((style) => (
                            <Badge key={style} variant="secondary" className="text-xs">
                              {style}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Itinerary */}
          <TabsContent value="itinerary" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Route className="w-6 h-6 mr-2 text-primary" />
                  Daily Itinerary
                </CardTitle>
                <CardDescription>
                  Detailed day-by-day plan for your trip
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isGeneratingItinerary && (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-lg font-medium text-gray-700">Creating your detailed itinerary...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                  </div>
                )}

                {itinerary.length === 0 && !isGeneratingItinerary && (
                  <div className="text-center py-8">
                    <Route className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-700 mb-2">No itinerary generated yet</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Generate trip suggestions first, then create a detailed day-by-day itinerary
                    </p>
                    <Button onClick={handleGenerateItinerary} variant="outline">
                      <Route className="w-4 h-4 mr-2" />
                      Generate Itinerary
                    </Button>
                  </div>
                )}

                {itinerary.length > 0 && !isGeneratingItinerary && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-700">Your Day-by-Day Itinerary</h3>
                      <Button onClick={handleGenerateItinerary} variant="outline" size="sm">
                        <Route className="w-4 h-4 mr-2" />
                        Generate New
                      </Button>
                    </div>
                    
                    {itinerary.map((day) => (
                      <Card key={day.day} className="border-l-4 border-l-primary">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center text-lg">
                            <Calendar className="w-5 h-5 mr-2 text-primary" />
                            Day {day.day} – {day.location}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Activities */}
                          <div>
                            <div className="flex items-center mb-2">
                              <ListChecks className="w-4 h-4 mr-2 text-blue-600" />
                              <span className="font-semibold text-blue-800 text-sm">Activities</span>
                            </div>
                            <ul className="space-y-1">
                              {day.activities.map((activity, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-start">
                                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                  {activity}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Cost */}
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center mb-1">
                              <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                              <span className="font-semibold text-green-800 text-sm">Estimated Cost</span>
                            </div>
                            <p className="text-green-700 font-bold">${day.estimatedCost}</p>
                          </div>

                          {/* Tips */}
                          <div>
                            <div className="flex items-center mb-2">
                              <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
                              <span className="font-semibold text-yellow-800 text-sm">Local Tips</span>
                            </div>
                            <ul className="space-y-1">
                              {day.tips.map((tip, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-start">
                                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: My Trips */}
          <TabsContent value="saved" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderOpen className="w-6 h-6 mr-2 text-primary" />
                  My Saved Trips
                </CardTitle>
                <CardDescription>
                  View and manage your saved travel plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSavedTrips && (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-lg font-medium text-gray-700">Loading your trips...</p>
                  </div>
                )}

                {savedTrips.length === 0 && !isLoadingSavedTrips && (
                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-700 mb-2">No saved trips yet</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Create your first trip using our AI-powered suggestions
                    </p>
                    <Button onClick={() => setActiveTab("preferences")} variant="outline">
                      <Bot className="w-4 h-4 mr-2" />
                      Start Planning
                    </Button>
                  </div>
                )}

                {savedTrips.length > 0 && !isLoadingSavedTrips && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                      You have {savedTrips.length} saved trip{savedTrips.length !== 1 ? 's' : ''}
                    </p>

                    {savedTrips.map((trip) => (
                      <Card key={trip.id} className="border hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{trip.title}</CardTitle>
                              <p className="text-sm text-gray-500 mt-1">
                                Created {new Date(trip.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <Badge variant="outline" className="text-xs">
                                {trip.duration}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {trip.budget}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">{trip.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {typeof trip.destinations === 'object' && trip.destinations?.name 
                                  ? trip.destinations.name 
                                  : 'Multiple destinations'}
                              </span>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <ExternalLink className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                Delete
                              </Button>
                            </div>
                          </div>

                          {trip.travelStyle && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {trip.travelStyle.split(',').map((style, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {style.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
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