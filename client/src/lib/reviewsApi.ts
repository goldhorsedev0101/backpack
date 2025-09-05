import { supabase } from './supabase';

export interface ReviewFilters {
  search?: string;
  entityType?: string;
  minRating?: number;
  sortBy?: 'newest' | 'top_rated' | 'lowest_rated' | 'most_helpful';
  page?: number;
  limit?: number;
}

export interface PlaceOption {
  id: string;
  name: string;
  entity_type: string;
}

export interface ReviewWithMetadata {
  id: string;
  entity_type: string;
  entity_id: string;
  rating: number;
  title: string;
  body: string;
  author_name?: string;
  user_id?: string;
  created_at: string;
  updated_at?: string;
  place_name?: string;
  photo_url?: string;
  helpful_count?: number;
  user_voted_helpful?: boolean;
}

export interface EntityPair {
  entity_type: string;
  entity_id: string;
}

// Get unique guest token for voting
export function getGuestToken(): string {
  let token = localStorage.getItem('tripwise_guest_vote_token');
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem('tripwise_guest_vote_token', token);
  }
  return token;
}

// Get current guest name
export function getGuestName(): string {
  return localStorage.getItem('tripwise_guest_name') || '';
}

// List reviews with filters and pagination
export async function listReviews(filters: ReviewFilters = {}) {
  const {
    search = '',
    entityType = 'all',
    minRating = 1,
    sortBy = 'newest',
    page = 0,
    limit = 20
  } = filters;

  let query = supabase
    .from('place_reviews')
    .select('*', { count: 'exact' });

  // Apply search filter
  if (search.trim()) {
    query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);
  }

  // Apply entity type filter
  if (entityType !== 'all') {
    query = query.eq('entity_type', entityType);
  }

  // Apply minimum rating filter
  if (minRating > 1) {
    query = query.gte('rating', minRating);
  }

  // Apply sorting
  switch (sortBy) {
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'top_rated':
      query = query.order('rating', { ascending: false }).order('created_at', { ascending: false });
      break;
    case 'lowest_rated':
      query = query.order('rating', { ascending: true }).order('created_at', { ascending: false });
      break;
    case 'most_helpful':
      // For now, sort by created_at since we'll add helpful counts separately
      query = query.order('created_at', { ascending: false });
      break;
  }

  // Apply pagination
  const start = page * limit;
  const end = start + limit - 1;
  query = query.range(start, end);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch reviews: ${error.message}`);
  }

  return {
    reviews: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  };
}

// Create a new review
export async function createReview(reviewData: {
  entity_type: string;
  entity_id: string;
  rating: number;
  title: string;
  body: string;
}) {
  const guestName = getGuestName();
  
  if (!guestName.trim()) {
    throw new Error('Please set your name first');
  }

  const { data: { user } } = await supabase.auth.getUser();

  const payload = {
    entity_type: reviewData.entity_type,
    entity_id: reviewData.entity_id,
    rating: reviewData.rating,
    title: reviewData.title.trim(),
    body: reviewData.body.trim(),
    user_id: user?.id || null,
    author_name: user?.id ? null : guestName
  };

  const { data, error } = await supabase
    .from('place_reviews')
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create review: ${error.message}`);
  }

  return data;
}

// Update an existing review
export async function updateReview(id: string, updates: {
  rating: number;
  title: string;
  body: string;
}) {
  const payload = {
    rating: updates.rating,
    title: updates.title.trim(),
    body: updates.body.trim(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('place_reviews')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update review: ${error.message}`);
  }

  return data;
}

// Delete a review
export async function deleteReview(id: string) {
  const { error } = await supabase
    .from('place_reviews')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete review: ${error.message}`);
  }
}

// Toggle helpful vote for a review
export async function toggleHelpful(reviewId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  const guestToken = user ? null : getGuestToken();

  // Check if user already voted
  let existingVoteQuery = supabase
    .from('place_review_votes')
    .select('id')
    .eq('review_id', reviewId);

  if (user) {
    existingVoteQuery = existingVoteQuery.eq('user_id', user.id);
  } else {
    existingVoteQuery = existingVoteQuery.eq('guest_token', guestToken);
  }

  const { data: existingVote, error: voteError } = await existingVoteQuery.single();

  if (voteError && voteError.code !== 'PGRST116') { // PGRST116 = no rows found
    throw new Error(`Failed to check vote status: ${voteError.message}`);
  }

  if (existingVote) {
    // Remove existing vote
    const { error } = await supabase
      .from('place_review_votes')
      .delete()
      .eq('id', existingVote.id);

    if (error) {
      throw new Error(`Failed to remove vote: ${error.message}`);
    }

    return { voted: false };
  } else {
    // Add new vote
    const votePayload = {
      review_id: reviewId,
      user_id: user?.id || null,
      guest_token: guestToken,
      is_helpful: true
    };

    const { error } = await supabase
      .from('place_review_votes')
      .insert([votePayload]);

    if (error) {
      throw new Error(`Failed to add vote: ${error.message}`);
    }

    return { voted: true };
  }
}

