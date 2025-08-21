import {
  users,
  trips,
  reviews,
  expenses,
  chatRooms,
  chatMessages,
  chatRoomMembers,
  connections,
  achievements,
  userAchievements,
  destinations,
  accommodations,
  attractions,
  restaurants,
  locationReviews,
  locationSubratings,
  locationPhotos,
  locationAncestors,
  placeReviews,
  reviewVotes,
  travelBuddyPosts,
  travelBuddyApplications,
  type User,
  type UpsertUser,
  type Trip,
  type InsertTrip,
  type Review,
  type InsertReview,
  type Expense,
  type InsertExpense,
  type ChatRoom,
  type ChatMessage,
  type InsertChatMessage,
  type ChatRoomMember,
  type InsertChatRoomMember,
  type Connection,
  type InsertConnection,
  type Achievement,
  type UserAchievement,
  type InsertUserAchievement,
  type Destination,
  type InsertDestination,
  type Accommodation,
  type InsertAccommodation,
  type Attraction,
  type InsertAttraction,
  type Restaurant,
  type InsertRestaurant,
  type LocationReview,
  type InsertLocationReview,
  type LocationSubrating,
  type InsertLocationSubrating,
  type LocationPhoto,
  type InsertLocationPhoto,
  type LocationAncestor,
  type InsertLocationAncestor,
  type PlaceReview,
  type InsertPlaceReview,
  type ReviewVote,
  type InsertReviewVote,
  type TravelBuddyPost,
  type InsertTravelBuddyPost,
  type TravelBuddyApplication,
  type InsertTravelBuddyApplication,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPreferences(userId: string, preferences: Partial<User>): Promise<User>;
  
  // Trip operations
  createTrip(trip: InsertTrip): Promise<Trip>;
  getUserTrips(userId: string): Promise<Trip[]>;
  getPublicTrips(): Promise<Trip[]>;
  getTripById(id: number): Promise<Trip | undefined>;
  updateTrip(id: number, trip: Partial<InsertTrip>): Promise<Trip>;
  saveUserTrip(userId: string, trip: any): Promise<void>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByDestination(destination: string): Promise<Review[]>;
  getRecentReviews(): Promise<Review[]>;
  
  // Expense operations
  createExpense(expense: InsertExpense): Promise<Expense>;
  getTripExpenses(tripId: number): Promise<Expense[]>;
  getUserExpenses(userId: string): Promise<Expense[]>;
  
  // Chat operations
  getChatRooms(): Promise<ChatRoom[]>;
  getChatMessages(roomId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Connection operations
  createConnection(connection: InsertConnection): Promise<Connection>;
  getUserConnections(userId: string): Promise<Connection[]>;
  updateConnectionStatus(id: number, status: string): Promise<Connection>;
  
  // Achievement operations
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  updateAchievementProgress(userId: string, achievementId: number, progress: number): Promise<UserAchievement>;
  checkAndUnlockAchievements(userId: string): Promise<UserAchievement[]>;
  
  // TripAdvisor data operations
  // Destination operations
  createDestination(destination: InsertDestination): Promise<Destination>;
  getDestinations(): Promise<Destination[]>;
  getDestinationByLocationId(locationId: string): Promise<Destination | undefined>;
  updateDestination(locationId: string, destination: Partial<InsertDestination>): Promise<Destination>;
  searchDestinations(query: string): Promise<Destination[]>;
  
  // Accommodation operations
  createAccommodation(accommodation: InsertAccommodation): Promise<Accommodation>;
  getAccommodations(destinationId?: number): Promise<Accommodation[]>;
  getAccommodationByLocationId(locationId: string): Promise<Accommodation | undefined>;
  updateAccommodation(locationId: string, accommodation: Partial<InsertAccommodation>): Promise<Accommodation>;
  searchAccommodations(query: string, filters?: { destinationId?: number; priceLevel?: string; rating?: number }): Promise<Accommodation[]>;
  
  // Attraction operations
  createAttraction(attraction: InsertAttraction): Promise<Attraction>;
  getAttractions(destinationId?: number): Promise<Attraction[]>;
  getAttractionByLocationId(locationId: string): Promise<Attraction | undefined>;
  updateAttraction(locationId: string, attraction: Partial<InsertAttraction>): Promise<Attraction>;
  searchAttractions(query: string, filters?: { destinationId?: number; category?: string }): Promise<Attraction[]>;
  
  // Restaurant operations
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  getRestaurants(destinationId?: number): Promise<Restaurant[]>;
  getRestaurantByLocationId(locationId: string): Promise<Restaurant | undefined>;
  updateRestaurant(locationId: string, restaurant: Partial<InsertRestaurant>): Promise<Restaurant>;
  searchRestaurants(query: string, filters?: { destinationId?: number; cuisine?: string; priceLevel?: string }): Promise<Restaurant[]>;
  
  // Location review operations
  createLocationReview(review: InsertLocationReview): Promise<LocationReview>;
  getLocationReviews(locationId: string, category: string): Promise<LocationReview[]>;
  getRecentLocationReviews(): Promise<LocationReview[]>;
  
  // Location subrating operations
  upsertLocationSubratings(locationId: string, category: string, subratings: InsertLocationSubrating[]): Promise<LocationSubrating[]>;
  getLocationSubratings(locationId: string, category: string): Promise<LocationSubrating[]>;
  
  // Location photo operations
  createLocationPhoto(photo: InsertLocationPhoto): Promise<LocationPhoto>;
  getLocationPhotos(locationId: string, category: string): Promise<LocationPhoto[]>;
  
  // Location ancestor operations
  upsertLocationAncestors(locationId: string, ancestors: InsertLocationAncestor[]): Promise<LocationAncestor[]>;
  getLocationAncestors(locationId: string): Promise<LocationAncestor[]>;
  
  // Enhanced community features
  // Place review operations (for real places with Google Places API)
  createPlaceReview(review: InsertPlaceReview): Promise<PlaceReview>;
  getPlaceReviews(placeId: string): Promise<PlaceReview[]>;
  getRecentPlaceReviews(limit?: number): Promise<PlaceReview[]>;
  getUserPlaceReviews(userId: string): Promise<PlaceReview[]>;
  searchPlaceReviews(location: string, placeType?: string): Promise<PlaceReview[]>;
  updatePlaceReview(id: number, review: Partial<InsertPlaceReview>): Promise<PlaceReview>;
  deletePlaceReview(id: number, userId: string): Promise<boolean>;
  
  // Review voting operations
  voteOnReview(vote: InsertReviewVote): Promise<ReviewVote>;
  getReviewVotes(reviewId: number): Promise<ReviewVote[]>;
  getUserVoteOnReview(reviewId: number, userId: string): Promise<ReviewVote | undefined>;
  updateReviewHelpfulness(reviewId: number): Promise<void>;
  
  // Enhanced chat room operations
  createChatRoom(room: any): Promise<ChatRoom>;
  getChatRoomById(id: number): Promise<ChatRoom | undefined>;
  updateChatRoom(id: number, room: Partial<any>): Promise<ChatRoom>;
  deleteChatRoom(id: number, userId: string): Promise<boolean>;
  joinChatRoom(roomId: number, userId: string): Promise<ChatRoomMember>;
  leaveChatRoom(roomId: number, userId: string): Promise<boolean>;
  getChatRoomMembers(roomId: number): Promise<ChatRoomMember[]>;
  searchChatRooms(query: string, filters?: { type?: string; destination?: string }): Promise<ChatRoom[]>;
  updateChatRoomActivity(roomId: number): Promise<void>;
  
  // Travel buddy system operations
  createTravelBuddyPost(post: InsertTravelBuddyPost): Promise<TravelBuddyPost>;
  getTravelBuddyPosts(filters?: { destination?: string; startDate?: Date; endDate?: Date }): Promise<TravelBuddyPost[]>;
  getUserTravelBuddyPosts(userId: string): Promise<TravelBuddyPost[]>;
  updateTravelBuddyPost(id: number, post: Partial<InsertTravelBuddyPost>): Promise<TravelBuddyPost>;
  deleteTravelBuddyPost(id: number, userId: string): Promise<boolean>;
  
  // Travel buddy application operations
  applyForTravelBuddy(application: InsertTravelBuddyApplication): Promise<TravelBuddyApplication>;
  getTravelBuddyApplications(postId: number): Promise<TravelBuddyApplication[]>;
  getUserTravelBuddyApplications(userId: string): Promise<TravelBuddyApplication[]>;
  updateTravelBuddyApplication(id: number, status: string): Promise<TravelBuddyApplication>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserPreferences(userId: string, preferences: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...preferences,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }

  // Trip operations
  async createTrip(trip: InsertTrip): Promise<Trip> {
    const [newTrip] = await db.insert(trips).values(trip).returning();
    return newTrip;
  }

  async getUserTrips(userId: string): Promise<Trip[]> {
    return await db
      .select()
      .from(trips)
      .where(eq(trips.userId, userId))
      .orderBy(desc(trips.createdAt));
  }

  async getPublicTrips(): Promise<Trip[]> {
    return await db
      .select()
      .from(trips)
      .where(eq(trips.isPublic, true))
      .orderBy(desc(trips.createdAt))
      .limit(20);
  }

  async getTripById(id: number): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip;
  }

  async updateTrip(id: number, tripData: Partial<InsertTrip>): Promise<Trip> {
    const [updatedTrip] = await db
      .update(trips)
      .set({ ...tripData, updatedAt: new Date() })
      .where(eq(trips.id, id))
      .returning();
    return updatedTrip;
  }

  // Simple trip saving for suggestions (creates a new trip)
  async saveUserTrip(userId: string, trip: any): Promise<void> {
    try {
      // Format destinations as a proper JSONB array or object
      let destinationsData;
      
      if (typeof trip.destinations === 'string') {
        // If it's a string, wrap it in an array
        destinationsData = [trip.destinations];
      } else if (Array.isArray(trip.destinations)) {
        // If it's already an array, use it as is
        destinationsData = trip.destinations;
      } else {
        // Otherwise, create from the destination field
        destinationsData = [trip.destination || 'Unknown destination'];
      }

      const tripData: InsertTrip = {
        userId: userId,
        title: trip.destination || trip.title || 'Saved Trip',
        description: trip.description || `Trip to ${trip.destination}`,
        destinations: destinationsData, // Simple JSONB array
        budget: trip.budget || trip.estimatedBudget?.high?.toString() || '1000',
        travelStyle: Array.isArray(trip.travelStyle) ? trip.travelStyle.join(', ') : (trip.travelStyle || 'Adventure'),
        isPublic: false
      };

      console.log('Saving trip data:', JSON.stringify(tripData, null, 2));
      await db.insert(trips).values(tripData);
      console.log('Trip saved successfully');
    } catch (error) {
      console.error('Error saving user trip:', error);
      console.error('Error details:', error);
      throw new Error('Failed to save trip to database');
    }
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getReviewsByDestination(destination: string): Promise<Review[]> {
    return await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        destination: reviews.destination,
        rating: reviews.rating,
        comment: reviews.comment,
        tags: reviews.tags,
        helpfulCount: reviews.helpfulCount,
        createdAt: reviews.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.destination, destination))
      .orderBy(desc(reviews.createdAt));
  }

  async getRecentReviews(): Promise<Review[]> {
    return await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        destination: reviews.destination,
        rating: reviews.rating,
        comment: reviews.comment,
        tags: reviews.tags,
        helpfulCount: reviews.helpfulCount,
        createdAt: reviews.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .orderBy(desc(reviews.createdAt))
      .limit(10);
  }

  // Expense operations
  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  async getTripExpenses(tripId: number): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .where(eq(expenses.tripId, tripId))
      .orderBy(desc(expenses.createdAt));
  }

  async getUserExpenses(userId: string): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.createdAt));
  }

  // Chat operations
  async getChatRooms(): Promise<ChatRoom[]> {
    return await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.isActive, true))
      .orderBy(desc(chatRooms.createdAt));
  }

  async getChatMessages(roomId: number): Promise<ChatMessage[]> {
    return await db
      .select({
        id: chatMessages.id,
        roomId: chatMessages.roomId,
        userId: chatMessages.userId,
        message: chatMessages.message,
        messageType: chatMessages.messageType,
        createdAt: chatMessages.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  // Connection operations
  async createConnection(connection: InsertConnection): Promise<Connection> {
    const [newConnection] = await db.insert(connections).values(connection).returning();
    return newConnection;
  }

  async getUserConnections(userId: string): Promise<Connection[]> {
    return await db
      .select({
        id: connections.id,
        requesterId: connections.requesterId,
        receiverId: connections.receiverId,
        status: connections.status,
        message: connections.message,
        createdAt: connections.createdAt,
        updatedAt: connections.updatedAt,
        requester: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          currentLocation: users.currentLocation,
        },
      })
      .from(connections)
      .leftJoin(users, eq(connections.requesterId, users.id))
      .where(or(eq(connections.requesterId, userId), eq(connections.receiverId, userId)))
      .orderBy(desc(connections.createdAt));
  }

  async updateConnectionStatus(id: number, status: string): Promise<Connection> {
    const [updatedConnection] = await db
      .update(connections)
      .set({ status, updatedAt: new Date() })
      .where(eq(connections.id, id))
      .returning();
    return updatedConnection;
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.isActive, true))
      .orderBy(achievements.category, achievements.points);
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await db
      .select({
        id: userAchievements.id,
        userId: userAchievements.userId,
        achievementId: userAchievements.achievementId,
        unlockedAt: userAchievements.unlockedAt,
        progress: userAchievements.progress,
        isCompleted: userAchievements.isCompleted,
        achievement: {
          id: achievements.id,
          name: achievements.name,
          description: achievements.description,
          category: achievements.category,
          iconName: achievements.iconName,
          badgeColor: achievements.badgeColor,
          points: achievements.points,
          rarity: achievements.rarity,
        },
      })
      .from(userAchievements)
      .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt));
  }

  async createUserAchievement(userAchievementData: InsertUserAchievement): Promise<UserAchievement> {
    const [userAchievement] = await db
      .insert(userAchievements)
      .values(userAchievementData)
      .returning();
    
    return userAchievement;
  }

  async updateAchievementProgress(userId: string, achievementId: number, progress: number): Promise<UserAchievement> {
    const [userAchievement] = await db
      .update(userAchievements)
      .set({ progress })
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        )
      )
      .returning();

    if (!userAchievement) {
      return await this.createUserAchievement({
        userId,
        achievementId,
        progress,
        isCompleted: false
      });
    }

    return userAchievement;
  }

  async checkAndUnlockAchievements(userId: string): Promise<UserAchievement[]> {
    const user = await this.getUser(userId);
    if (!user) return [];

    const userTrips = await this.getUserTrips(userId);
    const userExpenses = await this.getUserExpenses(userId);
    const userReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId));

    const newAchievements: UserAchievement[] = [];
    const totalSpent = userExpenses.reduce((sum: number, expense: any) => sum + parseFloat(expense.amount), 0);
    const countriesVisited = new Set(userTrips.map((trip: any) => trip.destinations?.[0]?.country).filter(Boolean)).size;

    const achievementChecks = [
      { name: "First Steps", condition: userTrips.length >= 1, progress: userTrips.length },
      { name: "Trip Explorer", condition: userTrips.length >= 5, progress: userTrips.length },
      { name: "Country Collector", condition: countriesVisited >= 3, progress: countriesVisited },
      { name: "Budget Tracker", condition: userExpenses.length >= 10, progress: userExpenses.length },
      { name: "Review Writer", condition: userReviews.length >= 5, progress: userReviews.length },
      { name: "Big Spender", condition: totalSpent >= 1000, progress: Math.floor(totalSpent) }
    ];

    for (const check of achievementChecks) {
      if (check.condition) {
        const existingUserAchievement = await db
          .select()
          .from(userAchievements)
          .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
          .where(
            and(
              eq(userAchievements.userId, userId),
              eq(achievements.name, check.name),
              eq(userAchievements.isCompleted, true)
            )
          )
          .limit(1);

        if (existingUserAchievement.length === 0) {
          const achievementDef = await db
            .select()
            .from(achievements)
            .where(eq(achievements.name, check.name))
            .limit(1);

          if (achievementDef.length > 0) {
            const newUserAchievement = await this.createUserAchievement({
              userId,
              achievementId: achievementDef[0].id,
              progress: check.progress,
              isCompleted: true
            });
            newAchievements.push(newUserAchievement);
          }
        }
      }
    }

    return newAchievements;
  }

  // TripAdvisor data operations implementation
  
  // Destination operations
  async createDestination(destination: InsertDestination): Promise<Destination> {
    const [newDestination] = await db.insert(destinations).values(destination).returning();
    return newDestination;
  }

  async getDestinations(): Promise<Destination[]> {
    return await db.select().from(destinations).orderBy(destinations.name);
  }

  async getDestinationByLocationId(locationId: string): Promise<Destination | undefined> {
    const [destination] = await db
      .select()
      .from(destinations)
      .where(eq(destinations.locationId, locationId));
    return destination || undefined;
  }

  async updateDestination(locationId: string, destinationData: Partial<InsertDestination>): Promise<Destination> {
    const [updated] = await db
      .update(destinations)
      .set({ ...destinationData, updatedAt: new Date() })
      .where(eq(destinations.locationId, locationId))
      .returning();
    return updated;
  }

  async searchDestinations(query: string): Promise<Destination[]> {
    return await db
      .select()
      .from(destinations)
      .where(or(
        sql`${destinations.name} ILIKE ${`%${query}%`}`,
        sql`${destinations.city} ILIKE ${`%${query}%`}`,
        sql`${destinations.country} ILIKE ${`%${query}%`}`
      ))
      .orderBy(destinations.name);
  }

  // Accommodation operations
  async createAccommodation(accommodation: InsertAccommodation): Promise<Accommodation> {
    const [newAccommodation] = await db.insert(accommodations).values(accommodation).returning();
    return newAccommodation;
  }

  async getAccommodations(destinationId?: number): Promise<Accommodation[]> {
    if (destinationId) {
      return await db
        .select()
        .from(accommodations)
        .where(eq(accommodations.destinationId, destinationId))
        .orderBy(desc(accommodations.rating));
    }
    return await db
      .select()
      .from(accommodations)
      .orderBy(desc(accommodations.rating));
  }

  async getAccommodationByLocationId(locationId: string): Promise<Accommodation | undefined> {
    const [accommodation] = await db
      .select()
      .from(accommodations)
      .where(eq(accommodations.locationId, locationId));
    return accommodation || undefined;
  }

  async updateAccommodation(locationId: string, accommodationData: Partial<InsertAccommodation>): Promise<Accommodation> {
    const [updated] = await db
      .update(accommodations)
      .set({ ...accommodationData, updatedAt: new Date() })
      .where(eq(accommodations.locationId, locationId))
      .returning();
    return updated;
  }

  async searchAccommodations(query: string, filters?: { destinationId?: number; priceLevel?: string; rating?: number }): Promise<Accommodation[]> {
    let conditions = [sql`${accommodations.name} ILIKE ${`%${query}%`}`];

    if (filters?.destinationId) {
      conditions.push(eq(accommodations.destinationId, filters.destinationId));
    }
    if (filters?.priceLevel) {
      conditions.push(eq(accommodations.priceLevel, filters.priceLevel));
    }
    if (filters?.rating) {
      conditions.push(sql`${accommodations.rating} >= ${filters.rating}`);
    }

    return await db
      .select()
      .from(accommodations)
      .where(and(...conditions))
      .orderBy(desc(accommodations.rating));
  }

  // Attraction operations
  async createAttraction(attraction: InsertAttraction): Promise<Attraction> {
    const [newAttraction] = await db.insert(attractions).values(attraction).returning();
    return newAttraction;
  }

  async getAttractions(destinationId?: number): Promise<Attraction[]> {
    if (destinationId) {
      return await db
        .select()
        .from(attractions)
        .where(eq(attractions.destinationId, destinationId))
        .orderBy(desc(attractions.rating));
    }
    return await db
      .select()
      .from(attractions)
      .orderBy(desc(attractions.rating));
  }

  async getAttractionByLocationId(locationId: string): Promise<Attraction | undefined> {
    const [attraction] = await db
      .select()
      .from(attractions)
      .where(eq(attractions.locationId, locationId));
    return attraction || undefined;
  }

  async updateAttraction(locationId: string, attractionData: Partial<InsertAttraction>): Promise<Attraction> {
    const [updated] = await db
      .update(attractions)
      .set({ ...attractionData, updatedAt: new Date() })
      .where(eq(attractions.locationId, locationId))
      .returning();
    return updated;
  }

  async searchAttractions(query: string, filters?: { destinationId?: number; category?: string }): Promise<Attraction[]> {
    let conditions = [sql`${attractions.name} ILIKE ${`%${query}%`}`];

    if (filters?.destinationId) {
      conditions.push(eq(attractions.destinationId, filters.destinationId));
    }
    if (filters?.category) {
      conditions.push(eq(attractions.category, filters.category));
    }

    return await db
      .select()
      .from(attractions)
      .where(and(...conditions))
      .orderBy(desc(attractions.rating));
  }

  // Restaurant operations
  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const [newRestaurant] = await db.insert(restaurants).values(restaurant).returning();
    return newRestaurant;
  }

  async getRestaurants(destinationId?: number): Promise<Restaurant[]> {
    if (destinationId) {
      return await db
        .select()
        .from(restaurants)
        .where(eq(restaurants.destinationId, destinationId))
        .orderBy(desc(restaurants.rating));
    }
    return await db
      .select()
      .from(restaurants)
      .orderBy(desc(restaurants.rating));
  }

  async getRestaurantByLocationId(locationId: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.locationId, locationId));
    return restaurant || undefined;
  }

  async updateRestaurant(locationId: string, restaurantData: Partial<InsertRestaurant>): Promise<Restaurant> {
    const [updated] = await db
      .update(restaurants)
      .set({ ...restaurantData, updatedAt: new Date() })
      .where(eq(restaurants.locationId, locationId))
      .returning();
    return updated;
  }

  async searchRestaurants(query: string, filters?: { destinationId?: number; cuisine?: string; priceLevel?: string }): Promise<Restaurant[]> {
    let conditions = [sql`${restaurants.name} ILIKE ${`%${query}%`}`];

    if (filters?.destinationId) {
      conditions.push(eq(restaurants.destinationId, filters.destinationId));
    }
    if (filters?.cuisine) {
      conditions.push(sql`${filters.cuisine} = ANY(${restaurants.cuisine})`);
    }
    if (filters?.priceLevel) {
      conditions.push(eq(restaurants.priceLevel, filters.priceLevel));
    }

    return await db
      .select()
      .from(restaurants)
      .where(and(...conditions))
      .orderBy(desc(restaurants.rating));
  }

  // Location review operations
  async createLocationReview(review: InsertLocationReview): Promise<LocationReview> {
    const [newReview] = await db.insert(locationReviews).values(review).returning();
    return newReview;
  }

  async getLocationReviews(locationId: string, category: string): Promise<LocationReview[]> {
    return await db
      .select({
        id: locationReviews.id,
        locationId: locationReviews.locationId,
        locationCategory: locationReviews.locationCategory,
        userId: locationReviews.userId,
        rating: locationReviews.rating,
        title: locationReviews.title,
        text: locationReviews.text,
        travelDate: locationReviews.travelDate,
        tripType: locationReviews.tripType,
        helpful: locationReviews.helpful,
        language: locationReviews.language,
        source: locationReviews.source,
        externalReviewId: locationReviews.externalReviewId,
        createdAt: locationReviews.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(locationReviews)
      .leftJoin(users, eq(locationReviews.userId, users.id))
      .where(and(
        eq(locationReviews.locationId, locationId),
        eq(locationReviews.locationCategory, category)
      ))
      .orderBy(desc(locationReviews.createdAt));
  }

  async getRecentLocationReviews(): Promise<LocationReview[]> {
    return await db
      .select({
        id: locationReviews.id,
        locationId: locationReviews.locationId,
        locationCategory: locationReviews.locationCategory,
        userId: locationReviews.userId,
        rating: locationReviews.rating,
        title: locationReviews.title,
        text: locationReviews.text,
        travelDate: locationReviews.travelDate,
        tripType: locationReviews.tripType,
        helpful: locationReviews.helpful,
        language: locationReviews.language,
        source: locationReviews.source,
        externalReviewId: locationReviews.externalReviewId,
        createdAt: locationReviews.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(locationReviews)
      .leftJoin(users, eq(locationReviews.userId, users.id))
      .orderBy(desc(locationReviews.createdAt))
      .limit(20);
  }

  // Location subrating operations
  async upsertLocationSubratings(locationId: string, category: string, subratings: InsertLocationSubrating[]): Promise<LocationSubrating[]> {
    // Delete existing subratings for this location
    await db
      .delete(locationSubratings)
      .where(and(
        eq(locationSubratings.locationId, locationId),
        eq(locationSubratings.locationCategory, category)
      ));

    // Insert new subratings
    if (subratings.length > 0) {
      return await db.insert(locationSubratings).values(subratings).returning();
    }
    return [];
  }

  async getLocationSubratings(locationId: string, category: string): Promise<LocationSubrating[]> {
    return await db
      .select()
      .from(locationSubratings)
      .where(and(
        eq(locationSubratings.locationId, locationId),
        eq(locationSubratings.locationCategory, category)
      ));
  }

  // Location photo operations
  async createLocationPhoto(photo: InsertLocationPhoto): Promise<LocationPhoto> {
    const [newPhoto] = await db.insert(locationPhotos).values(photo).returning();
    return newPhoto;
  }

  async getLocationPhotos(locationId: string, category: string): Promise<LocationPhoto[]> {
    return await db
      .select()
      .from(locationPhotos)
      .where(and(
        eq(locationPhotos.locationId, locationId),
        eq(locationPhotos.locationCategory, category)
      ))
      .orderBy(desc(locationPhotos.createdAt));
  }

  // Location ancestor operations
  async upsertLocationAncestors(locationId: string, ancestors: InsertLocationAncestor[]): Promise<LocationAncestor[]> {
    // Delete existing ancestors for this location
    await db
      .delete(locationAncestors)
      .where(eq(locationAncestors.locationId, locationId));

    // Insert new ancestors
    if (ancestors.length > 0) {
      return await db.insert(locationAncestors).values(ancestors).returning();
    }
    return [];
  }

  async getLocationAncestors(locationId: string): Promise<LocationAncestor[]> {
    return await db
      .select()
      .from(locationAncestors)
      .where(eq(locationAncestors.locationId, locationId));
  }
  // Enhanced community features implementation
  
  // Place review operations
  async createPlaceReview(review: InsertPlaceReview): Promise<PlaceReview> {
    const [placeReview] = await db.insert(placeReviews).values(review).returning();
    return placeReview;
  }

  async getPlaceReviews(placeId: string): Promise<PlaceReview[]> {
    return await db
      .select()
      .from(placeReviews)
      .where(eq(placeReviews.placeId, placeId))
      .orderBy(desc(placeReviews.createdAt));
  }

  async getRecentPlaceReviews(limit: number = 10): Promise<PlaceReview[]> {
    return await db
      .select()
      .from(placeReviews)
      .orderBy(desc(placeReviews.createdAt))
      .limit(limit);
  }

  async getUserPlaceReviews(userId: string): Promise<PlaceReview[]> {
    return await db
      .select()
      .from(placeReviews)
      .where(eq(placeReviews.userId, userId))
      .orderBy(desc(placeReviews.createdAt));
  }

  async searchPlaceReviews(location: string, placeType?: string): Promise<PlaceReview[]> {
    let query = db
      .select()
      .from(placeReviews)
      .where(sql`LOWER(${placeReviews.location}) LIKE LOWER(${'%' + location + '%'})`);

    if (placeType) {
      query = query.where(eq(placeReviews.placeType, placeType));
    }

    return await query.orderBy(desc(placeReviews.createdAt));
  }

  async updatePlaceReview(id: number, review: Partial<InsertPlaceReview>): Promise<PlaceReview> {
    const [updatedReview] = await db
      .update(placeReviews)
      .set({ ...review, updatedAt: new Date() })
      .where(eq(placeReviews.id, id))
      .returning();
    return updatedReview;
  }

  async deletePlaceReview(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(placeReviews)
      .where(and(eq(placeReviews.id, id), eq(placeReviews.userId, userId)));
    return result.rowCount > 0;
  }

  // Review voting operations
  async voteOnReview(vote: InsertReviewVote): Promise<ReviewVote> {
    const [reviewVote] = await db
      .insert(reviewVotes)
      .values(vote)
      .onConflictDoUpdate({
        target: [reviewVotes.reviewId, reviewVotes.userId],
        set: { voteType: vote.voteType, createdAt: new Date() },
      })
      .returning();
    
    await this.updateReviewHelpfulness(vote.reviewId);
    return reviewVote;
  }

  async getReviewVotes(reviewId: number): Promise<ReviewVote[]> {
    return await db
      .select()
      .from(reviewVotes)
      .where(eq(reviewVotes.reviewId, reviewId));
  }

  async getUserVoteOnReview(reviewId: number, userId: string): Promise<ReviewVote | undefined> {
    const [vote] = await db
      .select()
      .from(reviewVotes)
      .where(and(eq(reviewVotes.reviewId, reviewId), eq(reviewVotes.userId, userId)));
    return vote;
  }

  async updateReviewHelpfulness(reviewId: number): Promise<void> {
    const helpfulCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviewVotes)
      .where(and(eq(reviewVotes.reviewId, reviewId), eq(reviewVotes.voteType, 'helpful')))
      .then(result => result[0]?.count || 0);

    await db
      .update(placeReviews)
      .set({ helpfulCount })
      .where(eq(placeReviews.id, reviewId));
  }

  // Enhanced chat room operations
  async createChatRoom(room: any): Promise<ChatRoom> {
    const [chatRoom] = await db.insert(chatRooms).values(room).returning();
    
    // Add creator as first member with admin role
    await db.insert(chatRoomMembers).values({
      roomId: chatRoom.id,
      userId: room.createdBy,
      role: 'admin',
    });

    return chatRoom;
  }

  async getChatRoomById(id: number): Promise<ChatRoom | undefined> {
    const [room] = await db.select().from(chatRooms).where(eq(chatRooms.id, id));
    return room;
  }

  async updateChatRoom(id: number, room: Partial<any>): Promise<ChatRoom> {
    const [updatedRoom] = await db
      .update(chatRooms)
      .set({ ...room, updatedAt: new Date() })
      .where(eq(chatRooms.id, id))
      .returning();
    return updatedRoom;
  }

  async deleteChatRoom(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(chatRooms)
      .where(and(eq(chatRooms.id, id), eq(chatRooms.createdBy, userId)));
    return result.rowCount > 0;
  }

  async joinChatRoom(roomId: number, userId: string): Promise<ChatRoomMember> {
    const [member] = await db
      .insert(chatRoomMembers)
      .values({
        roomId,
        userId,
        role: 'member',
      })
      .onConflictDoNothing()
      .returning();

    // Update member count
    await db
      .update(chatRooms)
      .set({
        memberCount: sql`${chatRooms.memberCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(chatRooms.id, roomId));

    return member;
  }

  async leaveChatRoom(roomId: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(chatRoomMembers)
      .where(and(eq(chatRoomMembers.roomId, roomId), eq(chatRoomMembers.userId, userId)));

    if (result.rowCount > 0) {
      // Update member count
      await db
        .update(chatRooms)
        .set({
          memberCount: sql`${chatRooms.memberCount} - 1`,
          updatedAt: new Date(),
        })
        .where(eq(chatRooms.id, roomId));
    }

    return result.rowCount > 0;
  }

  async getChatRoomMembers(roomId: number): Promise<ChatRoomMember[]> {
    return await db
      .select()
      .from(chatRoomMembers)
      .where(eq(chatRoomMembers.roomId, roomId))
      .orderBy(chatRoomMembers.joinedAt);
  }

  async searchChatRooms(query: string, filters?: { type?: string; destination?: string }): Promise<ChatRoom[]> {
    let queryBuilder = db
      .select()
      .from(chatRooms)
      .where(
        and(
          eq(chatRooms.isActive, true),
          or(
            sql`LOWER(${chatRooms.name}) LIKE LOWER(${'%' + query + '%'})`,
            sql`LOWER(${chatRooms.description}) LIKE LOWER(${'%' + query + '%'})`
          )
        )
      );

    if (filters?.type) {
      queryBuilder = queryBuilder.where(eq(chatRooms.type, filters.type));
    }

    if (filters?.destination) {
      queryBuilder = queryBuilder.where(eq(chatRooms.destination, filters.destination));
    }

    return await queryBuilder
      .orderBy(desc(chatRooms.lastActivity))
      .limit(50);
  }

  async updateChatRoomActivity(roomId: number): Promise<void> {
    await db
      .update(chatRooms)
      .set({ lastActivity: new Date() })
      .where(eq(chatRooms.id, roomId));
  }

  // Travel buddy system operations
  async createTravelBuddyPost(post: InsertTravelBuddyPost): Promise<TravelBuddyPost> {
    const [buddyPost] = await db.insert(travelBuddyPosts).values(post).returning();
    return buddyPost;
  }

  async getTravelBuddyPosts(filters?: { destination?: string; startDate?: Date; endDate?: Date }): Promise<TravelBuddyPost[]> {
    let query = db
      .select()
      .from(travelBuddyPosts)
      .where(and(eq(travelBuddyPosts.isActive, true), sql`${travelBuddyPosts.expiresAt} > NOW()`));

    if (filters?.destination) {
      query = query.where(sql`LOWER(${travelBuddyPosts.destination}) LIKE LOWER(${'%' + filters.destination + '%'})`);
    }

    if (filters?.startDate) {
      query = query.where(sql`${travelBuddyPosts.startDate} >= ${filters.startDate}`);
    }

    if (filters?.endDate) {
      query = query.where(sql`${travelBuddyPosts.endDate} <= ${filters.endDate}`);
    }

    return await query.orderBy(desc(travelBuddyPosts.createdAt));
  }

  async getUserTravelBuddyPosts(userId: string): Promise<TravelBuddyPost[]> {
    return await db
      .select()
      .from(travelBuddyPosts)
      .where(eq(travelBuddyPosts.userId, userId))
      .orderBy(desc(travelBuddyPosts.createdAt));
  }

  async updateTravelBuddyPost(id: number, post: Partial<InsertTravelBuddyPost>): Promise<TravelBuddyPost> {
    const [updatedPost] = await db
      .update(travelBuddyPosts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(travelBuddyPosts.id, id))
      .returning();
    return updatedPost;
  }

  async deleteTravelBuddyPost(id: number, userId: string): Promise<boolean> {
    const result = await db
      .update(travelBuddyPosts)
      .set({ isActive: false })
      .where(and(eq(travelBuddyPosts.id, id), eq(travelBuddyPosts.userId, userId)));
    return result.rowCount > 0;
  }

  // Travel buddy application operations
  async applyForTravelBuddy(application: InsertTravelBuddyApplication): Promise<TravelBuddyApplication> {
    const [app] = await db.insert(travelBuddyApplications).values(application).returning();
    return app;
  }

  async getTravelBuddyApplications(postId: number): Promise<TravelBuddyApplication[]> {
    return await db
      .select()
      .from(travelBuddyApplications)
      .where(eq(travelBuddyApplications.postId, postId))
      .orderBy(travelBuddyApplications.createdAt);
  }

  async getUserTravelBuddyApplications(userId: string): Promise<TravelBuddyApplication[]> {
    return await db
      .select()
      .from(travelBuddyApplications)
      .where(eq(travelBuddyApplications.applicantId, userId))
      .orderBy(desc(travelBuddyApplications.createdAt));
  }

  async updateTravelBuddyApplication(id: number, status: string): Promise<TravelBuddyApplication> {
    const [updatedApp] = await db
      .update(travelBuddyApplications)
      .set({ status, updatedAt: new Date() })
      .where(eq(travelBuddyApplications.id, id))
      .returning();
    return updatedApp;
  }
}

export const storage = new DatabaseStorage();
