import { users, trips, reviews, expenses, chatRooms, chatMessages, chatRoomMembers, connections, achievements, userAchievements, destinations, accommodations, attractions, restaurants, locationReviews, locationSubratings, locationPhotos, locationAncestors, placeReviews, reviewVotes, travelBuddyPosts, travelBuddyApplications, } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";
export class DatabaseStorage {
    // User operations
    async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    }
    async upsertUser(userData) {
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
    async updateUserPreferences(userId, preferences) {
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
    async createTrip(trip) {
        const [newTrip] = await db.insert(trips).values(trip).returning();
        return newTrip;
    }
    async getUserTrips(userId) {
        return await db
            .select()
            .from(trips)
            .where(eq(trips.userId, userId))
            .orderBy(desc(trips.createdAt));
    }
    async getPublicTrips() {
        return await db
            .select()
            .from(trips)
            .where(eq(trips.isPublic, true))
            .orderBy(desc(trips.createdAt))
            .limit(20);
    }
    async getTripById(id) {
        const [trip] = await db.select().from(trips).where(eq(trips.id, id));
        return trip;
    }
    async updateTrip(id, tripData) {
        const [updatedTrip] = await db
            .update(trips)
            .set({ ...tripData, updatedAt: new Date() })
            .where(eq(trips.id, id))
            .returning();
        return updatedTrip;
    }
    // Simple trip saving for suggestions (creates a new trip)
    async saveUserTrip(userId, trip) {
        try {
            // Format destinations as a proper JSONB array or object
            let destinationsData;
            if (typeof trip.destinations === 'string') {
                // If it's a string, wrap it in an array
                destinationsData = [trip.destinations];
            }
            else if (Array.isArray(trip.destinations)) {
                // If it's already an array, use it as is
                destinationsData = trip.destinations;
            }
            else {
                // Otherwise, create from the destination field
                destinationsData = [trip.destination || 'Unknown destination'];
            }
            const tripData = {
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
        }
        catch (error) {
            console.error('Error saving user trip:', error);
            console.error('Error details:', error);
            throw new Error('Failed to save trip to database');
        }
    }
    // Review operations
    async createReview(review) {
        const [newReview] = await db.insert(reviews).values(review).returning();
        return newReview;
    }
    async getReviewsByDestination(destination) {
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
    async getRecentReviews() {
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
    async createExpense(expense) {
        const [newExpense] = await db.insert(expenses).values(expense).returning();
        return newExpense;
    }
    async getTripExpenses(tripId) {
        return await db
            .select()
            .from(expenses)
            .where(eq(expenses.tripId, tripId))
            .orderBy(desc(expenses.createdAt));
    }
    async getUserExpenses(userId) {
        return await db
            .select()
            .from(expenses)
            .where(eq(expenses.userId, userId))
            .orderBy(desc(expenses.createdAt));
    }
    // Chat operations
    async getChatRooms() {
        return await db
            .select()
            .from(chatRooms)
            .where(eq(chatRooms.isActive, true))
            .orderBy(desc(chatRooms.createdAt));
    }
    async getChatMessages(roomId) {
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
    async createChatMessage(message) {
        const [newMessage] = await db.insert(chatMessages).values(message).returning();
        return newMessage;
    }
    // Connection operations
    async createConnection(connection) {
        const [newConnection] = await db.insert(connections).values(connection).returning();
        return newConnection;
    }
    async getUserConnections(userId) {
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
    async updateConnectionStatus(id, status) {
        const [updatedConnection] = await db
            .update(connections)
            .set({ status, updatedAt: new Date() })
            .where(eq(connections.id, id))
            .returning();
        return updatedConnection;
    }
    async getAllAchievements() {
        return await db
            .select()
            .from(achievements)
            .where(eq(achievements.isActive, true))
            .orderBy(achievements.category, achievements.points);
    }
    async getUserAchievements(userId) {
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
    async createUserAchievement(userAchievementData) {
        const [userAchievement] = await db
            .insert(userAchievements)
            .values(userAchievementData)
            .returning();
        return userAchievement;
    }
    async updateAchievementProgress(userId, achievementId, progress) {
        const [userAchievement] = await db
            .update(userAchievements)
            .set({ progress })
            .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)))
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
    async checkAndUnlockAchievements(userId) {
        const user = await this.getUser(userId);
        if (!user)
            return [];
        const userTrips = await this.getUserTrips(userId);
        const userExpenses = await this.getUserExpenses(userId);
        const userReviews = await db
            .select()
            .from(reviews)
            .where(eq(reviews.userId, userId));
        const newAchievements = [];
        const totalSpent = userExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        const countriesVisited = new Set(userTrips.map((trip) => trip.destinations?.[0]?.country).filter(Boolean)).size;
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
                    .where(and(eq(userAchievements.userId, userId), eq(achievements.name, check.name), eq(userAchievements.isCompleted, true)))
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
    async createDestination(destination) {
        const [newDestination] = await db.insert(destinations).values(destination).returning();
        return newDestination;
    }
    async getDestinations() {
        return await db.select().from(destinations).orderBy(destinations.name);
    }
    async getDestinationByLocationId(locationId) {
        const [destination] = await db
            .select()
            .from(destinations)
            .where(eq(destinations.locationId, locationId));
        return destination || undefined;
    }
    async updateDestination(locationId, destinationData) {
        const [updated] = await db
            .update(destinations)
            .set({ ...destinationData, updatedAt: new Date() })
            .where(eq(destinations.locationId, locationId))
            .returning();
        return updated;
    }
    async searchDestinations(query) {
        return await db
            .select()
            .from(destinations)
            .where(or(sql `${destinations.name} ILIKE ${`%${query}%`}`, sql `${destinations.city} ILIKE ${`%${query}%`}`, sql `${destinations.country} ILIKE ${`%${query}%`}`))
            .orderBy(destinations.name);
    }
    // Accommodation operations
    async createAccommodation(accommodation) {
        const [newAccommodation] = await db.insert(accommodations).values(accommodation).returning();
        return newAccommodation;
    }
    async getAccommodations(destinationId) {
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
    async getAccommodationByLocationId(locationId) {
        const [accommodation] = await db
            .select()
            .from(accommodations)
            .where(eq(accommodations.locationId, locationId));
        return accommodation || undefined;
    }
    async updateAccommodation(locationId, accommodationData) {
        const [updated] = await db
            .update(accommodations)
            .set({ ...accommodationData, updatedAt: new Date() })
            .where(eq(accommodations.locationId, locationId))
            .returning();
        return updated;
    }
    async searchAccommodations(query, filters) {
        let conditions = [sql `${accommodations.name} ILIKE ${`%${query}%`}`];
        if (filters?.destinationId) {
            conditions.push(eq(accommodations.destinationId, filters.destinationId));
        }
        if (filters?.priceLevel) {
            conditions.push(eq(accommodations.priceLevel, filters.priceLevel));
        }
        if (filters?.rating) {
            conditions.push(sql `${accommodations.rating} >= ${filters.rating}`);
        }
        return await db
            .select()
            .from(accommodations)
            .where(and(...conditions))
            .orderBy(desc(accommodations.rating));
    }
    // Attraction operations
    async createAttraction(attraction) {
        const [newAttraction] = await db.insert(attractions).values(attraction).returning();
        return newAttraction;
    }
    async getAttractions(destinationId) {
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
    async getAttractionByLocationId(locationId) {
        const [attraction] = await db
            .select()
            .from(attractions)
            .where(eq(attractions.locationId, locationId));
        return attraction || undefined;
    }
    async updateAttraction(locationId, attractionData) {
        const [updated] = await db
            .update(attractions)
            .set({ ...attractionData, updatedAt: new Date() })
            .where(eq(attractions.locationId, locationId))
            .returning();
        return updated;
    }
    async searchAttractions(query, filters) {
        let conditions = [sql `${attractions.name} ILIKE ${`%${query}%`}`];
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
    async createRestaurant(restaurant) {
        const [newRestaurant] = await db.insert(restaurants).values(restaurant).returning();
        return newRestaurant;
    }
    async getRestaurants(destinationId) {
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
    async getRestaurantByLocationId(locationId) {
        const [restaurant] = await db
            .select()
            .from(restaurants)
            .where(eq(restaurants.locationId, locationId));
        return restaurant || undefined;
    }
    async updateRestaurant(locationId, restaurantData) {
        const [updated] = await db
            .update(restaurants)
            .set({ ...restaurantData, updatedAt: new Date() })
            .where(eq(restaurants.locationId, locationId))
            .returning();
        return updated;
    }
    async searchRestaurants(query, filters) {
        let conditions = [sql `${restaurants.name} ILIKE ${`%${query}%`}`];
        if (filters?.destinationId) {
            conditions.push(eq(restaurants.destinationId, filters.destinationId));
        }
        if (filters?.cuisine) {
            conditions.push(sql `${filters.cuisine} = ANY(${restaurants.cuisine})`);
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
    async createLocationReview(review) {
        const [newReview] = await db.insert(locationReviews).values(review).returning();
        return newReview;
    }
    async getLocationReviews(locationId, category) {
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
            .where(and(eq(locationReviews.locationId, locationId), eq(locationReviews.locationCategory, category)))
            .orderBy(desc(locationReviews.createdAt));
    }
    async getRecentLocationReviews() {
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
    async upsertLocationSubratings(locationId, category, subratings) {
        // Delete existing subratings for this location
        await db
            .delete(locationSubratings)
            .where(and(eq(locationSubratings.locationId, locationId), eq(locationSubratings.locationCategory, category)));
        // Insert new subratings
        if (subratings.length > 0) {
            return await db.insert(locationSubratings).values(subratings).returning();
        }
        return [];
    }
    async getLocationSubratings(locationId, category) {
        return await db
            .select()
            .from(locationSubratings)
            .where(and(eq(locationSubratings.locationId, locationId), eq(locationSubratings.locationCategory, category)));
    }
    // Location photo operations
    async createLocationPhoto(photo) {
        const [newPhoto] = await db.insert(locationPhotos).values(photo).returning();
        return newPhoto;
    }
    async getLocationPhotos(locationId, category) {
        return await db
            .select()
            .from(locationPhotos)
            .where(and(eq(locationPhotos.locationId, locationId), eq(locationPhotos.locationCategory, category)))
            .orderBy(desc(locationPhotos.createdAt));
    }
    // Location ancestor operations
    async upsertLocationAncestors(locationId, ancestors) {
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
    async getLocationAncestors(locationId) {
        return await db
            .select()
            .from(locationAncestors)
            .where(eq(locationAncestors.locationId, locationId));
    }
    // Enhanced community features implementation
    // Place review operations
    async createPlaceReview(review) {
        const [placeReview] = await db.insert(placeReviews).values(review).returning();
        return placeReview;
    }
    async getPlaceReviews(placeId) {
        return await db
            .select()
            .from(placeReviews)
            .where(eq(placeReviews.placeId, placeId))
            .orderBy(desc(placeReviews.createdAt));
    }
    async getRecentPlaceReviews(limit = 10) {
        return await db
            .select()
            .from(placeReviews)
            .orderBy(desc(placeReviews.createdAt))
            .limit(limit);
    }
    async getUserPlaceReviews(userId) {
        return await db
            .select()
            .from(placeReviews)
            .where(eq(placeReviews.userId, userId))
            .orderBy(desc(placeReviews.createdAt));
    }
    async searchPlaceReviews(location, placeType) {
        if (placeType) {
            return await db
                .select()
                .from(placeReviews)
                .where(and(sql `LOWER(${placeReviews.location}) LIKE LOWER(${'%' + location + '%'})`, eq(placeReviews.placeType, placeType)))
                .orderBy(desc(placeReviews.createdAt));
        }
        return await db
            .select()
            .from(placeReviews)
            .where(sql `LOWER(${placeReviews.location}) LIKE LOWER(${'%' + location + '%'})`)
            .orderBy(desc(placeReviews.createdAt));
    }
    async updatePlaceReview(id, review) {
        const [updatedReview] = await db
            .update(placeReviews)
            .set({ ...review, updatedAt: new Date() })
            .where(eq(placeReviews.id, id))
            .returning();
        return updatedReview;
    }
    async deletePlaceReview(id, userId) {
        const result = await db
            .delete(placeReviews)
            .where(and(eq(placeReviews.id, id), eq(placeReviews.userId, userId)));
        return (result.rowCount ?? 0) > 0;
    }
    // Review voting operations
    async voteOnReview(vote) {
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
    async getReviewVotes(reviewId) {
        return await db
            .select()
            .from(reviewVotes)
            .where(eq(reviewVotes.reviewId, reviewId));
    }
    async getUserVoteOnReview(reviewId, userId) {
        const [vote] = await db
            .select()
            .from(reviewVotes)
            .where(and(eq(reviewVotes.reviewId, reviewId), eq(reviewVotes.userId, userId)));
        return vote;
    }
    async updateReviewHelpfulness(reviewId) {
        const helpfulCount = await db
            .select({ count: sql `count(*)` })
            .from(reviewVotes)
            .where(and(eq(reviewVotes.reviewId, reviewId), eq(reviewVotes.voteType, 'helpful')))
            .then(result => result[0]?.count || 0);
        await db
            .update(placeReviews)
            .set({ helpfulCount })
            .where(eq(placeReviews.id, reviewId));
    }
    // Enhanced chat room operations
    async createChatRoom(room) {
        const [chatRoom] = await db.insert(chatRooms).values(room).returning();
        // Add creator as first member with admin role
        await db.insert(chatRoomMembers).values({
            roomId: chatRoom.id,
            userId: room.createdBy,
            role: 'admin',
        });
        return chatRoom;
    }
    async getChatRoomById(id) {
        const [room] = await db.select().from(chatRooms).where(eq(chatRooms.id, id));
        return room;
    }
    async updateChatRoom(id, room) {
        const [updatedRoom] = await db
            .update(chatRooms)
            .set({ ...room, updatedAt: new Date() })
            .where(eq(chatRooms.id, id))
            .returning();
        return updatedRoom;
    }
    async deleteChatRoom(id, userId) {
        const result = await db
            .delete(chatRooms)
            .where(and(eq(chatRooms.id, id), eq(chatRooms.createdBy, userId)));
        return (result.rowCount ?? 0) > 0;
    }
    async joinChatRoom(roomId, userId) {
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
            memberCount: sql `${chatRooms.memberCount} + 1`,
            updatedAt: new Date(),
        })
            .where(eq(chatRooms.id, roomId));
        return member;
    }
    async leaveChatRoom(roomId, userId) {
        const result = await db
            .delete(chatRoomMembers)
            .where(and(eq(chatRoomMembers.roomId, roomId), eq(chatRoomMembers.userId, userId)));
        if ((result.rowCount ?? 0) > 0) {
            // Update member count
            await db
                .update(chatRooms)
                .set({
                memberCount: sql `${chatRooms.memberCount} - 1`,
                updatedAt: new Date(),
            })
                .where(eq(chatRooms.id, roomId));
        }
        return (result.rowCount ?? 0) > 0;
    }
    async getChatRoomMembers(roomId) {
        return await db
            .select()
            .from(chatRoomMembers)
            .where(eq(chatRoomMembers.roomId, roomId))
            .orderBy(chatRoomMembers.joinedAt);
    }
    async searchChatRooms(query, filters) {
        const conditions = [
            eq(chatRooms.isActive, true),
            or(sql `LOWER(${chatRooms.name}) LIKE LOWER(${'%' + query + '%'})`, sql `LOWER(${chatRooms.description}) LIKE LOWER(${'%' + query + '%'})`)
        ];
        if (filters?.type) {
            conditions.push(eq(chatRooms.type, filters.type));
        }
        if (filters?.destination) {
            conditions.push(eq(chatRooms.destination, filters.destination));
        }
        return await db
            .select()
            .from(chatRooms)
            .where(and(...conditions))
            .orderBy(desc(chatRooms.lastActivity))
            .limit(50);
    }
    async updateChatRoomActivity(roomId) {
        await db
            .update(chatRooms)
            .set({ lastActivity: new Date() })
            .where(eq(chatRooms.id, roomId));
    }
    // Travel buddy system operations
    async createTravelBuddyPost(post) {
        const [buddyPost] = await db.insert(travelBuddyPosts).values(post).returning();
        return buddyPost;
    }
    async getTravelBuddyPosts(filters) {
        const conditions = [
            eq(travelBuddyPosts.isActive, true),
            sql `${travelBuddyPosts.expiresAt} > NOW()`
        ];
        if (filters?.destination) {
            conditions.push(sql `LOWER(${travelBuddyPosts.destination}) LIKE LOWER(${'%' + filters.destination + '%'})`);
        }
        if (filters?.startDate) {
            conditions.push(sql `${travelBuddyPosts.startDate} >= ${filters.startDate}`);
        }
        if (filters?.endDate) {
            conditions.push(sql `${travelBuddyPosts.endDate} <= ${filters.endDate}`);
        }
        return await db
            .select()
            .from(travelBuddyPosts)
            .where(and(...conditions))
            .orderBy(desc(travelBuddyPosts.createdAt));
    }
    async getUserTravelBuddyPosts(userId) {
        return await db
            .select()
            .from(travelBuddyPosts)
            .where(eq(travelBuddyPosts.userId, userId))
            .orderBy(desc(travelBuddyPosts.createdAt));
    }
    async updateTravelBuddyPost(id, post) {
        const [updatedPost] = await db
            .update(travelBuddyPosts)
            .set({ ...post, updatedAt: new Date() })
            .where(eq(travelBuddyPosts.id, id))
            .returning();
        return updatedPost;
    }
    async deleteTravelBuddyPost(id, userId) {
        const result = await db
            .update(travelBuddyPosts)
            .set({ isActive: false })
            .where(and(eq(travelBuddyPosts.id, id), eq(travelBuddyPosts.userId, userId)));
        return (result.rowCount ?? 0) > 0;
    }
    // Travel buddy application operations
    async applyForTravelBuddy(application) {
        const [app] = await db.insert(travelBuddyApplications).values(application).returning();
        return app;
    }
    async getTravelBuddyApplications(postId) {
        return await db
            .select()
            .from(travelBuddyApplications)
            .where(eq(travelBuddyApplications.postId, postId))
            .orderBy(travelBuddyApplications.createdAt);
    }
    async getUserTravelBuddyApplications(userId) {
        return await db
            .select()
            .from(travelBuddyApplications)
            .where(eq(travelBuddyApplications.applicantId, userId))
            .orderBy(desc(travelBuddyApplications.createdAt));
    }
    async updateTravelBuddyApplication(id, status) {
        const [updatedApp] = await db
            .update(travelBuddyApplications)
            .set({ status, updatedAt: new Date() })
            .where(eq(travelBuddyApplications.id, id))
            .returning();
        return updatedApp;
    }
}
export const storage = new DatabaseStorage();
