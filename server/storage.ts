import {
  users,
  trips,
  reviews,
  expenses,
  chatRooms,
  chatMessages,
  connections,
  achievements,
  userAchievements,
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
  type Connection,
  type InsertConnection,
  type Achievement,
  type UserAchievement,
  type InsertUserAchievement,
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
}

export const storage = new DatabaseStorage();
