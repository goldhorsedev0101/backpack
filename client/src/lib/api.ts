// API client for GlobeMate application
import { queryClient } from './queryClient';

export interface TableData {
  table_name: string;
  approx_row_count: number;
  error?: string;
}

export interface DashboardResponse {
  success: boolean;
  timestamp: string;
  total_tables: number;
  tables: TableData[];
}

// Base API URL
const API_BASE = import.meta.env.VITE_API_BASE || '';

// Generic API request function
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }

  return response.json();
}

// Dashboard API
export const dashboardApi = {
  // Get database table statistics
  getTables: (): Promise<DashboardResponse> =>
    apiRequest<DashboardResponse>('/api/dashboard/tables'),
};

// Places API
export const placesApi = {
  // Get all places
  getAll: () => apiRequest('/api/places'),
  
  // Get place by ID
  getById: (id: string) => apiRequest(`/api/places/${id}`),
  
  // Get place reviews
  getReviews: (placeId: string) => apiRequest(`/api/places/${placeId}/reviews`),
};

// Community API
export const communityApi = {
  // Get community data
  getData: () => apiRequest('/api/community'),
  
  // Get chat rooms
  getChatRooms: () => apiRequest('/api/chat-rooms'),
  
  // Get travel buddy posts
  getTravelBuddyPosts: () => apiRequest('/api/travel-buddy-posts'),
};

// Trips API
export const tripsApi = {
  // Get user trips
  getUserTrips: () => apiRequest('/api/trips'),
  
  // Create new trip
  create: (tripData: any) =>
    apiRequest('/api/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    }),
    
  // Update trip
  update: (id: string, tripData: any) =>
    apiRequest(`/api/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tripData),
    }),
};

// Expenses API
export const expensesApi = {
  // Get expenses
  getAll: () => apiRequest('/api/expenses'),
  
  // Get expenses by trip
  getByTrip: (tripId: string) => apiRequest(`/api/expenses?tripId=${tripId}`),
  
  // Create expense
  create: (expenseData: any) =>
    apiRequest('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    }),
};

// Destinations API
export async function getDestinations() {
  const r = await fetch('/api/destinations', { method: 'GET' });
  if (!r.ok) {
    const msg = await r.text().catch(() => r.statusText);
    throw new Error(`Failed to fetch destinations: ${r.status} ${msg}`);
  }
  return r.json();
}

// Export all APIs
export const api = {
  dashboard: dashboardApi,
  places: placesApi,
  community: communityApi,
  trips: tripsApi,
  expenses: expensesApi,
};

// Helper function to invalidate queries
export function invalidateQueries(queryKey: string[]) {
  queryClient.invalidateQueries({ queryKey });
}