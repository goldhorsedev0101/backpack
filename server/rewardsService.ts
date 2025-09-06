import { db } from './db.js';
import { pointsTransactions, achievements, userAchievements, missions, userMissions, users } from '../shared/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';

export type RewardAction = 
  | 'REVIEW_WRITTEN' 
  | 'PHOTO_UPLOADED' 
  | 'ITINERARY_SHARED'
  | 'TRIP_COMPLETED'
  | 'EXPENSE_TRACKED'
  | 'PLACE_VISITED'
  | 'COMMENT_POSTED'
  | 'PROFILE_COMPLETED'
  | 'LOGIN_DAILY'
  | 'REFERRAL_MADE';

const REWARD_POINTS: Record<RewardAction, number> = {
  REVIEW_WRITTEN: 50,
  PHOTO_UPLOADED: 10,
  ITINERARY_SHARED: 100,
  TRIP_COMPLETED: 200,
  EXPENSE_TRACKED: 5,
  PLACE_VISITED: 30,
  COMMENT_POSTED: 15,
  PROFILE_COMPLETED: 25,
  LOGIN_DAILY: 10,
  REFERRAL_MADE: 500,
};

export class RewardsService {
  // Award points to user for specific action
  async awardPoints(userId: string, action: RewardAction, description?: string): Promise<number> {
    const points = REWARD_POINTS[action];
    
    try {
      // Create points transaction
      await db.insert(pointsTransactions).values({
        userId,
        points,
        action,
        description: description || `Points earned for ${action}`,
        createdAt: new Date(),
      });

      // Check for achievements
      await this.checkAchievements(userId);

      return points;
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  // Check and unlock achievements for user
  async checkAchievements(userId: string): Promise<void> {
    try {
      // Get user's total activities
      const userStats = await this.getUserStats(userId);

      // Get all achievements
      const allAchievements = await db.select().from(achievements);

      // Get user's current achievements
      const userAchievementsList = await db
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId));

      const completedAchievementIds = new Set(
        userAchievementsList.filter((ua: any) => ua.isCompleted).map((ua: any) => ua.achievementId)
      );

      // Check each achievement
      for (const achievement of allAchievements) {
        if (completedAchievementIds.has(achievement.id)) continue;

        const isEligible = this.checkAchievementEligibility(achievement, userStats);
        
        if (isEligible) {
          // Check if user achievement record exists
          const existingRecord = userAchievementsList.find((ua: any) => ua.achievementId === achievement.id);
          
          if (existingRecord) {
            // Update existing record
            await db
              .update(userAchievements)
              .set({
                isCompleted: true,
                progress: achievement.progressMax,
                completedAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(userAchievements.id, existingRecord.id));
          } else {
            // Create new achievement record
            await db.insert(userAchievements).values({
              userId,
              achievementId: achievement.id,
              isCompleted: true,
              progress: achievement.progressMax,
              completedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }

          // Award achievement points
          await db.insert(pointsTransactions).values({
            userId,
            points: achievement.points,
            action: 'ACHIEVEMENT_UNLOCKED',
            description: `Achievement unlocked: ${achievement.name}`,
            createdAt: new Date(),
          });
        } else {
          // Update progress for incomplete achievements
          const currentProgress = this.calculateAchievementProgress(achievement, userStats);
          
          const existingRecord = userAchievementsList.find((ua: any) => ua.achievementId === achievement.id);
          
          if (existingRecord && existingRecord.progress !== currentProgress) {
            await db
              .update(userAchievements)
              .set({
                progress: currentProgress,
                updatedAt: new Date(),
              })
              .where(eq(userAchievements.id, existingRecord.id));
          } else if (!existingRecord && currentProgress > 0) {
            await db.insert(userAchievements).values({
              userId,
              achievementId: achievement.id,
              isCompleted: false,
              progress: currentProgress,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }

  // Get user statistics for achievement checking
  private async getUserStats(userId: string): Promise<Record<string, number>> {
    try {
      // Get points transactions summary
      const transactionSummary = await db
        .select({
          action: pointsTransactions.action,
          count: sql<number>`count(*)::int`,
        })
        .from(pointsTransactions)
        .where(eq(pointsTransactions.userId, userId))
        .groupBy(pointsTransactions.action);

      // Convert to stats object
      const stats: Record<string, number> = {};
      transactionSummary.forEach(({ action, count }: any) => {
        stats[action] = count;
      });

      // Calculate totals
      const totalPoints = await this.getUserTotalPoints(userId);
      stats.TOTAL_POINTS = totalPoints;

      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {};
    }
  }

  // Check if user is eligible for specific achievement
  private checkAchievementEligibility(achievement: any, userStats: Record<string, number>): boolean {
    switch (achievement.type) {
      case 'reviews':
        return (userStats.REVIEW_WRITTEN || 0) >= achievement.progressMax;
      case 'photos':
        return (userStats.PHOTO_UPLOADED || 0) >= achievement.progressMax;
      case 'itineraries':
        return (userStats.ITINERARY_SHARED || 0) >= achievement.progressMax;
      case 'trips':
        return (userStats.TRIP_COMPLETED || 0) >= achievement.progressMax;
      case 'points':
        return (userStats.TOTAL_POINTS || 0) >= achievement.progressMax;
      case 'places':
        return (userStats.PLACE_VISITED || 0) >= achievement.progressMax;
      default:
        return false;
    }
  }

  // Calculate current progress for achievement
  private calculateAchievementProgress(achievement: any, userStats: Record<string, number>): number {
    switch (achievement.type) {
      case 'reviews':
        return Math.min(userStats.REVIEW_WRITTEN || 0, achievement.progressMax);
      case 'photos':
        return Math.min(userStats.PHOTO_UPLOADED || 0, achievement.progressMax);
      case 'itineraries':
        return Math.min(userStats.ITINERARY_SHARED || 0, achievement.progressMax);
      case 'trips':
        return Math.min(userStats.TRIP_COMPLETED || 0, achievement.progressMax);
      case 'points':
        return Math.min(userStats.TOTAL_POINTS || 0, achievement.progressMax);
      case 'places':
        return Math.min(userStats.PLACE_VISITED || 0, achievement.progressMax);
      default:
        return 0;
    }
  }

  // Get user's total points
  async getUserTotalPoints(userId: string): Promise<number> {
    try {
      const result = await db
        .select({
          total: sql<number>`COALESCE(SUM(points), 0)::int`,
        })
        .from(pointsTransactions)
        .where(eq(pointsTransactions.userId, userId));

      return result[0]?.total || 0;
    } catch (error) {
      console.error('Error getting user total points:', error);
      return 0;
    }
  }

  // Get leaderboard
  async getLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      // Get top users by points in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const leaderboard = await db
        .select({
          userId: pointsTransactions.userId,
          totalPoints: sql<number>`SUM(points)::int`,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        })
        .from(pointsTransactions)
        .innerJoin(users, eq(pointsTransactions.userId, users.id))
        .where(sql`${pointsTransactions.createdAt} >= ${thirtyDaysAgo}`)
        .groupBy(pointsTransactions.userId, users.firstName, users.lastName, users.profileImageUrl)
        .orderBy(desc(sql`SUM(points)`))
        .limit(limit);

      return leaderboard;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  // Get user's points history
  async getUserPointsHistory(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const history = await db
        .select()
        .from(pointsTransactions)
        .where(eq(pointsTransactions.userId, userId))
        .orderBy(desc(pointsTransactions.createdAt))
        .limit(limit);

      return history;
    } catch (error) {
      console.error('Error getting user points history:', error);
      return [];
    }
  }

  // Initialize default achievements
  async initializeDefaultAchievements(): Promise<void> {
    try {
      const defaultAchievements = [
        {
          name: 'First Review',
          nameHe: 'הביקורת הראשונה',
          description: 'Write your first travel review',
          descriptionHe: 'כתוב את הביקורת הראשונה שלך',
          type: 'reviews',
          progressMax: 1,
          points: 100,
          rarity: 'common' as const,
          category: 'community',
        },
        {
          name: 'Review Master',
          nameHe: 'מאסטר ביקורות',
          description: 'Write 10 travel reviews',
          descriptionHe: 'כתוב 10 ביקורות נסיעה',
          type: 'reviews',
          progressMax: 10,
          points: 500,
          rarity: 'rare' as const,
          category: 'community',
        },
        {
          name: 'Photo Enthusiast',
          nameHe: 'חובב צילום',
          description: 'Upload 20 travel photos',
          descriptionHe: 'העלה 20 תמונות נסיעה',
          type: 'photos',
          progressMax: 20,
          points: 200,
          rarity: 'common' as const,
          category: 'content',
        },
        {
          name: 'Trip Planner',
          nameHe: 'מתכנן מסלולים',
          description: 'Create and share 5 itineraries',
          descriptionHe: 'צור ושתף 5 מסלולים',
          type: 'itineraries',
          progressMax: 5,
          points: 1000,
          rarity: 'epic' as const,
          category: 'planning',
        },
        {
          name: 'South America Explorer',
          nameHe: 'חוקר דרום אמריקה',
          description: 'Visit 5 different places in South America',
          descriptionHe: 'בקר ב-5 מקומות שונים בדרום אמריקה',
          type: 'places',
          progressMax: 5,
          points: 750,
          rarity: 'rare' as const,
          category: 'exploration',
        },
        {
          name: 'Points Collector',
          nameHe: 'אספן נקודות',
          description: 'Accumulate 1000 points',
          descriptionHe: 'צבור 1000 נקודות',
          type: 'points',
          progressMax: 1000,
          points: 200,
          rarity: 'common' as const,
          category: 'general',
        },
      ];

      // Insert achievements if they don't exist
      for (const achievement of defaultAchievements) {
        const existing = await db
          .select()
          .from(achievements)
          .where(eq(achievements.name, achievement.name))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(achievements).values({
            ...achievement,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    } catch (error) {
      console.error('Error initializing achievements:', error);
      throw error;
    }
  }
}

export const rewardsService = new RewardsService();