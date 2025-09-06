import { supabase } from '@/lib/supabase';

// Types for rewards system
export interface UserPointsSummary {
  userId: string;
  totalPoints: number;
  level: number;
  weeklyPoints: number;
  monthlyPoints: number;
  lastResetDate: string;
  updatedAt: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  category: string;
  iconName: string;
  badgeColor: string;
  requirement: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isActive: boolean;
  createdAt: string;
}

export interface UserAchievement {
  id: number;
  userId: string;
  achievementId: number;
  unlockedAt: string | null;
  progress: number;
  progressMax: number;
  isCompleted: boolean;
  createdAt: string;
  achievement?: Achievement;
}

export interface PointsLedgerEntry {
  id: number;
  userId: string;
  action: string;
  actionKey: string;
  points: number;
  metadata: any;
  description: string;
  createdAt: string;
}

export interface Mission {
  id: number;
  name: string;
  nameHe?: string;
  description: string;
  descriptionHe?: string;
  type: 'daily' | 'weekly';
  action: string;
  targetCount: number;
  pointsReward: number;
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  totalPoints: number;
  weeklyPoints: number;
  rank: number;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string;
  };
}

// Calculate user level based on total points
export function calcLevel(totalPoints: number): number {
  if (totalPoints >= 2000) return 5;
  if (totalPoints >= 1000) return 4;
  if (totalPoints >= 500) return 3;
  if (totalPoints >= 200) return 2;
  return 1;
}

// Get current user session
export async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session?.user || null;
}

