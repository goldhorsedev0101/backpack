// Supabase Database Types
// Generated from database schema

export interface Database {
  public: {
    Tables: {
      destinations: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          country: string;
          region: string;
          latitude: number | null;
          longitude: number | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          country: string;
          region: string;
          latitude?: number | null;
          longitude?: number | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          country?: string;
          region?: string;
          latitude?: number | null;
          longitude?: number | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      
      accommodations: {
        Row: {
          id: number;
          name: string;
          destination_id: number;
          type: string;
          price_range: string | null;
          rating: number | null;
          description: string | null;
          address: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          destination_id: number;
          type: string;
          price_range?: string | null;
          rating?: number | null;
          description?: string | null;
          address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          destination_id?: number;
          type?: string;
          price_range?: string | null;
          rating?: number | null;
          description?: string | null;
          address?: string | null;
          created_at?: string;
        };
      };

      attractions: {
        Row: {
          id: number;
          name: string;
          destination_id: number;
          type: string;
          description: string | null;
          rating: number | null;
          opening_hours: string | null;
          price: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          destination_id: number;
          type: string;
          description?: string | null;
          rating?: number | null;
          opening_hours?: string | null;
          price?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          destination_id?: number;
          type?: string;
          description?: string | null;
          rating?: number | null;
          opening_hours?: string | null;
          price?: string | null;
          created_at?: string;
        };
      };

      restaurants: {
        Row: {
          id: number;
          name: string;
          destination_id: number;
          cuisine_type: string;
          price_range: string | null;
          rating: number | null;
          description: string | null;
          address: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          destination_id: number;
          cuisine_type: string;
          price_range?: string | null;
          rating?: number | null;
          description?: string | null;
          address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          destination_id?: number;
          cuisine_type?: string;
          price_range?: string | null;
          rating?: number | null;
          description?: string | null;
          address?: string | null;
          created_at?: string;
        };
      };

      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      trips: {
        Row: {
          id: number;
          user_id: string;
          title: string;
          description: string | null;
          destination_id: number | null;
          start_date: string | null;
          end_date: string | null;
          budget: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          title: string;
          description?: string | null;
          destination_id?: number | null;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          title?: string;
          description?: string | null;
          destination_id?: number | null;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      expenses: {
        Row: {
          id: number;
          trip_id: number;
          user_id: string;
          category: string;
          amount: number;
          description: string | null;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          trip_id: number;
          user_id: string;
          category: string;
          amount: number;
          description?: string | null;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          trip_id?: number;
          user_id?: string;
          category?: string;
          amount?: number;
          description?: string | null;
          date?: string;
          created_at?: string;
        };
      };

      place_reviews: {
        Row: {
          id: number;
          place_id: number;
          user_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          place_id: number;
          user_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          place_id?: number;
          user_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };

      chat_rooms: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          destination_id: number | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          destination_id?: number | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          destination_id?: number | null;
          created_by?: string;
          created_at?: string;
        };
      };

      messages: {
        Row: {
          id: number;
          chat_room_id: number;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          chat_room_id: number;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          chat_room_id?: number;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
    };
  };
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Specific types for common entities
export type Destination = Tables<'destinations'>;
export type Accommodation = Tables<'accommodations'>;
export type Attraction = Tables<'attractions'>;
export type Restaurant = Tables<'restaurants'>;
export type User = Tables<'users'>;
export type Trip = Tables<'trips'>;
export type Expense = Tables<'expenses'>;
export type PlaceReview = Tables<'place_reviews'>;
export type ChatRoom = Tables<'chat_rooms'>;
export type Message = Tables<'messages'>;

// Insert types
export type DestinationInsert = Inserts<'destinations'>;
export type TripInsert = Inserts<'trips'>;
export type ExpenseInsert = Inserts<'expenses'>;
export type PlaceReviewInsert = Inserts<'place_reviews'>;
export type MessageInsert = Inserts<'messages'>;