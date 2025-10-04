import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Clock, DollarSign, Users, Compass } from "lucide-react";
import { useLocation } from "wouter";

interface PersonalizedRecommendationsProps {
  className?: string;
}

export default function PersonalizedRecommendations({ className }: PersonalizedRecommendationsProps) {
  const [, setLocation] = useLocation();
  
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['/api/user/preferences'],
    enabled: true
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!preferences?.onboardingCompleted) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-blue-600" />
            Welcome to GlobeMate!
          </CardTitle>
          <CardDescription>
            Complete your profile to get personalized South American travel recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setLocation('/onboarding')} className="w-full">
            Complete Setup
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Generate recommendations based on user preferences
  const getPersonalizedDestinations = () => {
    const userInterests = preferences.interests || [];
    const userBudget = preferences.budgetRange || 'mid-range';
    const userStyle = preferences.travelStyles || [];

    const destinations = [
      {
        name: "Machu Picchu, Peru",
        match: userInterests.includes("History & Culture") || userInterests.includes("Adventure Sports"),
        reason: "Ancient Inca ruins + hiking",
        budget: userBudget === 'budget' ? '$800-1200' : '$1200-2000',
        duration: "7-10 days",
        activities: ["Inca Trail trekking", "Sacred Valley tour", "Lima food scene"],
        icon: "🏔️"
      },
      {
        name: "Cartagena, Colombia",
        match: userInterests.includes("History & Culture") || userInterests.includes("Music & Nightlife"),
        reason: "Colonial architecture + vibrant nightlife",
        budget: userBudget === 'budget' ? '$600-1000' : '$1000-1500',
        duration: "5-7 days",
        activities: ["Old city walking tour", "Salsa dancing", "Caribbean beaches"],
        icon: "🏰"
      },
      {
        name: "Salar de Uyuni, Bolivia",
        match: userInterests.includes("Photography") || userInterests.includes("Nature & Wildlife"),
        reason: "World's largest salt flat + stargazing",
        budget: userBudget === 'budget' ? '$400-800' : '$800-1200',
        duration: "3-5 days",
        activities: ["Salt flat tours", "Flamingo watching", "Stargazing"],
        icon: "✨"
      },
      {
        name: "Patagonia, Chile/Argentina",
        match: userInterests.includes("Adventure Sports") || userInterests.includes("Nature & Wildlife"),
        reason: "Epic hiking + glacier viewing",
        budget: userBudget === 'budget' ? '$1000-1500' : '$1500-2500',
        duration: "10-14 days",
        activities: ["Torres del Paine", "Glacier trekking", "Wildlife spotting"],
        icon: "🏔️"
      }
    ];

    return destinations.filter(dest => dest.match).slice(0, 3);
  };

  const personalizedDestinations = getPersonalizedDestinations();

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Personalized for You
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Based on your interests: {preferences.interests?.slice(0, 3).join(", ")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personalizedDestinations.map((destination, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="text-2xl">{destination.icon}</span>
                {destination.name}
              </CardTitle>
              <CardDescription>{destination.reason}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {destination.budget}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {destination.duration}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium text-sm">Recommended Activities:</p>
                <div className="flex flex-wrap gap-2">
                  {destination.activities.map((activity, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {activity}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => setLocation('/my-trips')} 
                className="w-full"
                size="sm"
              >
                Plan This Trip
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {personalizedDestinations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Compass className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Discover Your Next Adventure
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Update your preferences to get personalized destination recommendations
            </p>
            <Button onClick={() => setLocation('/onboarding')}>
              Update Preferences
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium text-blue-900 dark:text-blue-100">
            Your Travel Profile
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-700 dark:text-blue-300 font-medium">Budget:</span>
            <p className="text-blue-900 dark:text-blue-100 capitalize">
              {preferences.budgetRange || 'Not set'}
            </p>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300 font-medium">Duration:</span>
            <p className="text-blue-900 dark:text-blue-100">
              {preferences.preferredDuration || 'Not set'}
            </p>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300 font-medium">Group:</span>
            <p className="text-blue-900 dark:text-blue-100 capitalize">
              {preferences.groupSize || 'Not set'}
            </p>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300 font-medium">Experience:</span>
            <p className="text-blue-900 dark:text-blue-100 capitalize">
              {preferences.experienceLevel || 'Not set'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}