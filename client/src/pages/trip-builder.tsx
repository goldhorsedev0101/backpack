import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { isUnauthorizedError } from "@/lib/authUtils";
import { WeatherWidget } from "@/components/WeatherWidget";
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
  Lightbulb
} from "lucide-react";

const tripFormSchema = z.object({
  travelStyle: z.array(z.string()).min(1, "Select at least one travel style"),
  budget: z.number().min(100, "Budget must be at least $100"),
  duration: z.string().min(1, "Duration is required"),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  preferredCountries: z.array(z.string()).optional(),
});

type TripFormData = z.infer<typeof tripFormSchema>;

interface ItineraryDay {
  day: number;
  location: string;
  activities: string[];
  estimatedCost: number;
  tips: string[];
}

const SOUTH_AMERICAN_COUNTRIES = [
  "Peru", "Colombia", "Bolivia", "Chile", "Argentina", "Brazil", "Ecuador", "Uruguay", "Paraguay", "Venezuela", "Guyana", "Suriname", "French Guiana"
];

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

// TripItineraryView Component
interface TripItineraryViewProps {
  itinerary: ItineraryDay[];
  isGenerating: boolean;
  onGenerateItinerary: () => void;
}

function TripItineraryView({ itinerary, isGenerating, onGenerateItinerary }: TripItineraryViewProps) {
  if (isGenerating) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
        <p className="text-lg font-medium text-gray-700">Creating your detailed itinerary...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
      </div>
    );
  }

  if (itinerary.length === 0) {
    return (
      <div className="text-center py-8">
        <Route className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 mb-2">No itinerary generated yet</p>
        <p className="text-sm text-gray-500 mb-4">
          Generate trip suggestions first, then create a detailed day-by-day itinerary
        </p>
        <Button onClick={onGenerateItinerary} variant="outline">
          <Route className="w-4 h-4 mr-2" />
          Generate Sample Itinerary
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-700">Your Day-by-Day Itinerary</h3>
        <Button onClick={onGenerateItinerary} variant="outline" size="sm">
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

            {/* Estimated Cost */}
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                <span className="font-semibold text-green-800 text-sm">Estimated Cost</span>
              </div>
              <p className="text-green-700 text-lg font-bold">${day.estimatedCost}</p>
            </div>

            {/* Daily Tips */}
            {day.tips && day.tips.length > 0 && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
                  <span className="font-semibold text-yellow-800 text-sm">Daily Tips</span>
                </div>
                <ul className="space-y-1">
                  {day.tips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-yellow-700 flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function TripBuilder() {
  const [budget, setBudget] = useState([2500]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);
  const [activeTab, setActiveTab] = useState("preferences");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      travelStyle: [],
      budget: 2500,
      duration: "",
      interests: [],
      preferredCountries: [],
    },
  });

  const generateTripMutation = useMutation({
    mutationFn: async (preferences: any) => {
      return await apiRequest("/api/ai/travel-suggestions", {
        method: "POST",
        body: JSON.stringify(preferences),
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setAiSuggestions(data.suggestions || []);
      setIsGenerating(false);
      toast({
        title: "Trip Suggestions Generated!",
        description: "Your personalized South American trip suggestions are ready.",
      });
    },
    onError: async (error) => {
      setIsGenerating(false);
      console.error("Trip generation error:", error);
      
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
      
      // Try to get more specific error message
      let errorMessage = "Could not generate trip. Please try again.";
      try {
        const errorResponse = await error.response?.text();
        if (errorResponse) {
          const errorData = JSON.parse(errorResponse);
          errorMessage = errorData.message || errorMessage;
        }
      } catch (e) {
        // Fall back to default message
      }
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const createTripMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/trips", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips/user"] });
      toast({
        title: "Trip Created!",
        description: "Your trip has been saved successfully.",
      });
      setAiSuggestions([]);
      form.reset();
      setSelectedStyles([]);
      setSelectedInterests([]);
      setSelectedCountries([]);
      setBudget([2500]);
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
        title: "Save Failed",
        description: "Could not save trip. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateAITrips = () => {
    setIsGenerating(true);
    const preferences = {
      travelStyle: selectedStyles,
      budget: budget[0],
      duration: form.getValues("duration"),
      interests: selectedInterests,
      preferredCountries: selectedCountries.length > 0 ? selectedCountries : undefined,
    };
    
    generateTripMutation.mutate(preferences);
  };

  const toggleStyle = (style: string) => {
    const newStyles = selectedStyles.includes(style) 
      ? selectedStyles.filter(s => s !== style)
      : [...selectedStyles, style];
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

  const toggleCountry = (country: string) => {
    const newCountries = selectedCountries.includes(country) 
      ? selectedCountries.filter(c => c !== country)
      : [...selectedCountries, country];
    setSelectedCountries(newCountries);
    form.setValue('preferredCountries', newCountries);
  };

  const handleSaveTrip = (suggestion: any) => {
    const tripData = {
      title: `${suggestion.destination}, ${suggestion.country}`,
      description: suggestion.description,
      destinations: suggestion.destination,
      budget: suggestion.estimatedBudget.high.toString(),
      travelStyle: suggestion.travelStyle.join(', '),
      isPublic: true,
    };

    createTripMutation.mutate(tripData);
  };

  const handleGenerateItinerary = async (suggestion?: any) => {
    setIsGeneratingItinerary(true);
    
    try {
      // Use suggestion data if provided, otherwise use form data
      const requestData = suggestion ? {
        userId: 'guest',
        destination: `${suggestion.destination}, ${suggestion.country}`,
        duration: parseInt(suggestion.duration.replace(/\D/g, '')) || 7,
        interests: selectedInterests,
        travelStyle: selectedStyles,
        budget: Math.floor((suggestion.estimatedBudget.low + suggestion.estimatedBudget.high) / 2 / 7) // Daily budget
      } : {
        userId: 'guest',
        destination: selectedCountries[0] || 'Peru',
        duration: parseInt(form.getValues("duration")?.replace(/\D/g, '')) || 7,
        interests: selectedInterests,
        travelStyle: selectedStyles,
        budget: Math.floor(budget[0] / 7) // Daily budget from total budget
      };

      const response = await apiRequest("/api/generate-itinerary", {
        method: "POST",
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      setItinerary(data.itinerary || []);
      setActiveTab("itinerary");
      
      toast({
        title: "Itinerary Generated!",
        description: "Your detailed day-by-day itinerary is ready.",
      });
    } catch (error) {
      console.error("Itinerary generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate itinerary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4">AI Trip Builder</h1>
          <p className="text-lg text-gray-600">Tell us your preferences and let our AI create personalized South American trip suggestions</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
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
          </TabsList>

          <TabsContent value="preferences" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trip Preferences Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="w-6 h-6 mr-2 text-primary" />
                AI Trip Builder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Duration */}
              <div>
                <Label htmlFor="duration" className="text-sm font-medium text-slate-700 mb-2 block">
                  Trip Duration
                </Label>
                <Select onValueChange={(value) => form.setValue('duration', value)}>
                  <SelectTrigger>
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
                    <span className="text-lg font-semibold text-primary">${budget[0]}</span>
                    <span>$5000</span>
                  </div>
                </div>
              </div>

              {/* Travel Style */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Travel Style <span className="text-xs text-gray-500">(select multiple)</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {TRAVEL_STYLES.map((style) => (
                    <Button
                      key={style.id}
                      type="button"
                      variant={selectedStyles.includes(style.id) ? "default" : "outline"}
                      onClick={() => toggleStyle(style.id)}
                      className="justify-start h-auto p-3 text-left"
                    >
                      <style.icon className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">{style.label}</div>
                        <div className="text-xs opacity-70">{style.description}</div>
                      </div>
                    </Button>
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

              {/* Preferred Countries */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Preferred Countries <span className="text-xs text-gray-500">(optional)</span>
                </Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {SOUTH_AMERICAN_COUNTRIES.map((country) => (
                    <Button
                      key={country}
                      type="button"
                      variant={selectedCountries.includes(country) ? "default" : "outline"}
                      onClick={() => toggleCountry(country)}
                      className="justify-start h-8 text-xs"
                    >
                      {country}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Generate AI Trip Button */}
              <Button 
                onClick={handleGenerateAITrips}
                disabled={isGenerating || selectedStyles.length === 0 || selectedInterests.length === 0 || !form.getValues("duration")}
                className="w-full h-12 text-lg font-semibold"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Your Perfect Trip...
                  </>
                ) : (
                  <>
                    <Bot className="w-5 h-5 mr-2" />
                    Generate AI Trip Suggestions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* AI Trip Suggestions Display */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-6 h-6 mr-2 text-primary" />
                AI Trip Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGenerating && (
                <div className="text-center py-8">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                  <p className="text-lg font-medium text-gray-700">Creating your perfect trip suggestions...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                </div>
              )}

              {aiSuggestions.length > 0 && !isGenerating && (
                <div className="space-y-6">
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

                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2 text-sm">Best Time to Visit</h4>
                        <p className="text-sm text-gray-600">{suggestion.bestTimeToVisit}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2 text-sm">Highlights</h4>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.highlights?.map((highlight: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2 text-sm">Travel Style</h4>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.travelStyle?.map((style: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {style}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 space-y-2">
                        <Button 
                          onClick={() => handleSaveTrip(suggestion)}
                          disabled={createTripMutation.isPending}
                          className="w-full"
                        >
                          {createTripMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Save This Trip
                            </>
                          )}
                        </Button>
                        <Button 
                          onClick={() => handleGenerateItinerary(suggestion)}
                          disabled={isGeneratingItinerary}
                          variant="outline"
                          className="w-full"
                        >
                          {isGeneratingItinerary ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Route className="w-4 h-4 mr-2" />
                              Create Itinerary
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="text-center pt-4">
                    <Button 
                      variant="outline"
                      onClick={handleGenerateAITrips}
                      disabled={isGenerating}
                    >
                      Generate New Suggestions
                    </Button>
                  </div>
                </div>
              )}

              {aiSuggestions.length === 0 && !isGenerating && (
                <div className="text-center py-8">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Ready to plan your South American adventure?</p>
                  <p className="text-sm text-gray-500">
                    Fill in your preferences and click "Generate AI Trip Suggestions" to get personalized recommendations
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="w-6 h-6 mr-2 text-primary" />
                  AI Trip Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isGenerating && (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-lg font-medium text-gray-700">Creating your perfect trip suggestions...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                  </div>
                )}

                {aiSuggestions.length > 0 && !isGenerating && (
                  <div className="space-y-6">
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

                        <div>
                          <h4 className="font-semibold text-slate-700 mb-2 text-sm">Best Time to Visit</h4>
                          <p className="text-sm text-gray-600">{suggestion.bestTimeToVisit}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-700 mb-2 text-sm">Highlights</h4>
                          <div className="flex flex-wrap gap-2">
                            {suggestion.highlights?.map((highlight: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-700 mb-2 text-sm">Travel Style</h4>
                          <div className="flex flex-wrap gap-2">
                            {suggestion.travelStyle?.map((style: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {style}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 space-y-2">
                          <Button 
                            onClick={() => handleSaveTrip(suggestion)}
                            disabled={createTripMutation.isPending}
                            className="w-full"
                          >
                            {createTripMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Save This Trip
                              </>
                            )}
                          </Button>
                          <Button 
                            onClick={() => handleGenerateItinerary(suggestion)}
                            disabled={isGeneratingItinerary}
                            variant="outline"
                            className="w-full"
                          >
                            {isGeneratingItinerary ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Route className="w-4 h-4 mr-2" />
                                Create Itinerary
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="text-center pt-4">
                      <Button 
                        variant="outline"
                        onClick={handleGenerateAITrips}
                        disabled={isGenerating}
                      >
                        Generate New Suggestions
                      </Button>
                    </div>
                  </div>
                )}

                {aiSuggestions.length === 0 && !isGenerating && (
                  <div className="text-center py-8">
                    <Bot className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-700 mb-2">Ready to plan your South American adventure?</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Go to Preferences tab, fill in your preferences and generate AI trip suggestions
                    </p>
                    <Button onClick={() => setActiveTab("preferences")} variant="outline">
                      <Bot className="w-4 h-4 mr-2" />
                      Go to Preferences
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="itinerary" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Route className="w-6 h-6 mr-2 text-primary" />
                  Day-by-Day Itinerary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TripItineraryView
                  itinerary={itinerary}
                  isGenerating={isGeneratingItinerary}
                  onGenerateItinerary={() => handleGenerateItinerary()}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
