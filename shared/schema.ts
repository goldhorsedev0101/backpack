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
} from "drizzle-orm/pg-core";
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
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  destination: varchar("destination").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  tags: jsonb("tags"), // Array of tags like ["food", "accommodation", "activities"]
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

// Chat rooms table
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // "destination", "general", "private"
  destination: varchar("destination"), // For destination-specific chats
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => chatRooms.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  messageType: varchar("message_type").default("text"), // "text", "image", "location"
  createdAt: timestamp("created_at").defaultNow(),
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
  points: integer("points").notNull().default(10),
  rarity: varchar("rarity").notNull().default("common"), // common, rare, epic, legendary
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements progress table
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  progress: integer("progress").default(0), // Current progress towards achievement
  isCompleted: boolean("is_completed").notNull().default(false),
});

// TripAdvisor-like data tables
export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  locationId: varchar("location_id").unique().notNull(), // TripAdvisor location ID
  name: varchar("name").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
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
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
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
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
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
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  trips: many(trips),
  reviews: many(reviews),
  expenses: many(expenses),
  sentConnections: many(connections, { relationName: "requester" }),
  receivedConnections: many(connections, { relationName: "receiver" }),
  chatMessages: many(chatMessages),
  userAchievements: many(userAchievements),
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
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  room: one(chatRooms, {
    fields: [chatMessages.roomId],
    references: [chatRooms.id],
  }),
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
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

export const insertConnectionSchema = createInsertSchema(connections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
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

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Connection = typeof connections.$inferSelect;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

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
