import { apiRequest } from './queryClient';

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
  let token = localStorage.getItem('globemate_guest_vote_token');
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem('globemate_guest_vote_token', token);
  }
  return token;
}

// Get current guest name
export function getGuestName(): string {
  return localStorage.getItem('globemate_guest_name') || '';
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

  try {
    const response = await apiRequest('/api/place-reviews');
    
    if (!response.ok) {
      const errorText = await response.text();
      console.warn('API error:', errorText);
      
      // Return mock data for demo purposes
      const mockReviews = [
        {
          id: '1',
          entity_type: 'destinations',
          entity_id: '1',
          rating: 5,
          title: 'Amazing experience at Machu Picchu!',
          body: 'The ancient Incan citadel was absolutely breathtaking. The views were incredible and the historical significance is immense. Highly recommend taking the early morning train to avoid crowds.',
          author_name: 'Travel Explorer',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          place_name: 'Machu Picchu'
        },
        {
          id: '2',
          entity_type: 'destinations',
          entity_id: '2',
          rating: 4,
          title: 'Incredible views from Christ the Redeemer',
          body: 'The statue is impressive and the panoramic views of Rio de Janeiro are stunning. The cog train ride up is an experience in itself. Can get quite crowded during peak hours.',
          author_name: 'City Explorer',
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          place_name: 'Christ the Redeemer'
        }
      ];
      
      // Apply filters to mock data
      let filtered = mockReviews;
      
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(review => 
          review.title.toLowerCase().includes(searchLower) ||
          review.body.toLowerCase().includes(searchLower)
        );
      }
      
      if (entityType !== 'all') {
        filtered = filtered.filter(review => review.entity_type === entityType);
      }
      
      if (minRating > 1) {
        filtered = filtered.filter(review => review.rating >= minRating);
      }
      
      return {
        reviews: filtered,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit)
      };
    }

    const data = await response.json();
    
    return {
      reviews: data.items || data.reviews || [],
      total: data.total || 0,
      page,
      limit,
      totalPages: Math.ceil((data.total || 0) / limit)
    };
  } catch (error) {
    console.warn('Failed to fetch reviews:', error);
    
    // Fallback to empty state
    return {
      reviews: [],
      total: 0,
      page,
      limit,
      totalPages: 0
    };
  }
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

  // For demo purposes, just return a mock created review
  const mockReview = {
    id: Date.now().toString(),
    entity_type: reviewData.entity_type,
    entity_id: reviewData.entity_id,
    rating: reviewData.rating,
    title: reviewData.title.trim(),
    body: reviewData.body.trim(),
    author_name: guestName,
    created_at: new Date().toISOString(),
    place_name: 'Selected Place'
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockReview;
}

// Update an existing review
export async function updateReview(id: string, updates: {
  rating: number;
  title: string;
  body: string;
}) {
  // For demo purposes, just return a mock updated review
  const mockUpdatedReview = {
    id,
    rating: updates.rating,
    title: updates.title.trim(),
    body: updates.body.trim(),
    updated_at: new Date().toISOString()
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return mockUpdatedReview;
}

// Delete a review
export async function deleteReview(id: string) {
  // For demo purposes, just simulate deletion
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Return success (no error thrown means success)
  return;
}

// Toggle helpful vote for a review
export async function toggleHelpful(reviewId: string) {
  // Simplified version - just return a mock response for now
  return { voted: true };
}

// Get helpful vote counts for reviews
export async function getHelpfulCounts(reviewIds: string[]) {
  // Simplified version - return mock counts
  const counts: Record<string, number> = {};
  reviewIds.forEach(id => {
    counts[id] = Math.floor(Math.random() * 10);
  });
  return counts;
}

// Check which reviews the current user has voted as helpful
export async function getUserHelpfulVotes(reviewIds: string[]) {
  // Simplified version - return empty votes
  return {};
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

  // Simplified version with mock data for demo
  const mockPlaces: PlaceOption[] = [
    { id: '1', name: 'Machu Picchu', entity_type: 'destinations' },
    { id: '2', name: 'Christ the Redeemer', entity_type: 'destinations' },
    { id: '3', name: 'Salar de Uyuni', entity_type: 'destinations' },
    { id: '4', name: 'Angel Falls', entity_type: 'destinations' },
    { id: '5', name: 'Torres del Paine', entity_type: 'destinations' }
  ];

  const filtered = mockPlaces.filter(place => 
    place.entity_type === entityType && 
    (!searchQuery || place.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return filtered.slice(0, limit);
}

// Fetch photos for multiple entities (batch to avoid N+1)
export async function fetchPhotosForEntities(entityPairs: EntityPair[]) {
  // Simplified version - return empty photos map
  return {};
}

// Fetch aggregated review data for multiple entities (batch to avoid N+1)
export async function fetchAggregatesForEntities(entityPairs: EntityPair[]) {
  // Simplified version - return empty aggregates
  return {};
}