import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useIntlFormatters } from "@/lib/intlFormatters";
import { 
  Trophy, 
  Target, 
  Medal, 
  Crown, 
  Calendar,
  Clock,
  Star,
  Gift,
  TrendingUp,
  Users,
  ChevronRight,
  Plus,
  CheckCircle,
  Camera,
  MessageSquare,
  Heart,
  MapPin,
  Award,
  Zap,
  Check
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import * as rewardsService from "@/services/rewardsService";
import { POINT_VALUES } from "@/services/rewardsService";

// Helper function to calculate level from points
const calculateLevel = (totalPoints: number) => {
  if (totalPoints < 100) return 1;
  if (totalPoints < 300) return 2;
  if (totalPoints < 700) return 3;
  if (totalPoints < 1500) return 4;
  return 5;
};

const getPointsToNextLevel = (totalPoints: number) => {
  const level = calculateLevel(totalPoints);
  const thresholds = [0, 100, 300, 700, 1500, Infinity];
  return thresholds[level] - totalPoints;
};

const getLevelName = (level: number, t: any) => {
  const names = [t('achievements.levels.beginner'), t('achievements.levels.explorer'), t('achievements.levels.wanderer'), t('achievements.levels.travel_expert'), t('achievements.levels.globetrotter')];
  return names[level - 1] || t('achievements.levels.globetrotter');
};

export default function Achievements() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { formatNumber, formatShortDate } = useIntlFormatters();

  // Fetch user points summary
  const { data: pointsSummary, isLoading: pointsLoading } = useQuery({
    queryKey: ["rewards", "summary"],
    queryFn: rewardsService.fetchMySummary,
    enabled: !!user,
  });

  // Fetch user achievements
  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ["rewards", "achievements"],
    queryFn: rewardsService.fetchMyAchievements,
    enabled: !!user,
  });

  // Fetch catalog achievements for Badges tab
  const { data: catalogAchievements, isLoading: catalogLoading } = useQuery({
    queryKey: ["rewards", "catalog"],
    queryFn: rewardsService.fetchCatalogAchievements,
    enabled: !!user,
  });

  // Fetch missions
  const { data: missions, isLoading: missionsLoading } = useQuery({
    queryKey: ["rewards", "missions"],
    queryFn: rewardsService.fetchMissions,
    enabled: !!user,
  });

  // Fetch leaderboard
  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["rewards", "leaderboard"],
    queryFn: () => rewardsService.fetchLeaderboard30d(10),
    enabled: !!user,
  });

  // Fetch points history
  const { data: pointsHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["rewards", "history"],
    queryFn: () => rewardsService.fetchMyPointsHistory(50),
    enabled: !!user,
  });

  // Weekly points from ledger (last 7 days)
  const { data: weeklyPoints } = useQuery({
    queryKey: ["rewards", "weekly-points"],
    queryFn: () => rewardsService.fetchWeeklyPoints(),
    enabled: !!user,
  });

  // Unlocked badges count
  const { data: unlockedBadgesCount } = useQuery({
    queryKey: ["rewards", "unlocked-badges-count"],
    queryFn: () => rewardsService.fetchUnlockedBadgesCount(),
    enabled: !!user,
  });

  // Achievement values from single source of truth
  const { data: dailyCheckinValue } = useQuery({
    queryKey: ["achievement-value", "daily.checkin"],
    queryFn: () => rewardsService.getAchievementValue("daily.checkin"),
    enabled: !!user,
  });

  const { data: reviewValue } = useQuery({
    queryKey: ["achievement-value", "review.create"],
    queryFn: () => rewardsService.getAchievementValue("review.create"),
    enabled: !!user,
  });

  const { data: photoValue } = useQuery({
    queryKey: ["achievement-value", "photo.upload"],
    queryFn: () => rewardsService.getAchievementValue("photo.upload"),
    enabled: !!user,
  });

  const { data: itineraryValue } = useQuery({
    queryKey: ["achievement-value", "itinerary.share"],
    queryFn: () => rewardsService.getAchievementValue("itinerary.share"),
    enabled: !!user,
  });

  // Helper function to show mission progress toasts
  const showMissionProgressToast = (result: any) => {
    if (!result) {
      toast({
        title: t('achievements.error_saving_progress'),
        description: t('achievements.please_try_again'),
        variant: "destructive",
      });
      return;
    }

    if (result.already_credited) {
      toast({
        title: t('achievements.already_credited_for_period'),
        description: t('achievements.already_completed_mission'),
        variant: "default",
        className: "border-gray-300 bg-gray-50 text-gray-900",
      });
      return;
    }

    if (result.completed) {
      // Mission completion toast
      toast({
        title: t('achievements.mission_complete'),
        description: `${result.mission_name} (+${result.awarded_points} pts)`,
        variant: "default",
        className: "border-green-300 bg-green-50 text-green-900",
      });
    } else {
      // Progress increment toast
      toast({
        title: t('achievements.progress_saved'),
        description: `${result.mission_name} — ${result.current_progress} / ${result.target_progress}${result.awarded_points > 0 ? ` (+${result.awarded_points} pts)` : ''}`,
        variant: "default",
        className: "border-blue-300 bg-blue-50 text-blue-900",
      });
    }
  };

  // Daily check-in mutation with mission progress tracking
  const dailyCheckInMutation = useMutation({
    mutationFn: rewardsService.trackDailyCheckIn,
    onSuccess: (result) => {
      showMissionProgressToast(result);
      
      // Refresh all relevant queries for consistency
      queryClient.invalidateQueries({ queryKey: ["rewards", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["rewards", "weekly-points"] });
      queryClient.invalidateQueries({ queryKey: ["rewards", "unlocked-badges-count"] });
      queryClient.invalidateQueries({ queryKey: ["rewards", "history"] });
      queryClient.invalidateQueries({ queryKey: ["achievement-value"] });
    },
    onError: (error) => {
      toast({
        title: t('achievements.checkin_error'),
        description: t('achievements.error_saving_progress_try_again'),
        variant: "destructive",
      });
    },
  });

  // Mission-based mutations for quick actions
  const awardReviewPointsMutation = useMutation({
    mutationFn: () => rewardsService.trackReviewCreation(
      `demo-review-${Date.now()}`, 
      "demo-place-123"
    ),
    onSuccess: (result) => {
      showMissionProgressToast(result);
      // Refresh all relevant queries for consistency
      queryClient.invalidateQueries({ queryKey: ["rewards", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["rewards", "weekly-points"] });
      queryClient.invalidateQueries({ queryKey: ["rewards", "unlocked-badges-count"] });
      queryClient.invalidateQueries({ queryKey: ["rewards", "history"] });
      queryClient.invalidateQueries({ queryKey: ["achievement-value"] });
    },
    onError: () => {
      toast({
        title: t('achievements.error_saving_progress'),
        description: t('achievements.please_try_again'),
        variant: "destructive",
      });
    },
  });

  const awardPhotoPointsMutation = useMutation({
    mutationFn: () => rewardsService.trackPhotoUpload(
      `demo-photo-${Date.now()}`, 
      "demo-place-456"
    ),
    onSuccess: (result) => {
      showMissionProgressToast(result);
      // Refresh all relevant queries for consistency
      queryClient.invalidateQueries({ queryKey: ["rewards", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["rewards", "weekly-points"] });
      queryClient.invalidateQueries({ queryKey: ["rewards", "unlocked-badges-count"] });
      queryClient.invalidateQueries({ queryKey: ["rewards", "history"] });
      queryClient.invalidateQueries({ queryKey: ["achievement-value"] });
    },
    onError: () => {
      toast({
        title: t('achievements.error_saving_progress'),
        description: t('achievements.please_try_again'),
        variant: "destructive",
      });
    },
  });

  const awardItineraryPointsMutation = useMutation({
    mutationFn: () => rewardsService.trackItineraryShare(
      `demo-itinerary-${Date.now()}`
    ),
    onSuccess: (result) => {
      showMissionProgressToast(result);
      // Refresh all relevant queries for consistency
      queryClient.invalidateQueries({ queryKey: ["rewards", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["rewards", "weekly-points"] });
      queryClient.invalidateQueries({ queryKey: ["rewards", "unlocked-badges-count"] });
      queryClient.invalidateQueries({ queryKey: ["rewards", "history"] });
      queryClient.invalidateQueries({ queryKey: ["achievement-value"] });
    },
    onError: () => {
      toast({
        title: t('achievements.error_saving_progress'),
        description: t('achievements.please_try_again'),
        variant: "destructive",
      });
    },
  });

  // Authentication check
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50" dir="ltr">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] min-h-screen">
          <div className="p-6">
            <Card className="text-center max-w-md mx-auto mt-20">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Trophy className="w-8 h-8 text-orange-500" />
                  {t('achievements.title')}
                </CardTitle>
                <CardDescription>
                  {t('achievements.sign_in_to_save_progress')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => window.location.href = '/api/auth/google'}>
                  {t('auth.sign_in_with_google')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const totalPoints = (pointsSummary as any)?.totalPoints || 0;
  const currentLevel = calculateLevel(totalPoints);
  const pointsToNext = getPointsToNextLevel(totalPoints);
  const levelName = getLevelName(currentLevel, t);

  // Mock mission progress for demo (in real app, this would come from user_mission_progress table)
  const mockMissionProgress = {
    'write-3-reviews': { current: 1, max: 3 },
    'upload-10-photos': { current: 3, max: 10 },
    'share-itinerary': { current: 2, max: 5 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50" dir="ltr">
      {/* Two-column layout: Main content + Right sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] min-h-screen">
        
        {/* Main Content Area */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Trophy className="w-10 h-10 text-orange-500" />
              {t('achievements.title')}
            </h1>
            <p className="text-gray-600 text-lg">{t('achievements.subtitle')}</p>
          </div>

          {/* Quick Actions Bar */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                {t('achievements.quick_actions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 overflow-x-auto pb-2">
                <Button 
                  onClick={() => dailyCheckInMutation.mutate()}
                  disabled={dailyCheckInMutation.isPending}
                  variant="outline"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Calendar className="w-4 h-4" />
                  {dailyCheckInMutation.isPending ? t('achievements.checking_in') : 
                    dailyCheckinValue ? 
                      `${t(dailyCheckinValue.label)} (+${dailyCheckinValue.points} ${t('common.points_short', {defaultValue: 'pts'})})` :
                      t('achievements.daily_checkin_default', { points: POINT_VALUES.DAILY_CHECKIN })
                  }
                </Button>
                
                <Button 
                  onClick={() => awardReviewPointsMutation.mutate()}
                  disabled={awardReviewPointsMutation.isPending}
                  variant="outline"
                  className="flex items-center gap-2 whitespace-nowrap"
                  aria-label="Track review writing progress"
                >
                  <MessageSquare className="w-4 h-4" />
                  {awardReviewPointsMutation.isPending ? t('achievements.tracking') : 
                    reviewValue ? 
                      `${t(reviewValue.label)} (+${reviewValue.points} ${t('common.points_short', {defaultValue: 'pts'})})` :
                      t('achievements.write_review_default', { points: POINT_VALUES.WRITE_REVIEW })
                  }
                </Button>
                
                <Button 
                  onClick={() => awardPhotoPointsMutation.mutate()}
                  disabled={awardPhotoPointsMutation.isPending}
                  variant="outline"
                  className="flex items-center gap-2 whitespace-nowrap"
                  aria-label="Track photo upload progress"
                >
                  <Camera className="w-4 h-4" />
                  {awardPhotoPointsMutation.isPending ? t('achievements.tracking') : 
                    photoValue ? 
                      `${t(photoValue.label)} (+${photoValue.points} ${t('common.points_short', {defaultValue: 'pts'})})` :
                      t('achievements.upload_photo_default', { points: POINT_VALUES.UPLOAD_PHOTO })
                  }
                </Button>
                
                <Button 
                  onClick={() => awardItineraryPointsMutation.mutate()}
                  disabled={awardItineraryPointsMutation.isPending}
                  variant="outline"
                  className="flex items-center gap-2 whitespace-nowrap"
                  aria-label="Track itinerary sharing progress"
                >
                  <MapPin className="w-4 h-4" />
                  {awardItineraryPointsMutation.isPending ? t('achievements.tracking') : 
                    itineraryValue ? 
                      `${t(itineraryValue.label)} (+${itineraryValue.points} ${t('common.points_short', {defaultValue: 'pts'})})` :
                      t('achievements.share_itinerary_default', { points: POINT_VALUES.SHARE_ITINERARY })
                  }
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="overflow-x-auto">
              <TabsList className="inline-flex w-auto min-w-full justify-evenly h-10">
                <TabsTrigger value="overview" className="whitespace-nowrap">{t('achievements.overview')}</TabsTrigger>
                <TabsTrigger value="missions" className="whitespace-nowrap">{t('achievements.missions')}</TabsTrigger>
                <TabsTrigger value="badges" className="whitespace-nowrap">{t('achievements.badges')}</TabsTrigger>
                <TabsTrigger value="leaderboard" className="whitespace-nowrap">{t('achievements.leaderboard')}</TabsTrigger>
                <TabsTrigger value="history" className="whitespace-nowrap">{t('achievements.history')}</TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* User Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* My Balance */}
                <Card className="bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                      <Star className="w-5 h-5" />
                      {t('achievements.my_balance')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-3xl font-bold text-orange-900">{totalPoints.toLocaleString()} pts</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-orange-700">
                          <span>{t('achievements.level_with_name', { level: currentLevel, name: levelName })}</span>
                          <span>{pointsToNext > 0 ? t('achievements.points_to_next', { points: pointsToNext }) : t('achievements.max_level')}</span>
                        </div>
                        {pointsToNext > 0 && (
                          <Progress 
                            value={((totalPoints % 100) / 100) * 100} 
                            className="h-2 bg-orange-200"
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Unlocked Badges */}
                <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                      <Medal className="w-5 h-5" />
                      {t('achievements.unlocked_badges')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-900 mb-2">
                      {unlockedBadgesCount || 0}
                    </div>
                    <p className="text-blue-700 text-sm">{t('achievements.achievements_completed')}</p>
                  </CardContent>
                </Card>

                {/* Current Rank */}
                <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
                      <Crown className="w-5 h-5" />
                      {t('achievements.current_rank')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-900 mb-2">#1</div>
                    <p className="text-purple-700 text-sm">{t('achievements.this_month')}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    {t('achievements.recent_activity')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-green-900">{t('achievements.points_this_week')}</h4>
                          <p className="text-2xl font-bold text-green-700">
                            {weeklyPoints > 0 ? `+${weeklyPoints}` : weeklyPoints || 0}
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-500" />
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-blue-900">{t('achievements.badges_unlocked')}</h4>
                          <p className="text-2xl font-bold text-blue-700">{unlockedBadgesCount || 0}</p>
                        </div>
                        <Medal className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Missions Tab */}
            <TabsContent value="missions" className="space-y-6">
              {/* Daily Missions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    {t('achievements.daily_missions')}
                  </CardTitle>
                  <CardDescription>{t('achievements.reset_daily')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Daily Check-in Mission */}
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-200 rounded-full">
                            <Calendar className="w-5 h-5 text-orange-700" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{t('achievements.daily_checkin')}</h4>
                            <p className="text-sm text-gray-600">{t('achievements.daily_checkin_description')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-600">+5</div>
                          <div className="text-sm text-gray-500">{t('achievements.points')}</div>
                        </div>
                      </div>
                    </div>

                    {/* Additional daily missions from DB */}
                    {(missions as any)?.filter?.((m: any) => m.type === 'daily')?.map?.((mission: any) => (
                      <div key={mission.id} className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-200 rounded-full">
                              <Target className="w-5 h-5 text-orange-700" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{mission.name}</h4>
                              <p className="text-sm text-gray-600">{mission.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-orange-600">+{mission.pointsReward}</div>
                            <div className="text-sm text-gray-500">{t('achievements.points')}</div>
                          </div>
                        </div>
                      </div>
                    )) || []}
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Missions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Weekly Missions
                  </CardTitle>
                  <CardDescription>Reset every Monday</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Weekly Mission: Write 3 Reviews */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-200 rounded-full">
                          <MessageSquare className="w-5 h-5 text-blue-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">Write 3 Reviews</h4>
                              <p className="text-sm text-gray-600">Share your travel experiences with others</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">+100</div>
                              <div className="text-sm text-gray-500">{t('achievements.points')}</div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-700">{t('achievements.progress')}</span>
                              <span className="text-blue-900 font-semibold">
                                {mockMissionProgress['write-3-reviews'].current} / {mockMissionProgress['write-3-reviews'].max}
                              </span>
                            </div>
                            <Progress 
                              value={(mockMissionProgress['write-3-reviews'].current / mockMissionProgress['write-3-reviews'].max) * 100} 
                              className="h-3"
                            />
                            <div className="text-xs text-blue-600">
                              {mockMissionProgress['write-3-reviews'].current >= mockMissionProgress['write-3-reviews'].max 
                                ? t('achievements.completed') 
                                : `${mockMissionProgress['write-3-reviews'].max - mockMissionProgress['write-3-reviews'].current} more reviews needed`
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Weekly Mission: Upload 10 Photos */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-200 rounded-full">
                          <Camera className="w-5 h-5 text-purple-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{t('achievements.upload_10_photos')}</h4>
                              <p className="text-sm text-gray-600">{t('achievements.share_amazing_photos')}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-purple-600">+75</div>
                              <div className="text-sm text-gray-500">{t('achievements.points')}</div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-purple-700">{t('achievements.progress')}</span>
                              <span className="text-purple-900 font-semibold">
                                {mockMissionProgress['upload-10-photos'].current} / {mockMissionProgress['upload-10-photos'].max}
                              </span>
                            </div>
                            <Progress 
                              value={(mockMissionProgress['upload-10-photos'].current / mockMissionProgress['upload-10-photos'].max) * 100} 
                              className="h-3"
                            />
                            <div className="text-xs text-purple-600">
                              {mockMissionProgress['upload-10-photos'].current >= mockMissionProgress['upload-10-photos'].max 
                                ? t('achievements.completed') 
                                : `${mockMissionProgress['upload-10-photos'].max - mockMissionProgress['upload-10-photos'].current} more photos needed`
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Weekly Mission: Share 5 Itineraries */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-200 rounded-full">
                          <MapPin className="w-5 h-5 text-green-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{t('achievements.share_5_itineraries')}</h4>
                              <p className="text-sm text-gray-600">{t('achievements.help_others_plan')}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">+150</div>
                              <div className="text-sm text-gray-500">{t('achievements.points')}</div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-green-700">{t('achievements.progress')}</span>
                              <span className="text-green-900 font-semibold">
                                {mockMissionProgress['share-itinerary'].current} / {mockMissionProgress['share-itinerary'].max}
                              </span>
                            </div>
                            <Progress 
                              value={(mockMissionProgress['share-itinerary'].current / mockMissionProgress['share-itinerary'].max) * 100} 
                              className="h-3"
                            />
                            <div className="text-xs text-green-600">
                              {mockMissionProgress['share-itinerary'].current >= mockMissionProgress['share-itinerary'].max 
                                ? t('achievements.completed') 
                                : `${mockMissionProgress['share-itinerary'].max - mockMissionProgress['share-itinerary'].current} more shares needed`
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional weekly missions from DB */}
                    {(missions as any)?.filter?.((m: any) => m.type === 'weekly')?.map?.((mission: any) => (
                      <div key={mission.id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-200 rounded-full">
                              <Target className="w-5 h-5 text-blue-700" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{mission.name}</h4>
                              <p className="text-sm text-gray-600">{mission.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">+{mission.pointsReward}</div>
                            <div className="text-sm text-gray-500">{t('achievements.points')}</div>
                          </div>
                        </div>
                      </div>
                    )) || []}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Badges Tab */}
            <TabsContent value="badges" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category: Travel */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="w-5 h-5 text-green-500" />
                      {t('achievements.travel_badges')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(achievements as any)?.unlocked?.filter?.((ua: any) => ua.achievement?.category === 'travel')?.map?.((userAchievement: any) => (
                      <div key={userAchievement.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-semibold text-green-900">{userAchievement.achievement.name}</div>
                          <div className="text-sm text-green-700">+{userAchievement.achievement.points} pts</div>
                        </div>
                      </div>
                    )) || []}
                    
                    {/* Default badges if none from DB */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <Target className="w-5 h-5 text-gray-600" />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{t('achievements.first_trip')}</div>
                        <div className="text-sm text-gray-700">{t('achievements.plan_first_trip')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Category: Social */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="w-5 h-5 text-blue-500" />
                      {t('achievements.social_badges')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <Target className="w-5 h-5 text-gray-600" />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{t('achievements.helpful_reviewer')}</div>
                        <div className="text-sm text-gray-700">{t('achievements.write_5_helpful_reviews')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    {t('achievements.top_travelers_30_days')}
                  </CardTitle>
                  <CardDescription>{t('achievements.see_how_you_rank')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(leaderboard as any)?.map?.((entry: any, index: number) => (
                      <div key={entry.userId} className={`flex items-center gap-4 p-4 rounded-lg border ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' :
                        index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200' :
                        index === 2 ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200' :
                        'bg-white border-gray-200'
                      }`}>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-400 text-gray-900' :
                          index === 2 ? 'bg-orange-400 text-orange-900' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {index < 3 ? ['🥇', '🥈', '🥉'][index] : entry.rank}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {entry.user?.firstName && entry.user?.lastName 
                              ? `${entry.user.firstName} ${entry.user.lastName}`
                              : entry.user?.email?.split('@')[0] || t('achievements.anonymous_user')
                            }
                          </div>
                          <div className="text-sm text-gray-600">Level {calculateLevel(entry.totalPoints)} • {getLevelName(calculateLevel(entry.totalPoints), t)}</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{entry.totalPoints.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{t('achievements.points')}</div>
                        </div>
                      </div>
                    )) || []}
                    
                    {/* Empty state */}
                    {!(leaderboard as any)?.length && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p>{t('achievements.no_leaderboard_data')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    {t('achievements.points_history')}
                  </CardTitle>
                  <CardDescription>{t('achievements.recent_point_activities')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(pointsHistory as any)?.map?.((entry: any) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <div className="font-semibold text-gray-900">{entry.description || entry.action}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(entry.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <div className={`text-lg font-bold ${entry.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {entry.points > 0 ? '+' : ''}{formatNumber(entry.points)}
                        </div>
                      </div>
                    )) || []}
                    
                    {/* Empty state */}
                    {!(pointsHistory as any)?.length && (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p>{t('achievements.no_activity_history')}</p>
                        <p className="text-sm">{t('achievements.start_earning_to_see_history')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="bg-white/90 backdrop-blur-sm border-l border-gray-200 p-6 space-y-6">
          {/* User Profile Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-500" />
                {t('achievements.my_profile')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h3 className="font-semibold text-gray-900">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                </h3>
                <p className="text-sm text-gray-600">{t('achievements.level')} {currentLevel} • {levelName}</p>
              </div>
              
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">{t('achievements.total_points')}</span>
                  <span className="font-semibold text-orange-600">{formatNumber(totalPoints)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">{t('achievements.badges_unlocked')}</span>
                  <span className="font-semibold text-blue-600">{(achievements as any)?.unlocked?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('achievements.current_rank')}</span>
                  <span className="font-semibold text-purple-600">#1</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                {t('achievements.this_week')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('achievements.points_earned')}</span>
                  <span className="font-semibold text-green-600">+{formatNumber(weeklyPoints || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('achievements.missions_completed')}</span>
                  <span className="font-semibold text-blue-600">{(missions as any)?.filter((m: any) => m.completed_at)?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('achievements.rank_change')}</span>
                  <span className="font-semibold text-orange-600">↑ 2</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Level Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                {t('achievements.level_progress')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('achievements.level')} {currentLevel}</span>
                  <span className="text-gray-900 font-semibold">{t('achievements.level')} {currentLevel + 1}</span>
                </div>
                {pointsToNext > 0 ? (
                  <>
                    <Progress value={((totalPoints % 100) / 100) * 100} className="h-3" />
                    <p className="text-sm text-gray-600 text-center">
                      {formatNumber(pointsToNext)} {t('achievements.points_to_next_level')}
                    </p>
                  </>
                ) : (
                  <div className="text-center">
                    <Crown className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                    <p className="text-sm font-semibold text-yellow-700">{t('achievements.max_level_reached')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}