import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
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
// import { useAuth } from "@/hooks/useAuth"; // Demo mode

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

const interestKeys = [
  "history_culture", "adventure_sports", "nature_wildlife", "food_cuisine",
  "photography", "music_nightlife", "art_museums", "spiritual_wellness",
  "local_communities", "architecture", "festivals_events", "shopping"
];

const travelStyleKeys = [
  "adventure", "cultural", "budget_backpacking", "luxury", "eco_tourism",
  "solo_travel", "family_friendly", "digital_nomad", "volunteer_tourism"
];

const activityKeys = [
  "hiking_trekking", "water_sports", "city_tours", "cooking_classes",
  "dancing_lessons", "wildlife_viewing", "archaeological_sites", "beach_relaxation",
  "mountain_climbing", "river_rafting", "scuba_diving", "cycling_tours"
];

const personalityTraitKeys = [
  "spontaneous", "well_planned", "social_butterfly", "peaceful_explorer",
  "adrenaline_seeker", "culture_enthusiast", "budget_conscious", "luxury_lover",
  "early_riser", "night_owl", "group_leader", "easy_going"
];

const accommodationKeys = ["hostels", "hotels", "guesthouses", "airbnb", "camping", "luxury_resorts"];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
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

  const user = null; // Demo mode - no auth
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
              <CardTitle className="text-2xl">{t('onboarding.step1.title')}</CardTitle>
              <CardDescription>
                {t('onboarding.step1.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {interestKeys.map((interestKey) => (
                  <div key={interestKey} className="flex items-center gap-3 p-4 min-h-[3.5rem] border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Checkbox
                      id={interestKey}
                      checked={preferences.interests.includes(interestKey)}
                      onCheckedChange={(checked) => 
                        handleArrayChange('interests', interestKey, checked as boolean)
                      }
                      className="flex-shrink-0"
                    />
                    <Label htmlFor={interestKey} className="text-base font-medium cursor-pointer break-words whitespace-normal leading-relaxed flex-1">
                      {t(`onboarding.interests.${interestKey}`)}
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
              <CardTitle className="text-2xl">{t('onboarding.step2.title')}</CardTitle>
              <CardDescription>
                {t('onboarding.step2.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {travelStyleKeys.map((styleKey) => (
                  <div key={styleKey} className="flex items-center gap-3 p-4 min-h-[3.5rem] border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Checkbox
                      id={styleKey}
                      checked={preferences.travelStyle.includes(styleKey)}
                      onCheckedChange={(checked) => 
                        handleArrayChange('travelStyle', styleKey, checked as boolean)
                      }
                      className="flex-shrink-0"
                    />
                    <Label htmlFor={styleKey} className="text-base font-medium cursor-pointer break-words whitespace-normal leading-relaxed flex-1">
                      {t(`onboarding.travel_styles.${styleKey}`)}
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
              <CardTitle className="text-2xl">{t('onboarding.step3.title')}</CardTitle>
              <CardDescription>
                {t('onboarding.step3.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="budget">{t('onboarding.budget_range.label')}</Label>
                <Select value={preferences.budgetRange} onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, budgetRange: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder={t('onboarding.budget_range.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">{t('onboarding.budget_range.budget')}</SelectItem>
                    <SelectItem value="mid-range">{t('onboarding.budget_range.mid_range')}</SelectItem>
                    <SelectItem value="luxury">{t('onboarding.budget_range.luxury')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">{t('onboarding.duration.label')}</Label>
                <Select value={preferences.preferredDuration} onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, preferredDuration: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder={t('onboarding.duration.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2 weeks">{t('onboarding.duration.1_2_weeks')}</SelectItem>
                    <SelectItem value="2-4 weeks">{t('onboarding.duration.2_4_weeks')}</SelectItem>
                    <SelectItem value="1-2 months">{t('onboarding.duration.1_2_months')}</SelectItem>
                    <SelectItem value="3+ months">{t('onboarding.duration.3_plus_months')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="group">{t('onboarding.group_size.label')}</Label>
                <Select value={preferences.groupSize} onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, groupSize: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder={t('onboarding.group_size.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">{t('onboarding.group_size.solo')}</SelectItem>
                    <SelectItem value="couple">{t('onboarding.group_size.couple')}</SelectItem>
                    <SelectItem value="small-group">{t('onboarding.group_size.small_group')}</SelectItem>
                    <SelectItem value="large-group">{t('onboarding.group_size.large_group')}</SelectItem>
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
              <CardTitle className="text-2xl">{t('onboarding.step4.title')}</CardTitle>
              <CardDescription>
                {t('onboarding.step4.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {activityKeys.map((activityKey) => (
                  <div key={activityKey} className="flex items-center gap-3 p-4 min-h-[3.5rem] border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Checkbox
                      id={activityKey}
                      checked={preferences.activities.includes(activityKey)}
                      onCheckedChange={(checked) => 
                        handleArrayChange('activities', activityKey, checked as boolean)
                      }
                      className="flex-shrink-0"
                    />
                    <Label htmlFor={activityKey} className="text-base font-medium cursor-pointer break-words whitespace-normal leading-relaxed flex-1">
                      {t(`onboarding.activities.${activityKey}`)}
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
              <CardTitle className="text-2xl">{t('onboarding.step5.title')}</CardTitle>
              <CardDescription>
                {t('onboarding.step5.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="experience">{t('onboarding.experience_level.label')}</Label>
                <Select value={preferences.experienceLevel} onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, experienceLevel: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder={t('onboarding.experience_level.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">{t('onboarding.experience_level.beginner')}</SelectItem>
                    <SelectItem value="intermediate">{t('onboarding.experience_level.intermediate')}</SelectItem>
                    <SelectItem value="experienced">{t('onboarding.experience_level.experienced')}</SelectItem>
                    <SelectItem value="expert">{t('onboarding.experience_level.expert')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('onboarding.personality_traits_label')}</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {personalityTraitKeys.map((traitKey) => (
                    <div key={traitKey} className="flex items-center gap-3 p-4 min-h-[3.5rem] border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <Checkbox
                        id={traitKey}
                        checked={preferences.personalityTraits.includes(traitKey)}
                        onCheckedChange={(checked) => 
                          handleArrayChange('personalityTraits', traitKey, checked as boolean)
                        }
                        className="flex-shrink-0"
                      />
                      <Label htmlFor={traitKey} className="text-base font-medium cursor-pointer break-words whitespace-normal leading-relaxed flex-1">
                        {t(`onboarding.personality_traits.${traitKey}`)}
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
              <CardTitle className="text-2xl">{t('onboarding.step6.title')}</CardTitle>
              <CardDescription>
                {t('onboarding.step6.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="accommodation">{t('onboarding.accommodation.label')}</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {accommodationKeys.map((accommodationKey) => (
                    <div key={accommodationKey} className="flex items-center gap-3 p-4 min-h-[3.5rem] border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <Checkbox
                        id={accommodationKey}
                        checked={preferences.accommodationType.includes(accommodationKey)}
                        onCheckedChange={(checked) => 
                          handleArrayChange('accommodationType', accommodationKey, checked as boolean)
                        }
                        className="flex-shrink-0"
                      />
                      <Label htmlFor={accommodationKey} className="text-base font-medium cursor-pointer break-words whitespace-normal leading-relaxed flex-1">
                        {t(`onboarding.accommodation.${accommodationKey}`)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="bio">{t('onboarding.bio.label')}</Label>
                <Textarea
                  id="bio"
                  placeholder={t('onboarding.bio.placeholder')}
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
            {t('onboarding.step_of', { current: currentStep, total: totalSteps })}
          </h1>
          <Progress value={progressPercent} className="w-full" />
        </div>
      </div>

      {renderStep()}

      <div className="flex gap-4 mt-8">
        <Button variant="outline" onClick={handleSkip}>
          {t('onboarding.skip_for_now')}
        </Button>
        <Button 
          onClick={handleNext} 
          className="min-w-[120px]"
        >
          {currentStep === totalSteps ? t('onboarding.complete_setup') : t('onboarding.next')}
        </Button>
      </div>

      {currentStep > 1 && (
        <Button 
          variant="ghost" 
          onClick={() => setCurrentStep(prev => prev - 1)}
          className="mt-4"
        >
          {t('onboarding.back')}
        </Button>
      )}
    </div>
  );
}