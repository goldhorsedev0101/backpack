export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      destinations: {
        Row: {
          id: number
          name: string
          country: string
          description: string | null
          best_time_to_visit: string | null
          average_cost: number | null
          popularity: number | null
          image_url: string | null
          coordinates: Json | null
          weather_info: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          country: string
          description?: string | null
          best_time_to_visit?: string | null
          average_cost?: number | null
          popularity?: number | null
          image_url?: string | null
          coordinates?: Json | null
          weather_info?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          country?: string
          description?: string | null
          best_time_to_visit?: string | null
          average_cost?: number | null
          popularity?: number | null
          image_url?: string | null
          coordinates?: Json | null
          weather_info?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      accommodations: {
        Row: {
          id: number
          destination_id: number
          name: string
          type: string
          address: string | null
          price_range: string | null
          rating: number | null
          amenities: Json | null
          contact_info: Json | null
          booking_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          destination_id: number
          name: string
          type: string
          address?: string | null
          price_range?: string | null
          rating?: number | null
          amenities?: Json | null
          contact_info?: Json | null
          booking_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          destination_id?: number
          name?: string
          type?: string
          address?: string | null
          price_range?: string | null
          rating?: number | null
          amenities?: Json | null
          contact_info?: Json | null
          booking_url?: string | null
          created_at?: string | null
        }
      }
      attractions: {
        Row: {
          id: number
          destination_id: number
          name: string
          type: string
          description: string | null
          entry_fee: number | null
          opening_hours: string | null
          rating: number | null
          coordinates: Json | null
          created_at: string | null
        }
        Insert: {
          id?: number
          destination_id: number
          name: string
          type: string
          description?: string | null
          entry_fee?: number | null
          opening_hours?: string | null
          rating?: number | null
          coordinates?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: number
          destination_id?: number
          name?: string
          type?: string
          description?: string | null
          entry_fee?: number | null
          opening_hours?: string | null
          rating?: number | null
          coordinates?: Json | null
          created_at?: string | null
        }
      }
      restaurants: {
        Row: {
          id: number
          destination_id: number
          name: string
          cuisine_type: string
          address: string | null
          price_range: string | null
          rating: number | null
          specialties: Json | null
          contact_info: Json | null
          created_at: string | null
        }
        Insert: {
          id?: number
          destination_id: number
          name: string
          cuisine_type: string
          address?: string | null
          price_range?: string | null
          rating?: number | null
          specialties?: Json | null
          contact_info?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: number
          destination_id?: number
          name?: string
          cuisine_type?: string
          address?: string | null
          price_range?: string | null
          rating?: number | null
          specialties?: Json | null
          contact_info?: Json | null
          created_at?: string | null
        }
      }
      places: {
        Row: {
          id: number
          name: string
          description: string | null
          location: string
          rating: number | null
          created_at: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          location: string
          rating?: number | null
          created_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          location?: string
          rating?: number | null
          created_at?: string | null
        }
      }
      place_reviews: {
        Row: {
          id: number
          place_id: number
          user_name: string
          rating: number
          comment: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          place_id: number
          user_name: string
          rating: number
          comment?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          place_id?: number
          user_name?: string
          rating?: number
          comment?: string | null
          created_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          username: string
          email: string
          interests: Json | null
          travel_styles: Json | null
          budget_range: string | null
          experience_level: string | null
          group_size: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          username: string
          email: string
          interests?: Json | null
          travel_styles?: Json | null
          budget_range?: string | null
          experience_level?: string | null
          group_size?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          email?: string
          interests?: Json | null
          travel_styles?: Json | null
          budget_range?: string | null
          experience_level?: string | null
          group_size?: string | null
          created_at?: string | null
        }
      }
      trips: {
        Row: {
          id: number
          user_id: string
          destination: string
          start_date: string
          end_date: string
          budget: number | null
          status: string
          itinerary: Json | null
          created_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          destination: string
          start_date: string
          end_date: string
          budget?: number | null
          status: string
          itinerary?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          destination?: string
          start_date?: string
          end_date?: string
          budget?: number | null
          status?: string
          itinerary?: Json | null
          created_at?: string | null
        }
      }
      expenses: {
        Row: {
          id: number
          user_id: string
          trip_id: number | null
          category: string
          amount: number
          currency: string
          description: string | null
          date: string
          created_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          trip_id?: number | null
          category: string
          amount: number
          currency: string
          description?: string | null
          date: string
          created_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          trip_id?: number | null
          category?: string
          amount?: number
          currency?: string
          description?: string | null
          date?: string
          created_at?: string | null
        }
      }
      chat_rooms: {
        Row: {
          id: number
          name: string
          topic: string | null
          created_by: string
          created_at: string | null
        }
        Insert: {
          id?: number
          name: string
          topic?: string | null
          created_by: string
          created_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          topic?: string | null
          created_by?: string
          created_at?: string | null
        }
      }
      messages: {
        Row: {
          id: number
          room_id: number
          user_id: string
          content: string
          created_at: string | null
        }
        Insert: {
          id?: number
          room_id: number
          user_id: string
          content: string
          created_at?: string | null
        }
        Update: {
          id?: number
          room_id?: number
          user_id?: string
          content?: string
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
  ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

// Convenient type aliases
export type Destination = Database["public"]["Tables"]["destinations"]["Row"]
export type Accommodation = Database["public"]["Tables"]["accommodations"]["Row"]
export type Attraction = Database["public"]["Tables"]["attractions"]["Row"]
export type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"]
export type Place = Database["public"]["Tables"]["places"]["Row"]
export type PlaceReview = Database["public"]["Tables"]["place_reviews"]["Row"]
export type User = Database["public"]["Tables"]["users"]["Row"]
export type Trip = Database["public"]["Tables"]["trips"]["Row"]
export type Expense = Database["public"]["Tables"]["expenses"]["Row"]
export type ChatRoom = Database["public"]["Tables"]["chat_rooms"]["Row"]
export type Message = Database["public"]["Tables"]["messages"]["Row"]

// Insert types
export type DestinationInsert = Database["public"]["Tables"]["destinations"]["Insert"]
export type AccommodationInsert = Database["public"]["Tables"]["accommodations"]["Insert"]
export type AttractionInsert = Database["public"]["Tables"]["attractions"]["Insert"]
export type RestaurantInsert = Database["public"]["Tables"]["restaurants"]["Insert"]
export type PlaceInsert = Database["public"]["Tables"]["places"]["Insert"]
export type PlaceReviewInsert = Database["public"]["Tables"]["place_reviews"]["Insert"]
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"]
export type TripInsert = Database["public"]["Tables"]["trips"]["Insert"]
export type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"]
export type ChatRoomInsert = Database["public"]["Tables"]["chat_rooms"]["Insert"]
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"]