// Get helpful vote counts for reviews
export async function getHelpfulCounts(reviewIds: string[]) {
  if (reviewIds.length === 0) return {};

  const { data, error } = await supabase
    .from('place_review_votes')
    .select('review_id')
    .in('review_id', reviewIds);

  if (error) {
    console.warn('Failed to fetch helpful counts:', error);
    return {};
  }

  const counts: Record<string, number> = {};
  data?.forEach(vote => {
    counts[vote.review_id] = (counts[vote.review_id] || 0) + 1;
  });

  return counts;
}

// Check which reviews the current user has voted as helpful
export async function getUserHelpfulVotes(reviewIds: string[]) {
  if (reviewIds.length === 0) return {};

  const { data: { user } } = await supabase.auth.getUser();
  const guestToken = user ? null : getGuestToken();

  let query = supabase
    .from('place_review_votes')
    .select('review_id')
    .in('review_id', reviewIds);

  if (user) {
    query = query.eq('user_id', user.id);
  } else {
    query = query.eq('guest_token', guestToken);
  }

  const { data, error } = await query;

  if (error) {
    console.warn('Failed to fetch user votes:', error);
    return {};
  }

  const votes: Record<string, boolean> = {};
  data?.forEach(vote => {
    votes[vote.review_id] = true;
  });

  return votes;
}

// Search places by type and name for autocomplete
export async function listPlacesForType(
  entityType: string, 
  searchQuery: string = '', 
  limit: number = 10
): Promise<PlaceOption[]> {
  if (!entityType || entityType === 'all') {
    return [];
  }

  const tableMap: Record<string, string> = {
    'destinations': 'destinations',
    'accommodations': 'accommodations', 
    'attractions': 'attractions',
    'restaurants': 'restaurants'
  };

  const tableName = tableMap[entityType.toLowerCase()];
  if (!tableName) {
    return [];
  }

  let query = supabase
    .from(tableName)
    .select('id, name')
    .limit(limit);

  if (searchQuery.trim()) {
    query = query.ilike('name', `%${searchQuery}%`);
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.warn(`Failed to fetch ${entityType}:`, error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    entity_type: entityType
  }));
}

// Fetch photos for multiple entities (batch to avoid N+1)
export async function fetchPhotosForEntities(entityPairs: EntityPair[]) {
  if (entityPairs.length === 0) return {};

  const photoMap: Record<string, string> = {};

  // Group by entity type for efficient queries
  const groupedPairs: Record<string, string[]> = {};
  entityPairs.forEach(pair => {
    if (!groupedPairs[pair.entity_type]) {
      groupedPairs[pair.entity_type] = [];
    }
    groupedPairs[pair.entity_type].push(pair.entity_id);
  });

  // Fetch photos for each entity type
  for (const [entityType, entityIds] of Object.entries(groupedPairs)) {
    try {
      const { data, error } = await supabase
        .from('location_photos')
        .select('entity_id, thumbnail_url, url')
        .eq('entity_type', entityType)
        .in('entity_id', entityIds)
        .order('inserted_at', { ascending: false });

      if (!error && data) {
        data.forEach(photo => {
          if (!photoMap[photo.entity_id]) {
            photoMap[photo.entity_id] = photo.thumbnail_url || photo.url;
          }
        });
      }
    } catch (error) {
      console.warn(`Failed to fetch photos for ${entityType}:`, error);
    }
  }

  return photoMap;
}

// Fetch aggregated review data for multiple entities (batch to avoid N+1)
export async function fetchAggregatesForEntities(entityPairs: EntityPair[]) {
  if (entityPairs.length === 0) return {};

  const aggregateMap: Record<string, { avg_rating: number; review_count: number }> = {};

  // Group by entity type for efficient queries
  const groupedPairs: Record<string, string[]> = {};
  entityPairs.forEach(pair => {
    if (!groupedPairs[pair.entity_type]) {
      groupedPairs[pair.entity_type] = [];
    }
    groupedPairs[pair.entity_type].push(pair.entity_id);
  });

  // Fetch aggregates for each entity type
  for (const [entityType, entityIds] of Object.entries(groupedPairs)) {
    try {
      const { data, error } = await supabase
        .from('place_reviews')
        .select('entity_id, rating')
        .eq('entity_type', entityType)
        .in('entity_id', entityIds);

      if (!error && data) {
        // Calculate aggregates manually
        const entityStats: Record<string, { total: number; sum: number; count: number }> = {};
        
        data.forEach(review => {
          if (!entityStats[review.entity_id]) {
            entityStats[review.entity_id] = { total: 0, sum: 0, count: 0 };
          }
          entityStats[review.entity_id].sum += review.rating;
          entityStats[review.entity_id].count += 1;
        });

        Object.entries(entityStats).forEach(([entityId, stats]) => {
          aggregateMap[entityId] = {
            avg_rating: stats.sum / stats.count,
            review_count: stats.count
          };
        });
      }
    } catch (error) {
      console.warn(`Failed to fetch aggregates for ${entityType}:`, error);
    }
  }

  return aggregateMap;
}