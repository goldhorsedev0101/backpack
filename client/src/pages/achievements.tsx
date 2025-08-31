import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import AchievementBadge from "@/components/achievement-badge";
import { 
  Trophy, 
  Award, 
  Target, 
  Star, 
  TrendingUp, 
  Users, 
  MapPin, 
  DollarSign,
  Sparkles,
  Crown,
  Medal,
  Gift,
  Zap,
  Calendar,
  Activity
} from "lucide-react";

export default function Achievements() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showNewAchievements, setShowNewAchievements] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allAchievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ["/api/achievements"]
  });

  const { data: userAchievementData, isLoading: userAchievementsLoading } = useQuery({
    queryKey: ["/api/achievements/user"],
    refetchInterval: 30000 // Check for new achievements every 30 seconds
  });

  const userAchievements = userAchievementData?.userAchievements || [];
  const newlyUnlocked = userAchievementData?.newlyUnlocked || [];

  const checkAchievementsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/achievements/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: (data) => {
      if (data.count > 0) {
        setShowNewAchievements(true);
        toast({
          title: "New Achievement Unlocked!",
          description: `You've unlocked ${data.count} new achievement${data.count > 1 ? 's' : ''}!`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/achievements/user"] });
    },
    onError: (error) => {
      if (!isUnauthorizedError(error)) {
        console.error("Error checking achievements:", error);
      }
    },
  });

  const initAchievementsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/achievements/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      toast({
        title: "Success",
        description: "Achievement system initialized successfully",
      });
    },
  });

  // Auto-check for new achievements when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!userAchievementsLoading) {
        checkAchievementsMutation.mutate();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const unlockedAchievementIds = new Set(userAchievements.map((ua: any) => ua.achievementId));
  
  const categorizedAchievements = allAchievements.reduce((acc: any, achievement: any) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {});

  const categories = Object.keys(categorizedAchievements);
  
  const filteredAchievements = selectedCategory === "all" 
    ? allAchievements 
    : categorizedAchievements[selectedCategory] || [];

  const totalPoints = userAchievements.reduce((sum: number, ua: any) => 
    ua.isCompleted ? sum + (ua.achievement?.points || 0) : sum, 0
  );

  const unlockedCount = userAchievements.filter((ua: any) => ua.isCompleted).length;
  const totalAchievements = allAchievements.length;
  const completionPercentage = totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0;

  const rarityStats = userAchievements
    .filter((ua: any) => ua.isCompleted)
    .reduce((acc: any, ua: any) => {
      const rarity = ua.achievement?.rarity || 'common';
      acc[rarity] = (acc[rarity] || 0) + 1;
      return acc;
    }, {});

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4 flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-500" />
            Travel Achievements
          </h1>
          <p className="text-lg text-gray-600">Track your South American travel journey and earn badges</p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button 
            onClick={() => checkAchievementsMutation.mutate()}
            disabled={checkAchievementsMutation.isPending}
            className="bg-primary hover:bg-orange-600"
          >
            <Zap className="w-4 h-4 mr-2" />
            {checkAchievementsMutation.isPending ? "Checking..." : "Check Progress"}
          </Button>
          
          {allAchievements.length === 0 && (
            <Button 
              onClick={() => initAchievementsMutation.mutate()}
              disabled={initAchievementsMutation.isPending}
              variant="outline"
            >
              <Gift className="w-4 h-4 mr-2" />
              {initAchievementsMutation.isPending ? "Initializing..." : "Initialize Achievements"}
            </Button>
          )}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              All Badges
            </TabsTrigger>
            <TabsTrigger value="unlocked" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Unlocked
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Progress
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Points */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Points</p>
                      <p className="text-2xl font-bold text-yellow-600">{totalPoints}</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Achievements Unlocked */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Unlocked</p>
                      <p className="text-2xl font-bold text-green-600">{unlockedCount}/{totalAchievements}</p>
                    </div>
                    <Trophy className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Completion Percentage */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Completion</p>
                      <p className="text-2xl font-bold text-blue-600">{completionPercentage.toFixed(1)}%</p>
                    </div>
                    <Target className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Rarest Achievement */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Rarest Unlocked</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {rarityStats.legendary ? 'Legendary' : rarityStats.epic ? 'Epic' : rarityStats.rare ? 'Rare' : 'Common'}
                      </p>
                    </div>
                    <Crown className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                  Achievement Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Completion</span>
                      <span>{unlockedCount}/{totalAchievements} achievements</span>
                    </div>
                    <Progress value={completionPercentage} className="h-3" />
                  </div>
                  
                  {categories.map((category) => {
                    const categoryAchievements = categorizedAchievements[category];
                    const categoryUnlocked = categoryAchievements.filter((a: any) => 
                      unlockedAchievementIds.has(a.id)
                    ).length;
                    const categoryPercentage = (categoryUnlocked / categoryAchievements.length) * 100;
                    
                    return (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="capitalize">{category}</span>
                          <span>{categoryUnlocked}/{categoryAchievements.length}</span>
                        </div>
                        <Progress value={categoryPercentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Medal className="w-5 h-5 mr-2 text-primary" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userAchievements.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {userAchievements
                      .filter((ua: any) => ua.isCompleted)
                      .slice(0, 6)
                      .map((ua: any) => (
                        <AchievementBadge
                          key={ua.id}
                          achievement={ua.achievement}
                          isUnlocked={true}
                          size="md"
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No Achievements Yet</h3>
                    <p className="text-gray-500">Start planning trips and tracking expenses to earn your first badges!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Badges Tab */}
          <TabsContent value="all" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredAchievements.map((achievement: any) => (
                <div key={achievement.id} className="flex flex-col items-center">
                  <AchievementBadge
                    achievement={achievement}
                    isUnlocked={unlockedAchievementIds.has(achievement.id)}
                    size="lg"
                    showDetails={true}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Unlocked Tab */}
          <TabsContent value="unlocked" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Your Earned Achievements
              </h2>
              <p className="text-gray-600">
                You've unlocked {unlockedCount} out of {totalAchievements} achievements
              </p>
            </div>

            {unlockedCount > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {userAchievements
                  .filter((ua: any) => ua.isCompleted)
                  .map((ua: any) => (
                    <div key={ua.id} className="flex flex-col items-center">
                      <AchievementBadge
                        achievement={ua.achievement}
                        isUnlocked={true}
                        size="lg"
                        showDetails={true}
                      />
                      <div className="mt-3 text-center">
                        <Badge variant="outline" className="text-xs">
                          Unlocked {new Date(ua.unlockedAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">No Achievements Unlocked Yet</h3>
                <p className="text-gray-500 mb-6">Start your travel journey to earn your first achievement badge!</p>
                <Button onClick={() => setActiveTab("all")}>
                  View Available Achievements
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Achievement Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Progress Tracking Coming Soon</h3>
                  <p className="text-gray-500">Detailed progress tracking and milestone visualization will be available soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* New Achievement Celebration Modal */}
        {showNewAchievements && newlyUnlocked.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-md mx-4 relative">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <Sparkles className="w-16 h-16 text-yellow-500 animate-pulse" />
                </div>
                <CardTitle className="text-2xl text-yellow-600">
                  Achievement Unlocked!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                {newlyUnlocked.map((ua: any) => (
                  <div key={ua.id} className="flex flex-col items-center">
                    <AchievementBadge
                      achievement={ua.achievement}
                      isUnlocked={true}
                      size="lg"
                    />
                    <div className="mt-2">
                      <h3 className="font-semibold">{ua.achievement.name}</h3>
                      <p className="text-sm text-gray-600">{ua.achievement.description}</p>
                      <Badge className="mt-1">+{ua.achievement.points} points</Badge>
                    </div>
                  </div>
                ))}
                <Button 
                  onClick={() => setShowNewAchievements(false)}
                  className="w-full mt-6"
                >
                  Awesome!
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}