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
  CheckCircle
} from "lucide-react";

const tripFormSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  duration: z.string().min(1, "Duration is required"),
  budget: z.number().min(100, "Budget must be at least $100"),
  travelStyle: z.array(z.string()).min(1, "Select at least one travel style"),
  description: z.string().optional(),
});

type TripFormData = z.infer<typeof tripFormSchema>;

const DESTINATIONS = [
  "Peru", "Colombia", "Bolivia", "Chile", "Argentina", "Brazil", "Ecuador", "Uruguay", "Paraguay", "Venezuela"
];

const DURATIONS = [
  { value: "1-2-weeks", label: "1-2 weeks" },
  { value: "2-4-weeks", label: "2-4 weeks" },
  { value: "1-2-months", label: "1-2 months" },
  { value: "3-months", label: "3+ months" },
];

const TRAVEL_STYLES = [
  { id: 'adventure', icon: Mountain, label: 'Adventure', description: 'Mountain, outdoor activities' },
  { id: 'culture', icon: Camera, label: 'Culture', description: 'Museums, historical sites' },
  { id: 'food', icon: Utensils, label: 'Food', description: 'Local cuisine, food tours' },
  { id: 'nightlife', icon: GlassWater, label: 'Nightlife', description: 'Bars, clubs, social events' }
];

export default function TripBuilder() {
  const [budget, setBudget] = useState([2500]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      destination: "",
      duration: "",
      budget: 2500,
      travelStyle: [],
      description: "",
    },
  });

  const generateTripMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/ai/generate-trip", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: async (response) => {
      const suggestion = await response.json();
      setAiSuggestion(suggestion);
      setIsGenerating(false);
      toast({
        title: "Trip Generated!",
        description: "Your personalized itinerary is ready.",
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
      setAiSuggestion(null);
      form.reset();
      setSelectedStyles([]);
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

  const toggleStyle = (style: string) => {
    const newStyles = selectedStyles.includes(style) 
      ? selectedStyles.filter(s => s !== style)
      : [...selectedStyles, style];
    setSelectedStyles(newStyles);
    form.setValue('travelStyle', newStyles);
  };

  const handleGenerateTrip = () => {
    const values = form.getValues();
    if (!values.destination || !values.duration || selectedStyles.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in destination, duration, and select at least one travel style.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    generateTripMutation.mutate({
      destination: values.destination,
      duration: values.duration,
      budget: budget[0],
      travelStyle: selectedStyles,
      interests: selectedStyles,
    });
  };

  const handleSaveTrip = () => {
    if (!aiSuggestion) return;

    const tripData = {
      title: aiSuggestion.title,
      description: aiSuggestion.description,
      destinations: aiSuggestion.destinations,
      budget: aiSuggestion.totalEstimatedCost.toString(),
      travelStyle: selectedStyles.join(', '),
      isPublic: true,
    };

    createTripMutation.mutate(tripData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4">AI Trip Builder</h1>
          <p className="text-lg text-gray-600">Tell us your preferences and let our AI create the perfect itinerary</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trip Preferences Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-6 h-6 mr-2 text-primary" />
                Trip Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Destination */}
              <div>
                <Label htmlFor="destination" className="text-sm font-medium text-slate-700 mb-2 block">
                  Where do you want to go?
                </Label>
                <Select onValueChange={(value) => form.setValue('destination', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {DESTINATIONS.map((dest) => (
                      <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="duration" className="text-sm font-medium text-slate-700 mb-2 block">
                  Trip Duration
                </Label>
                <Select onValueChange={(value) => form.setValue('duration', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
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
                  Travel Style
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TRAVEL_STYLES.map((style) => (
                    <Button
                      key={style.id}
                      type="button"
                      variant={selectedStyles.includes(style.id) ? "default" : "outline"}
                      onClick={() => toggleStyle(style.id)}
                      className="justify-start h-auto p-3"
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

              {/* Additional Notes */}
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-slate-700 mb-2 block">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  placeholder="Any specific interests or requirements?"
                  {...form.register('description')}
                  className="min-h-[80px]"
                />
              </div>

              {/* Generate Button */}
              <Button 
                onClick={handleGenerateTrip}
                disabled={isGenerating}
                className="w-full bg-primary hover:bg-orange-600 py-3"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Your Trip...
                  </>
                ) : (
                  <>
                    <Bot className="w-5 h-5 mr-2" />
                    Generate My Trip
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* AI Suggestion */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="w-6 h-6 mr-2 text-secondary" />
                AI Generated Itinerary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Crafting Your Perfect Trip</h3>
                  <p className="text-gray-600">Our AI is analyzing your preferences...</p>
                </div>
              ) : aiSuggestion ? (
                <div className="space-y-6">
                  {/* Trip Overview */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">{aiSuggestion.title}</h3>
                    <p className="text-gray-600 mb-4">{aiSuggestion.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                        <span>Budget: ${aiSuggestion.totalEstimatedCost}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-blue-600 mr-1" />
                        <span>{aiSuggestion.destinations?.length || 0} destinations</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Destinations */}
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-3">Destinations</h4>
                    <div className="space-y-3">
                      {aiSuggestion.destinations?.map((dest: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium text-slate-700 mb-2">{dest.name}</h5>
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {dest.days} days
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              ${dest.estimatedCost}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {dest.activities?.map((activity: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {activity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-3">AI Recommendations</h4>
                    <ul className="space-y-2">
                      {aiSuggestion.recommendations?.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  {/* Weather Information */}
                  {aiSuggestion.destinations?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Weather & Travel Conditions</h4>
                      <WeatherWidget 
                        destination={aiSuggestion.destinations[0].name}
                        country={form.getValues('destination')}
                        showRecommendations={true}
                      />
                    </div>
                  )}

                  <Separator />

                  {/* Save Trip */}
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleSaveTrip}
                      disabled={createTripMutation.isPending}
                      className="flex-1 bg-success hover:bg-green-700"
                    >
                      {createTripMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Save Trip
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setAiSuggestion(null)}
                      className="flex-1"
                    >
                      Start Over
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Ready to Plan?</h3>
                  <p className="text-gray-500">Fill in your preferences and click "Generate My Trip" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