// Fetch user points summary
export async function fetchMySummary(): Promise<UserPointsSummary> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_points_summary')
    .select('*')
    .eq('userId', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // 116 = no rows found

  if (!data) {
    // Return default summary if no record exists
    return {
      userId: user.id,
      totalPoints: 0,
      level: 1,
      weeklyPoints: 0,
      monthlyPoints: 0,
      lastResetDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  return {
    ...data,
    level: calcLevel(data.totalPoints)
  };
}

// Fetch user achievements with progress
export async function fetchMyAchievements() {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      id,
      userId,
      achievementId,
      unlockedAt,
      progress,
      progressMax,
      isCompleted,
      createdAt,
      achievement:achievements (
        id, name, description, category, iconName, badgeColor, 
        requirement, points, rarity, isActive, createdAt
      )
    `)
    .eq('userId', user.id)
    .order('unlockedAt', { ascending: false, nullsFirst: false });

  if (error) throw error;

  const achievements = (data as UserAchievement[]) || [];
  const unlocked = achievements.filter(a => a.isCompleted && a.unlockedAt);
  const inProgress = achievements.filter(a => !a.isCompleted && a.progress < a.progressMax);

  return { unlocked, inProgress, all: achievements };
}

// Fetch all available achievements catalog
export async function fetchCatalogAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('isActive', true)
    .order('rarity', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Fetch missions (daily/weekly)
export async function fetchMissions(): Promise<Mission[]> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('isActive', true)
    .or(`validUntil.is.null,validUntil.gt.${now}`)
    .order('type', { ascending: true })
    .order('pointsReward', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Fetch leaderboard for last 30 days
export async function fetchLeaderboard30d(limit = 10): Promise<LeaderboardEntry[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Query points ledger for last 30 days, aggregated by user
  const { data, error } = await supabase
    .from('points_ledger')
    .select(`
      userId,
      points,
      users!inner (
        id,
        firstName,
        lastName,
        email,
        profileImageUrl
      )
    `)
    .gte('createdAt', thirtyDaysAgo.toISOString())
    .order('points', { ascending: false })
    .limit(limit * 5); // Get more data to aggregate properly

  if (error) throw error;

  // Aggregate points by user
  const userPointsMap = new Map<string, { points: number; user: any }>();
  
  data?.forEach((entry: any) => {
    const existing = userPointsMap.get(entry.userId);
    if (existing) {
      existing.points += entry.points;
    } else {
      userPointsMap.set(entry.userId, {
        points: entry.points,
        user: entry.users
      });
    }
  });

  // Convert to leaderboard entries and sort
  const leaderboard = Array.from(userPointsMap.entries())
    .map(([userId, data]) => ({
      userId,
      totalPoints: data.points,
      weeklyPoints: data.points, // For now, same as total in 30d period
      rank: 0, // Will be set below
      user: data.user
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit);

  // Set ranks
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return leaderboard;
}

// History: יומן נקודות (Ledger) - updated version
export async function fetchMyPointsHistory(limit = 50, page = 0) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const from = page * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('points_ledger')
    .select('*', { count: 'exact' })
    .eq('userId', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

// Generic history function (for all users)
export async function fetchMyHistory(limit = 50, page = 0) {
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('points_ledger')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

// RPC award_points: זיכוי נקודות אידמפוטנטי
type AwardParams = {
  action: string;
  points: number;
  actionKey?: string | null;
  meta?: Record<string, any>;
};

export async function awardPoints({ action, points, actionKey = null, meta = {} }: AwardParams) {
  const { data, error } = await supabase.rpc('award_points', {
    p_action: action,
    p_points: points,
    p_action_key: actionKey,
    p_meta: meta
  });

  if (error) {
    console.warn('awardPoints error', error);
  }
  return (data?.[0]) ?? { total_points: undefined, lifetime_points: undefined };
}

// Daily check-in - updated to use new awardPoints
export async function dailyCheckIn(): Promise<{ success: boolean; message: string }> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const result = await awardPoints({
      action: 'daily.checkin',
      points: 5,
      actionKey: `checkin:${today}`,
      meta: { date: today }
    });
    
    if (result.total_points !== undefined) {
      return { success: true, message: 'Daily check-in successful! +5 points' };
    } else {
      return { success: false, message: 'Already checked in today' };
    }
  } catch (error) {
    console.error('Daily check-in error:', error);
    return { success: false, message: 'Error processing check-in' };
  }
}

// עדכון התקדמות הישגים (Progress) + פתיחה (Unlock)
export async function bumpAchievementsProgressForAction(action: string, bump = 1) {
  // משוך את ההישגים הרלוונטיים
  const { data: ach, error } = await supabase
    .from('achievements')
    .select('id, code, criteria_json, points_reward, name')
    .eq('active', true);

  if (error) throw error;

  const targets = (ach ?? []).filter((a: any) =>
    a.criteria_json?.type === 'count' &&
    a.criteria_json?.action === action
  );

  for (const t of targets) {
    // upsert לשורת user_achievements
    const { data: ua } = await supabase
      .from('user_achievements')
      .select('progress, progress_max, unlocked_at')
      .eq('achievement_id', t.id)
      .single();

    let newProgress = (ua?.progress ?? 0) + bump;
    const progressMax = ua?.progress_max ?? (t.criteria_json?.target ?? 1);
    if (newProgress > progressMax) newProgress = progressMax;

    await supabase
      .from('user_achievements')
      .upsert({
        achievement_id: t.id,
        progress: newProgress,
        progress_max: progressMax,
      }, { onConflict: 'user_id,achievement_id' });

    // אם הושלם — נפתח באדג׳ ונזכה בבונוס
    if (!ua?.unlocked_at && newProgress >= progressMax) {
      await supabase
        .from('user_achievements')
        .update({ unlocked_at: new Date().toISOString() })
        .eq('achievement_id', t.id);

      const bonus = t.points_reward ?? 0;
      if (bonus > 0) {
        await awardPoints({
          action: `achievement.unlock:${t.code}`,
          points: bonus,
          actionKey: `ach_unlock:${t.code}`,
          meta: { achievement_id: t.id }
        });
      }

      return { 
        unlocked: true, 
        achievement: { id: t.id, name: t.name, points: bonus },
        newProgress,
        progressMax
      };
    }
  }

  return { unlocked: false };
}

// פונקציות עזר לפעולות נפוצות עם התקדמות הישגים
export async function awardReviewPointsWithProgress(reviewId: string, placeId: string) {
  const result = await awardPoints({
    action: 'review.create',
    points: 50,
    actionKey: `review:${reviewId}`,
    meta: { place_id: placeId, review_id: reviewId }
  });
  
  const progressResult = await bumpAchievementsProgressForAction('review.create');
  
  return { pointsResult: result, progressResult };
}

export async function awardPhotoPointsWithProgress(photoId: string, placeId: string) {
  const result = await awardPoints({
    action: 'photo.upload',
    points: 10,
    actionKey: `photo:${photoId}`,
    meta: { place_id: placeId, photo_id: photoId }
  });
  
  const progressResult = await bumpAchievementsProgressForAction('photo.upload');
  
  return { pointsResult: result, progressResult };
}

export async function awardItineraryPointsWithProgress(itineraryId: string, isShare = false) {
  const action = isShare ? 'itinerary.share' : 'itinerary.save';
  const points = isShare ? 20 : 10;
  const actionKey = isShare ? `share:${itineraryId}` : `itinerary:${itineraryId}`;
  
  const result = await awardPoints({
    action,
    points,
    actionKey,
    meta: { itinerary_id: itineraryId }
  });
  
  const progressResult = await bumpAchievementsProgressForAction(action);
  
  return { pointsResult: result, progressResult };
}