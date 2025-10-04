import { apiRequest } from './queryClient';

// Chat Rooms API
export const chatRoomsApi = {
  // Get all chat rooms
  getRooms: () => apiRequest('/api/chat-rooms'),
  
  // Get specific room
  getRoom: (id: number) => apiRequest(`/api/chat-rooms/${id}`),
  
  // Create new room
  createRoom: (roomData: {
    name: string;
    description?: string;
    type: string;
    destination?: string;
    tags?: string[];
    maxMembers?: number;
  }) => apiRequest('/api/chat-rooms', {
    method: 'POST',
    body: JSON.stringify(roomData)
  }),
  
  // Join room
  joinRoom: (id: number) => apiRequest(`/api/chat-rooms/${id}/join`, {
    method: 'POST'
  }),
  
  // Leave room
  leaveRoom: (id: number) => apiRequest(`/api/chat-rooms/${id}/leave`, {
    method: 'POST'
  }),
  
  // Get room members
  getMembers: (id: number) => apiRequest(`/api/chat-rooms/${id}/members`)
};

// Chat Messages API
export const chatMessagesApi = {
  // Get messages for a room
  getMessages: (roomId: number, options?: {
    limit?: number;
    offset?: number;
    before?: string;
  }) => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.before) params.append('before', options.before);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/api/chat/messages/${roomId}${query}`);
  },
  
  // Send message
  sendMessage: (messageData: {
    room_id: number;
    message: string;
    author_name?: string;
    message_type?: string;
  }) => apiRequest('/api/chat/messages', {
    method: 'POST',
    body: JSON.stringify(messageData)
  }),
  
  // Edit message (if supported)
  editMessage: (id: number, message: string) => apiRequest(`/api/chat/messages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ message })
  }),
  
  // Delete message (if supported)
  deleteMessage: (id: number) => apiRequest(`/api/chat/messages/${id}`, {
    method: 'DELETE'
  })
};

// Travel Buddy Posts API
export const travelBuddyApi = {
  // Get all posts with filters
  getPosts: (filters?: {
    destination?: string;
    startDate?: string;
    endDate?: string;
    budget?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.destination && filters.destination !== 'all') {
      params.append('destination', filters.destination);
    }
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);
    if (filters?.budget && filters.budget !== 'all') {
      params.append('budget', filters.budget);
    }
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/api/travel-buddy-posts${query}`);
  },
  
  // Get specific post
  getPost: (id: number) => apiRequest(`/api/travel-buddy-posts/${id}`),
  
  // Create new post
  createPost: (postData: {
    title: string;
    description: string;
    destination: string;
    start_date: string;
    end_date: string;
    group_size: number;
    budget?: string;
    travel_style?: string[];
    activities?: string[];
    requirements?: string;
    contact_info?: any;
    author_name?: string;
  }) => apiRequest('/api/travel-buddy-posts', {
    method: 'POST',
    body: JSON.stringify(postData)
  }),
  
  // Update post
  updatePost: (id: number, postData: any) => apiRequest(`/api/travel-buddy-posts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(postData)
  }),
  
  // Delete post
  deletePost: (id: number) => apiRequest(`/api/travel-buddy-posts/${id}`, {
    method: 'DELETE'
  }),
  
  // Get user's posts
  getUserPosts: () => apiRequest('/api/travel-buddy-posts/user'),
  
  // Get applications for a post
  getApplications: (id: number) => apiRequest(`/api/travel-buddy-posts/${id}/applications`),
  
  // Apply to a post
  applyToPost: (postId: number, message: string) => apiRequest('/api/travel-buddy-applications', {
    method: 'POST',
    body: JSON.stringify({ post_id: postId, message })
  }),
  
  // Update application status
  updateApplication: (id: number, status: 'accepted' | 'rejected') => apiRequest(`/api/travel-buddy-applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
};

// WebSocket/Realtime functionality (placeholder for future Supabase realtime)
export const realtimeApi = {
  // Subscribe to room messages
  subscribeToRoom: (roomId: number, callback: (message: any) => void) => {
    // This would be implemented with Supabase realtime
    // For now, we'll use polling in the components
    console.log(`Subscribing to room ${roomId}`, callback);
    return () => {
      console.log(`Unsubscribing from room ${roomId}`);
    };
  },
  
  // Subscribe to new travel buddy posts
  subscribeToPosts: (callback: (post: any) => void) => {
    // This would be implemented with Supabase realtime
    console.log('Subscribing to travel buddy posts', callback);
    return () => {
      console.log('Unsubscribing from travel buddy posts');
    };
  }
};

// Guest utilities
export const guestUtils = {
  // Get guest name from localStorage
  getGuestName: (): string => {
    return localStorage.getItem('globemate_guest_name') || '';
  },
  
  // Set guest name in localStorage
  setGuestName: (name: string): void => {
    localStorage.setItem('globemate_guest_name', name.trim());
  },
  
  // Clear guest data
  clearGuestData: (): void => {
    localStorage.removeItem('globemate_guest_name');
  },
  
  // Check if user is authenticated (placeholder)
  isAuthenticated: (): boolean => {
    // This would check actual auth state
    return false;
  }
};