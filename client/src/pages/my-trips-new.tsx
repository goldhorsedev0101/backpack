import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  BookOpen,
  Heart,
  Save,
  Trash2
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
  const { isAuthenticated, user, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState("preferences");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
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
        const response = await apiRequest('/api/ai/travel-suggestions', {
          method: 'POST',
          body: JSON.stringify({
            destination: data.destination,
            travelStyle: data.travelStyle,
            budget: data.budget,
            duration: data.duration,
            interests: data.interests,
          }),
        });
        const jsonData = await response.json();
        console.log('API response received:', jsonData);
        return jsonData as TripSuggestion[];
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
      
      // Validate data before sending
      if (!formData.destination) {
        throw new Error("Please select a destination first");
      }
      
      if (selectedInterests.length === 0) {
        throw new Error("Please select at least one interest");
      }
      
      if (selectedStyles.length === 0) {
        throw new Error("Please select at least one travel style");
      }
      
      const requestData = {
        destination: formData.destination,
        duration: formData.duration || "1 week",
        interests: selectedInterests,
        travelStyle: selectedStyles,
        budget: budget[0] || 1000,
      };
      
      console.log('Sending itinerary request with data:', requestData);
      
      const response = await apiRequest('/api/ai/itinerary', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Itinerary API error:', errorData);
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }
      
      const jsonData = await response.json();
      console.log('Received itinerary response:', jsonData);
      return jsonData as ItineraryDay[];
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
        description: error?.message || "Failed to generate itinerary. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Save trip suggestion mutation
  const saveTripMutation = useMutation({
    mutationFn: async (suggestion: TripSuggestion) => {
      const response = await apiRequest('/api/trips', {
        method: 'POST',
        body: JSON.stringify({
          title: `${suggestion.destination}, ${suggestion.country}`,
          destinations: JSON.stringify([{
            name: suggestion.destination,
            country: suggestion.country,
            description: suggestion.description,
            highlights: suggestion.highlights
          }]),
          description: suggestion.description,
          budget: suggestion.estimatedBudget.low.toString(),
          travelStyle: suggestion.travelStyle.join(', '),
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Trip Saved!",
        description: "Trip suggestion saved to My Trips",
      });
      // Refresh saved trips
      queryClient.invalidateQueries({ queryKey: ['/api/trips/user'] });
    },
    onError: (error) => {
      console.error('Error saving trip:', error);
      toast({
        title: "Error",
        description: "Failed to save trip. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Save itinerary mutation with Supabase
  const saveItineraryMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error("Please sign in to save your itinerary");
      }
      
      if (itinerary.length === 0) {
        throw new Error("No itinerary to save");
      }
      
      const mainDestination = itinerary[0]?.location || "Unknown";
      const totalCost = itinerary.reduce((sum, day) => sum + day.estimatedCost, 0);
      
      const { data, error } = await supabase
        .from('itineraries')
        .insert({
          user_id: user.id,
          title: `${mainDestination} Itinerary - ${new Date().toLocaleDateString()}`,
          plan_json: {
            mainDestination,
            totalDays: itinerary.length,
            totalCost,
            generatedAt: new Date().toISOString(),
            itinerary: itinerary.map(day => ({
              day: day.day,
              location: day.location,
              activities: day.activities,
              estimatedCost: day.estimatedCost,
              tips: day.tips || []
            }))
          }
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Failed to save itinerary');
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "האיטינררי נשמר בהצלחה!",
        description: "האיטינררי המפורט שלך נשמר ב-My Itineraries",
      });
      queryClient.invalidateQueries({ queryKey: ['my-itineraries'] });
    },
    onError: (error) => {
      console.error('Error saving itinerary:', error);
      toast({
        title: "שגיאה",
        description: error.message === "Please sign in to save your itinerary" 
          ? "שמירה דורשת התחברות" 
          : "שמירה נכשלה, נסה שוב",
        variant: "destructive",
      });
    },
  });

  // Fetch saved trips
  const { data: savedTrips = [], isLoading: isLoadingSavedTrips } = useQuery({
    queryKey: ['/api/trips/user'],
    queryFn: async () => {
      const response = await apiRequest('/api/trips/user');
      return response.json() as Promise<SavedTrip[]>;
    },
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
      
      // Use mutateAsync and wrap in try-catch to prevent unhandled rejection
      try {
        const result = await generateAISuggestionsMutation.mutateAsync(data);
        console.log('Mutation completed successfully:', result);
      } catch (mutationError) {
        console.error('Mutation failed:', mutationError);
        // Error is already handled in onError callback, no need to rethrow
      }
      
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
      try {
        const result = await generateItineraryMutation.mutateAsync();
        console.log('Itinerary generation completed:', result);
      } catch (mutationError) {
        console.error('Itinerary mutation failed:', mutationError);
        // Error is handled in onError callback
      }
    } catch (error) {
      console.error('Error in handleGenerateItinerary:', error);
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  const handleGenerateItineraryForSuggestion = async (suggestion: TripSuggestion) => {
    try {
      setIsGeneratingItinerary(true);
      
      // Parse duration to get number of days
      const durationText = suggestion.duration.toLowerCase();
      let durationDays = 7; // default
      
      if (durationText.includes('week')) {
        const weeks = parseInt(durationText) || 1;
        durationDays = weeks * 7;
      } else if (durationText.includes('day')) {
        durationDays = parseInt(durationText) || 7;
      }
      
      console.log('Generating itinerary for suggestion:', {
        destination: suggestion.destination,
        duration: durationDays,
        travelStyle: suggestion.travelStyle
      });
      
      const response = await apiRequest('/api/ai/itinerary', {
        method: 'POST',
        body: JSON.stringify({
          destination: suggestion.destination,
          duration: durationDays,
          interests: suggestion.highlights || [], // Use highlights as interests
          travelStyle: suggestion.travelStyle,
          budget: suggestion.estimatedBudget.low || 1000,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Itinerary API error:', errorData);
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }
      
      const jsonData = await response.json();
      console.log('Received itinerary response:', jsonData);
      setItinerary(jsonData);
      setActiveTab('itinerary'); // Switch to itinerary tab
      
      toast({
        title: "Success!",
        description: `Generated ${durationDays}-day itinerary for ${suggestion.destination}`,
      });
      
    } catch (error) {
      console.error('Error generating itinerary for suggestion:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate itinerary",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  const handleSaveItinerary = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    
    try {
      await saveItineraryMutation.mutateAsync();
    } catch (error) {
      console.error('Error saving itinerary:', error);
    }
  };

  // Handle auth modal Google sign-in
  const handleAuthModalSignIn = async () => {
    try {
      await signInWithGoogle();
      setIsAuthModalOpen(false);
      // Auto-save after successful login
      setTimeout(async () => {
        if (itinerary.length > 0) {
          await saveItineraryMutation.mutateAsync();
        }
      }, 1000);
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "שגיאה בהתחברות",
        description: "נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  };

  // Fetch saved itineraries from Supabase
  const { data: savedItineraries = [], isLoading: isLoadingItineraries } = useQuery({
    queryKey: ['my-itineraries'],
    queryFn: async () => {
      if (!isAuthenticated || !user) return [];
      
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching itineraries:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: isAuthenticated && !!user,
  });

  // Delete itinerary mutation
  const deleteItineraryMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isAuthenticated || !user) {
        throw new Error("Authentication required");
      }
      
      const { error } = await supabase
        .from('itineraries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast({
        title: "נמחק בהצלחה",
        description: "האיטינררי נמחק מהרשימה שלך",
      });
      queryClient.invalidateQueries({ queryKey: ['my-itineraries'] });
    },
    onError: (error) => {
      toast({
        title: "שגיאה במחיקה",
        description: "לא הצלחנו למחוק את האיטינררי, נסה שוב",
        variant: "destructive",
      });
    },
  });

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
              Preferences
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="itinerary" className="flex items-center">
              <Route className="w-4 h-4 mr-2" />
              Itinerary
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center">
              <FolderOpen className="w-4 h-4 mr-2" />
              My Trips
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

                        <div className="flex flex-wrap gap-2 mb-4">
                          {suggestion.travelStyle.map((style) => (
                            <Badge key={style} variant="secondary" className="text-xs">
                              {style}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                          <Button 
                            onClick={() => handleGenerateItineraryForSuggestion(suggestion)}
                            disabled={isGeneratingItinerary}
                            variant="outline"
                            size="sm"
                            className="mr-2"
                          >
                            {isGeneratingItinerary ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Route className="w-4 h-4 mr-2" />
                            )}
                            Generate Daily Itinerary
                          </Button>
                          
                          <Button 
                            onClick={() => saveTripMutation.mutate(suggestion)}
                            disabled={saveTripMutation.isPending}
                            variant="default"
                            size="sm"
                          >
                            {saveTripMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Heart className="w-4 h-4 mr-2" />
                            )}
                            Save Trip
                          </Button>
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
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                onClick={handleSaveItinerary}
                                disabled={saveItineraryMutation.isPending}
                                variant="default"
                                size="sm"
                              >
                                {saveItineraryMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Heart className="w-4 h-4 mr-2" />
                                )}
                                Save Itinerary
                              </Button>
                            </TooltipTrigger>
                            {!isAuthenticated && (
                              <TooltipContent>
                                <p>צריך להתחבר כדי לשמור. לחיצה תפתח מסך התחברות.</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                        <Button onClick={handleGenerateItinerary} variant="outline" size="sm">
                          <Route className="w-4 h-4 mr-2" />
                          Generate New
                        </Button>
                      </div>
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

                {/* My Saved Itineraries Section */}
                {isAuthenticated && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <Save className="w-6 h-6 mr-2 text-primary" />
                        <h3 className="text-xl font-bold text-slate-700">My Saved Itineraries</h3>
                      </div>
                      <Badge variant="secondary">{savedItineraries.length}</Badge>
                    </div>

                    {isLoadingItineraries ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
                        <p className="text-sm text-gray-600">Loading your saved itineraries...</p>
                      </div>
                    ) : savedItineraries.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Save className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-600 mb-2">אין איטינררים שמורים עדיין</p>
                        <p className="text-sm text-gray-500">האיטינררים שתשמור יופיעו כאן</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {savedItineraries.map((itinerary) => {
                          const planData = itinerary.plan_json as any;
                          return (
                            <Card key={itinerary.id} className="border hover:shadow-md transition-shadow">
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <CardTitle className="text-lg">{itinerary.title}</CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                      נוצר ב-{new Date(itinerary.created_at).toLocaleDateString('he-IL')}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                      {planData?.totalDays || 0} ימים
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteItineraryMutation.mutate(itinerary.id)}
                                      disabled={deleteItineraryMutation.isPending}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      {deleteItineraryMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {planData?.mainDestination || 'יעד לא ידוע'}
                                  </div>
                                  {planData?.totalCost && (
                                    <div className="flex items-center text-sm text-gray-600">
                                      <DollarSign className="w-4 h-4 mr-2" />
                                      עלות משוערת: ${planData.totalCost}
                                    </div>
                                  )}
                                  {planData?.itinerary && planData.itinerary.length > 0 && (
                                    <div className="text-sm text-gray-600">
                                      <span className="font-medium">{planData.itinerary.length} ימי פעילויות:</span>
                                      <div className="mt-1 text-xs">
                                        {planData.itinerary.slice(0, 2).map((day: any, idx: number) => (
                                          <div key={idx} className="text-gray-500">
                                            יום {day.day}: {day.location}
                                          </div>
                                        ))}
                                        {planData.itinerary.length > 2 && (
                                          <div className="text-gray-400">ועוד {planData.itinerary.length - 2} ימים...</div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
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

        {/* Auth Modal */}
        <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">התחבר כדי לשמור את האיטינררי</DialogTitle>
              <DialogDescription className="text-center">
                כדי לשמור ולגשת לאיטינררי שלך מכל מכשיר, התחבר עם Google.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Button
                onClick={handleAuthModalSignIn}
                className="w-full"
                size="lg"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                התחבר עם Google
              </Button>
            </div>
            <DialogFooter className="flex justify-center">
              <Button variant="outline" onClick={() => setIsAuthModalOpen(false)}>
                ביטול
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}