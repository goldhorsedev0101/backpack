import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useLocalizedFormatting } from "@/hooks/useLanguageSwitch";
import { useLocalizedDestinations } from "@/lib/localizedData";
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

// Create form schema function that uses translations
const createTripFormSchema = (t: any) => z.object({
  destination: z.string().min(1, t('trips.select_destination')),
  travelStyle: z.array(z.string()).min(1, t('trips.select_travel_style')),
  budget: z.number().min(100, t('trips.budget_required')),
  duration: z.string().min(1, t('trips.select_duration')),
  interests: z.array(z.string()).min(1, t('trips.select_interests')),
});

type TripFormData = {
  destination: string;
  travelStyle: string[];
  budget: number;
  duration: string;
  interests: string[];
};

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

export default function MyTripsNew() {
  const { t, i18n } = useTranslation();
  const { formatCurrency, formatDate } = useLocalizedFormatting();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, user, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState("preferences");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Set localized page title
  useEffect(() => {
    document.title = `${t('trips.my_trips')} - TripWise`;
  }, [t]);

  // Localized constants - defined inside component to access t()
  const DURATIONS = [
    { value: "1-2 weeks", label: t('trips.duration_1_2_weeks') },
    { value: "2-4 weeks", label: t('trips.duration_2_4_weeks') },
    { value: "1-2 months", label: t('trips.duration_1_2_months') },
    { value: "3+ months", label: t('trips.duration_3_months') },
  ];

  const TRAVEL_STYLES = [
    { id: 'adventure', icon: Mountain, label: t('trips.adventure'), description: t('trips.adventure_desc') },
    { id: 'cultural', icon: Camera, label: t('trips.cultural'), description: t('trips.cultural_desc') },
    { id: 'budget', icon: DollarSign, label: t('trips.budget_travel'), description: t('trips.budget_desc') },
    { id: 'luxury', icon: Sparkles, label: t('trips.luxury'), description: t('trips.luxury_desc') },
    { id: 'nature', icon: Mountain, label: t('trips.nature'), description: t('trips.nature_desc') },
    { id: 'food', icon: Utensils, label: t('trips.food'), description: t('trips.food_desc') },
    { id: 'nightlife', icon: GlassWater, label: t('trips.nightlife'), description: t('trips.nightlife_desc') },
    { id: 'relaxation', icon: Clock, label: t('trips.relaxation'), description: t('trips.relaxation_desc') }
  ];

  const INTERESTS = [
    t('trips.interests_list.history_culture'), t('trips.interests_list.adventure_sports'), 
    t('trips.interests_list.nature_wildlife'), t('trips.interests_list.food_cuisine'), 
    t('trips.interests_list.nightlife_entertainment'), t('trips.interests_list.photography'), 
    t('trips.interests_list.architecture'), t('trips.interests_list.local_markets'),
    t('trips.interests_list.beaches_coastlines'), t('trips.interests_list.mountains_hiking'), 
    t('trips.interests_list.art_museums'), t('trips.interests_list.music_festivals'),
    t('trips.interests_list.shopping'), t('trips.interests_list.wellness_relaxation'), 
    t('trips.interests_list.language_learning'), t('trips.interests_list.volunteering')
  ];
  
  // Form state
  const [budget, setBudget] = useState([1000]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  // Results state
  const [aiSuggestions, setAiSuggestions] = useState<TripSuggestion[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);

  // Create form with dynamic schema that uses current translations
  const form = useForm<TripFormData>({
    resolver: zodResolver(createTripFormSchema(t)),
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
            language: i18n.language,
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
          title: t('trips.ai_suggestions_generated'),
          description: t('trips.suggestions_count', { count: data.length }),
        });
      } else {
        console.error('Invalid data received:', data);
        toast({
          title: t('common.error'),
          description: t('trips.invalid_response_format'),
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Error generating AI suggestions:', error);
      setIsGenerating(false);
      toast({
        title: t('common.error'), 
        description: error?.message || t('trips.error_generating'),
        variant: "destructive",
      });
    },
  });

  const generateItineraryMutation = useMutation({
    mutationFn: async () => {
      const formData = form.getValues();
      
      // Validate data before sending
      if (!formData.destination) {
        throw new Error(t('trips.please_select_destination_first'));
      }
      
      if (selectedInterests.length === 0) {
        throw new Error(t('trips.please_select_interest'));
      }
      
      if (selectedStyles.length === 0) {
        throw new Error(t('trips.please_select_travel_style_one'));
      }
      
      const requestData = {
        destination: formData.destination,
        duration: formData.duration || t('trips.1_week_default'),
        interests: selectedInterests,
        travelStyle: selectedStyles,
        budget: budget[0] || 1000,
      };
      
      console.log('Sending itinerary request with data:', requestData);
      
      const response = await apiRequest('/api/ai/itinerary', {
        method: 'POST',
        body: JSON.stringify({
          ...requestData,
          language: i18n.language,
        }),
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
        title: t('trips.itinerary_generated'),
        description: t('trips.itinerary_generated_desc', { count: data.length }),
      });
    },
    onError: (error) => {
      console.error('Error generating itinerary:', error);
      toast({
        title: t('common.error'),
        description: error?.message || t('trips.error_generating_itinerary'),
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
        title: t('trips.trip_saved'),
        description: t('trips.trip_saved_desc'),
      });
      // Refresh saved trips
      queryClient.invalidateQueries({ queryKey: ['/api/trips/user'] });
    },
    onError: (error) => {
      console.error('Error saving trip:', error);
      toast({
        title: t('common.error'),
        description: t('trips.error_saving_trip'),
        variant: "destructive",
      });
    },
  });

  // Save itinerary mutation with Supabase
  const saveItineraryMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error(t('trips.sign_in_required_save'));
      }
      
      if (itinerary.length === 0) {
        throw new Error(t('trips.no_itinerary_to_save'));
      }
      
      const mainDestination = itinerary[0]?.location || t('common.unknown');
      const totalCost = itinerary.reduce((sum, day) => sum + day.estimatedCost, 0);
      
      const { data, error } = await supabase
        .from('itineraries')
        .insert({
          user_id: user.id,
          title: `${mainDestination} ${t('trips.itinerary')} - ${formatDate(new Date())}`,
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
        title: t('trips.itinerary_saved'),
        description: t('trips.itinerary_saved_desc'),
      });
      queryClient.invalidateQueries({ queryKey: ['my-itineraries'] });
    },
    onError: (error) => {
      console.error('Error saving itinerary:', error);
      toast({
        title: t('common.error'),
        description: error.message === t('trips.sign_in_required_save')
          ? t('trips.sign_in_required_save') 
          : t('trips.save_failed'),
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
          title: t('trips.missing_info'),
          description: t('trips.missing_info_desc'),
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
        title: t('common.error'),
        description: t('trips.error_generating'),
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
          language: i18n.language,
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
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('trips.error_generating_itinerary'),
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
        throw new Error(t('auth.sign_in_required'));
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
          <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4">{t('trips.my_trip_planner')}</h1>
          <p className="text-lg text-gray-600">{t('trips.planner_subtitle')}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-auto min-w-full justify-evenly h-10">
              <TabsTrigger value="preferences" className="flex items-center whitespace-nowrap" data-testid="tab-preferences">
                <Bot className="w-4 h-4 mr-2" />
                {t('trips.preferences')}
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="flex items-center whitespace-nowrap" data-testid="tab-suggestions">
                <Sparkles className="w-4 h-4 mr-2" />
                {t('trips.suggestions')}
              </TabsTrigger>
              <TabsTrigger value="itinerary" className="flex items-center whitespace-nowrap" data-testid="tab-itinerary">
                <Route className="w-4 h-4 mr-2" />
                {t('trips.itinerary')}
              </TabsTrigger>
              <TabsTrigger value="my-itineraries" className="flex items-center whitespace-nowrap" data-testid="tab-my-itineraries">
                <Save className="w-4 h-4 mr-2" />
                {t('trips.my_itineraries')}
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center whitespace-nowrap" data-testid="tab-saved">
                <FolderOpen className="w-4 h-4 mr-2" />
                {t('trips.my_trips')}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Preferences */}
          <TabsContent value="preferences" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="w-6 h-6 mr-2 text-primary" />
                  {t('trips.trip_preferences')}
                </CardTitle>
                <CardDescription>
                  {t('trips.tell_us_preferences')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Destination */}
                <div>
                  <Label htmlFor="destination" className="text-sm font-medium text-slate-700 mb-2 block">
                    {t('trips.destination')}
                  </Label>
                  <Select onValueChange={(value) => {
                    form.setValue('destination', value);
                    console.log('Destination set to:', value);
                  }}>
                    <SelectTrigger className="w-full p-3">
                      <SelectValue placeholder={t('trips.select_destination')} />
                    </SelectTrigger>
                    <SelectContent>
                      {SOUTH_AMERICAN_COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {t(`trips.countries.${country}`) || country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div>
                  <Label htmlFor="duration" className="text-sm font-medium text-slate-700 mb-2 block">
                    {t('trips.trip_duration')}
                  </Label>
                  <Select onValueChange={(value) => {
                    form.setValue('duration', value);
                    console.log('Duration set to:', value);
                  }}>
                    <SelectTrigger className="w-full p-3">
                      <SelectValue placeholder={t('trips.how_long_travel')} />
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
                    {t('trips.budget_range')}
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
{t('trips.interests')} <span className="text-xs text-gray-500">({t('trips.select_multiple')})</span>
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
{t('trips.generating_perfect_trip')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
{t('trips.generate_ai_suggestions')}
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
                  {t('trips.ai_trip_suggestions')}
                </CardTitle>
                <CardDescription>
                  {t('trips.personalized_recommendations')}
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
                    <p className="text-lg font-medium text-gray-700 mb-2">{t('trips.no_suggestions_generated')}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {t('trips.create_suggestions_first')}
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      Debug: isGenerating={String(isGenerating)}, suggestions length={aiSuggestions.length}
                    </p>
                    <Button onClick={() => setActiveTab("preferences")} variant="outline">
                      <Bot className="w-4 h-4 mr-2" />
                      {t('trips.go_to_preferences')}
                    </Button>
                  </div>
                )}

                {aiSuggestions.length > 0 && !isGenerating && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
{t('trips.found_suggestions', { count: aiSuggestions.length })}
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
{t('trips.generate_itinerary')}
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
{t('trips.generate_daily_itinerary')}
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
                  {t('trips.daily_itinerary')}
                </CardTitle>
                <CardDescription>
                  {t('trips.detailed_day_by_day_plan')}
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
                    <p className="text-lg font-medium text-gray-700 mb-2">{t('trips.no_itinerary_generated')}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {t('trips.generate_suggestions_first')}
                    </p>
                    <Button onClick={handleGenerateItinerary} variant="outline">
                      <Route className="w-4 h-4 mr-2" />
                      {t('trips.generate_itinerary')}
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: My Itineraries */}
          <TabsContent value="my-itineraries" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Save className="w-6 h-6 mr-2 text-primary" />
                  {t('trips.my_saved_itineraries')}
                </CardTitle>
                <CardDescription>
                  {t('trips.view_manage_itineraries')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isAuthenticated ? (
                  <div className="text-center py-8">
                    <Save className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-700 mb-2">התחבר כדי לראות איטינררים</p>
                    <p className="text-sm text-gray-500 mb-4">
                      צריך להתחבר כדי לגשת לאיטינררים השמורים שלך
                    </p>
                    <Button onClick={() => signInWithGoogle()} variant="outline">
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      התחבר עם Google
                    </Button>
                  </div>
                ) : isLoadingItineraries ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
                    <p className="text-sm text-gray-600">Loading your saved itineraries...</p>
                  </div>
                ) : savedItineraries.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Save className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 mb-2">אין איטינררים שמורים עדיין</p>
                    <p className="text-sm text-gray-500 mb-4">האיטינררים שתשמור יופיעו כאן</p>
                    <Button onClick={() => setActiveTab("itinerary")} variant="outline">
                      <Route className="w-4 h-4 mr-2" />
                      צור איטינררי חדש
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-600">
                        יש לך {savedItineraries.length} איטינררי{savedItineraries.length !== 1 ? 'ם' : ''} שמור{savedItineraries.length !== 1 ? 'ים' : ''}
                      </p>
                      <Badge variant="secondary">{savedItineraries.length}</Badge>
                    </div>

                    {savedItineraries.map((itinerary) => {
                      const planData = itinerary.plan_json as any;
                      return (
                        <Card key={itinerary.id} className="border hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">
                                  <Link href={`/itineraries/${itinerary.id}`} className="hover:text-primary cursor-pointer transition-colors">
                                    {itinerary.title}
                                  </Link>
                                </CardTitle>
                                <p className="text-sm text-gray-500 mt-1">
                                  {t('common.created')} {formatDate(new Date(itinerary.created_at))}
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: My Trips */}
          <TabsContent value="saved" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderOpen className="w-6 h-6 mr-2 text-primary" />
                  {t('trips.my_saved_trips')}
                </CardTitle>
                <CardDescription>
                  {t('trips.view_manage_trips')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSavedTrips && (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-lg font-medium text-gray-700">{t('trips.loading_trips')}</p>
                  </div>
                )}

                {savedTrips.length === 0 && !isLoadingSavedTrips && (
                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-700 mb-2">{t('trips.no_saved_trips')}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {t('trips.create_first_trip_ai')}
                    </p>
                    <Button onClick={() => setActiveTab("preferences")} variant="outline">
                      <Bot className="w-4 h-4 mr-2" />
                      {t('trips.start_planning')}
                    </Button>
                  </div>
                )}

                {savedTrips.length > 0 && !isLoadingSavedTrips && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                      {t('trips.you_have_trips', { count: savedTrips.length })}
                    </p>

                    {savedTrips.map((trip) => (
                      <Card key={trip.id} className="border hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{trip.title}</CardTitle>
                              <p className="text-sm text-gray-500 mt-1">
                                {t('common.created')} {formatDate(new Date(trip.createdAt))}
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
                                {t('common.view')}
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                {t('common.delete')}
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