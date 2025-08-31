import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, MapPin, Calendar, Heart, Users, DollarSign } from "lucide-react";
import { SOUTH_AMERICAN_COUNTRIES } from "@/lib/constants";

const registrySchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500, "Bio must be less than 500 characters"),
  currentLocation: z.string().min(2, "Please enter your location"),
  travelStyle: z.string().min(1, "Please select a travel style"),
  preferredDuration: z.string().min(1, "Please select preferred trip duration"),
  budgetRange: z.string().min(1, "Please select your budget range"),
});

type RegistryData = z.infer<typeof registrySchema>;

const travelStyles = [
  { value: "adventure", label: "Adventure Seeker", icon: "🏔️" },
  { value: "cultural", label: "Cultural Explorer", icon: "🏛️" },
  { value: "budget", label: "Budget Backpacker", icon: "🎒" },
  { value: "luxury", label: "Luxury Traveler", icon: "✨" },
  { value: "family", label: "Family Traveler", icon: "👨‍👩‍👧‍👦" },
  { value: "solo", label: "Solo Explorer", icon: "🚶‍♀️" },
  { value: "romantic", label: "Romantic Getaway", icon: "💕" },
  { value: "foodie", label: "Food & Wine", icon: "🍷" },
];

const tripDurations = [
  { value: "weekend", label: "Weekend (2-3 days)" },
  { value: "short", label: "Short Trip (4-7 days)" },
  { value: "medium", label: "Medium Trip (1-2 weeks)" },
  { value: "long", label: "Long Trip (3-4 weeks)" },
  { value: "extended", label: "Extended Travel (1+ months)" },
];

const budgetRanges = [
  { value: "budget", label: "Budget ($500-1,500)", icon: DollarSign },
  { value: "mid", label: "Mid-range ($1,500-3,000)", icon: DollarSign },
  { value: "luxury", label: "Luxury ($3,000+)", icon: DollarSign },
];

export default function Registry() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegistryData>({
    resolver: zodResolver(registrySchema),
    defaultValues: {
      bio: "",
      currentLocation: "",
      travelStyle: "",
      preferredDuration: "",
      budgetRange: "",
    },
  });

  const registryMutation = useMutation({
    mutationFn: async (data: RegistryData) => {
      return apiRequest("/api/user/registry", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          registrationCompleted: true,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Registration Complete!",
        description: "Welcome to TripWise! Let's start planning your South American adventure.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: "There was an error completing your registration. Please try again.",
        variant: "destructive",
      });
      console.error("Registry error:", error);
    },
  });

  const onSubmit = async (data: RegistryData) => {
    setIsSubmitting(true);
    try {
      await registryMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">TripWise</span>
          </div>
          <CardTitle className="text-3xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription className="text-lg">
            Tell us about yourself to get personalized South American travel recommendations
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Bio Section */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-base font-semibold">
                      <User className="h-4 w-4" />
                      About You
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself, your travel experiences, and what excites you about exploring South America..."
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Current Location */}
              <FormField
                control={form.control}
                name="currentLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-base font-semibold">
                      <MapPin className="h-4 w-4" />
                      Current Location
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SOUTH_AMERICAN_COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Travel Style */}
              <FormField
                control={form.control}
                name="travelStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-base font-semibold">
                      <Heart className="h-4 w-4" />
                      Travel Style
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose your travel style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {travelStyles.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            <div className="flex items-center gap-2">
                              <span>{style.icon}</span>
                              <span>{style.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Trip Duration */}
              <FormField
                control={form.control}
                name="preferredDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-base font-semibold">
                      <Calendar className="h-4 w-4" />
                      Preferred Trip Duration
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="How long do you usually travel?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tripDurations.map((duration) => (
                          <SelectItem key={duration.value} value={duration.value}>
                            {duration.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Budget Range */}
              <FormField
                control={form.control}
                name="budgetRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-base font-semibold">
                      <DollarSign className="h-4 w-4" />
                      Budget Range (per trip)
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your typical budget" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {budgetRanges.map((budget) => (
                          <SelectItem key={budget.value} value={budget.value}>
                            <div className="flex items-center gap-2">
                              <budget.icon className="h-4 w-4" />
                              <span>{budget.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Completing Registration..." : "Complete Registration"}
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <Badge variant="outline" className="text-sm">
              🌎 Ready to explore South America? Let's get started!
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}