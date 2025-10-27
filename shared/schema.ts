import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  currentLocation: varchar("current_location"),
  travelStyle: varchar("travel_style"),
  // Enhanced personalization fields
  interests: text("interests").array(),
  travelStyles: text("travel_styles").array(), 
  budgetRange: varchar("budget_range"),
  experienceLevel: varchar("experience_level"),
  groupSize: varchar("group_size"),
  preferredDuration: varchar("preferred_duration"),
  accommodationType: text("accommodation_type").array(),
  activities: text("activities").array(),
  dietaryRestrictions: text("dietary_restrictions").array(),
  languages: text("languages").array(),
  personalityTraits: text("personality_traits").array(),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  registrationCompleted: boolean("registration_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trips table
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  destinations: jsonb("destinations").notNull(), // Array of destination objects
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  travelStyle: varchar("travel_style"),
  itinerary: jsonb("itinerary"), // Daily itinerary data
  isPublic: boolean("is_public").default(true),
  adults: integer("adults").default(2), // Number of adults
  children: integer("children").default(0), // Number of children
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Multi-Destination Journeys table (pre-made travel routes)
export const journeys = pgTable("journeys", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  destinations: jsonb("destinations").notNull(), // Array of {name, country, nights, transport: {type, cost, duration}}
  totalNights: integer("total_nights").notNull(),
  priceMin: decimal("price_min", { precision: 10, scale: 2 }).notNull(),
  priceMax: decimal("price_max", { precision: 10, scale: 2 }).notNull(),
  season: text("season").array(), // ["summer", "winter", "spring", "fall", "year-round"]
  tags: text("tags").array(), // ["nature", "food", "culture", "nightlife", "adventure"]
  audienceTags: text("audience_tags").array(), // ["12+", "couple", "family", "solo", "group", "friends"]
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"), // 0.00 - 5.00
  popularity: integer("popularity").default(0),
  heroImage: text("hero_image"),
  images: text("images").array(),
  dailyItinerary: jsonb("daily_itinerary"), // Structured by destination: {destinationIndex: [{day, activities}]}
  costsBreakdown: jsonb("costs_breakdown"), // {transport: {min, max}, activities: {min, max}, lodging: {min, max}}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Saved Journeys table (user's saved journeys)
export const savedJourneys = pgTable("saved_journeys", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  journeyId: integer("journey_id").references(() => journeys.id).notNull(),
  notes: text("notes"), // Optional user notes about this journey
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced Reviews table for real places
export const placeReviews = pgTable("place_reviews", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  placeId: varchar("place_id").notNull(), // Google Places ID or TripAdvisor ID
  placeName: varchar("place_name").notNull(),
  placeType: varchar("place_type").notNull(), // "accommodation", "restaurant", "attraction", "activity"
  location: varchar("location").notNull(), // City, Country
  coordinates: jsonb("coordinates"), // {lat, lng}
  overallRating: integer("overall_rating").notNull(), // 1-5
  ratings: jsonb("ratings").notNull(), // {cleanliness: 5, location: 4, value: 3, service: 5}
  title: varchar("title").notNull(),
  comment: text("comment").notNull(),
  photos: text("photos").array(), // URLs to user photos
  tags: text("tags").array(), // ["solo-friendly", "budget", "party", "romantic"]
  visitedDate: timestamp("visited_date"),
  tripDuration: varchar("trip_duration"), // "1-2 days", "3-7 days", etc
  travelStyle: varchar("travel_style"), // "backpacker", "luxury", "family"
  helpfulCount: integer("helpful_count").default(0),
  isVerified: boolean("is_verified").default(false), // Verified by mods
  language: varchar("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Review helpfulness votes
export const reviewVotes = pgTable("review_votes", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").references(() => placeReviews.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  voteType: varchar("vote_type").notNull(), // "helpful", "not_helpful"
  createdAt: timestamp("created_at").defaultNow(),
});

// Legacy reviews table (keep for compatibility)
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  destination: varchar("destination").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  tags: jsonb("tags"),
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Expenses table
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").references(() => trips.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  category: varchar("category").notNull(), // "accommodation", "transportation", "food", "activities", "other"
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  location: varchar("location"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced Chat rooms with advanced features
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // "destination", "travel_style", "activity", "general", "private", "trip_buddy"
  destination: varchar("destination"), // For destination-specific chats
  travelDates: jsonb("travel_dates"), // {start: "2024-03-15", end: "2024-03-22"}
  maxMembers: integer("max_members").default(50),
  memberCount: integer("member_count").default(1),
  isPrivate: boolean("is_private").default(false),
  requiresApproval: boolean("requires_approval").default(false),
  tags: text("tags").array(), // ["backpacking", "budget", "solo-travel", "women-only"]
  languages: text("languages").array(), // ["en", "es", "pt"]
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat room members (updated for guest support)
export const chatRoomMembers = pgTable("chat_room_members", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => chatRooms.id).notNull(),
  userId: varchar("user_id").references(() => users.id), // Made nullable for guest support
  guestName: varchar("guest_name"), // For guest mode support
  role: varchar("role").default("member"), // "admin", "moderator", "member"
  joinedAt: timestamp("joined_at").defaultNow(),
  lastSeen: timestamp("last_seen").defaultNow(),
  notificationsEnabled: boolean("notifications_enabled").default(true),
});

// Enhanced Chat messages with rich content
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => chatRooms.id).notNull(),
  userId: varchar("user_id").references(() => users.id), // Made nullable for guest support
  authorName: varchar("author_name"), // For guest mode support
  message: text("message").notNull(),
  messageType: varchar("message_type").default("text"), // "text", "image", "location", "place_share", "trip_share", "file"
  metadata: jsonb("metadata"), // Store URLs, coordinates, place info, etc.
  replyTo: integer("reply_to"), // Reference to another message
  reactions: jsonb("reactions").default('{}'), // {👍: ["user1", "user2"], ❤️: ["user3"]}
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat attachments for file uploads
export const chatAttachments = pgTable("chat_attachments", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").references(() => chatMessages.id).notNull(),
  bucket: varchar("bucket").notNull().default("chat-uploads"),
  path: text("path").notNull(),
  url: text("url").notNull(),
  mimeType: varchar("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  width: integer("width"), // For images
  height: integer("height"), // For images
  filename: varchar("filename").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Travel buddy matching system
export const travelBuddyPosts = pgTable("travel_buddy_posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  destination: varchar("destination").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  groupSize: integer("group_size").notNull(),
  adults: integer("adults").default(2),
  children: integer("children").default(0),
  currentMembers: integer("current_members").default(1),
  budget: varchar("budget"), // "low", "mid", "high"
  travelStyle: text("travel_style").array(),
  activities: text("activities").array(),
  requirements: text("requirements"), // Age range, gender preferences, etc.
  contactInfo: jsonb("contact_info"), // How to get in touch
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Travel buddy applications
export const travelBuddyApplications = pgTable("travel_buddy_applications", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => travelBuddyPosts.id).notNull(),
  applicantId: varchar("applicant_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  status: varchar("status").default("pending"), // "pending", "accepted", "rejected"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Travel companions/connections table
export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  requesterId: varchar("requester_id").references(() => users.id).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id).notNull(),
  status: varchar("status").default("pending"), // "pending", "accepted", "declined"
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Achievement definitions table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // travel, social, budget, exploration, adventure, cultural
  iconName: varchar("icon_name").notNull(),
  badgeColor: varchar("badge_color").notNull(),
  requirement: text("requirement").notNull(), // JSON string describing requirements
  pointsReward: integer("points_reward").notNull().default(10),
  rarity: varchar("rarity").notNull().default("common"), // common, rare, epic, legendary
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements progress table
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  unlockedAt: timestamp("unlocked_at"),
  progress: integer("progress").default(0), // Current progress towards achievement
  progressMax: integer("progress_max").default(1), // Target for completion
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Points ledger for tracking all point transactions
export const pointsLedger = pgTable("points_ledger", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  action: varchar("action").notNull(), // "review.create", "photo.upload", etc.
  actionKey: varchar("action_key").unique(), // "review:123" for anti-abuse
  points: integer("points").notNull(),
  metadata: jsonb("metadata"), // Additional context data
  description: text("description"), // Human readable description
  createdAt: timestamp("created_at").defaultNow(),
});

// User points summary for quick access
export const userPointsSummary = pgTable("user_points_summary", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  totalPoints: integer("total_points").default(0),
  level: integer("level").default(1),
  weeklyPoints: integer("weekly_points").default(0),
  monthlyPoints: integer("monthly_points").default(0),
  lastResetDate: timestamp("last_reset_date").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily/weekly missions
export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  nameHe: varchar("name_he"), // Hebrew translation
  description: text("description").notNull(),
  descriptionHe: text("description_he"), // Hebrew translation
  type: varchar("type").notNull(), // "daily", "weekly"
  action: varchar("action").notNull(), // "review.create", "photo.upload", etc.
  targetCount: integer("target_count").default(1), // How many times to complete
  pointsReward: integer("points_reward").notNull(),
  isActive: boolean("is_active").default(true),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User mission progress
export const userMissionProgress = pgTable("user_mission_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  missionId: integer("mission_id").references(() => missions.id).notNull(),
  currentCount: integer("current_count").default(0),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  periodStart: timestamp("period_start").defaultNow(), // Start of current period
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// TripAdvisor-like data tables
export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  locationId: varchar("location_id").unique().notNull(), // TripAdvisor location ID
  name: varchar("name").notNull(),
  lat: decimal("lat", { precision: 10, scale: 8 }),
  lon: decimal("lon", { precision: 11, scale: 8 }),
  addressStreet1: varchar("address_street1"),
  addressStreet2: varchar("address_street2"),
  city: varchar("city"),
  state: varchar("state"),
  country: varchar("country").notNull(),
  postalCode: varchar("postal_code"),
  addressString: text("address_string"),
  webUrl: text("web_url"),
  photoCount: integer("photo_count").default(0),
  timezone: varchar("timezone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const accommodations = pgTable("accommodations", {
  id: serial("id").primaryKey(),
  locationId: varchar("location_id").unique().notNull(), // TripAdvisor location ID
  destinationId: integer("destination_id").references(() => destinations.id),
  name: varchar("name").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }), // Overall rating (1-5)
  numReviews: integer("num_reviews").default(0),
  priceLevel: varchar("price_level"), // $, $$, $$$, $$$$
  category: varchar("category").notNull().default("hotel"), // hotel, bed_and_breakfast, etc.
  lat: decimal("lat", { precision: 10, scale: 8 }),
  lon: decimal("lon", { precision: 11, scale: 8 }),
  addressStreet1: varchar("address_street1"),
  addressStreet2: varchar("address_street2"),
  city: varchar("city"),
  state: varchar("state"),
  country: varchar("country").notNull(),
  postalCode: varchar("postal_code"),
  addressString: text("address_string"),
  webUrl: text("web_url"),
  writeReviewUrl: text("write_review_url"),
  bookingUrl: text("booking_url"),
  isBookable: boolean("is_bookable").default(false),
  photoCount: integer("photo_count").default(0),
  ranking: integer("ranking"),
  rankingOutOf: integer("ranking_out_of"),
  rankingString: varchar("ranking_string"),
  geoLocationId: varchar("geo_location_id"),
  geoLocationName: varchar("geo_location_name"),
  amenities: text("amenities").array(),
  awards: jsonb("awards"), // Store award information as JSON
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const attractions = pgTable("attractions", {
  id: serial("id").primaryKey(),
  locationId: varchar("location_id").unique().notNull(), // TripAdvisor location ID
  destinationId: integer("destination_id").references(() => destinations.id),
  name: varchar("name").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }), // Overall rating (1-5)
  numReviews: integer("num_reviews").default(0),
  priceLevel: varchar("price_level"), // $, $$, $$$, $$$$
  category: varchar("category").notNull(), // attraction
  subcategory: varchar("subcategory"),
  attractionTypes: text("attraction_types").array(),
  lat: decimal("lat", { precision: 10, scale: 8 }),
  lon: decimal("lon", { precision: 11, scale: 8 }),
  addressStreet1: varchar("address_street1"),
  addressStreet2: varchar("address_street2"),
  city: varchar("city"),
  state: varchar("state"),
  country: varchar("country").notNull(),
  postalCode: varchar("postal_code"),
  addressString: text("address_string"),
  webUrl: text("web_url"),
  writeReviewUrl: text("write_review_url"),
  photoCount: integer("photo_count").default(0),
  ranking: integer("ranking"),
  rankingOutOf: integer("ranking_out_of"),
  rankingString: varchar("ranking_string"),
  geoLocationId: varchar("geo_location_id"),
  geoLocationName: varchar("geo_location_name"),
  hours: jsonb("hours"), // Store operating hours as JSON
  awards: jsonb("awards"), // Store award information as JSON
  groups: jsonb("groups"), // Attraction groups and categories
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  locationId: varchar("location_id").unique().notNull(), // TripAdvisor location ID
  destinationId: integer("destination_id").references(() => destinations.id),
  name: varchar("name").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }), // Overall rating (1-5)
  numReviews: integer("num_reviews").default(0),
  priceLevel: varchar("price_level"), // $, $$, $$$, $$$$
  category: varchar("category").notNull().default("restaurant"),
  cuisine: text("cuisine").array(), // Array of cuisine types
  lat: decimal("lat", { precision: 10, scale: 8 }),
  lon: decimal("lon", { precision: 11, scale: 8 }),
  addressStreet1: varchar("address_street1"),
  addressStreet2: varchar("address_street2"),
  city: varchar("city"),
  state: varchar("state"),
  country: varchar("country").notNull(),
  postalCode: varchar("postal_code"),
  addressString: text("address_string"),
  webUrl: text("web_url"),
  writeReviewUrl: text("write_review_url"),
  photoCount: integer("photo_count").default(0),
  ranking: integer("ranking"),
  rankingOutOf: integer("ranking_out_of"),
  rankingString: varchar("ranking_string"),
  geoLocationId: varchar("geo_location_id"),
  geoLocationName: varchar("geo_location_name"),
  hours: jsonb("hours"), // Store operating hours as JSON
  awards: jsonb("awards"), // Store award information as JSON
  dietaryRestrictions: text("dietary_restrictions").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const locationReviews = pgTable("location_reviews", {
  id: serial("id").primaryKey(),
  locationId: varchar("location_id").notNull(), // References TripAdvisor location ID
  locationCategory: varchar("location_category").notNull(), // "accommodation", "attraction", "restaurant"
  userId: varchar("user_id").references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 rating
  title: varchar("title"),
  text: text("text"),
  travelDate: timestamp("travel_date"),
  tripType: varchar("trip_type"), // business, couples, solo, family, friends
  helpful: integer("helpful").default(0),
  language: varchar("language").default("en"),
  source: varchar("source").default("tripadvisor"), // tripadvisor, internal, etc.
  externalReviewId: varchar("external_review_id"), // Original review ID from source
  createdAt: timestamp("created_at").defaultNow(),
});

export const locationSubratings = pgTable("location_subratings", {
  id: serial("id").primaryKey(),
  locationId: varchar("location_id").notNull(), // References TripAdvisor location ID
  locationCategory: varchar("location_category").notNull(), // "accommodation", "restaurant"
  ratingType: varchar("rating_type").notNull(), // location, sleep, room, service, value, cleanliness, food, atmosphere
  rating: decimal("rating", { precision: 2, scale: 1 }), // 1-5 rating
  localizedName: varchar("localized_name"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const locationPhotos = pgTable("location_photos", {
  id: serial("id").primaryKey(),
  locationId: varchar("location_id").notNull(), // References TripAdvisor location ID
  locationCategory: varchar("location_category").notNull(), // "accommodation", "attraction", "restaurant"
  photoUrl: text("photo_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  caption: text("caption"),
  uploadedBy: varchar("uploaded_by"), // user or business
  width: integer("width"),
  height: integer("height"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const locationAncestors = pgTable("location_ancestors", {
  id: serial("id").primaryKey(),
  locationId: varchar("location_id").notNull(), // References TripAdvisor location ID
  ancestorLocationId: varchar("ancestor_location_id").notNull(),
  level: varchar("level").notNull(), // City, State, Country
  name: varchar("name").notNull(),
  abbreviation: varchar("abbreviation"),
});

// i18n translation tables for admin editing
export const destinationsI18n = pgTable("destinations_i18n", {
  id: serial("id").primaryKey(),
  destinationId: integer("destination_id").references(() => destinations.id).notNull(),
  locale: varchar("locale", { length: 5 }).notNull(), // 'en', 'he'
  name: varchar("name"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("destinations_i18n_destination_locale_idx").on(table.destinationId, table.locale),
]);

export const accommodationsI18n = pgTable("accommodations_i18n", {
  id: serial("id").primaryKey(),
  accommodationId: integer("accommodation_id").references(() => accommodations.id).notNull(),
  locale: varchar("locale", { length: 5 }).notNull(), // 'en', 'he'
  name: varchar("name"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("accommodations_i18n_accommodation_locale_idx").on(table.accommodationId, table.locale),
]);

export const attractionsI18n = pgTable("attractions_i18n", {
  id: serial("id").primaryKey(),
  attractionId: integer("attraction_id").references(() => attractions.id).notNull(),
  locale: varchar("locale", { length: 5 }).notNull(), // 'en', 'he'
  name: varchar("name"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("attractions_i18n_attraction_locale_idx").on(table.attractionId, table.locale),
]);

export const restaurantsI18n = pgTable("restaurants_i18n", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").references(() => restaurants.id).notNull(),
  locale: varchar("locale", { length: 5 }).notNull(), // 'en', 'he'
  name: varchar("name"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("restaurants_i18n_restaurant_locale_idx").on(table.restaurantId, table.locale),
]);

// Itineraries table - stores saved trips with editable items
export const itineraries = pgTable("itineraries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(), // String UUID to match Supabase auth.users.id
  title: text("title").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  source: text("source"), // 'suggested', 'manual', etc.
  sourceRef: text("source_ref"), // Reference to original suggestion
  planJson: jsonb("plan_json"), // Optional: backup/cache of complete structure
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("itineraries_user_id_idx").on(table.userId),
  index("itineraries_created_at_idx").on(table.createdAt),
]);

// Detailed itinerary items table for day-by-day planning
export const itineraryItems = pgTable("itinerary_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  itineraryId: uuid("itinerary_id").references(() => itineraries.id, { onDelete: "cascade" }).notNull(),
  dayIndex: integer("day_index").notNull().default(1),
  position: integer("position").notNull().default(0),
  itemType: text("item_type").notNull(), // 'attraction', 'restaurant', 'accommodation', 'transport', 'other'
  refTable: text("ref_table"), // 'attractions', 'restaurants', 'accommodations', 'destinations'
  refId: text("ref_id"), // UUID or external ID to link to actual entities
  title: text("title"), // Fallback name if no ref
  notes: text("notes"),
  startTime: timestamp("start_time", { withTimezone: true }),
  endTime: timestamp("end_time", { withTimezone: true }),
  source: text("source"), // 'suggested', 'manual', etc.
  sourceRef: text("source_ref"), // Reference to original suggestion
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("items_itinerary_id_idx").on(table.itineraryId),
  index("items_day_position_idx").on(table.dayIndex, table.position),
]);

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  trips: many(trips),
  reviews: many(reviews),
  expenses: many(expenses),
  sentConnections: many(connections, { relationName: "requester" }),
  receivedConnections: many(connections, { relationName: "receiver" }),
  chatMessages: many(chatMessages),
  userAchievements: many(userAchievements),
  itineraries: many(itineraries),
  pointsLedger: many(pointsLedger),
  pointsSummary: one(userPointsSummary),
  missionProgress: many(userMissionProgress),
}));

export const itinerariesRelations = relations(itineraries, ({ one, many }) => ({
  user: one(users, {
    fields: [itineraries.userId],
    references: [users.id],
  }),
  items: many(itineraryItems),
}));

export const itineraryItemsRelations = relations(itineraryItems, ({ one }) => ({
  itinerary: one(itineraries, {
    fields: [itineraryItems.itineraryId],
    references: [itineraries.id],
  }),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  user: one(users, {
    fields: [trips.userId],
    references: [users.id],
  }),
  expenses: many(expenses),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  trip: one(trips, {
    fields: [expenses.tripId],
    references: [trips.id],
  }),
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}));

export const chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
  creator: one(users, {
    fields: [chatRooms.createdBy],
    references: [users.id],
  }),
  members: many(chatRoomMembers),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one, many }) => ({
  room: one(chatRooms, {
    fields: [chatMessages.roomId],
    references: [chatRooms.id],
  }),
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
  attachments: many(chatAttachments),
}));

export const chatAttachmentsRelations = relations(chatAttachments, ({ one }) => ({
  message: one(chatMessages, {
    fields: [chatAttachments.messageId],
    references: [chatMessages.id],
  }),
}));

export const connectionsRelations = relations(connections, ({ one }) => ({
  requester: one(users, {
    fields: [connections.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  receiver: one(users, {
    fields: [connections.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

// New community feature relations
export const placeReviewsRelations = relations(placeReviews, ({ one, many }) => ({
  user: one(users, {
    fields: [placeReviews.userId],
    references: [users.id],
  }),
  votes: many(reviewVotes),
}));

export const reviewVotesRelations = relations(reviewVotes, ({ one }) => ({
  review: one(placeReviews, {
    fields: [reviewVotes.reviewId],
    references: [placeReviews.id],
  }),
  user: one(users, {
    fields: [reviewVotes.userId],
    references: [users.id],
  }),
}));

export const chatRoomMembersRelations = relations(chatRoomMembers, ({ one }) => ({
  room: one(chatRooms, {
    fields: [chatRoomMembers.roomId],
    references: [chatRooms.id],
  }),
  user: one(users, {
    fields: [chatRoomMembers.userId],
    references: [users.id],
  }),
}));

export const travelBuddyPostsRelations = relations(travelBuddyPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [travelBuddyPosts.userId],
    references: [users.id],
  }),
  applications: many(travelBuddyApplications),
}));

export const travelBuddyApplicationsRelations = relations(travelBuddyApplications, ({ one }) => ({
  post: one(travelBuddyPosts, {
    fields: [travelBuddyApplications.postId],
    references: [travelBuddyPosts.id],
  }),
  applicant: one(users, {
    fields: [travelBuddyApplications.applicantId],
    references: [users.id],
  }),
}));

// Points and achievements relations
export const pointsLedgerRelations = relations(pointsLedger, ({ one }) => ({
  user: one(users, {
    fields: [pointsLedger.userId],
    references: [users.id],
  }),
}));

export const userPointsSummaryRelations = relations(userPointsSummary, ({ one }) => ({
  user: one(users, {
    fields: [userPointsSummary.userId],
    references: [users.id],
  }),
}));

export const missionsRelations = relations(missions, ({ many }) => ({
  userProgress: many(userMissionProgress),
}));

export const userMissionProgressRelations = relations(userMissionProgress, ({ one }) => ({
  user: one(users, {
    fields: [userMissionProgress.userId],
    references: [users.id],
  }),
  mission: one(missions, {
    fields: [userMissionProgress.missionId],
    references: [missions.id],
  }),
}));

// TripAdvisor data relations
export const destinationsRelations = relations(destinations, ({ many }) => ({
  accommodations: many(accommodations),
  attractions: many(attractions),
  restaurants: many(restaurants),
}));

export const accommodationsRelations = relations(accommodations, ({ one, many }) => ({
  destination: one(destinations, {
    fields: [accommodations.destinationId],
    references: [destinations.id],
  }),
  reviews: many(locationReviews),
  subratings: many(locationSubratings),
  photos: many(locationPhotos),
  ancestors: many(locationAncestors),
}));

export const attractionsRelations = relations(attractions, ({ one, many }) => ({
  destination: one(destinations, {
    fields: [attractions.destinationId],
    references: [destinations.id],
  }),
  reviews: many(locationReviews),
  photos: many(locationPhotos),
  ancestors: many(locationAncestors),
}));

export const restaurantsRelations = relations(restaurants, ({ one, many }) => ({
  destination: one(destinations, {
    fields: [restaurants.destinationId],
    references: [destinations.id],
  }),
  reviews: many(locationReviews),
  subratings: many(locationSubratings),
  photos: many(locationPhotos),
  ancestors: many(locationAncestors),
}));

export const locationReviewsRelations = relations(locationReviews, ({ one }) => ({
  user: one(users, {
    fields: [locationReviews.userId],
    references: [users.id],
  }),
}));

export const locationSubratingsRelations = relations(locationSubratings, ({ one }) => ({
  accommodation: one(accommodations, {
    fields: [locationSubratings.locationId],
    references: [accommodations.locationId],
  }),
  restaurant: one(restaurants, {
    fields: [locationSubratings.locationId],
    references: [restaurants.locationId],
  }),
}));

export const locationPhotosRelations = relations(locationPhotos, ({ one }) => ({
  accommodation: one(accommodations, {
    fields: [locationPhotos.locationId],
    references: [accommodations.locationId],
  }),
  attraction: one(attractions, {
    fields: [locationPhotos.locationId],
    references: [attractions.locationId],
  }),
  restaurant: one(restaurants, {
    fields: [locationPhotos.locationId],
    references: [restaurants.locationId],
  }),
}));

export const locationAncestorsRelations = relations(locationAncestors, ({ one }) => ({
  accommodation: one(accommodations, {
    fields: [locationAncestors.locationId],
    references: [accommodations.locationId],
  }),
  attraction: one(attractions, {
    fields: [locationAncestors.locationId],
    references: [attractions.locationId],
  }),
  restaurant: one(restaurants, {
    fields: [locationAncestors.locationId],
    references: [restaurants.locationId],
  }),
}));


// Insert schemas
export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJourneySchema = createInsertSchema(journeys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  popularity: true,
});

export const insertSavedJourneySchema = createInsertSchema(savedJourneys).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  helpfulCount: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertChatAttachmentSchema = createInsertSchema(chatAttachments).omit({
  id: true,
  createdAt: true,
});

export const insertConnectionSchema = createInsertSchema(connections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

// New Zod schemas for enhanced community features
export const insertPlaceReviewSchema = createInsertSchema(placeReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  helpfulCount: true,
  isVerified: true,
}).extend({
  overallRating: z.number().min(1).max(5),
  ratings: z.object({
    cleanliness: z.number().min(1).max(5).optional(),
    location: z.number().min(1).max(5).optional(), 
    value: z.number().min(1).max(5).optional(),
    service: z.number().min(1).max(5).optional(),
    facilities: z.number().min(1).max(5).optional(),
  }),
  title: z.string().min(5).max(100),
  comment: z.string().min(20).max(2000),
  tags: z.array(z.string()).max(10),
});

export const insertReviewVoteSchema = createInsertSchema(reviewVotes).omit({
  id: true,
  createdAt: true,
});

export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  memberCount: true,
  lastActivity: true,
}).extend({
  name: z.string().min(3).max(50),
  description: z.string().max(200).optional(),
  tags: z.array(z.string()).max(10),
  maxMembers: z.number().min(2).max(100),
});

export const insertChatRoomMemberSchema = createInsertSchema(chatRoomMembers).omit({
  id: true,
  joinedAt: true,
  lastSeen: true,
});

export const insertTravelBuddyPostSchema = createInsertSchema(travelBuddyPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentMembers: true,
  isActive: true,
}).extend({
  title: z.string().min(10).max(100),
  description: z.string().min(20).max(1000),
  groupSize: z.number().min(1).max(20),
  adults: z.number().min(1).max(8).default(2),
  children: z.number().min(0).max(6).default(0),
  travelStyle: z.array(z.string()).max(5),
  activities: z.array(z.string()).max(10),
});

export const insertTravelBuddyApplicationSchema = createInsertSchema(travelBuddyApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

// Type exports for the new schemas
export type PlaceReview = typeof placeReviews.$inferSelect;
export type InsertPlaceReview = z.infer<typeof insertPlaceReviewSchema>;
export type ReviewVote = typeof reviewVotes.$inferSelect;
export type InsertReviewVote = z.infer<typeof insertReviewVoteSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatRoomMember = typeof chatRoomMembers.$inferSelect;
export type InsertChatRoomMember = z.infer<typeof insertChatRoomMemberSchema>;
export type TravelBuddyPost = typeof travelBuddyPosts.$inferSelect;
export type InsertTravelBuddyPost = z.infer<typeof insertTravelBuddyPostSchema>;
export type TravelBuddyApplication = typeof travelBuddyApplications.$inferSelect;
export type InsertTravelBuddyApplication = z.infer<typeof insertTravelBuddyApplicationSchema>;

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
  createdAt: true,
});

// Points and missions insert schemas
export const insertPointsLedgerSchema = createInsertSchema(pointsLedger).omit({
  id: true,
  createdAt: true,
});

export const insertUserPointsSummarySchema = createInsertSchema(userPointsSummary).omit({
  id: true,
  updatedAt: true,
});

export const insertMissionSchema = createInsertSchema(missions).omit({
  id: true,
  createdAt: true,
});

export const insertUserMissionProgressSchema = createInsertSchema(userMissionProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TripAdvisor insert schemas
export const insertDestinationSchema = createInsertSchema(destinations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAccommodationSchema = createInsertSchema(accommodations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAttractionSchema = createInsertSchema(attractions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLocationReviewSchema = createInsertSchema(locationReviews).omit({
  id: true,
  createdAt: true,
});

export const insertLocationSubratingSchema = createInsertSchema(locationSubratings).omit({
  id: true,
  updatedAt: true,
});

export const insertLocationPhotoSchema = createInsertSchema(locationPhotos).omit({
  id: true,
  createdAt: true,
});

export const insertLocationAncestorSchema = createInsertSchema(locationAncestors).omit({
  id: true,
});

// i18n insert schemas
export const insertDestinationI18nSchema = createInsertSchema(destinationsI18n).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAccommodationI18nSchema = createInsertSchema(accommodationsI18n).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAttractionI18nSchema = createInsertSchema(attractionsI18n).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRestaurantI18nSchema = createInsertSchema(restaurantsI18n).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Journey = typeof journeys.$inferSelect;
export type InsertJourney = z.infer<typeof insertJourneySchema>;
export type SavedJourney = typeof savedJourneys.$inferSelect;
export type InsertSavedJourney = z.infer<typeof insertSavedJourneySchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatAttachment = typeof chatAttachments.$inferSelect;
export type InsertChatAttachment = z.infer<typeof insertChatAttachmentSchema>;
export type Connection = typeof connections.$inferSelect;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

// Points and missions types
export type PointsLedger = typeof pointsLedger.$inferSelect;
export type InsertPointsLedger = z.infer<typeof insertPointsLedgerSchema>;
export type UserPointsSummary = typeof userPointsSummary.$inferSelect;
export type InsertUserPointsSummary = z.infer<typeof insertUserPointsSummarySchema>;
export type Mission = typeof missions.$inferSelect;
export type InsertMission = z.infer<typeof insertMissionSchema>;
export type UserMissionProgress = typeof userMissionProgress.$inferSelect;
export type InsertUserMissionProgress = z.infer<typeof insertUserMissionProgressSchema>;

// TripAdvisor types
export type Destination = typeof destinations.$inferSelect;
export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type Accommodation = typeof accommodations.$inferSelect;
export type InsertAccommodation = z.infer<typeof insertAccommodationSchema>;
export type Attraction = typeof attractions.$inferSelect;
export type InsertAttraction = z.infer<typeof insertAttractionSchema>;
export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type LocationReview = typeof locationReviews.$inferSelect;
export type InsertLocationReview = z.infer<typeof insertLocationReviewSchema>;
export type LocationSubrating = typeof locationSubratings.$inferSelect;
export type InsertLocationSubrating = z.infer<typeof insertLocationSubratingSchema>;
export type LocationPhoto = typeof locationPhotos.$inferSelect;
export type InsertLocationPhoto = z.infer<typeof insertLocationPhotoSchema>;
export type LocationAncestor = typeof locationAncestors.$inferSelect;
export type InsertLocationAncestor = z.infer<typeof insertLocationAncestorSchema>;

// Hotel Inquiries table (for hotel-deals page)
export const hotelInquiries = pgTable("hotel_inquiries", {
  id: serial("id").primaryKey(),
  destination: varchar("destination").notNull(),
  checkIn: timestamp("check_in").notNull(),
  checkOut: timestamp("check_out").notNull(),
  adults: integer("adults").notNull().default(2),
  children: integer("children").notNull().default(0),
  budget: varchar("budget").notNull(),
  phone: varchar("phone").notNull(),
  email: varchar("email").notNull(),
  notes: text("notes"),
  whatsappConsent: boolean("whatsapp_consent").default(false),
  status: varchar("status").default("new"), // new, contacted, quoted, booked, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertHotelInquirySchema = createInsertSchema(hotelInquiries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export type HotelInquiry = typeof hotelInquiries.$inferSelect;
export type InsertHotelInquiry = z.infer<typeof insertHotelInquirySchema>;

// AI Chat Sessions table
export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  messages: jsonb("messages").notNull(), // Array of {id, content, sender, timestamp, suggestions?, type?}
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastMessageAt: true,
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;

// Flight Bookings table
export const flightBookings = pgTable("flight_bookings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  offerId: varchar("offer_id").notNull(), // Duffel offer ID
  flightData: jsonb("flight_data").notNull(), // Complete flight offer data {slices, owner, etc}
  passengerData: jsonb("passenger_data").notNull(), // Passenger details array
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull(),
  status: varchar("status").notNull().default("upcoming"), // upcoming, completed, cancelled
  bookingReference: varchar("booking_reference"), // Confirmation number
  origin: varchar("origin").notNull(), // IATA code
  destination: varchar("destination").notNull(), // IATA code
  departureDate: timestamp("departure_date").notNull(),
  returnDate: timestamp("return_date"), // Optional for round trips
  adults: integer("adults").notNull(),
  children: integer("children").notNull().default(0),
  cabinClass: varchar("cabin_class").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFlightBookingSchema = createInsertSchema(flightBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FlightBooking = typeof flightBookings.$inferSelect;
export type InsertFlightBooking = z.infer<typeof insertFlightBookingSchema>;

// i18n types
export type DestinationI18n = typeof destinationsI18n.$inferSelect;
export type InsertDestinationI18n = z.infer<typeof insertDestinationI18nSchema>;
export type AccommodationI18n = typeof accommodationsI18n.$inferSelect;
export type InsertAccommodationI18n = z.infer<typeof insertAccommodationI18nSchema>;
export type AttractionI18n = typeof attractionsI18n.$inferSelect;
export type InsertAttractionI18n = z.infer<typeof insertAttractionI18nSchema>;
export type RestaurantI18n = typeof restaurantsI18n.$inferSelect;
export type InsertRestaurantI18n = z.infer<typeof insertRestaurantI18nSchema>;

// Itinerary schemas and types
export const insertItinerarySchema = createInsertSchema(itineraries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertItineraryItemSchema = createInsertSchema(itineraryItems).omit({
  id: true,
  createdAt: true,
});

export type Itinerary = typeof itineraries.$inferSelect;
export type InsertItinerary = z.infer<typeof insertItinerarySchema>;
export type ItineraryItem = typeof itineraryItems.$inferSelect;
export type InsertItineraryItem = z.infer<typeof insertItineraryItemSchema>;

// Emergency Information table
export const emergencyInfo = pgTable("emergency_info", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  // Emergency Contacts (JSONB array of contacts)
  emergencyContacts: jsonb("emergency_contacts"), // [{name, phone, relationship, email}]
  // Medical Information
  bloodType: varchar("blood_type"), // A+, B-, O+, AB-, etc.
  allergies: text("allergies"), // Free text for allergies
  medications: text("medications"), // Free text for medications
  medicalConditions: text("medical_conditions"), // Free text for medical conditions
  doctorName: varchar("doctor_name"), // Doctor's name
  doctorPhone: varchar("doctor_phone"), // Doctor's phone
  // Insurance Information
  insuranceProvider: varchar("insurance_provider"),
  policyNumber: varchar("policy_number"),
  insuranceEmergencyPhone: varchar("insurance_emergency_phone"),
  // Passport Information
  passportNumber: varchar("passport_number"),
  passportExpiry: timestamp("passport_expiry"),
  passportCountry: varchar("passport_country"),
  // Additional Notes
  additionalNotes: text("additional_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEmergencyInfoSchema = createInsertSchema(emergencyInfo).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  passportExpiry: z.union([z.string(), z.date()]).optional().transform(val => {
    if (!val) return undefined;
    if (typeof val === 'string') return new Date(val);
    return val;
  }),
});

export type EmergencyInfo = typeof emergencyInfo.$inferSelect;
export type InsertEmergencyInfo = z.infer<typeof insertEmergencyInfoSchema>;
