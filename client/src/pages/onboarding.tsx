import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Heart, DollarSign, Calendar, Compass, Users } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface UserPreferences {
  interests: string[];
  travelStyle: string[];
  budgetRange: string;
  experienceLevel: string;
  groupSize: string;
  preferredDuration: string;
  accommodationType: string[];
  activities: string[];
  dietaryRestrictions: string[];
  languages: string[];
  personalityTraits: string[];
  bio: string;
}

const interests = [
  "History & Culture", "Adventure Sports", "Nature & Wildlife", "Food & Cuisine",
  "Photography", "Music & Nightlife", "Art & Museums", "Spiritual & Wellness",
  "Local Communities", "Architecture", "Festivals & Events", "Shopping"
];

const travelStyles = [
  "Adventure", "Cultural", "Budget Backpacking", "Luxury", "Eco-Tourism",
  "Solo Travel", "Family-Friendly", "Digital Nomad", "Volunteer Tourism"
];

const activities = [
  "Hiking & Trekking", "Water Sports", "City Tours", "Cooking Classes",
  "Dancing Lessons", "Wildlife Viewing", "Archaeological Sites", "Beach Relaxation",
  "Mountain Climbing", "River Rafting", "Scuba Diving", "Cycling Tours"
];

const personalityTraits = [
  "Spontaneous", "Well-Planned", "Social Butterfly", "Peaceful Explorer",
  "Adrenaline Seeker", "Culture Enthusiast", "Budget Conscious", "Luxury Lover",
  "Early Riser", "Night Owl", "Group Leader", "Easy Going"
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    interests: [],
    travelStyle: [],
    budgetRange: "",
    experienceLevel: "",
    groupSize: "",
    preferredDuration: "",
    accommodationType: [],
    activities: [],
    dietaryRestrictions: [],
    languages: [],
    personalityTraits: [],
    bio: ""
  });

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // TODO: Implement proper API integration for saving preferences
  // const savePreferences = useMutation({ ... });

  const totalSteps = 6;
  const progressPercent = (currentStep / totalSteps) * 100;

  const handleArrayChange = (field: keyof UserPreferences, value: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleCompleteSetup();
    }
  };

  const handleSkip = () => {
    // For now, just navigate to home even without saving preferences
    setLocation('/');
  };

  const handleCompleteSetup = async () => {
    console.log('Complete Setup clicked with preferences:', preferences);
    
    try {
      // Save preferences to backend to mark onboarding as complete
      console.log('Saving preferences...');
      await apiRequest('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...preferences,
          onboardingCompleted: true
        })
      });
      
      // Invalidate cache to refetch user data
      queryClient.invalidateQueries({ queryKey: ['/api/user/preferences'] });
      
      // Navigate to home page
      console.log('Attempting navigation to home page...');
      setLocation('/');
      
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Still navigate even if save fails
      setLocation('/');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Heart className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Welcome to TripWise!</CardTitle>
              <CardDescription>
                Let's personalize your South American adventure. What interests you most?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {interests.map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest}
                      checked={preferences.interests.includes(interest)}
                      onCheckedChange={(checked) => 
                        handleArrayChange('interests', interest, checked as boolean)
                      }
                    />
                    <Label htmlFor={interest} className="text-sm font-medium cursor-pointer">
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Compass className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Travel Style</CardTitle>
              <CardDescription>
                How do you like to travel? Select all that apply.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {travelStyles.map((style) => (
                  <div key={style} className="flex items-center space-x-2">
                    <Checkbox
                      id={style}
                      checked={preferences.travelStyle.includes(style)}
                      onCheckedChange={(checked) => 
                        handleArrayChange('travelStyle', style, checked as boolean)
                      }
                    />
                    <Label htmlFor={style} className="text-sm font-medium cursor-pointer">
                      {style}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <DollarSign className="h-12 w-12 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl">Budget & Duration</CardTitle>
              <CardDescription>
                Help us plan the perfect trip for your budget and time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="budget">Budget Range per Trip</Label>
                <Select value={preferences.budgetRange} onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, budgetRange: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget ($500-$1,500)</SelectItem>
                    <SelectItem value="mid-range">Mid-range ($1,500-$3,000)</SelectItem>
                    <SelectItem value="luxury">Luxury ($3,000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Preferred Trip Duration</Label>
                <Select value={preferences.preferredDuration} onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, preferredDuration: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="How long do you like to travel?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                    <SelectItem value="2-4 weeks">2-4 weeks</SelectItem>
                    <SelectItem value="1-2 months">1-2 months</SelectItem>
                    <SelectItem value="3+ months">3+ months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="group">Group Size</Label>
                <Select value={preferences.groupSize} onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, groupSize: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="How many people usually travel with you?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Solo traveler</SelectItem>
                    <SelectItem value="couple">Couple (2 people)</SelectItem>
                    <SelectItem value="small-group">Small group (3-5 people)</SelectItem>
                    <SelectItem value="large-group">Large group (6+ people)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <MapPin className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Favorite Activities</CardTitle>
              <CardDescription>
                What activities make your travels memorable?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {activities.map((activity) => (
                  <div key={activity} className="flex items-center space-x-2">
                    <Checkbox
                      id={activity}
                      checked={preferences.activities.includes(activity)}
                      onCheckedChange={(checked) => 
                        handleArrayChange('activities', activity, checked as boolean)
                      }
                    />
                    <Label htmlFor={activity} className="text-sm font-medium cursor-pointer">
                      {activity}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Your Travel Personality</CardTitle>
              <CardDescription>
                Tell us about your travel style and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="experience">Travel Experience Level</Label>
                <Select value={preferences.experienceLevel} onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, experienceLevel: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="How experienced are you with travel?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-2 trips)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (3-10 trips)</SelectItem>
                    <SelectItem value="experienced">Experienced (10+ trips)</SelectItem>
                    <SelectItem value="expert">Expert (frequent traveler)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Personality Traits</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {personalityTraits.map((trait) => (
                    <div key={trait} className="flex items-center space-x-2">
                      <Checkbox
                        id={trait}
                        checked={preferences.personalityTraits.includes(trait)}
                        onCheckedChange={(checked) => 
                          handleArrayChange('personalityTraits', trait, checked as boolean)
                        }
                      />
                      <Label htmlFor={trait} className="text-sm font-medium cursor-pointer">
                        {trait}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Calendar className="h-12 w-12 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl">Final Details</CardTitle>
              <CardDescription>
                A few more details to perfect your recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="accommodation">Preferred Accommodation</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {["Hostels", "Hotels", "Guesthouses", "Airbnb", "Camping", "Luxury Resorts"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={preferences.accommodationType.includes(type)}
                        onCheckedChange={(checked) => 
                          handleArrayChange('accommodationType', type, checked as boolean)
                        }
                      />
                      <Label htmlFor={type} className="text-sm font-medium cursor-pointer">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Tell us about yourself (optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="What makes you excited about traveling to South America? Any specific goals or dreams?"
                  value={preferences.bio}
                  onChange={(e) => setPreferences(prev => ({ ...prev, bio: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mb-8">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Step {currentStep} of {totalSteps}
          </h1>
          <Progress value={progressPercent} className="w-full" />
        </div>
      </div>

      {renderStep()}

      <div className="flex gap-4 mt-8">
        <Button variant="outline" onClick={handleSkip}>
          Skip for now
        </Button>
        <Button 
          onClick={handleNext} 
          className="min-w-[120px]"
        >
          {currentStep === totalSteps ? "Complete Setup" : "Next"}
        </Button>
      </div>
      
      <div className="mt-4 text-center">
        <Button 
          variant="ghost" 
          onClick={() => window.open('/landing', '_blank')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          View Landing Page
        </Button>
      </div>

      {currentStep > 1 && (
        <Button 
          variant="ghost" 
          onClick={() => setCurrentStep(prev => prev - 1)}
          className="mt-4"
        >
          Back
        </Button>
      )}
    </div>
  );
}