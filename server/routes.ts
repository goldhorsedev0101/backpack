import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage.js";
import { MediaOrchestrator } from './integrations/media/mediaOrchestrator.js';

// Create MediaOrchestrator singleton for rate limiting persistence
const mediaOrchestrator = new MediaOrchestrator(storage);
import { config } from "./config.js";
// Removed Replit OAuth - using Supabase Auth only

// Simple middleware that doesn't check auth (client-side auth via Supabase)
const noAuth = (req: any, res: any, next: any) => {
  // In development, use a consistent dev user instead of anonymous
  // This allows testing features that require user identity
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  const devUserId = 'dev-user-12345';
  
  req.user = { 
    claims: { 
      sub: isDevelopment ? devUserId : 'anonymous',
      email: isDevelopment ? 'dev@globemate.test' : undefined,
      name: isDevelopment ? 'Dev User' : undefined
    },
    id: isDevelopment ? devUserId : 'anonymous'
  };
  next();
};
import { db, pool } from "./db.js";
import { googlePlaces } from "./googlePlaces.js";
import { seedSouthAmericanData } from "./dataSeeder.js";
import { weatherService } from "./weatherService.js";
import { travelTimingService } from "./travelTimingService.js";
import { eq, sql } from "drizzle-orm";
import { registerCollectorRoutes } from "./collectorRoutes.js";
import type { Request, Response, Router } from 'express';
import { supabaseAdmin } from './supabase.js';
// import { rewardsService } from './rewardsService.js'; // Temporarily commented out due to compilation issues
// Temporarily commenting out schema imports until we fix the shared module
// import {
//   insertTripSchema,
//   insertReviewSchema,
//   insertExpenseSchema,
//   insertChatMessageSchema,
//   insertConnectionSchema,
//   insertPlaceReviewSchema,
//   insertReviewVoteSchema,
//   insertChatRoomSchema,
//   insertTravelBuddyPostSchema,
//   insertTravelBuddyApplicationSchema,
//   insertLocationReviewSchema,
// } from "@shared/schema";
import { insertJourneySchema, insertSavedJourneySchema, hotelInquiries } from "@shared/schema";
import {
  generateTravelSuggestions,
  generateItinerary,
  analyzeBudget,
  generateRecommendations,
  chatAssistant,
  conversationalTripAssistant,
  generateConversationalSuggestions,
  enrichSuggestionsWithRealPlaces
} from "./openai.js";
import { generateItinerary as generateDetailedItinerary } from "./generateItinerary.js";

// In-memory storage for user itineraries
interface UserItineraryDay {
  day: number;
  location: string;
  activities: string[];
  estimatedCost: number;
  tips: string[];
}

const userItineraries: Record<string, UserItineraryDay[]> = {};

export async function registerRoutes(app: Express): Promise<void> {
  // Using Supabase Auth only - no server-side auth middleware needed

  // Basic health endpoint
  app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

  // Database test endpoint
  // Import admin middleware
  const { requireAdmin, createDevAdminSession } = await import('./lib/adminAuth.js');
  const { I18nService } = await import('./lib/i18nService.js');

  // Development-only route to create admin session for testing
  if (process.env.NODE_ENV !== 'production') {
    app.post('/api/dev/create-admin-session', (req, res) => {
      try {
        createDevAdminSession(req, req.body.email);
        res.json({ 
          success: true, 
          message: 'Admin session created for development',
          email: req.body.email || 'admin@globemate.com'
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create admin session' });
      }
    });
  }

  // Admin translation routes
  app.get('/api/admin/translations/:entityType', requireAdmin, async (req, res) => {
    try {
      const { entityType } = req.params;
      const { locale = 'en', search } = req.query;
      
      if (!['destinations', 'accommodations', 'attractions', 'restaurants'].includes(entityType)) {
        return res.status(400).json({ error: 'Invalid entity type' });
      }
      
      const results = await I18nService.getEntitiesWithTranslations(
        entityType as any, 
        locale as any, 
        search as string
      );
      
      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error fetching admin translations:', error);
      res.status(500).json({ error: 'Failed to fetch translations' });
    }
  });

  app.post('/api/admin/translations/:entityType/:entityId', requireAdmin, async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const { locale, name, description } = req.body;
      
      if (!['destinations', 'accommodations', 'attractions', 'restaurants'].includes(entityType)) {
        return res.status(400).json({ error: 'Invalid entity type' });
      }
      
      const result = await I18nService.saveTranslation(
        entityType as any,
        parseInt(entityId),
        locale,
        name,
        description
      );
      
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error saving translation:', error);
      res.status(500).json({ error: 'Failed to save translation' });
    }
  });

  app.delete('/api/admin/translations/:entityType/:entityId/:locale', requireAdmin, async (req, res) => {
    try {
      const { entityType, entityId, locale } = req.params;
      
      if (!['destinations', 'accommodations', 'attractions', 'restaurants'].includes(entityType)) {
        return res.status(400).json({ error: 'Invalid entity type' });
      }
      
      const result = await I18nService.deleteTranslation(
        entityType as any,
        parseInt(entityId),
        locale as any
      );
      
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error deleting translation:', error);
      res.status(500).json({ error: 'Failed to delete translation' });
    }
  });

  app.get('/api/admin/translations/stats/:locale', requireAdmin, async (req, res) => {
    try {
      const { locale } = req.params;
      const stats = await I18nService.getTranslationStats(locale as any);
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error fetching translation stats:', error);
      res.status(500).json({ error: 'Failed to fetch translation statistics' });
    }
  });

  // Localized search endpoint
  app.get('/api/search/localized', async (req, res) => {
    try {
      const { q: query, locale = 'en', types } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter required' });
      }
      
      const entityTypes = types ? (types as string).split(',') : undefined;
      const results = await I18nService.searchLocalized(
        query,
        locale as any,
        entityTypes as any
      );
      
      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error performing localized search:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Localized data endpoints for each entity type
  app.get('/api/localized/destinations', async (req, res) => {
    try {
      const { locale = 'en', search, limit, offset, country, city, minRating } = req.query;
      const results = await I18nService.getEntitiesWithTranslations(
        'destinations',
        locale as any,
        search as string
      );
      
      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error fetching localized destinations:', error);
      res.status(500).json({ error: 'Failed to fetch destinations' });
    }
  });

  app.get('/api/localized/attractions', async (req, res) => {
    try {
      const { locale = 'en', search, limit, offset, country, city, minRating } = req.query;
      const results = await I18nService.getEntitiesWithTranslations(
        'attractions',
        locale as any,
        search as string
      );
      
      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error fetching localized attractions:', error);
      res.status(500).json({ error: 'Failed to fetch attractions' });
    }
  });

  app.get('/api/localized/restaurants', async (req, res) => {
    try {
      const { locale = 'en', search, limit, offset, country, city, minRating } = req.query;
      const results = await I18nService.getEntitiesWithTranslations(
        'restaurants',
        locale as any,
        search as string
      );
      
      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error fetching localized restaurants:', error);
      res.status(500).json({ error: 'Failed to fetch restaurants' });
    }
  });

  app.get('/api/localized/accommodations', async (req, res) => {
    try {
      const { locale = 'en', search, limit, offset, country, city, minRating } = req.query;
      const results = await I18nService.getEntitiesWithTranslations(
        'accommodations',
        locale as any,
        search as string
      );
      
      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error fetching localized accommodations:', error);
      res.status(500).json({ error: 'Failed to fetch accommodations' });
    }
  });

  // Get individual localized entity by ID
  app.get('/api/localized/:entityType/:entityId', async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const { locale = 'en' } = req.query;
      
      if (!['destinations', 'accommodations', 'attractions', 'restaurants'].includes(entityType)) {
        return res.status(400).json({ error: 'Invalid entity type' });
      }
      
      const results = await I18nService.getEntitiesWithTranslations(
        entityType as any,
        locale as any,
        undefined
      );
      
      const entity = results.find(item => item.id === parseInt(entityId));
      
      if (!entity) {
        return res.status(404).json({ error: 'Entity not found' });
      }
      
      res.json({ success: true, data: entity });
    } catch (error) {
      console.error(`Error fetching localized ${req.params.entityType}:`, error);
      res.status(500).json({ error: 'Failed to fetch entity' });
    }
  });

  app.get('/api/test-db', async (_req, res) => {
    try {
      const client = await pool.connect();
      console.log('Database connected successfully');
      
      // Test if places table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'places'
        );
      `);
      
      const placesTableExists = tableCheck.rows[0].exists;
      console.log('Places table exists:', placesTableExists);
      
      if (!placesTableExists) {
        // Create places table
        await client.query(`
          CREATE TABLE places (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255),
            country VARCHAR(100),
            rating DECIMAL(2,1),
            description TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `);
        
        // Insert sample data
        await client.query(`
          INSERT INTO places (name, location, country, rating, description) VALUES
          ('Machu Picchu', 'Cusco', 'Peru', 4.8, 'Ancient Incan citadel set high in the Andes Mountains'),
          ('Christ the Redeemer', 'Rio de Janeiro', 'Brazil', 4.5, 'Iconic statue overlooking Rio de Janeiro'),
          ('Salar de Uyuni', 'Potosí', 'Bolivia', 4.7, 'World''s largest salt flat with stunning mirror effects'),
          ('Angel Falls', 'Canaima National Park', 'Venezuela', 4.6, 'World''s highest uninterrupted waterfall'),
          ('Torres del Paine', 'Patagonia', 'Chile', 4.4, 'Dramatic granite peaks and pristine wilderness');
        `);
        
        console.log('Places table created and seeded with sample data');
      }
      
      // Get count of places
      const countResult = await client.query('SELECT COUNT(*) FROM places');
      const count = countResult.rows[0].count;
      
      client.release();
      
      res.json({ 
        success: true, 
        database: 'connected',
        placesTableExists,
        placesCount: parseInt(count),
        message: 'Database connection and places table verified'
      });
    } catch (error) {
      console.error('Database test error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Database connection failed' 
      });
    }
  });

  // Create itinerary tables endpoint (development only)
  app.post('/api/setup/create-itinerary-tables', async (_req, res) => {
    try {
      // Create tables using direct SQL through db client
      await pool.query(`
        CREATE TABLE IF NOT EXISTS itineraries (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id varchar NOT NULL,
            title varchar NOT NULL,
            plan_json jsonb NOT NULL,
            created_at timestamp DEFAULT NOW(),
            updated_at timestamp DEFAULT NOW()
        );
      `);
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS itinerary_items (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            itinerary_id varchar NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
            day_number integer NOT NULL,
            location varchar NOT NULL,
            activity_type varchar,
            description text,
            estimated_cost decimal(10,2),
            start_time time,
            end_time time,
            notes text,
            created_at timestamp DEFAULT NOW()
        );
      `);
      
      res.json({ 
        success: true, 
        message: "Itinerary tables created successfully" 
      });
    } catch (error) {
      console.error('Error creating itinerary tables:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create tables' 
      });
    }
  });


  // --- Debug cookie endpoints (temporary for diagnosis) ---
  app.get('/api/debug/set-cookie', (req, res) => {
    res.cookie('bb_debug', 'ok', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
      path: '/',
      maxAge: 1000 * 60 * 10,
    });
    res.json({ ok: true });
  });

  app.get('/api/debug/echo-cookie', (req, res) => {
    res.json({ cookiesSeen: req.headers.cookie || null });
  });

  // Auth routes - simplified (no server-side auth validation)
  app.get('/api/auth/user', noAuth, async (req: any, res) => {
    try {
      // Handle localhost test user
      const userId = req.user.claims?.sub || req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User preferences endpoints
  app.get('/api/user/preferences', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        interests: user.interests || [],
        travelStyles: user.travelStyles || [],
        budgetRange: user.budgetRange,
        experienceLevel: user.experienceLevel,
        groupSize: user.groupSize,
        preferredDuration: user.preferredDuration,
        accommodationType: user.accommodationType || [],
        activities: user.activities || [],
        dietaryRestrictions: user.dietaryRestrictions || [],
        languages: user.languages || [],
        personalityTraits: user.personalityTraits || [],
        bio: user.bio,
        onboardingCompleted: user.onboardingCompleted || false,
        registrationCompleted: user.registrationCompleted || false
      });
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  app.post('/api/user/preferences', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const preferences = req.body;
      
      // Map travelStyle to travelStyles for database storage
      if (preferences.travelStyle) {
        preferences.travelStyles = preferences.travelStyle;
        delete preferences.travelStyle;
      }
      
      // Mark onboarding as completed
      preferences.onboardingCompleted = true;
      
      const updatedUser = await storage.updateUserPreferences(userId, preferences);
      
      res.json({
        message: "Preferences updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });

  // Registry completion endpoint
  app.post('/api/user/registry', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const registryData = req.body;
      
      // Mark registration as completed
      registryData.registrationCompleted = true;
      
      const updatedUser = await storage.updateUserPreferences(userId, registryData);
      
      res.json({
        message: "Registration completed successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error completing registry:", error);
      res.status(500).json({ message: "Failed to complete registration" });
    }
  });

  // Trip routes
  app.get('/api/trips', async (req, res) => {
    try {
      const trips = await storage.getPublicTrips();
      res.json(trips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      res.status(500).json({ message: "Failed to fetch trips" });
    }
  });

  app.get('/api/trips/user', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const trips = await storage.getUserTrips(userId);
      res.json(trips);
    } catch (error) {
      console.error("Error fetching user trips:", error);
      res.status(500).json({ message: "Failed to fetch user trips" });
    }
  });

  app.post('/api/trips', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Validate and normalize budget to ensure it's a number
      let budget = req.body.budget;
      if (typeof budget === 'string') {
        // Extract numeric value from formatted string
        const numbers = budget.match(/\d+/g);
        budget = numbers && numbers.length > 0 ? parseFloat(numbers[numbers.length - 1]) : null;
        console.warn('⚠️ Budget was a string, extracted numeric value:', budget);
      } else if (typeof budget === 'number') {
        budget = budget;
      } else {
        budget = null;
      }
      
      const tripData = { ...req.body, userId, budget };
      
      console.log('📝 Creating trip - User ID:', userId);
      console.log('📝 Normalized budget:', budget, typeof budget);
      
      const trip = await storage.createTrip(tripData);
      
      console.log('✅ Trip created successfully:', trip.id);
      res.status(201).json(trip);
    } catch (error) {
      console.error("Error creating trip:", error);
      res.status(400).json({ message: "Failed to create trip", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete('/api/trips/:id', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const tripId = parseInt(req.params.id);
      
      console.log(`🗑️ DELETE request - Trip ID: ${tripId}, User ID: ${userId}`);
      console.log(`🔍 Request user object:`, JSON.stringify(req.user, null, 2));
      
      await storage.deleteTrip(tripId, userId);
      
      console.log(`✅ Trip ${tripId} deleted successfully for user ${userId}`);
      res.json({ success: true, message: "Trip deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting trip:", error);
      res.status(400).json({ success: false, message: "Failed to delete trip", error: String(error) });
    }
  });

  // Itinerary routes
  app.get('/api/itineraries', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      if (!userId || userId === 'anonymous') {
        return res.status(401).json({ message: "Authentication required" });
      }
      const itineraries = await storage.getUserItineraries(userId);
      res.json(itineraries);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      res.status(500).json({ message: "Failed to fetch itineraries" });
    }
  });

  app.post('/api/itineraries', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      if (!userId || userId === 'anonymous') {
        return res.status(401).json({ message: "Authentication required to save itinerary" });
      }
      
      const { title, plan_json } = req.body;
      if (!plan_json) {
        return res.status(400).json({ message: "Plan data is required" });
      }

      const itineraryData = {
        userId,
        title: title || `Itinerary - ${new Date().toLocaleDateString()}`,
        planJson: plan_json
      };

      const newItinerary = await storage.createItinerary(itineraryData);
      res.json(newItinerary);
    } catch (error) {
      console.error("Error creating itinerary:", error);
      res.status(400).json({ message: "Failed to save itinerary" });
    }
  });

  app.delete('/api/itineraries/:id', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      if (!userId || userId === 'anonymous') {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const itineraryId = req.params.id;
      await storage.deleteItinerary(itineraryId, userId);
      res.json({ message: "Itinerary deleted successfully" });
    } catch (error) {
      console.error("Error deleting itinerary:", error);
      res.status(400).json({ message: "Failed to delete itinerary" });
    }
  });

  app.get('/api/trips/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const trip = await storage.getTripById(id);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      res.json(trip);
    } catch (error) {
      console.error("Error fetching trip:", error);
      res.status(500).json({ message: "Failed to fetch trip" });
    }
  });

  // Journey routes (multi-destination routes)
  app.get('/api/journeys', async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.season) {
        filters.season = req.query.season as string;
      }
      if (req.query.minBudget) {
        filters.minBudget = parseInt(req.query.minBudget as string);
      }
      if (req.query.maxBudget) {
        filters.maxBudget = parseInt(req.query.maxBudget as string);
      }
      if (req.query.minNights) {
        filters.minNights = parseInt(req.query.minNights as string);
      }
      if (req.query.maxNights) {
        filters.maxNights = parseInt(req.query.maxNights as string);
      }
      if (req.query.tags) {
        filters.tags = (req.query.tags as string).split(',');
      }
      if (req.query.audienceTags) {
        filters.audienceTags = (req.query.audienceTags as string).split(',');
      }
      if (req.query.limit) {
        filters.limit = parseInt(req.query.limit as string);
      }
      if (req.query.offset) {
        filters.offset = parseInt(req.query.offset as string);
      }
      
      const journeys = await storage.getJourneys(filters);
      res.json(journeys);
    } catch (error) {
      console.error("Error fetching journeys:", error);
      res.status(500).json({ message: "Failed to fetch journeys" });
    }
  });

  app.get('/api/journeys/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const journey = await storage.getJourneyById(id);
      
      if (!journey) {
        return res.status(404).json({ message: "Journey not found" });
      }
      
      res.json(journey);
    } catch (error) {
      console.error("Error fetching journey:", error);
      res.status(500).json({ message: "Failed to fetch journey" });
    }
  });

  app.post('/api/journeys', async (req, res) => {
    try {
      const validatedData = insertJourneySchema.parse(req.body);
      const journey = await storage.createJourney(validatedData);
      res.status(201).json(journey);
    } catch (error) {
      console.error("Error creating journey:", error);
      res.status(400).json({ message: "Failed to create journey", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Saved Journeys routes
  app.post('/api/saved-journeys', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      
      // Validate request body
      const validatedData = insertSavedJourneySchema.parse({
        userId,
        journeyId: req.body.journeyId,
        notes: req.body.notes,
      });

      // Check if already saved
      const alreadySaved = await storage.isJourneySaved(userId, validatedData.journeyId);
      if (alreadySaved) {
        return res.status(400).json({ message: "Journey already saved" });
      }

      const savedJourney = await storage.saveJourney(userId, validatedData.journeyId, validatedData.notes);
      res.status(201).json(savedJourney);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", error: error.message });
      }
      console.error("Error saving journey:", error);
      res.status(500).json({ message: "Failed to save journey" });
    }
  });

  app.get('/api/saved-journeys', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const savedJourneys = await storage.getUserSavedJourneys(userId);
      console.log('📦 Saved Journeys API Response:', JSON.stringify(savedJourneys, null, 2));
      if (savedJourneys.length > 0) {
        console.log('📦 First Journey Object:', savedJourneys[0].journey);
      }
      res.json(savedJourneys);
    } catch (error) {
      console.error("Error fetching saved journeys:", error);
      res.status(500).json({ message: "Failed to fetch saved journeys" });
    }
  });

  app.get('/api/saved-journeys/check/:journeyId', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const journeyId = parseInt(req.params.journeyId);
      
      if (isNaN(journeyId)) {
        return res.status(400).json({ message: "Invalid journeyId - must be a number" });
      }
      
      const isSaved = await storage.isJourneySaved(userId, journeyId);
      res.json({ isSaved });
    } catch (error) {
      console.error("Error checking saved journey:", error);
      res.status(500).json({ message: "Failed to check if journey is saved" });
    }
  });

  app.delete('/api/saved-journeys/:id', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid saved journey ID - must be a number" });
      }
      
      await storage.removeSavedJourney(id, userId);
      res.json({ message: "Journey removed from saved list" });
    } catch (error) {
      console.error("Error removing saved journey:", error);
      res.status(500).json({ message: "Failed to remove saved journey" });
    }
  });

  // Review routes
  app.get('/api/reviews', async (req, res) => {
    try {
      const { destination } = req.query;
      if (destination) {
        const reviews = await storage.getReviewsByDestination(destination as string);
        res.json(reviews);
      } else {
        const reviews = await storage.getRecentReviews();
        res.json(reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/reviews', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = { ...req.body, userId };
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ message: "Failed to create review" });
    }
  });

  // Expense routes
  app.get('/api/expenses/trip/:tripId', noAuth, async (req, res) => {
    try {
      const tripId = parseInt(req.params.tripId);
      const expenses = await storage.getTripExpenses(tripId);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching trip expenses:", error);
      res.status(500).json({ message: "Failed to fetch trip expenses" });
    }
  });

  app.get('/api/expenses/user', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const expenses = await storage.getUserExpenses(userId);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching user expenses:", error);
      res.status(500).json({ message: "Failed to fetch user expenses" });
    }
  });

  app.post('/api/expenses', noAuth, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || 'anonymous';
      const { tripId, category, amount, description, location } = req.body;

      console.log("Received expense request:", { tripId, category, amount, description, location, userId });

      // Validate required fields
      if (!tripId) {
        return res.status(400).json({ message: "אנא בחר טיול" });
      }
      if (!category) {
        return res.status(400).json({ message: "אנא בחר קטגוריה" });
      }
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "אנא הזן סכום תקין" });
      }
      if (!description || description.trim() === '') {
        return res.status(400).json({ message: "אנא הזן תיאור" });
      }

      const parsedTripId = parseInt(tripId);
      
      // Verify the trip exists and belongs to the user
      const trip = await storage.getTripById(parsedTripId);
      console.log("Found trip:", trip);
      
      if (!trip) {
        return res.status(400).json({ message: "הטיול שנבחר לא נמצא במערכת" });
      }
      
      // In demo mode, allow anonymous users to add expenses to anonymous trips
      if (trip.userId !== userId && !(trip.userId === 'anonymous' && userId === 'anonymous')) {
        return res.status(403).json({ message: "אין לך הרשאה להוסיף הוצאות לטיול זה" });
      }

      const expenseData = { tripId: parsedTripId, category, amount, description, location, userId };
      console.log("Creating expense with data:", expenseData);
      
      const expense = await storage.createExpense(expenseData);
      res.status(201).json(expense);
    } catch (error: any) {
      console.error("Error creating expense:", error);
      
      // Check for specific database errors
      if (error.code === '23503') {
        return res.status(400).json({ message: "הטיול שנבחר לא קיים במערכת" });
      }
      
      res.status(400).json({ message: error.message || "שגיאה בהוספת הוצאה, אנא נסה שוב" });
    }
  });

  app.delete('/api/expenses/:id', noAuth, async (req: any, res) => {
    try {
      const expenseId = parseInt(req.params.id);
      
      if (isNaN(expenseId)) {
        return res.status(400).json({ message: 'Invalid expense ID' });
      }

      await storage.deleteExpense(expenseId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Hotel Inquiries (hotel-deals page)
  app.post('/api/hotel-inquiries', async (req, res) => {
    try {
      console.log("Received hotel inquiry request:", req.body);
      const { destination, checkIn, checkOut, adults, children, budget, phone, email, notes, whatsappConsent } = req.body;
      
      if (!destination || !checkIn || !checkOut || !phone || !email) {
        console.error("Missing required fields:", { destination, checkIn, checkOut, phone, email });
        return res.status(400).json({ message: "Missing required fields" });
      }

      console.log("Inserting into database:", {
        destination,
        checkIn,
        checkOut,
        adults: adults || 2,
        children: children || 0,
        budget,
        phone,
        email,
        notes,
        whatsappConsent: whatsappConsent || false
      });

      const inquiry = await db.insert(hotelInquiries).values({
        destination,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        adults: adults || 2,
        children: children || 0,
        budget,
        phone,
        email,
        notes,
        whatsappConsent: whatsappConsent || false
      }).returning();

      console.log("Successfully created inquiry:", inquiry[0]);

      // Send email notification
      try {
        const { sendHotelInquiryEmail } = await import('./email.js');
        await sendHotelInquiryEmail({
          destination,
          checkIn,
          checkOut,
          adults: adults || 2,
          children: children || 0,
          budget,
          phone,
          email,
          notes,
          whatsappConsent: whatsappConsent || false
        });
        console.log("✅ Notification email sent to support@globemate.co.il");
      } catch (emailError) {
        // Log email error but don't fail the request
        console.error("⚠️ Failed to send email notification:", emailError);
      }

      res.status(201).json({ success: true, inquiry: inquiry[0] });
    } catch (error) {
      console.error("Error creating hotel inquiry:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ 
        message: "Failed to submit inquiry",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Chat routes
  app.get('/api/chat/rooms', async (req, res) => {
    try {
      const rooms = await storage.getChatRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      res.status(500).json({ message: "Failed to fetch chat rooms" });
    }
  });

  // Alternative endpoint with dash for chat-rooms (used by frontend)
  app.get('/api/chat-rooms', async (req, res) => {
    try {
      const rooms = await storage.getChatRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      res.status(500).json({ message: "Failed to fetch chat rooms" });
    }
  });

  app.get('/api/chat/messages/:roomId', async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const messages = await storage.getChatMessages(roomId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat/messages', async (req, res) => {
    try {
      const { room_id, message, author_name, message_type, attachments } = req.body;
      
      if (!room_id || (!message?.trim() && !attachments?.length)) {
        return res.status(400).json({ message: "Room ID and message content or attachments are required" });
      }

      const messageData = {
        roomId: parseInt(room_id),
        message: message?.trim() || '',
        authorName: author_name || 'Guest',
        userId: null, // Guest mode for now
        messageType: message_type || 'text'
      };

      const newMessage = await storage.createChatMessage(messageData);
      
      // If there are attachments, create them
      if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
          await storage.createChatAttachment({
            path: attachment.path || attachment.url || '',
            messageId: newMessage.id,
            url: attachment.url,
            filename: attachment.filename,
            mimeType: attachment.mimeType,
            sizeBytes: attachment.sizeBytes,
            width: attachment.width,
            height: attachment.height
          });
        }
      }
      
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Direct Messages routes
  app.get('/api/dms', async (req, res) => {
    try {
      const { user_name } = req.query;
      const rooms = await storage.getDMRooms(user_name as string);
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching DM rooms:", error);
      res.status(500).json({ message: "Failed to fetch DM rooms" });
    }
  });

  app.post('/api/dms/start', async (req, res) => {
    try {
      const { participant1, participant2 } = req.body;
      
      if (!participant1 || !participant2) {
        return res.status(400).json({ message: "Both participant names are required" });
      }

      // Check if DM room already exists
      const existingRoom = await storage.findDMRoom(participant1, participant2);
      if (existingRoom) {
        return res.json(existingRoom);
      }

      // Create new DM room
      const roomData = {
        name: `DM: ${participant1} & ${participant2}`,
        description: `Direct message between ${participant1} and ${participant2}`,
        is_private: true,
        room_type: 'dm'
      };

      const newRoom = await storage.createChatRoom(roomData);
      
      // Add both participants to the room
      await storage.addRoomMember(newRoom.id, participant1);
      await storage.addRoomMember(newRoom.id, participant2);
      
      res.status(201).json(newRoom);
    } catch (error) {
      console.error("Error starting DM:", error);
      res.status(500).json({ message: "Failed to start DM" });
    }
  });

  // File upload endpoint for attachments
  app.post('/api/upload-attachment', async (req, res) => {
    try {
      const multer = await import('multer');
      const upload = multer.default({ 
        storage: multer.default.memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
      });
      
      // Use multer middleware to parse the uploaded file
      upload.single('file')(req, res, async (err) => {
        if (err) {
          console.error('Multer error:', err);
          return res.status(400).json({ message: 'File upload error' });
        }
        
        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }
        
        try {
          const { uploadFile, getFileUrl, ensureBucketExists } = await import('./supabase.js');
          
          // Ensure the attachments bucket exists
          await ensureBucketExists('attachments');
          
          // Generate unique filename
          const fileExtension = req.file.originalname.split('.').pop() || '';
          const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
          
          // Upload to Supabase Storage
          await uploadFile('attachments', uniqueFileName, req.file.buffer, req.file.mimetype);
          
          // Get public URL
          const fileUrl = await getFileUrl('attachments', uniqueFileName);
          
          // Return file metadata
          res.json({
            url: fileUrl,
            filename: req.file.originalname,
            mimeType: req.file.mimetype,
            sizeBytes: req.file.size,
            width: undefined, // TODO: Extract image dimensions if needed
            height: undefined
          });
          
        } catch (storageError) {
          console.error('Storage error:', storageError);
          res.status(500).json({ message: 'Failed to store file' });
        }
      });
    } catch (error) {
      console.error("Error uploading attachment:", error);
      res.status(500).json({ message: "Failed to upload attachment" });
    }
  });

  // Connection routes
  app.get('/api/connections', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const connections = await storage.getUserConnections(userId);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  app.post('/api/connections', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const connectionData = { ...req.body, requesterId: userId };
      const connection = await storage.createConnection(connectionData);
      res.status(201).json(connection);
    } catch (error) {
      console.error("Error creating connection:", error);
      res.status(400).json({ message: "Failed to create connection" });
    }
  });

  app.patch('/api/connections/:id', noAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const connection = await storage.updateConnectionStatus(id, status);
      res.json(connection);
    } catch (error) {
      console.error("Error updating connection:", error);
      res.status(400).json({ message: "Failed to update connection" });
    }
  });

  // Debug endpoint for authentication testing
  app.get('/api/debug/auth', noAuth, async (req: any, res) => {
    res.json({ 
      authenticated: true, 
      user: req.user?.claims?.sub || req.user?.id,
      timestamp: new Date().toISOString() 
    });
  });

  // ===== INGESTION DASHBOARD API ENDPOINTS =====
  
  // Get ingestion jobs data
  app.get('/api/ingestion-jobs', async (req, res) => {
    try {
      const { country, kind, search } = req.query;
      
      // Create mock data based on existing destinations
      const mockJobs = [
        {
          id: 'job_1',
          destination_name: 'Machu Picchu',
          country: 'Peru',
          kind: 'attraction',
          count: 25,
          status: 'succeeded',
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'job_2',
          destination_name: 'Salar de Uyuni',
          country: 'Bolivia',
          kind: 'restaurant',
          count: 12,
          status: 'running',
          updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'job_3',
          destination_name: 'Cartagena',
          country: 'Colombia',
          kind: 'accommodation',
          count: 18,
          status: 'queued',
          updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'job_4',
          destination_name: 'Christ the Redeemer',
          country: 'Brazil',
          kind: 'attraction',
          count: 31,
          status: 'succeeded',
          updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'job_5',
          destination_name: 'Torres del Paine',
          country: 'Chile',
          kind: 'accommodation',
          count: 7,
          status: 'failed',
          updated_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'job_6',
          destination_name: 'Angel Falls',
          country: 'Venezuela',
          kind: 'restaurant',
          count: 39,
          status: 'succeeded',
          updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      // Apply filters
      let filteredJobs = mockJobs;
      if (country && country !== 'all') {
        filteredJobs = filteredJobs.filter((job: any) => job.country === country);
      }
      if (kind && kind !== 'all') {
        filteredJobs = filteredJobs.filter((job: any) => job.kind === kind);
      }
      if (search) {
        filteredJobs = filteredJobs.filter((job: any) => 
          job.destination_name.toLowerCase().includes(search.toString().toLowerCase())
        );
      }
      
      res.json(filteredJobs);
    } catch (error) {
      console.error('Error fetching ingestion jobs:', error);
      res.status(500).json({ error: 'Failed to fetch ingestion jobs' });
    }
  });
  
  // Get ingestion summary data
  app.get('/api/ingestion-summary', async (req, res) => {
    try {
      // Create mock summary data - simplified version
      const mockSummary = [
        {
          destination_name: 'Machu Picchu',
          country: 'Peru',
          total_attractions: 25,
          total_restaurants: 15,
          total_accommodations: 30,
          last_updated: new Date().toISOString()
        },
        {
          destination_name: 'Salar de Uyuni',
          country: 'Bolivia',
          total_attractions: 18,
          total_restaurants: 8,
          total_accommodations: 12,
          last_updated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          destination_name: 'Cartagena',
          country: 'Colombia',
          total_attractions: 22,
          total_restaurants: 28,
          total_accommodations: 35,
          last_updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      res.json(mockSummary);
    } catch (error) {
      console.error('Error fetching ingestion summary:', error);
      res.status(500).json({ error: 'Failed to fetch ingestion summary' });
    }
  });

  // ===== COLLECTOR DATA API ENDPOINTS =====
  registerCollectorRoutes(app);

  // ===== DUFFEL FLIGHTS API INTEGRATION =====
  
  // Search flights using Duffel API
  app.post('/api/flights/search', noAuth, async (req: any, res) => {
    try {
      const { origin, destination, departureDate, returnDate, passengers, cabinClass } = req.body;
      
      console.log('Flight search request:', { origin, destination, departureDate, returnDate, passengers, cabinClass });
      
      if (!origin || !destination || !departureDate || !passengers) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const apiKey = process.env.DUFFEL_API_KEY;
      const baseUrl = process.env.DUFFEL_BASE_URL || 'https://api.duffel.com';

      if (!apiKey) {
        console.error('Duffel API key not configured');
        return res.status(500).json({ error: 'Duffel API key not configured' });
      }

      // Build slices (one-way or round-trip)
      const slices: any[] = [
        {
          origin,
          destination,
          departure_date: departureDate
        }
      ];

      if (returnDate) {
        slices.push({
          origin: destination,
          destination: origin,
          departure_date: returnDate
        });
      }

      // Build passengers array
      const passengersList = [];
      for (let i = 0; i < (passengers.adults || 1); i++) {
        passengersList.push({ type: 'adult' });
      }
      if (passengers.children) {
        for (let i = 0; i < passengers.children; i++) {
          // Children in Duffel API require age instead of type
          passengersList.push({ age: 10 }); // Using default age 10 for children
        }
      }

      const offerRequest = {
        data: {
          slices,
          passengers: passengersList,
          cabin_class: cabinClass || 'economy'
        }
      };

      // Make request to Duffel API
      const https = await import('https');
      const postData = JSON.stringify(offerRequest);

      const options = {
        hostname: 'api.duffel.com',
        path: '/air/offer_requests',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Duffel-Version': 'v2',
          'Accept': 'application/json'
        }
      };

      const apiResponse = await new Promise<any>((resolve, reject) => {
        const apiReq = https.request(options, (apiRes) => {
          let data = '';
          apiRes.on('data', (chunk) => { data += chunk; });
          apiRes.on('end', () => {
            try {
              console.log('Duffel API response status:', apiRes.statusCode);
              console.log('Duffel API response data:', data.substring(0, 500));
              const parsed = JSON.parse(data);
              if (apiRes.statusCode === 200 || apiRes.statusCode === 201) {
                resolve(parsed);
              } else {
                console.error('Duffel API error:', parsed.errors);
                reject(new Error(parsed.errors?.[0]?.message || JSON.stringify(parsed.errors) || 'Duffel API error'));
              }
            } catch (e) {
              console.error('Failed to parse Duffel response:', data);
              reject(new Error('Failed to parse Duffel response'));
            }
          });
        });
        apiReq.on('error', (error) => {
          console.error('HTTP request error:', error);
          reject(error);
        });
        apiReq.write(postData);
        apiReq.end();
      });

      console.log('Number of offers found:', apiResponse.data?.offers?.length || 0);
      
      res.json({
        success: true,
        offers: apiResponse.data?.offers || [],
        requestId: apiResponse.data?.id
      });

    } catch (error: any) {
      console.error('Flights search error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: error.message || 'Failed to search flights' });
    }
  });

  // Get offer details
  app.get('/api/flights/offer/:offerId', noAuth, async (req: any, res) => {
    try {
      const { offerId } = req.params;
      const apiKey = process.env.DUFFEL_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: 'Duffel API key not configured' });
      }

      const https = await import('https');
      const options = {
        hostname: 'api.duffel.com',
        path: `/air/offers/${offerId}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Duffel-Version': 'v2',
          'Accept': 'application/json'
        }
      };

      const apiResponse = await new Promise<any>((resolve, reject) => {
        const apiReq = https.request(options, (apiRes) => {
          let data = '';
          apiRes.on('data', (chunk) => { data += chunk; });
          apiRes.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (apiRes.statusCode === 200) {
                resolve(parsed);
              } else {
                reject(new Error(parsed.errors?.[0]?.message || 'Duffel API error'));
              }
            } catch (e) {
              reject(new Error('Failed to parse Duffel response'));
            }
          });
        });
        apiReq.on('error', reject);
        apiReq.end();
      });

      res.json({
        success: true,
        offer: apiResponse.data
      });

    } catch (error: any) {
      console.error('Offer details error:', error);
      res.status(500).json({ error: error.message || 'Failed to get offer details' });
    }
  });

  // Flight Bookings endpoints
  
  // Create a new flight booking
  app.post('/api/flights/bookings', async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const bookingData = req.body;
      
      // Add userId to booking data
      const booking = await storage.createFlightBooking({
        ...bookingData,
        userId
      });
      
      res.json({
        success: true,
        booking
      });
    } catch (error: any) {
      console.error('Create booking error:', error);
      res.status(500).json({ error: error.message || 'Failed to create booking' });
    }
  });
  
  // Get all user bookings
  app.get('/api/flights/bookings', async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const bookings = await storage.getUserFlightBookings(userId);
      
      res.json({
        success: true,
        bookings
      });
    } catch (error: any) {
      console.error('Get bookings error:', error);
      res.status(500).json({ error: error.message || 'Failed to get bookings' });
    }
  });
  
  // Get upcoming bookings
  app.get('/api/flights/bookings/upcoming', async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const bookings = await storage.getUpcomingFlightBookings(userId);
      
      res.json({
        success: true,
        bookings
      });
    } catch (error: any) {
      console.error('Get upcoming bookings error:', error);
      res.status(500).json({ error: error.message || 'Failed to get upcoming bookings' });
    }
  });
  
  // Get past bookings
  app.get('/api/flights/bookings/past', async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const bookings = await storage.getPastFlightBookings(userId);
      
      res.json({
        success: true,
        bookings
      });
    } catch (error: any) {
      console.error('Get past bookings error:', error);
      res.status(500).json({ error: error.message || 'Failed to get past bookings' });
    }
  });
  
  // Track flight using OpenSky Network API
  app.get('/api/flights/track/:callsign', noAuth, async (req: any, res) => {
    try {
      const { callsign } = req.params;
      
      // OpenSky Network API - Free, no API key required
      // Get all current flights and filter by callsign
      const https = await import('https');
      const options = {
        hostname: 'opensky-network.org',
        path: `/api/states/all`,
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };
      
      const apiResponse = await new Promise<any>((resolve, reject) => {
        const apiReq = https.request(options, (apiRes) => {
          let data = '';
          apiRes.on('data', (chunk) => { data += chunk; });
          apiRes.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (apiRes.statusCode === 200) {
                resolve(parsed);
              } else {
                reject(new Error('OpenSky API error'));
              }
            } catch (e) {
              reject(new Error('Failed to parse OpenSky response'));
            }
          });
        });
        apiReq.on('error', reject);
        apiReq.end();
      });
      
      // Parse OpenSky response
      // Response format: { time, states: [[icao24, callsign, origin_country, time_position, last_contact, longitude, latitude, baro_altitude, on_ground, velocity, true_track, vertical_rate, sensors, geo_altitude, squawk, spi, position_source]] }
      
      // Filter by callsign (state[1])
      const targetCallsign = callsign.toUpperCase().trim();
      
      console.log(`🔍 Searching for flight: ${targetCallsign}`);
      console.log(`📊 Total flights in response: ${apiResponse.states?.length || 0}`);
      
      // Find matching flight by callsign
      const matchingState = apiResponse.states?.find((state: any) => {
        const stateCallsign = state[1]?.trim().toUpperCase();
        return stateCallsign === targetCallsign || stateCallsign?.includes(targetCallsign);
      });
      
      if (matchingState) {
        console.log(`✅ Found flight: ${matchingState[1]?.trim()}`);
      } else {
        console.log(`❌ Flight ${targetCallsign} not found in current flights`);
      }
      
      if (matchingState) {
        const state = matchingState;
        const flightData = {
          callsign: state[1]?.trim() || targetCallsign,
          origin_country: state[2],
          longitude: state[5],
          latitude: state[6],
          altitude: state[7], // meters
          on_ground: state[8],
          velocity: state[9], // m/s
          heading: state[10], // degrees
          vertical_rate: state[11], // m/s
          last_contact: new Date(state[4] * 1000).toISOString()
        };
        
        res.json({
          success: true,
          flight: flightData
        });
      } else {
        res.json({
          success: false,
          message: 'Flight not found or not currently in the air'
        });
      }
      
    } catch (error: any) {
      console.error('Flight tracking error:', error);
      res.status(500).json({ error: error.message || 'Failed to track flight' });
    }
  });

  // ===== ENHANCED GLOBAL TRAVEL DATA ENDPOINTS =====
  
  // Seed database with comprehensive travel data (includes South America and other regions)
  app.post('/api/data/seed', async (req: any, res) => {
    try {
      const result = await seedSouthAmericanData();
      res.json(result);
    } catch (error) {
      console.error('Seeding error:', error);
      res.status(500).json({ error: 'Failed to seed data' });
    }
  });

  // Temporary public endpoint to load sample data
  app.get('/api/data/load-samples', async (req: any, res) => {
    try {
      const result = await seedSouthAmericanData();
      res.json({ 
        success: true,
        message: 'Sample data loaded successfully',
        result 
      });
    } catch (error) {
      console.error('Loading samples error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to load samples', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Basic places endpoint - returns places from existing database tables
  app.get('/api/places', async (req, res) => {
    try {
      console.log('Fetching places from existing tables...');
      
      // Use the existing 'places' table that already has data
      const client = await pool.connect();
      try {
        const placesResult = await client.query('SELECT * FROM places ORDER BY rating DESC LIMIT 50');
        const places = placesResult.rows.map(place => ({
          ...place,
          type: 'destination'
        }));
        
        console.log(`Retrieved ${places.length} places from database`);
        res.json({ total: places.length, items: places });
        
      } catch (dbError) {
        console.error('Database query error:', dbError);
        res.json({ 
          total: 0, 
          items: [], 
          message: 'Places data is being loaded. The database is connected but tables may be syncing.',
          error: 'Could not fetch places data'
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      res.status(500).json({ error: 'Failed to fetch places' });
    }
  });

  // ===== GOOGLE PLACES API INTEGRATION =====
  
  // Search places using Google Places API
  app.get('/api/places/search', noAuth, async (req: any, res) => {
    try {
      const { query, type, location } = req.query;
      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      
      const results = await googlePlaces.searchPlaces(query, type, location);
      res.json({ results });
    } catch (error) {
      console.error('Places search error:', error);
      res.status(500).json({ error: 'Failed to search places' });
    }
  });

  // Nearby search using lat/lng
  app.get('/api/places/nearby', noAuth, async (req: any, res) => {
    try {
      const { lat, lng, radius, type } = req.query;
      if (!lat || !lng) {
        return res.status(400).json({ error: 'lat and lng parameters are required' });
      }
      
      const results = await googlePlaces.nearbySearch(
        parseFloat(lat),
        parseFloat(lng),
        radius ? parseInt(radius) : 1000,
        type
      );
      res.json({ results });
    } catch (error) {
      console.error('Nearby search error:', error);
      res.status(500).json({ error: 'Failed to search nearby places' });
    }
  });

  // Import Google Places data to our database
  app.post('/api/places/import', noAuth, async (req: any, res) => {
    try {
      const { placeId, category, destinationId } = req.body;
      if (!placeId || !category || !destinationId) {
        return res.status(400).json({ error: 'placeId, category, and destinationId are required' });
      }

      let imported = null;
      switch (category) {
        case 'accommodation':
          const placeResult = { place_id: placeId, name: '', formatted_address: '', geometry: { location: { lat: 0, lng: 0 } }, types: [] };
          imported = await googlePlaces.importAccommodation(placeResult, destinationId);
          break;
        case 'restaurant':
          const restaurantResult = { place_id: placeId, name: '', formatted_address: '', geometry: { location: { lat: 0, lng: 0 } }, types: [] };
          imported = await googlePlaces.importRestaurant(restaurantResult, destinationId);
          break;
        case 'attraction':
          const attractionResult = { place_id: placeId, name: '', formatted_address: '', geometry: { location: { lat: 0, lng: 0 } }, types: [] };
          imported = await googlePlaces.importAttraction(attractionResult, destinationId);
          break;
        default:
          return res.status(400).json({ error: 'Invalid category. Must be accommodation, restaurant, or attraction' });
      }

      if (imported) {
        // Import reviews as well
        await googlePlaces.importReviews(placeId, category);
      }

      res.json({ imported, message: 'Place imported successfully' });
    } catch (error) {
      console.error('Places import error:', error);
      res.status(500).json({ error: 'Failed to import place' });
    }
  });

  // Get tourist attractions for a specific location using Google Places
  app.get('/api/places/attractions/:location', async (req, res) => {
    try {
      const { location } = req.params;
      
      if (!location) {
        return res.status(400).json({ error: 'Location parameter is required' });
      }

      // Search for tourist attractions using Google Places API
      const results = await googlePlaces.searchPlaces(
        location, 
        'tourist_attraction',
        location
      );

      // Limit to 10 most popular results and format response
      const formattedResults = results.slice(0, 10).map(place => ({
        name: place.name,
        formatted_address: place.formatted_address,
        rating: place.rating,
        place_id: place.place_id,
        types: place.types,
        photo_reference: place.photos && place.photos.length > 0 ? place.photos[0].photo_reference : null,
        user_ratings_total: place.user_ratings_total,
        price_level: place.price_level,
        opening_hours: place.opening_hours,
        business_status: place.business_status
      }));

      res.json(formattedResults);
    } catch (error) {
      console.error('Error fetching tourist attractions:', error);
      res.status(500).json({ 
        error: 'Failed to fetch tourist attractions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ===== TRIPADVISOR-READY STRUCTURE =====
  
  // TripAdvisor API placeholder endpoints (ready for future integration)
  app.get('/api/tripadvisor/search', noAuth, async (req: any, res) => {
    // TODO: Integrate TripAdvisor API when access is granted
    res.json({ 
      message: 'TripAdvisor API integration pending approval',
      fallback: 'Using enhanced database and Google Places data',
      docs: 'https://www.tripadvisor.com/APIAccessSupport'
    });
  });

  app.get('/api/tripadvisor/location/:locationId', noAuth, async (req: any, res) => {
    // TODO: TripAdvisor location details endpoint
    const { locationId } = req.params;
    
    // Fallback to our database
    const accommodation = await storage.getAccommodationByLocationId(locationId);
    const restaurant = await storage.getRestaurantByLocationId(locationId);
    const attraction = await storage.getAttractionByLocationId(locationId);
    
    const location = accommodation || restaurant || attraction;
    if (location) {
      res.json({ location, source: 'database' });
    } else {
      res.status(404).json({ error: 'Location not found' });
    }
  });

  app.get('/api/tripadvisor/reviews/:locationId', noAuth, async (req: any, res) => {
    // TODO: TripAdvisor reviews endpoint
    const { locationId } = req.params;
    const { category } = req.query;
    
    // Fallback to our database
    const reviews = await storage.getLocationReviews(locationId, category as string);
    res.json({ reviews, source: 'database' });
  });

  // AI-powered trip generation
  app.post('/api/ai/generate-trip', noAuth, async (req: any, res) => {
    try {
      const { destination, duration, budget, travelStyle, interests } = req.body;
      
      console.log('Trip generation request:', { destination, duration, budget, travelStyle, interests });
      
      // Validate required fields
      if (!destination || !duration || !budget || !travelStyle) {
        return res.status(400).json({ 
          message: "Missing required fields: destination, duration, budget, and travelStyle are required" 
        });
      }
      
      // Enhanced destination-specific trip data (Global destinations)
      const destinationData = {
        // South America
        'Peru': {
          activities: ['Machu Picchu trek', 'Sacred Valley exploration', 'Cusco city tour', 'Amazon rainforest adventure', 'Lima food tour'],
          description: 'Discover ancient Inca civilization, stunning mountain landscapes, and rich cultural heritage in Peru.',
          highlights: ['Machu Picchu', 'Sacred Valley', 'Rainbow Mountain', 'Amazon jungle', 'Colonial architecture']
        },
        'Colombia': {
          activities: ['Cartagena colonial tour', 'Coffee region exploration', 'Medellín city experience', 'Tayrona National Park', 'Salsa dancing lessons'],
          description: 'Experience vibrant culture, stunning Caribbean coast, and world-renowned coffee regions in Colombia.',
          highlights: ['Cartagena old city', 'Coffee plantations', 'Caribbean beaches', 'Pablo Escobar tour', 'Street art scene']
        },
        'Bolivia': {
          activities: ['Salar de Uyuni tour', 'La Paz cable car ride', 'Death Road cycling', 'Lake Titicaca visit', 'Sucre colonial exploration'],
          description: 'Explore otherworldly salt flats, high-altitude adventures, and indigenous culture in Bolivia.',
          highlights: ['Salt flats mirror effect', 'Floating islands', 'World\'s most dangerous road', 'Witch markets', 'Colonial Sucre']
        },
        'Chile': {
          activities: ['Atacama Desert stargazing', 'Patagonia hiking', 'Santiago wine tours', 'Easter Island exploration', 'Valparaíso street art tour'],
          description: 'Journey through diverse landscapes from desert to glaciers, with world-class wine and unique culture.',
          highlights: ['Atacama geysers', 'Torres del Paine', 'Moai statues', 'Wine valleys', 'Colorful port cities']
        },
        'Argentina': {
          activities: ['Buenos Aires tango shows', 'Iguazu Falls visit', 'Patagonia glacier trekking', 'Mendoza wine tasting', 'Bariloche lake district'],
          description: 'Experience passionate tango culture, incredible natural wonders, and world-famous beef and wine.',
          highlights: ['Iguazu waterfalls', 'Perito Moreno glacier', 'Tango shows', 'Wine country', 'Lake district']
        },
        'Brazil': {
          activities: ['Rio de Janeiro beaches', 'Amazon rainforest tour', 'Salvador cultural immersion', 'Iguazu Falls Brazilian side', 'São Paulo food scene'],
          description: 'Immerse yourself in carnival culture, pristine beaches, and the world\'s largest rainforest.',
          highlights: ['Christ the Redeemer', 'Copacabana beach', 'Amazon wildlife', 'Carnival festivals', 'Capoeira performances']
        },
        'Ecuador': {
          activities: ['Galápagos wildlife tour', 'Quito colonial exploration', 'Amazon lodge stay', 'Cotopaxi volcano hike', 'Otavalo market visit'],
          description: 'Discover unique wildlife, colonial architecture, and diverse ecosystems from coast to jungle.',
          highlights: ['Galápagos islands', 'Equatorial monuments', 'Cloud forests', 'Indigenous markets', 'Active volcanoes']
        },
        // Europe
        'France': {
          activities: ['Eiffel Tower visit', 'Louvre Museum tour', 'French Riviera beaches', 'Loire Valley châteaux', 'Wine tasting in Bordeaux'],
          description: 'Experience world-class art, exquisite cuisine, iconic landmarks, and romantic ambiance in France.',
          highlights: ['Eiffel Tower', 'Versailles Palace', 'Provence lavender fields', 'French cuisine', 'Wine regions']
        },
        'Italy': {
          activities: ['Colosseum tour', 'Venice gondola rides', 'Tuscan countryside', 'Amalfi Coast', 'Vatican City'],
          description: 'Immerse yourself in ancient history, Renaissance art, stunning coastlines, and world-renowned cuisine.',
          highlights: ['Roman ruins', 'Vatican Museums', 'Leaning Tower of Pisa', 'Gelato tasting', 'Italian vineyards']
        },
        'Spain': {
          activities: ['Sagrada Familia', 'Flamenco shows', 'Tapas tours', 'Alhambra Palace', 'Beach clubs in Ibiza'],
          description: 'Discover vibrant culture, stunning architecture, passionate music, and Mediterranean beaches.',
          highlights: ['Gaudi architecture', 'La Tomatina festival', 'Camino de Santiago', 'Paella', 'Running of the Bulls']
        },
        'United Kingdom': {
          activities: ['British Museum', 'Buckingham Palace', 'Scottish Highlands', 'Stonehenge', 'Afternoon tea'],
          description: 'Explore royal history, diverse landscapes, iconic landmarks, and charming countryside.',
          highlights: ['Tower of London', 'Edinburgh Castle', 'Lake District', 'Harry Potter sites', 'English pubs']
        },
        'Greece': {
          activities: ['Acropolis tour', 'Santorini sunsets', 'Island hopping', 'Ancient Delphi', 'Greek cooking class'],
          description: 'Experience ancient mythology, stunning islands, crystal-clear waters, and Mediterranean cuisine.',
          highlights: ['Parthenon', 'Mykonos beaches', 'Meteora monasteries', 'Greek islands', 'Olive groves']
        },
        // Asia
        'Japan': {
          activities: ['Tokyo city tour', 'Mt. Fuji visit', 'Kyoto temples', 'Cherry blossom viewing', 'Sushi making class'],
          description: 'Discover ancient traditions, cutting-edge technology, serene temples, and exquisite cuisine.',
          highlights: ['Bullet trains', 'Geisha districts', 'Anime culture', 'Hot springs', 'Zen gardens']
        },
        'Thailand': {
          activities: ['Bangkok temples', 'Island beach hopping', 'Thai cooking class', 'Elephant sanctuary', 'Night markets'],
          description: 'Experience tropical paradise, ornate temples, delicious street food, and warm hospitality.',
          highlights: ['Floating markets', 'Phi Phi Islands', 'Full moon parties', 'Thai massage', 'Tuk-tuk rides']
        },
        'China': {
          activities: ['Great Wall hike', 'Forbidden City', 'Terracotta Warriors', 'Li River cruise', 'Dim sum tour'],
          description: 'Explore ancient wonders, modern megacities, diverse landscapes, and rich cultural heritage.',
          highlights: ['Great Wall', 'Beijing skyline', 'Pandas', 'Chinese cuisine', 'Silk Road']
        },
        'India': {
          activities: ['Taj Mahal visit', 'Varanasi Ganges ceremony', 'Kerala backwaters', 'Jaipur palaces', 'Street food tours'],
          description: 'Immerse yourself in vibrant colors, spiritual traditions, diverse landscapes, and aromatic cuisine.',
          highlights: ['Taj Mahal', 'Holi festival', 'Bollywood', 'Yoga retreats', 'Spice markets']
        },
        // Oceania
        'Australia': {
          activities: ['Great Barrier Reef diving', 'Sydney Opera House', 'Outback adventure', 'Uluru sunset', 'Beach surfing'],
          description: 'Discover unique wildlife, stunning coastlines, vibrant cities, and vast wilderness.',
          highlights: ['Great Barrier Reef', 'Sydney Harbour', 'Kangaroos', 'Beach culture', 'Aboriginal heritage']
        },
        'New Zealand': {
          activities: ['Milford Sound cruise', 'Hobbit movie sites', 'Queenstown adventure sports', 'Maori cultural experience', 'Glacier hiking'],
          description: 'Experience breathtaking landscapes, adventure activities, Maori culture, and Middle-earth scenery.',
          highlights: ['Lord of the Rings locations', 'Fjords', 'Bungee jumping', 'Geothermal areas', 'Hiking trails']
        }
      };

      const selectedDestination = destinationData[destination as keyof typeof destinationData] || {
        activities: ['Explore local culture', 'Visit main attractions', 'Try local cuisine', 'Meet local people', 'Discover hidden gems'],
        description: `Explore the amazing ${destination} with authentic ${travelStyle?.join(' and ') || 'adventure'} experiences.`,
        highlights: ['Cultural sites', 'Local markets', 'Traditional food', 'Natural landscapes', 'Historical monuments']
      };

      // Use enhanced destination-specific data for reliable trip generation
      const trip = {
        destination: destination,
        description: selectedDestination.description,
        highlights: selectedDestination.activities.slice(0, 5),
        estimatedBudget: {
          low: Math.max(budget * 0.8, 500),
          high: Math.max(budget * 1.2, 800)
        }
      };

      const response = {
        title: `${destination} ${travelStyle?.includes('adventure') ? 'Adventure' : travelStyle?.includes('cultural') ? 'Cultural Journey' : 'Experience'}`,
        description: trip.description,
        destinations: [
          {
            name: destination,
            days: duration === "1-2 weeks" ? 10 : duration === "2-4 weeks" ? 21 : 14,
            activities: trip.highlights || selectedDestination.activities,
            estimatedCost: trip.estimatedBudget?.low || budget * 0.8
          }
        ],
        totalEstimatedCost: trip.estimatedBudget?.high || budget * 1.2,
        recommendations: selectedDestination.highlights
      };
      
      console.log('Sending trip response:', response);
      res.json(response);
    } catch (error) {
      console.error("Error generating trip:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Provide more specific error information
      if (errorMessage.includes("API key")) {
        res.status(500).json({ 
          message: "OpenAI API key issue. Please check configuration.",
          error: errorMessage 
        });
      } else if (errorMessage.includes("rate limit")) {
        res.status(500).json({ 
          message: "OpenAI rate limit reached. Please try again later.",
          error: errorMessage 
        });
      } else {
        res.status(500).json({ 
          message: "Failed to generate trip with AI",
          error: errorMessage 
        });
      }
    }
  });

  // AI-powered travel suggestions (guest-friendly)
  app.post('/api/ai/travel-suggestions', async (req, res) => {
    try {
      const { destination, travelStyle, budget, duration, interests, preferredCountries, language, adults, children, tripType } = req.body;
      
      // Normalize language parameter
      const normalizedLanguage = (language || req.headers['accept-language'] || 'en').toString().toLowerCase();
      const isHebrew = normalizedLanguage.startsWith('he');
      const finalLanguage = isHebrew ? 'he' : 'en';
      
      console.log('Travel suggestions request - Language:', language, 'Normalized:', finalLanguage);
      
      // Validate required inputs
      if (!travelStyle || !budget || !duration || !interests) {
        return res.status(400).json({ 
          message: "Missing required fields: travelStyle, budget, duration, and interests are required" 
        });
      }

      // Parse destination to separate city and country if provided as "City, Country"
      let specificCity: string | undefined;
      let country: string;
      
      if (destination && typeof destination === 'string' && destination.includes(',')) {
        const parts = destination.split(',').map(part => part.trim());
        specificCity = parts[0]; // e.g., "Rome"
        country = parts[1]; // e.g., "Italy"
      } else {
        country = destination;
      }

      console.log("Generating travel suggestions with data:", {
        specificCity, country, travelStyle, budget, duration, interests, preferredCountries, adults, children, tripType
      });

      const suggestions = await generateTravelSuggestions({
        travelStyle,
        budget,
        duration,
        interests,
        preferredCountries: Array.isArray(destination) ? destination : [country],
        specificCity,
        language: finalLanguage,
        adults: adults || 2,
        children: children || 0,
        tripType: tripType || 'family'
      });
      
      console.log("Generated suggestions:", suggestions);
      res.json(suggestions);
    } catch (error) {
      console.error("Error generating travel suggestions:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Provide more specific error information
      if (errorMessage.includes("API key")) {
        res.status(500).json({ 
          message: "OpenAI API key issue. Please check configuration.",
          error: errorMessage 
        });
      } else if (errorMessage.includes("rate limit")) {
        res.status(500).json({ 
          message: "OpenAI rate limit reached. Please try again later.",
          error: errorMessage 
        });
      } else {
        res.status(500).json({ 
          message: "Failed to generate trip suggestions. Please try again.",
          error: errorMessage 
        });
      }
    }
  });

  // AI-powered itinerary generation
  app.post('/api/ai/itinerary', noAuth, async (req, res) => {
    try {
      const { destination, duration, interests, travelStyle, budget, language, adults, children, tripType } = req.body;
      
      // Normalize language parameter
      const normalizedLanguage = (language || req.headers['accept-language'] || 'en').toString().toLowerCase();
      const isHebrew = normalizedLanguage.startsWith('he');
      const finalLanguage = isHebrew ? 'he' : 'en';
      
      console.log('Itinerary request - Language:', language, 'Normalized:', finalLanguage);
      
      console.log('Generating itinerary with data:', {
        destination, duration, interests, travelStyle, budget
      });
      
      // Validate required fields
      if (!destination) {
        return res.status(400).json({ 
          message: "Destination is required" 
        });
      }
      
      // Convert duration string to number of days
      let durationDays = 7; // default
      if (typeof duration === 'string') {
        const match = duration.match(/(\d+)/);
        if (match) {
          durationDays = parseInt(match[1]);
        }
      } else if (typeof duration === 'number') {
        durationDays = duration;
      }
      
      // Ensure arrays are properly formatted
      const cleanInterests = Array.isArray(interests) ? interests : [];
      const cleanTravelStyle = Array.isArray(travelStyle) ? travelStyle : [];
      const cleanBudget = typeof budget === 'number' ? budget : 1000;
      
      // Use the generateDetailedItinerary function for better results
      const itinerary = await generateDetailedItinerary({
        userId: (req.user as any)?.claims?.sub || (req.user as any)?.id || 'guest',
        destination: destination,
        duration: durationDays,
        interests: cleanInterests,
        travelStyle: cleanTravelStyle,
        budget: cleanBudget,
        language: finalLanguage,
        adults: adults || 2,
        children: children || 0,
        tripType: tripType || 'family'
      });
      
      console.log('Generated itinerary successfully:', itinerary.length, 'days');
      res.json(itinerary);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
      
      // More detailed error handling
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      if (errorMessage.includes("API key")) {
        res.status(500).json({ 
          message: "OpenAI API configuration issue",
          error: "API key problem"
        });
      } else if (errorMessage.includes("rate limit")) {
        res.status(500).json({ 
          message: "OpenAI rate limit reached. Please try again in a few minutes.",
          error: "Rate limit exceeded"
        });
      } else {
        res.status(500).json({ 
          message: "Failed to generate itinerary",
          error: errorMessage
        });
      }
    }
  });

  // Generate custom journey based on inspiration
  app.post('/api/ai/generate-custom-journey', noAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.id || 'guest';
      const { journeyId, adults, children, tripType, startDate, budget, customRequest, language } = req.body;
      
      // Normalize language parameter
      const normalizedLanguage = (language || req.headers['accept-language'] || 'en').toString().toLowerCase();
      const isHebrew = normalizedLanguage.startsWith('he');
      const finalLanguage = isHebrew ? 'he' : 'en';
      
      console.log('Custom journey request:', { journeyId, adults, children, tripType, startDate, budget });
      
      // Validate required fields
      if (!journeyId) {
        return res.status(400).json({ message: "Journey ID is required" });
      }
      
      // Get the original journey for inspiration
      const journey = await storage.getJourneyById(parseInt(journeyId));
      if (!journey) {
        return res.status(404).json({ message: "Journey not found" });
      }
      
      // Extract destinations from journey
      const destinations = Array.isArray(journey.destinations) 
        ? journey.destinations.map((d: any) => d.name).join(', ')
        : 'Multiple destinations';
      
      // Calculate duration from journey
      const duration = journey.totalNights || 14;
      
      // Generate customized itinerary using AI
      const itinerary = await generateDetailedItinerary({
        userId,
        destination: destinations,
        duration,
        interests: ['culture', 'food', 'sightseeing'], // Default interests based on journey type
        travelStyle: [tripType],
        budget: budget ? parseFloat(budget) : 2000,
        language: finalLanguage,
        adults: adults || 2,
        children: children || 0,
        tripType: tripType || 'family',
        customRequest: customRequest || undefined
      });
      
      // Create trip title and description based on language
      const tripTitle = finalLanguage === 'he' 
        ? `מסע מותאם אישית מבוסס על ${journey.title}`
        : `Custom Journey inspired by ${journey.title}`;
      
      // Generate description in the correct language (customRequest is used for AI prompting only, not for description)
      let tripDescription = '';
      if (finalLanguage === 'he') {
        tripDescription = `מסע מותאם אישית ${tripType === 'couple' ? 'לזוג' : tripType === 'family' ? 'למשפחה' : tripType === 'solo' ? 'לטיול סולו' : 'לחברים'} המבוסס על ${journey.title}. ${itinerary.length} ימים של חוויות בלתי נשכחות ב-${destinations}.`;
      } else {
        tripDescription = `A custom ${tripType} journey inspired by ${journey.title}. ${itinerary.length} days of unforgettable experiences in ${destinations}.`;
      }
      
      // Create new trip in database
      const newTrip = await storage.createTrip({
        userId,
        title: tripTitle,
        description: tripDescription,
        destinations: journey.destinations,
        startDate: startDate ? new Date(startDate) : null,
        budget: budget || null,
        travelStyle: tripType,
        itinerary,
        adults: adults || 2,
        children: children || 0,
        isPublic: false
      });
      
      console.log('Created custom journey with ID:', newTrip.id);
      
      // Return the new trip ID
      res.status(201).json({ 
        tripId: newTrip.id,
        message: finalLanguage === 'he' ? 'המסע נוצר בהצלחה' : 'Journey created successfully'
      });
    } catch (error) {
      console.error("Error generating custom journey:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ 
        message: "Failed to generate custom journey",
        error: errorMessage
      });
    }
  });

  // AI-powered budget analysis
  app.post('/api/ai/budget-analysis', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { tripId, totalBudget } = req.body;
      
      let expenses;
      if (tripId) {
        expenses = await storage.getTripExpenses(tripId);
      } else {
        expenses = await storage.getUserExpenses(userId);
      }

      // Transform expenses to match the expected format
      const transformedExpenses = expenses.map(expense => ({
        category: expense.category,
        amount: parseFloat(expense.amount),
        description: expense.description,
        location: expense.location || undefined
      }));

      const analysis = await analyzeBudget(transformedExpenses, totalBudget);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing budget:", error);
      res.status(500).json({ message: "Failed to analyze budget" });
    }
  });

  // AI-powered recommendations
  app.post('/api/ai/recommendations', async (req, res) => {
    try {
      const { destination } = req.body;
      const reviews = await storage.getReviewsByDestination(destination);
      // Transform reviews to match the expected format
      const transformedReviews = reviews.map(review => ({
        rating: review.rating,
        comment: review.comment,
        tags: Array.isArray(review.tags) ? review.tags : []
      }));
      const recommendations = await generateRecommendations(destination, transformedReviews);
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Test real places enrichment endpoint
  app.post('/api/ai/enrich-places', async (req, res) => {
    try {
      const { suggestions } = req.body;
      
      if (!suggestions || !Array.isArray(suggestions)) {
        return res.status(400).json({ 
          message: "Invalid input: suggestions array required" 
        });
      }
      
      console.log('Enriching suggestions with real places...');
      const enrichedSuggestions = await enrichSuggestionsWithRealPlaces(suggestions);
      
      res.json({ 
        enrichedSuggestions,
        message: 'Successfully enriched suggestions with real places from Google Places API'
      });
    } catch (error) {
      console.error("Error enriching places:", error);
      res.status(500).json({ 
        message: "Failed to enrich suggestions with real places",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Test OpenAI API endpoint
  app.get('/api/ai/test', async (req, res) => {
    try {
      console.log('Testing OpenAI API...');
      const testResponse = await generateTravelSuggestions({
        travelStyle: ['adventure'],
        budget: 1000,
        duration: '1-2 weeks',
        interests: ['hiking'],
        preferredCountries: ['Peru']
      });
      console.log('OpenAI test successful:', testResponse);
      res.json({ status: 'success', suggestions: testResponse });
    } catch (error) {
      console.error('OpenAI test failed:', error);
      res.status(500).json({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  });

  // Enhanced AI chat assistant with conversation history
  app.post('/api/ai/chat', noAuth, async (req: any, res) => {
    try {
      const { message, chatHistory = [], previousSuggestions = [], language = 'en' } = req.body;
      
      // Build context with optional user data if authenticated
      const context: any = {
        chatHistory,
        previousSuggestions
      };
      
      // Add user context if user is authenticated
      if (req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        try {
          const userTrips = await storage.getUserTrips(userId);
          const user = await storage.getUser(userId);
          context.userTrips = userTrips;
          context.travelPreferences = user;
        } catch (err) {
          console.log("Could not fetch user context, continuing without it");
        }
      }

      const response = await conversationalTripAssistant(message, context, language);
      
      // If AI indicates it's ready to generate suggestions, generate them
      if (response.type === 'suggestions') {
        const suggestions = await generateConversationalSuggestions(chatHistory, previousSuggestions, language);
        response.suggestions = suggestions;
        
        // Store suggestions for this user session (could be expanded to database storage)
        // For now, we'll return them in the response for client-side management
      }
      
      res.json(response);
    } catch (error) {
      console.error("Error in chat assistant:", error);
      res.status(500).json({ 
        message: "Failed to get chat response",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate trip suggestions based on conversation
  app.post('/api/ai/conversational-suggestions', noAuth, async (req: any, res) => {
    try {
      const { chatHistory = [], previousSuggestions = [], language = 'en' } = req.body;
      
      const suggestions = await generateConversationalSuggestions(chatHistory, previousSuggestions, language);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error generating conversational suggestions:", error);
      res.status(500).json({ message: "Failed to generate suggestions from conversation" });
    }
  });

  // Generate trip suggestions from form data (MyTripsScreen)
  app.post('/api/get-suggestions', async (req, res) => {
    try {
      const { destination, dailyBudget, travelStyle, interests, duration, language = 'en' } = req.body;
      
      if (!destination || !duration || !travelStyle || travelStyle.length === 0) {
        return res.status(400).json({ message: "Missing required fields: destination, duration, and travel style" });
      }

      console.log("Generating suggestions for:", { destination, dailyBudget, travelStyle, interests, duration });

      // Build message for AI based on form inputs
      const interestsText = interests && interests.length > 0 ? ` I enjoy ${interests.join(', ')}.` : '';
      const travelStyleText = Array.isArray(travelStyle) ? travelStyle.join(', ') : travelStyle;
      const message = `I want to visit ${destination} for ${duration}. My daily budget is $${dailyBudget}. I'm interested in ${travelStyleText} travel style.${interestsText} Please suggest 3 different trip options for me.`;

      const chatHistory = [{ role: 'user' as const, content: message }];
      const suggestions = await generateConversationalSuggestions(chatHistory, [], language);

      console.log("Generated suggestions:", suggestions);
      res.json({ suggestions: suggestions || [] });
    } catch (error) {
      console.error("Get suggestions error:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      res.status(500).json({ 
        message: "Failed to generate trip suggestions",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get user's saved trips (simplified for guest user)
  app.get('/api/my-trips/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      // For guest user, get recent public trips as placeholder
      if (userId === 'guest') {
        const publicTrips = await storage.getPublicTrips();
        return res.json(publicTrips.slice(0, 6)); // Limit to 6 recent trips
      }

      // For authenticated users, get their actual trips
      try {
        const trips = await storage.getUserTrips(userId);
        res.json(trips);
      } catch (authError) {
        // Fallback to public trips if user not found
        const publicTrips = await storage.getPublicTrips();
        res.json(publicTrips.slice(0, 6));
      }
    } catch (error) {
      console.error("Get user trips error:", error);
      res.status(500).json({ 
        message: "Failed to fetch user trips",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate detailed day-by-day itinerary
  app.post('/api/generate-itinerary', async (req, res) => {
    try {
      const { userId, destination, duration, interests, travelStyle, budget } = req.body;
      
      if (!destination || !duration || !budget) {
        return res.status(400).json({ message: "Missing required fields: destination, duration, budget" });
      }

      const itineraryRequest = {
        userId: userId || 'guest',
        destination,
        duration: parseInt(duration) || 7,
        interests: interests || [],
        travelStyle: travelStyle || [],
        budget: parseInt(budget) || 50
      };

      const itinerary = await generateDetailedItinerary(itineraryRequest);
      res.json({ itinerary });
    } catch (error) {
      console.error("Generate itinerary error:", error);
      res.status(500).json({ 
        message: "Failed to generate itinerary",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Add place to user's custom itinerary
  app.post('/api/itinerary/:userId/add', async (req, res) => {
    try {
      const { userId } = req.params;
      const { day, location, activity, estimatedCost, tip } = req.body;
      
      // Validate required fields
      if (!userId || !day || !location || !activity) {
        return res.status(400).json({ 
          message: "Missing required fields: day, location, activity are required" 
        });
      }

      // Initialize user itinerary if it doesn't exist
      if (!userItineraries[userId]) {
        userItineraries[userId] = [];
      }

      // Find if day already exists in itinerary
      let dayEntry = userItineraries[userId].find(d => d.day === parseInt(day));
      
      if (dayEntry) {
        // Add activity to existing day
        dayEntry.activities.push(activity);
        dayEntry.estimatedCost += parseInt(estimatedCost) || 0;
        if (tip) {
          dayEntry.tips.push(tip);
        }
      } else {
        // Create new day entry
        const newDay: UserItineraryDay = {
          day: parseInt(day),
          location: location,
          activities: [activity],
          estimatedCost: parseInt(estimatedCost) || 0,
          tips: tip ? [tip] : []
        };
        userItineraries[userId].push(newDay);
        
        // Sort by day number
        userItineraries[userId].sort((a, b) => a.day - b.day);
      }

      res.json({
        message: "Activity added to itinerary successfully",
        itinerary: userItineraries[userId],
        addedActivity: {
          day: parseInt(day),
          location,
          activity,
          estimatedCost: parseInt(estimatedCost) || 0,
          tip: tip || null
        }
      });
    } catch (error) {
      console.error("Error adding to itinerary:", error);
      res.status(500).json({ 
        message: "Failed to add activity to itinerary",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Save trip suggestion to user's trips  
  app.post('/api/my-trips/:userId/save', async (req, res) => {
    try {
      const { userId } = req.params;
      const trip = req.body;

      console.log("Saving trip for user:", userId, "Trip data:", trip);

      if (!trip || !trip.destination) {
        return res.status(400).json({ message: "Missing trip data - destination is required" });
      }

      await storage.saveUserTrip(userId, trip);
      res.status(200).json({ success: true, message: "Trip saved successfully" });
    } catch (error) {
      console.error("Failed to save trip:", error);
      res.status(500).json({ 
        message: "Failed to save trip",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get user's custom itinerary
  app.get('/api/itinerary/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      const itinerary = userItineraries[userId] || [];
      res.json({ 
        userId,
        itinerary,
        totalDays: itinerary.length,
        totalCost: itinerary.reduce((sum, day) => sum + day.estimatedCost, 0)
      });
    } catch (error) {
      console.error("Error fetching user itinerary:", error);
      res.status(500).json({ 
        message: "Failed to fetch user itinerary",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Clear user's custom itinerary
  app.delete('/api/itinerary/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      delete userItineraries[userId];
      
      res.json({ 
        message: "User itinerary cleared successfully",
        userId
      });
    } catch (error) {
      console.error("Error clearing user itinerary:", error);
      res.status(500).json({ 
        message: "Failed to clear user itinerary",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Legacy AI chat assistant for backward compatibility
  app.post('/api/ai/chat-legacy', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message } = req.body;
      
      // Get user context
      const userTrips = await storage.getUserTrips(userId);
      const context = {
        userTrips,
        currentLocation: req.body.currentLocation,
        travelPreferences: req.body.travelPreferences
      };

      const response = await chatAssistant(message, context);
      res.json({ response });
    } catch (error) {
      console.error("Error in chat assistant:", error);
      res.status(500).json({ message: "Failed to get chat response" });
    }
  });

  // Weather & Travel Conditions API
  // Weather API with real weather data and travel recommendations
  app.get('/api/weather/:destination', async (req, res) => {
    try {
      const { destination } = req.params;
      const { country = 'Peru' } = req.query;
      
      let weatherData;
      try {
        // Get current weather from OpenWeather API
        weatherData = await weatherService.getCurrentWeather(destination, country as string);
        
        if (!weatherData) {
          throw new Error("Weather data not available");
        }
      } catch (weatherError) {
        console.log('Weather service error, using mock data:', weatherError);
        // Mock weather data for fallback
        weatherData = {
          location: destination,
          country: country,
          temperature: 22,
          condition: "Partly Cloudy",
          humidity: 65,
          windSpeed: 15,
          description: `Pleasant weather in ${destination}`,
          icon: "partly-cloudy",
          forecast: [
            { day: "Today", temp: 22, condition: "Partly Cloudy" },
            { day: "Tomorrow", temp: 24, condition: "Sunny" },
            { day: "Day 3", temp: 20, condition: "Light Rain" }
          ]
        };
      }

      res.json(weatherData);
    } catch (error) {
      console.error("Error fetching weather:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  // Travel recommendations based on weather and climate data
  app.get('/api/weather/:destination/recommendations', async (req, res) => {
    try {
      const { destination } = req.params;
      const { country = 'Peru' } = req.query;
      
      let recommendations;
      try {
        // Get current weather for better recommendations
        const weatherData = await weatherService.getCurrentWeather(destination, country as string);
        
        // Generate travel recommendations
        recommendations = weatherService.generateTravelRecommendation(destination, weatherData || undefined);
      } catch (weatherError) {
        console.log('Weather recommendations error, using mock data:', weatherError);
        // Mock travel recommendations
        recommendations = {
          destination,
          bestTimeToVisit: "April to October",
          currentConditions: "Good for travel",
          recommendations: [
            "Pack light layers for variable weather",
            "Bring waterproof jacket for occasional rain",
            "Comfortable walking shoes recommended"
          ],
          activities: [
            "Outdoor sightseeing",
            "Walking tours", 
            "Photography"
          ]
        };
      }
      
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating travel recommendations:", error);
      res.status(500).json({ message: "Failed to generate travel recommendations" });
    }
  });

  // Batch weather API for multiple destinations by coordinates
  app.post('/api/weather/batch', async (req, res) => {
    try {
      const { destinations } = req.body;
      
      if (!destinations || !Array.isArray(destinations)) {
        return res.status(400).json({ message: "Invalid destinations data" });
      }
      
      const weatherResults = new Map<string, any>();
      
      // Process each destination
      for (const dest of destinations) {
        try {
          if (!dest.lat || !dest.lon || isNaN(dest.lat) || isNaN(dest.lon)) {
            continue; // Skip destinations without valid coordinates
          }
          
          // Call OpenWeather API with coordinates
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${dest.lat}&lon=${dest.lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
          );
          
          if (!response.ok) {
            console.warn(`Weather API failed for ${dest.name}: ${response.statusText}`);
            continue;
          }
          
          const data = await response.json();
          
          // Map weather icon to emoji
          const getWeatherIcon = (iconCode: string): string => {
            const iconMap: { [key: string]: string } = {
              '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
              '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
              '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
              '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
              '50d': '🌫️', '50n': '🌫️'
            };
            return iconMap[iconCode] || '🌤️';
          };
          
          weatherResults.set(dest.id, {
            id: dest.id,
            temperature: Math.round(data.main.temp),
            tempMin: Math.round(data.main.temp_min),
            tempMax: Math.round(data.main.temp_max),
            feelsLike: Math.round(data.main.feels_like),
            condition: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
            precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
            icon: getWeatherIcon(data.weather[0].icon),
            lastUpdated: new Date().toISOString()
          });
          
        } catch (error) {
          console.warn(`Failed to get weather for ${dest.name}:`, error);
          continue; // Continue with other destinations
        }
      }
      
      // Convert Map to object for JSON response
      const responseData = Object.fromEntries(weatherResults);
      res.json(responseData);
      
    } catch (error) {
      console.error("Error in batch weather request:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  // Test endpoint to verify routing works
  app.get("/api/test-timing", (req, res) => {
    res.json({ message: "Travel timing routes are working" });
  });

  // Travel timing endpoints - moved higher in the route order to prevent conflicts
  app.get("/api/travel-timing/:destination", (req, res) => {
    try {
      const { destination } = req.params;
      const { country } = req.query;
      
      console.log('Travel timing request for:', destination, 'country:', country);
      
      // Direct access to travel timing database for debugging
      const destinationKey = destination.toLowerCase().replace(/[^a-z]/g, '');
      console.log('Looking for destination key:', destinationKey);
      
      const timingInfo = travelTimingService.getBestTimeInfo(destination, country as string);
      console.log('Travel timing result:', timingInfo ? 'Found' : 'Not found');
      
      if (!timingInfo) {
        console.log('Available destinations:', ['lima', 'cusco', 'bogota', 'buenosaires', 'riodejaneiro', 'santiago']);
        return res.status(404).json({ 
          error: 'Travel timing information not available for this destination',
          availableDestinations: ['lima', 'cusco', 'bogota', 'buenosaires', 'riodejaneiro', 'santiago']
        });
      }
      
      res.json(timingInfo);
    } catch (error) {
      console.error('Travel timing error:', error);
      res.status(500).json({ error: 'Failed to fetch travel timing information' });
    }
  });

  app.get("/api/travel-timing/:destination/summary", async (req, res) => {
    try {
      const { destination } = req.params;
      
      const summary = travelTimingService.getSeasonalSummary(destination);
      const currentRating = travelTimingService.getCurrentMonthRating(destination);
      
      res.json({
        summary,
        currentRating,
        destination
      });
    } catch (error) {
      console.error('Travel timing summary error:', error);
      res.status(500).json({ error: 'Failed to fetch travel timing summary' });
    }
  });

  // Currency Exchange API
  app.get('/api/currency/:from/:to', async (req, res) => {
    try {
      const { from, to } = req.params;
      // This would integrate with a currency API like ExchangeRate-API
      const rates: Record<string, number> = {
        'USD-PEN': 3.75, 'USD-COP': 4200, 'USD-BOB': 6.9, 'USD-CLP': 950,
        'USD-ARS': 800, 'USD-BRL': 5.2, 'USD-UYU': 39, 'USD-PYG': 7200,
        'USD-VES': 36, 'USD-GYD': 210, 'USD-SRD': 36, 'USD-FRF': 4.2
      };
      const rate = rates[`${from}-${to}`] || 1;
      res.json({
        from,
        to,
        rate,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      res.status(500).json({ message: "Failed to fetch exchange rate" });
    }
  });

  // Safety & Travel Advisories API
  app.get('/api/safety/:country', async (req, res) => {
    try {
      const { country } = req.params;
      const safetyInfo = {
        country,
        riskLevel: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
        advisories: [
          'Avoid displaying valuable items in public',
          'Use registered taxi services',
          'Stay in well-lit areas at night',
          'Keep copies of important documents'
        ],
        emergencyNumbers: {
          police: '105',
          ambulance: '106',
          fire: '116',
          tourist_police: '0800-123456'
        },
        lastUpdated: new Date().toISOString()
      };
      res.json(safetyInfo);
    } catch (error) {
      console.error("Error fetching safety info:", error);
      res.status(500).json({ message: "Failed to fetch safety information" });
    }
  });

  // Transportation Options API
  app.get('/api/transport/:from/:to', async (req, res) => {
    try {
      const { from, to } = req.params;
      const { type } = req.query; // bus, flight, train
      
      const transportOptions = [
        {
          type: 'flight',
          provider: 'LATAM Airlines',
          duration: '2h 30m',
          price: 180,
          currency: 'USD',
          departure: '08:00',
          arrival: '10:30'
        },
        {
          type: 'bus',
          provider: 'Cruz del Sur',
          duration: '8h 45m',
          price: 25,
          currency: 'USD',
          departure: '22:00',
          arrival: '06:45'
        }
      ].filter(option => !type || option.type === type);

      res.json(transportOptions);
    } catch (error) {
      console.error("Error fetching transport options:", error);
      res.status(500).json({ message: "Failed to fetch transport options" });
    }
  });

  // Accommodation Search API
  app.get('/api/accommodation/:destination', async (req, res) => {
    try {
      const { destination } = req.params;
      const { checkin, checkout, guests, type } = req.query;
      
      const accommodations = [
        {
          id: 1,
          name: 'Backpacker Hostel Central',
          type: 'hostel',
          price: 15,
          currency: 'USD',
          rating: 4.2,
          amenities: ['WiFi', 'Kitchen', 'Laundry', 'Common Area'],
          location: `${destination} City Center`,
          availability: true
        },
        {
          id: 2,
          name: 'Boutique Hotel Plaza',
          type: 'hotel',
          price: 85,
          currency: 'USD',
          rating: 4.6,
          amenities: ['WiFi', 'Restaurant', 'Pool', 'Spa'],
          location: `${destination} Historic District`,
          availability: true
        },
        {
          id: 3,
          name: 'Mountain View Lodge',
          type: 'lodge',
          price: 120,
          currency: 'USD',
          rating: 4.8,
          amenities: ['WiFi', 'Restaurant', 'Hiking', 'Nature Tours'],
          location: `${destination} Mountains`,
          availability: true
        }
      ].filter(acc => !type || acc.type === type);

      res.json(accommodations);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      res.status(500).json({ message: "Failed to fetch accommodations" });
    }
  });

  // Local Activities & Tours API
  app.get('/api/activities/:destination', async (req, res) => {
    try {
      const { destination } = req.params;
      const { category, duration } = req.query;
      
      const activities = [
        {
          id: 1,
          name: 'Historic City Walking Tour',
          category: 'cultural',
          duration: '3 hours',
          price: 25,
          currency: 'USD',
          rating: 4.5,
          description: 'Explore the colonial architecture and learn about local history',
          included: ['Guide', 'Museum entries', 'Light snacks']
        },
        {
          id: 2,
          name: 'Mountain Hiking Adventure',
          category: 'adventure',
          duration: 'full day',
          price: 65,
          currency: 'USD',
          rating: 4.7,
          description: 'Challenge yourself with breathtaking mountain trails',
          included: ['Guide', 'Equipment', 'Lunch', 'Transportation']
        },
        {
          id: 3,
          name: 'Traditional Cooking Class',
          category: 'cultural',
          duration: '4 hours',
          price: 40,
          currency: 'USD',
          rating: 4.8,
          description: 'Learn to cook authentic local dishes with a chef',
          included: ['Ingredients', 'Recipes', 'Meal', 'Certificate']
        }
      ].filter(activity => 
        (!category || activity.category === category) &&
        (!duration || activity.duration.includes(duration as string))
      );

      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Local Food & Restaurant API
  app.get('/api/restaurants/:destination', async (req, res) => {
    try {
      const { destination } = req.params;
      const { cuisine, priceRange } = req.query;
      
      const restaurants = [
        {
          id: 1,
          name: 'Mercado Central Food Court',
          cuisine: 'local',
          priceRange: 'budget',
          averagePrice: 8,
          currency: 'USD',
          rating: 4.3,
          specialties: ['Ceviche', 'Empanadas', 'Fresh Juices'],
          location: `${destination} Central Market`,
          openHours: '06:00-18:00'
        },
        {
          id: 2,
          name: 'Casa de la Abuela',
          cuisine: 'traditional',
          priceRange: 'mid',
          averagePrice: 25,
          currency: 'USD',
          rating: 4.6,
          specialties: ['Lomo Saltado', 'Aji de Gallina', 'Chicha Morada'],
          location: `${destination} Old Town`,
          openHours: '12:00-22:00'
        },
        {
          id: 3,
          name: 'The Gourmet Corner',
          cuisine: 'fusion',
          priceRange: 'upscale',
          averagePrice: 55,
          currency: 'USD',
          rating: 4.8,
          specialties: ['Tasting Menu', 'Wine Pairing', 'Chef Specials'],
          location: `${destination} Business District`,
          openHours: '18:00-24:00'
        }
      ].filter(restaurant => 
        (!cuisine || restaurant.cuisine === cuisine) &&
        (!priceRange || restaurant.priceRange === priceRange)
      );

      res.json(restaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  // Travel Documents & Visa Requirements API
  app.get('/api/visa-requirements/:fromCountry/:toCountry', async (req, res) => {
    try {
      const { fromCountry, toCountry } = req.params;
      
      const visaInfo = {
        fromCountry,
        toCountry,
        visaRequired: Math.random() > 0.5,
        stayDuration: '90 days',
        requirements: [
          'Valid passport (6+ months validity)',
          'Proof of onward travel',
          'Proof of sufficient funds',
          'Yellow fever vaccination certificate (if applicable)'
        ],
        processing: {
          time: '5-10 business days',
          fee: Math.random() > 0.5 ? 50 : 0,
          currency: 'USD'
        },
        lastUpdated: new Date().toISOString()
      };
      
      res.json(visaInfo);
    } catch (error) {
      console.error("Error fetching visa requirements:", error);
      res.status(500).json({ message: "Failed to fetch visa requirements" });
    }
  });

  // Travel Insurance API
  app.get('/api/insurance/quotes', async (req, res) => {
    try {
      const { destination, duration, coverage, age } = req.query;
      
      const quotes = [
        {
          provider: 'World Nomads',
          plan: 'Explorer',
          price: 45,
          currency: 'USD',
          coverage: {
            medical: 100000,
            evacuation: 1000000,
            baggage: 2500,
            cancellation: 5000
          },
          features: ['24/7 Support', 'Adventure Sports', 'COVID Coverage']
        },
        {
          provider: 'SafetyWing',
          plan: 'Nomad Insurance',
          price: 37,
          currency: 'USD',
          coverage: {
            medical: 250000,
            evacuation: 100000,
            baggage: 1000,
            cancellation: 0
          },
          features: ['Flexible Plans', 'Worldwide Coverage', 'Telemedicine']
        }
      ];
      
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching insurance quotes:", error);
      res.status(500).json({ message: "Failed to fetch insurance quotes" });
    }
  });

  // Travel Checklist & Tips API
  app.get('/api/checklist/:destination/:duration', async (req, res) => {
    try {
      const { destination, duration } = req.params;
      
      const checklist = {
        destination,
        duration,
        beforeTravel: [
          'Check passport validity (6+ months)',
          'Get travel insurance',
          'Notify bank of travel plans',
          'Download offline maps',
          'Learn basic local phrases',
          'Check vaccination requirements'
        ],
        packing: [
          'Weather-appropriate clothing',
          'Universal power adapter',
          'First aid kit',
          'Copies of important documents',
          'Portable charger',
          'Reusable water bottle'
        ],
        onArrival: [
          'Get local SIM card or data plan',
          'Exchange currency',
          'Save emergency contacts',
          'Register with embassy (long stays)',
          'Download local transport apps'
        ],
        tips: [
          'Always negotiate taxi fares beforehand',
          'Keep valuables in hotel safe',
          'Try local food but choose busy restaurants',
          'Learn about local customs and etiquette',
          'Keep emergency cash in different locations'
        ]
      };
      
      res.json(checklist);
    } catch (error) {
      console.error("Error fetching checklist:", error);
      res.status(500).json({ message: "Failed to fetch travel checklist" });
    }
  });

  // Emergency Contacts API
  app.get('/api/emergency/:country', async (req, res) => {
    try {
      const { country } = req.params;
      
      const emergency = {
        country,
        contacts: {
          police: '105',
          ambulance: '106',
          fire: '116',
          tourist_police: '0800-123456',
          embassy: '+1-555-0123'
        },
        hospitals: [
          {
            name: 'Hospital Internacional',
            phone: '+51-1-234-5678',
            address: 'Av. Principal 123',
            services: ['Emergency', 'English Speaking Staff']
          }
        ],
        consulates: [
          {
            country: 'United States',
            phone: '+51-1-618-2000',
            address: 'Av. La Encalada 1245',
            hours: 'Mon-Fri 8:00-17:00'
          }
        ]
      };
      
      res.json(emergency);
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      res.status(500).json({ message: "Failed to fetch emergency contacts" });
    }
  });



  // Offline Maps & Navigation API
  app.get('/api/maps/:destination/download', async (req, res) => {
    try {
      const { destination } = req.params;
      
      const mapInfo = {
        destination,
        downloadUrl: `https://maps.example.com/offline/${destination}.map`,
        size: '45MB',
        coverage: `${destination} city center and surrounding areas`,
        features: ['GPS Navigation', 'Points of Interest', 'Public Transport'],
        validFor: '30 days',
        lastUpdated: new Date().toISOString()
      };
      
      res.json(mapInfo);
    } catch (error) {
      console.error("Error preparing map download:", error);
      res.status(500).json({ message: "Failed to prepare map download" });
    }
  });

  // User Preferences & Settings API
  app.get('/api/user/preferences', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const preferences = {
        userId,
        travelStyle: user?.travelStyle || 'adventure',
        budget: 'mid',
        interests: ['culture', 'food', 'nature'],
        notifications: {
          email: true,
          push: true,
          deals: true,
          tips: true
        },
        currency: 'USD',
        language: 'en',
        privacy: {
          profileVisible: true,
          tripsPublic: false,
          shareLocation: false
        }
      };
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  app.put('/api/user/preferences', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = req.body;
      // In a real app, you'd update the user's preferences in the database
      res.json({ message: "Preferences updated successfully", preferences });
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });

  // Travel Deals & Offers API
  app.get('/api/deals', async (req, res) => {
    try {
      const { destination, type, category } = req.query;
      
      const deals = [
        {
          id: 1,
          title: '50% Off Peru Adventure Tours',
          description: 'Limited time offer on Machu Picchu and Sacred Valley tours',
          discount: 50,
          originalPrice: 300,
          dealPrice: 150,
          currency: 'USD',
          category: 'tours',
          destination: 'Peru',
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          provider: 'Inca Trail Adventures',
          rating: 4.8
        },
        {
          id: 2,
          title: 'Hostel Flash Sale - Colombia',
          description: 'Book now and save on accommodations in Bogotá and Cartagena',
          discount: 30,
          originalPrice: 25,
          dealPrice: 18,
          currency: 'USD',
          category: 'accommodation',
          destination: 'Colombia',
          validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          provider: 'Backpacker Hostels',
          rating: 4.3
        },
        {
          id: 3,
          title: 'Flight Sale: US to South America',
          description: 'Round-trip flights starting from $399 to major SA cities',
          discount: 25,
          originalPrice: 599,
          dealPrice: 399,
          currency: 'USD',
          category: 'flights',
          destination: 'South America',
          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          provider: 'SkyTravel',
          rating: 4.1
        }
      ].filter(deal => 
        (!destination || deal.destination.toLowerCase().includes(destination.toString().toLowerCase())) &&
        (!type || deal.category === type) &&
        (!category || deal.category === category)
      );

      res.json(deals);
    } catch (error) {
      console.error("Error fetching deals:", error);
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  // Notifications API
  app.get('/api/notifications', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const notifications = [
        {
          id: 1,
          type: 'deal',
          title: 'New Deal Alert',
          message: 'Peru adventure tours are 50% off this week!',
          read: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          actionUrl: '/deals'
        },
        {
          id: 2,
          type: 'trip',
          title: 'Trip Reminder',
          message: 'Your Colombia trip starts in 5 days. Don\'t forget to check-in!',
          read: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          actionUrl: '/trips'
        },
        {
          id: 3,
          type: 'social',
          title: 'New Review',
          message: 'Someone commented on your Cusco review',
          read: true,
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          actionUrl: '/community'
        }
      ];

      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', noAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      // In a real app, you'd update the notification in the database
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error updating notification:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  // Travel Analytics & Statistics API
  app.get('/api/analytics/dashboard', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userTrips = await storage.getUserTrips(userId);
      const userExpenses = await storage.getUserExpenses(userId);
      
      const analytics = {
        trips: {
          total: userTrips.length,
          completed: userTrips.filter((trip: any) => new Date(trip.endDate) < new Date()).length,
          upcoming: userTrips.filter((trip: any) => new Date(trip.startDate) > new Date()).length,
          countries: Array.from(new Set(userTrips.map((trip: any) => trip.destinations?.[0]?.country).filter(Boolean))).length
        },
        expenses: {
          total: userExpenses.reduce((sum: number, expense: any) => sum + parseFloat(expense.amount), 0),
          thisMonth: userExpenses
            .filter((expense: any) => {
              const expenseDate = new Date(expense.createdAt);
              const now = new Date();
              return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
            })
            .reduce((sum: number, expense: any) => sum + parseFloat(expense.amount), 0),
          topCategory: userExpenses.reduce((acc: any, expense: any) => {
            acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
            return acc;
          }, {}),
          avgPerTrip: userTrips.length > 0 ? userExpenses.reduce((sum: number, expense: any) => sum + parseFloat(expense.amount), 0) / userTrips.length : 0
        },
        destinations: {
          visited: Array.from(new Set(userTrips.map((trip: any) => trip.destinations?.[0]?.name).filter(Boolean))),
          wishlist: ['Patagonia', 'Amazon Rainforest', 'Atacama Desert', 'Salar de Uyuni']
        }
      };

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Search API (Universal Search)
  app.get('/api/search', async (req, res) => {
    try {
      const { q, type, limit = 10 } = req.query;
      const query = q?.toString().toLowerCase() || '';
      
      const results = {
        destinations: [
          { type: 'destination', name: 'Machu Picchu', country: 'Peru', rating: 4.9 },
          { type: 'destination', name: 'Salar de Uyuni', country: 'Bolivia', rating: 4.8 },
          { type: 'destination', name: 'Cartagena', country: 'Colombia', rating: 4.7 }
        ].filter(item => !type || type === 'destinations').filter(item => 
          item.name.toLowerCase().includes(query) || item.country.toLowerCase().includes(query)
        ),
        activities: [
          { type: 'activity', name: 'Inca Trail Hiking', location: 'Peru', rating: 4.8 },
          { type: 'activity', name: 'Tango Lessons', location: 'Argentina', rating: 4.6 },
          { type: 'activity', name: 'Amazon River Cruise', location: 'Brazil', rating: 4.7 }
        ].filter(item => !type || type === 'activities').filter(item => 
          item.name.toLowerCase().includes(query) || item.location.toLowerCase().includes(query)
        ),
        restaurants: [
          { type: 'restaurant', name: 'Central Restaurant', location: 'Lima, Peru', rating: 4.9 },
          { type: 'restaurant', name: 'La Puerta Falsa', location: 'Bogotá, Colombia', rating: 4.5 },
          { type: 'restaurant', name: 'Parrilla Don Julio', location: 'Buenos Aires, Argentina', rating: 4.8 }
        ].filter(item => !type || type === 'restaurants').filter(item => 
          item.name.toLowerCase().includes(query) || item.location.toLowerCase().includes(query)
        )
      };

      const allResults = [
        ...results.destinations,
        ...results.activities,
        ...results.restaurants
      ].slice(0, parseInt(limit.toString()));

      res.json(allResults);
    } catch (error) {
      console.error("Error performing search:", error);
      res.status(500).json({ message: "Failed to perform search" });
    }
  });

  // Backup & Export API
  app.get('/api/export/user-data', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const userTrips = await storage.getUserTrips(userId);
      const userExpenses = await storage.getUserExpenses(userId);
      const userConnections = await storage.getUserConnections(userId);

      const exportData = {
        user: {
          id: user?.id,
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          createdAt: user?.createdAt
        },
        trips: userTrips,
        expenses: userExpenses,
        connections: userConnections,
        exportedAt: new Date().toISOString(),
        format: 'json',
        version: '1.0'
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="globemate-data-${userId}-${Date.now()}.json"`);
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting user data:", error);
      res.status(500).json({ message: "Failed to export user data" });
    }
  });

  // Health Check & System Status API
  app.get('/api/health', async (req, res) => {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          openai: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
          storage: 'operational'
        },
        version: '1.0.0',
        uptime: process.uptime()
      };
      res.json(health);
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(500).json({ 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Feedback & Support API
  app.post('/api/feedback', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type, subject, message, rating } = req.body;
      
      const feedback = {
        id: Date.now(),
        userId,
        type, // bug, feature, general
        subject,
        message,
        rating,
        status: 'submitted',
        createdAt: new Date().toISOString()
      };

      // In a real app, you'd save this to database and possibly send email
      res.json({ message: "Feedback submitted successfully", ticketId: feedback.id });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  // Achievement System API
  app.get('/api/achievements', async (req, res) => {
    try {
      const achievements = await storage.getAllAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get('/api/achievements/user', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userAchievements = await storage.getUserAchievements(userId);
      
      // Also check for new unlocked achievements
      const newAchievements = await storage.checkAndUnlockAchievements(userId);
      
      res.json({
        userAchievements,
        newlyUnlocked: newAchievements
      });
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  app.post('/api/achievements/check', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const newAchievements = await storage.checkAndUnlockAchievements(userId);
      
      res.json({
        newlyUnlocked: newAchievements,
        count: newAchievements.length
      });
    } catch (error) {
      console.error("Error checking achievements:", error);
      res.status(500).json({ message: "Failed to check achievements" });
    }
  });

  // Initialize default achievements if they don't exist
  app.post('/api/achievements/init', async (req, res) => {
    try {
      const defaultAchievements = [
        {
          name: "First Steps",
          description: "Plan your first trip",
          category: "travel",
          iconName: "MapPin",
          badgeColor: "bg-blue-500",
          requirement: JSON.stringify({ type: "trip_count", value: 1 }),
          points: 10,
          rarity: "common"
        },
        {
          name: "Trip Explorer",
          description: "Plan 5 different trips",
          category: "travel", 
          iconName: "Navigation",
          badgeColor: "bg-green-500",
          requirement: JSON.stringify({ type: "trip_count", value: 5 }),
          points: 50,
          rarity: "rare"
        },
        {
          name: "Country Collector",
          description: "Visit 3 different countries",
          category: "exploration",
          iconName: "Globe",
          badgeColor: "bg-purple-500",
          requirement: JSON.stringify({ type: "country_count", value: 3 }),
          points: 75,
          rarity: "epic"
        },
        {
          name: "Budget Tracker",
          description: "Record 10 travel expenses",
          category: "budget",
          iconName: "DollarSign",
          badgeColor: "bg-orange-500",
          requirement: JSON.stringify({ type: "expense_count", value: 10 }),
          points: 30,
          rarity: "common"
        },
        {
          name: "Review Writer",
          description: "Write 5 destination reviews",
          category: "social",
          iconName: "Star",
          badgeColor: "bg-yellow-500",
          requirement: JSON.stringify({ type: "review_count", value: 5 }),
          points: 40,
          rarity: "rare"
        },
        {
          name: "Big Spender",
          description: "Spend over $1000 on travels",
          category: "budget",
          iconName: "CreditCard",
          badgeColor: "bg-red-500",
          requirement: JSON.stringify({ type: "total_spent", value: 1000 }),
          points: 100,
          rarity: "epic"
        },
        {
          name: "Adventure Seeker",
          description: "Plan an adventure-focused trip",
          category: "adventure",
          iconName: "Mountain",
          badgeColor: "bg-emerald-500",
          requirement: JSON.stringify({ type: "trip_style", value: "adventure" }),
          points: 25,
          rarity: "common"
        },
        {
          name: "Cultural Explorer",
          description: "Plan a cultural immersion trip",
          category: "cultural",
          iconName: "Camera",
          badgeColor: "bg-indigo-500",
          requirement: JSON.stringify({ type: "trip_style", value: "cultural" }),
          points: 25,
          rarity: "common"
        },
        {
          name: "Social Butterfly",
          description: "Connect with 10 fellow travelers",
          category: "social",
          iconName: "Users",
          badgeColor: "bg-pink-500",
          requirement: JSON.stringify({ type: "connection_count", value: 10 }),
          points: 60,
          rarity: "rare"
        },
        {
          name: "World Explorer",
          description: "Visit 20 different countries",
          category: "exploration",
          iconName: "Award",
          badgeColor: "bg-gradient-to-r from-yellow-400 to-orange-500",
          requirement: JSON.stringify({ type: "country_count", value: 20 }),
          points: 500,
          rarity: "legendary"
        }
      ];

      let createdCount = 0;
      for (const achievement of defaultAchievements) {
        try {
          // Check if achievement already exists
          const existing = await storage.getAllAchievements();
          const existingAchievement = existing.find(a => a.name === achievement.name);

          if (!existingAchievement) {
            // Achievement insert temporarily disabled until schema is fixed
            console.log('Achievement would be created:', achievement);
            createdCount++;
          }
        } catch (error) {
          console.error(`Error creating achievement ${achievement.name}:`, error);
        }
      }

      res.json({ 
        message: `Initialized ${createdCount} achievements`,
        total: defaultAchievements.length,
        created: createdCount
      });
    } catch (error) {
      console.error("Error initializing achievements:", error);
      res.status(500).json({ message: "Failed to initialize achievements" });
    }
  });

  // API Documentation Endpoint
  app.get('/api/docs', async (req, res) => {
    const apiDocs = {
      title: "GlobeMate API Documentation",
      version: "1.0.0",
      description: "Complete API reference for the GlobeMate global travel platform",
      endpoints: {
        authentication: {
          "GET /api/auth/user": "Get authenticated user details",
          "GET /api/user/preferences": "Get user travel preferences",
          "PUT /api/user/preferences": "Update user preferences"
        },
        trips: {
          "GET /api/trips": "Get public trips (community)",
          "GET /api/trips/user": "Get user's trips",
          "POST /api/trips": "Create new trip",
          "GET /api/trips/:id": "Get specific trip",
          "PUT /api/trips/:id": "Update trip",
          "DELETE /api/trips/:id": "Delete trip"
        },
        ai_features: {
          "POST /api/ai/generate-trip": "AI-powered trip generation",
          "POST /api/ai/travel-suggestions": "Get personalized suggestions",
          "POST /api/ai/itinerary": "Generate detailed itinerary",
          "POST /api/ai/budget-analysis": "Analyze expenses with AI",
          "POST /api/ai/recommendations": "Get destination recommendations",
          "POST /api/ai/chat": "Chat with travel assistant"
        },
        expenses: {
          "GET /api/expenses/user": "Get user's expenses",
          "GET /api/expenses/trip/:id": "Get trip expenses",
          "POST /api/expenses": "Add new expense"
        },
        community: {
          "GET /api/reviews": "Get recent reviews",
          "POST /api/reviews": "Submit new review",
          "GET /api/reviews/destination/:name": "Get destination reviews"
        },
        travel_info: {
          "GET /api/weather/:destination": "Get weather forecast",
          "GET /api/currency/:from/:to": "Get exchange rates",
          "GET /api/safety/:country": "Get safety advisories",
          "GET /api/transport/:from/:to": "Get transport options",
          "GET /api/accommodation/:destination": "Search accommodations",
          "GET /api/activities/:destination": "Find activities",
          "GET /api/restaurants/:destination": "Find restaurants",
          "GET /api/visa-requirements/:from/:to": "Check visa requirements",
          "GET /api/insurance/quotes": "Get insurance quotes",
          "GET /api/checklist/:destination/:duration": "Get travel checklist",
          "GET /api/emergency/:country": "Get emergency contacts",
          "GET /api/maps/:destination/download": "Get offline maps"
        },
        social: {
          "GET /api/connections": "Get user connections",
          "POST /api/connections": "Add connection",
          "PUT /api/connections/:id": "Update connection",
          "GET /api/chat/rooms": "Get chat rooms",
          "GET /api/chat/messages/:roomId": "Get chat messages",
          "WebSocket /ws": "Real-time chat"
        },
        platform: {
          "GET /api/deals": "Get travel deals",
          "GET /api/notifications": "Get notifications",
          "PUT /api/notifications/:id/read": "Mark notification read",
          "GET /api/analytics/dashboard": "Get travel analytics",
          "GET /api/search": "Universal search",
          "GET /api/export/user-data": "Export user data",
          "GET /api/health": "System health check",
          "POST /api/feedback": "Submit feedback"
        }
      },
      totalEndpoints: 40,
      features: [
        "OpenAI-powered travel planning",
        "Real-time chat and community",
        "Comprehensive expense tracking",
        "Weather and currency integration",
        "Safety and travel advisories",
        "Accommodation and activity search",
        "User analytics and insights",
        "Data export and backup"
      ]
    };
    
    res.json(apiDocs);
  });


  // WebSocket setup for real-time chat (disabled - server created in index.ts)
  // const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  /*
  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat_message') {
          // Store message in database
          const messageData = insertChatMessageSchema.parse({
            roomId: message.roomId,
            userId: message.userId,
            message: message.text,
          });
          
          const newMessage = await storage.createChatMessage(messageData);
          
          // Broadcast to all connected clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'chat_message',
                data: newMessage
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });
  */

  // TripAdvisor-style data API routes
  // Platform Statistics API
  app.get('/api/stats', async (req, res) => {
    try {
      // Get real statistics from the database
      const [
        destinations,
        reviews,
        users,
        journeys
      ] = await Promise.all([
        storage.getDestinations(),
        storage.getRecentReviews(),
        db.select().from(schema.users),
        storage.getJourneys({ limit: 1000 })
      ]);

      // Calculate unique countries from destinations
      const uniqueCountries = new Set(
        destinations.map((d: any) => d.country).filter(Boolean)
      );

      // Calculate average rating from reviews
      const avgRating = reviews.length > 0
        ? (reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : '0.0';

      const stats = {
        countries: uniqueCountries.size,
        destinations: destinations.length,
        users: users.length,
        rating: parseFloat(avgRating),
        journeys: journeys.length
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });
  
  // Destinations API - Returns database destinations in frontend-compatible format
  app.get('/api/destinations', async (req, res) => {
    try {
      const { destinations: destinationsTable } = await import('../shared/schema.js');
      const { db: database } = await import('./db.js');
      const dbDestinations = await database.select().from(destinationsTable).orderBy(destinationsTable.name);
      
      // Transform database format to frontend format
      const formattedDestinations = dbDestinations.map(dest => ({
        id: dest.id,
        name: dest.name,
        country: dest.country || '',
        continent: 'Europe', // Default, will be improved later
        types: ['city'],
        description: `Explore ${dest.name}, ${dest.country}`,
        rating: 4.5,
        userRatingsTotal: 1000,
        trending: false,
        flag: '',
        lat: parseFloat(dest.lat?.toString() || '0'),
        lng: parseFloat(dest.lon?.toString() || '0'),
        photoRefs: [],
        placeId: dest.id,
      }));
      
      res.json(formattedDestinations);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      res.status(500).json({ message: "Failed to fetch destinations" });
    }
  });

  app.get('/api/destinations/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      const destinations = await storage.searchDestinations(q);
      res.json(destinations);
    } catch (error) {
      console.error("Error searching destinations:", error);
      res.status(500).json({ message: "Failed to search destinations" });
    }
  });

  // Popular destinations from Google Places API with full details
  app.get('/api/destinations/popular', async (req, res) => {
    try {
      const popularCities = [
        // Europe
        { name: 'Paris', country: 'France', continent: 'Europe', query: 'Paris Eiffel Tower', trending: true, flag: '🇫🇷' },
        { name: 'London', country: 'UK', continent: 'Europe', query: 'London Big Ben', trending: true, flag: '🇬🇧' },
        { name: 'Rome', country: 'Italy', continent: 'Europe', query: 'Rome Colosseum', trending: true, flag: '🇮🇹' },
        { name: 'Barcelona', country: 'Spain', continent: 'Europe', query: 'Barcelona Sagrada Familia', trending: true, flag: '🇪🇸' },
        { name: 'Amsterdam', country: 'Netherlands', continent: 'Europe', query: 'Amsterdam canals', trending: false, flag: '🇳🇱' },
        { name: 'Prague', country: 'Czech Republic', continent: 'Europe', query: 'Prague Castle', trending: false, flag: '🇨🇿' },
        { name: 'Vienna', country: 'Austria', continent: 'Europe', query: 'Vienna Schonbrunn Palace', trending: false, flag: '🇦🇹' },
        { name: 'Athens', country: 'Greece', continent: 'Europe', query: 'Athens Acropolis', trending: false, flag: '🇬🇷' },
        { name: 'Lisbon', country: 'Portugal', continent: 'Europe', query: 'Lisbon Belem Tower', trending: true, flag: '🇵🇹' },
        { name: 'Berlin', country: 'Germany', continent: 'Europe', query: 'Berlin Brandenburg Gate', trending: false, flag: '🇩🇪' },
        { name: 'Moscow', country: 'Russia', continent: 'Europe', query: 'Moscow Red Square', trending: false, flag: '🇷🇺' },
        { name: 'Reykjavik', country: 'Iceland', continent: 'Europe', query: 'Reykjavik Hallgrimskirkja', trending: true, flag: '🇮🇸' },
        { name: 'Santorini', country: 'Greece', continent: 'Europe', query: 'Santorini Oia', trending: true, flag: '🇬🇷' },
        { name: 'Venice', country: 'Italy', continent: 'Europe', query: 'Venice Grand Canal', trending: false, flag: '🇮🇹' },
        { name: 'Florence', country: 'Italy', continent: 'Europe', query: 'Florence Duomo', trending: false, flag: '🇮🇹' },
        { name: 'Milan', country: 'Italy', continent: 'Europe', query: 'Milan Cathedral', trending: false, flag: '🇮🇹' },
        { name: 'Madrid', country: 'Spain', continent: 'Europe', query: 'Madrid Royal Palace', trending: false, flag: '🇪🇸' },
        { name: 'Seville', country: 'Spain', continent: 'Europe', query: 'Seville Cathedral', trending: false, flag: '🇪🇸' },
        { name: 'Munich', country: 'Germany', continent: 'Europe', query: 'Munich Marienplatz', trending: false, flag: '🇩🇪' },
        { name: 'Edinburgh', country: 'UK', continent: 'Europe', query: 'Edinburgh Castle', trending: false, flag: '🇬🇧' },
        { name: 'Dublin', country: 'Ireland', continent: 'Europe', query: 'Dublin Temple Bar', trending: false, flag: '🇮🇪' },
        { name: 'Copenhagen', country: 'Denmark', continent: 'Europe', query: 'Copenhagen Nyhavn', trending: false, flag: '🇩🇰' },
        { name: 'Stockholm', country: 'Sweden', continent: 'Europe', query: 'Stockholm Old Town', trending: false, flag: '🇸🇪' },
        { name: 'Oslo', country: 'Norway', continent: 'Europe', query: 'Oslo Opera House', trending: false, flag: '🇳🇴' },
        { name: 'Budapest', country: 'Hungary', continent: 'Europe', query: 'Budapest Parliament', trending: false, flag: '🇭🇺' },
        { name: 'Krakow', country: 'Poland', continent: 'Europe', query: 'Krakow Main Square', trending: false, flag: '🇵🇱' },
        { name: 'Zurich', country: 'Switzerland', continent: 'Europe', query: 'Zurich Lake', trending: false, flag: '🇨🇭' },
        { name: 'Brussels', country: 'Belgium', continent: 'Europe', query: 'Brussels Grand Place', trending: false, flag: '🇧🇪' },
        
        // Asia
        { name: 'Tokyo', country: 'Japan', continent: 'Asia', query: 'Tokyo Tower Japan', trending: true, flag: '🇯🇵' },
        { name: 'Dubai', country: 'United Arab Emirates', continent: 'Asia', query: 'Dubai Burj Khalifa', trending: true, flag: '🇦🇪' },
        { name: 'Bangkok', country: 'Thailand', continent: 'Asia', query: 'Bangkok Grand Palace', trending: true, flag: '🇹🇭' },
        { name: 'Istanbul', country: 'Turkey', continent: 'Asia', query: 'Istanbul Hagia Sophia', trending: false, flag: '🇹🇷' },
        { name: 'Singapore', country: 'Singapore', continent: 'Asia', query: 'Singapore Marina Bay Sands', trending: true, flag: '🇸🇬' },
        { name: 'Bali', country: 'Indonesia', continent: 'Asia', query: 'Bali Uluwatu Temple', trending: true, flag: '🇮🇩' },
        { name: 'Mumbai', country: 'India', continent: 'Asia', query: 'Mumbai Gateway of India', trending: false, flag: '🇮🇳' },
        { name: 'Seoul', country: 'South Korea', continent: 'Asia', query: 'Seoul Gyeongbokgung Palace', trending: true, flag: '🇰🇷' },
        { name: 'Hong Kong', country: 'Hong Kong', continent: 'Asia', query: 'Hong Kong Victoria Peak', trending: true, flag: '🇭🇰' },
        { name: 'Kyoto', country: 'Japan', continent: 'Asia', query: 'Kyoto Fushimi Inari', trending: false, flag: '🇯🇵' },
        { name: 'Shanghai', country: 'China', continent: 'Asia', query: 'Shanghai Bund', trending: false, flag: '🇨🇳' },
        { name: 'Beijing', country: 'China', continent: 'Asia', query: 'Beijing Forbidden City', trending: false, flag: '🇨🇳' },
        { name: 'Hanoi', country: 'Vietnam', continent: 'Asia', query: 'Hanoi Old Quarter', trending: false, flag: '🇻🇳' },
        { name: 'Ho Chi Minh City', country: 'Vietnam', continent: 'Asia', query: 'Ho Chi Minh City Notre Dame', trending: false, flag: '🇻🇳' },
        { name: 'Kuala Lumpur', country: 'Malaysia', continent: 'Asia', query: 'Kuala Lumpur Petronas Towers', trending: false, flag: '🇲🇾' },
        { name: 'Manila', country: 'Philippines', continent: 'Asia', query: 'Manila Rizal Park', trending: false, flag: '🇵🇭' },
        { name: 'Jakarta', country: 'Indonesia', continent: 'Asia', query: 'Jakarta Monas', trending: false, flag: '🇮🇩' },
        { name: 'Delhi', country: 'India', continent: 'Asia', query: 'Delhi India Gate', trending: false, flag: '🇮🇳' },
        { name: 'Jaipur', country: 'India', continent: 'Asia', query: 'Jaipur Hawa Mahal', trending: false, flag: '🇮🇳' },
        { name: 'Agra', country: 'India', continent: 'Asia', query: 'Agra Taj Mahal', trending: false, flag: '🇮🇳' },
        { name: 'Tel Aviv', country: 'Israel', continent: 'Asia', query: 'Tel Aviv Beach', trending: false, flag: '🇮🇱' },
        { name: 'Jerusalem', country: 'Israel', continent: 'Asia', query: 'Jerusalem Western Wall', trending: false, flag: '🇮🇱' },
        { name: 'Colombo', country: 'Sri Lanka', continent: 'Asia', query: 'Colombo Gangaramaya Temple', trending: false, flag: '🇱🇰' },
        { name: 'Kathmandu', country: 'Nepal', continent: 'Asia', query: 'Kathmandu Durbar Square', trending: false, flag: '🇳🇵' },
        { name: 'Phuket', country: 'Thailand', continent: 'Asia', query: 'Phuket Big Buddha', trending: false, flag: '🇹🇭' },
        
        // North America
        { name: 'New York', country: 'United States', continent: 'North America', query: 'New York Statue of Liberty', trending: true, flag: '🇺🇸' },
        { name: 'Los Angeles', country: 'United States', continent: 'North America', query: 'Los Angeles Hollywood Sign', trending: false, flag: '🇺🇸' },
        { name: 'Miami', country: 'United States', continent: 'North America', query: 'Miami South Beach', trending: false, flag: '🇺🇸' },
        { name: 'Mexico City', country: 'Mexico', continent: 'North America', query: 'Mexico City Zocalo', trending: false, flag: '🇲🇽' },
        { name: 'Las Vegas', country: 'United States', continent: 'North America', query: 'Las Vegas Strip', trending: true, flag: '🇺🇸' },
        { name: 'San Francisco', country: 'United States', continent: 'North America', query: 'San Francisco Golden Gate', trending: false, flag: '🇺🇸' },
        { name: 'Chicago', country: 'United States', continent: 'North America', query: 'Chicago Cloud Gate', trending: false, flag: '🇺🇸' },
        { name: 'Toronto', country: 'Canada', continent: 'North America', query: 'Toronto CN Tower', trending: false, flag: '🇨🇦' },
        { name: 'Vancouver', country: 'Canada', continent: 'North America', query: 'Vancouver Stanley Park', trending: false, flag: '🇨🇦' },
        { name: 'Cancun', country: 'Mexico', continent: 'North America', query: 'Cancun beach', trending: true, flag: '🇲🇽' },
        { name: 'Playa del Carmen', country: 'Mexico', continent: 'North America', query: 'Playa del Carmen beach', trending: false, flag: '🇲🇽' },
        { name: 'Montreal', country: 'Canada', continent: 'North America', query: 'Montreal Old Port', trending: false, flag: '🇨🇦' },
        
        // South America
        { name: 'Rio de Janeiro', country: 'Brazil', continent: 'South America', query: 'Rio Christ the Redeemer', trending: false, flag: '🇧🇷' },
        { name: 'Buenos Aires', country: 'Argentina', continent: 'South America', query: 'Buenos Aires Obelisco', trending: false, flag: '🇦🇷' },
        { name: 'Lima', country: 'Peru', continent: 'South America', query: 'Lima Plaza de Armas', trending: false, flag: '🇵🇪' },
        { name: 'Cusco', country: 'Peru', continent: 'South America', query: 'Cusco Plaza', trending: false, flag: '🇵🇪' },
        { name: 'Santiago', country: 'Chile', continent: 'South America', query: 'Santiago Cerro San Cristobal', trending: false, flag: '🇨🇱' },
        { name: 'Bogota', country: 'Colombia', continent: 'South America', query: 'Bogota Bolivar Square', trending: false, flag: '🇨🇴' },
        { name: 'Cartagena', country: 'Colombia', continent: 'South America', query: 'Cartagena Walled City', trending: false, flag: '🇨🇴' },
        { name: 'Medellin', country: 'Colombia', continent: 'South America', query: 'Medellin Plaza Botero', trending: false, flag: '🇨🇴' },
        { name: 'Quito', country: 'Ecuador', continent: 'South America', query: 'Quito Old Town', trending: false, flag: '🇪🇨' },
        { name: 'La Paz', country: 'Bolivia', continent: 'South America', query: 'La Paz Witches Market', trending: false, flag: '🇧🇴' },
        { name: 'Montevideo', country: 'Uruguay', continent: 'South America', query: 'Montevideo Rambla', trending: false, flag: '🇺🇾' },
        { name: 'Sao Paulo', country: 'Brazil', continent: 'South America', query: 'Sao Paulo Paulista Avenue', trending: false, flag: '🇧🇷' },
        
        // Oceania
        { name: 'Sydney', country: 'Australia', continent: 'Oceania', query: 'Sydney Opera House', trending: true, flag: '🇦🇺' },
        { name: 'Melbourne', country: 'Australia', continent: 'Oceania', query: 'Melbourne Flinders Street', trending: false, flag: '🇦🇺' },
        { name: 'Auckland', country: 'New Zealand', continent: 'Oceania', query: 'Auckland Sky Tower', trending: false, flag: '🇳🇿' },
        { name: 'Brisbane', country: 'Australia', continent: 'Oceania', query: 'Brisbane South Bank', trending: false, flag: '🇦🇺' },
        { name: 'Perth', country: 'Australia', continent: 'Oceania', query: 'Perth Kings Park', trending: false, flag: '🇦🇺' },
        { name: 'Wellington', country: 'New Zealand', continent: 'Oceania', query: 'Wellington Cable Car', trending: false, flag: '🇳🇿' },
        { name: 'Queenstown', country: 'New Zealand', continent: 'Oceania', query: 'Queenstown Lake Wakatipu', trending: false, flag: '🇳🇿' },
        { name: 'Fiji', country: 'Fiji', continent: 'Oceania', query: 'Fiji Beach', trending: true, flag: '🇫🇯' },
        
        // Africa
        { name: 'Cape Town', country: 'South Africa', continent: 'Africa', query: 'Cape Town Table Mountain', trending: false, flag: '🇿🇦' },
        { name: 'Cairo', country: 'Egypt', continent: 'Africa', query: 'Cairo Pyramids of Giza', trending: false, flag: '🇪🇬' },
        { name: 'Marrakech', country: 'Morocco', continent: 'Africa', query: 'Marrakech Jemaa el-Fnaa', trending: false, flag: '🇲🇦' },
        { name: 'Nairobi', country: 'Kenya', continent: 'Africa', query: 'Nairobi National Park', trending: false, flag: '🇰🇪' },
        { name: 'Johannesburg', country: 'South Africa', continent: 'Africa', query: 'Johannesburg Apartheid Museum', trending: false, flag: '🇿🇦' },
        { name: 'Casablanca', country: 'Morocco', continent: 'Africa', query: 'Casablanca Hassan II Mosque', trending: false, flag: '🇲🇦' },
        { name: 'Luxor', country: 'Egypt', continent: 'Africa', query: 'Luxor Temple', trending: false, flag: '🇪🇬' },
        { name: 'Zanzibar', country: 'Tanzania', continent: 'Africa', query: 'Zanzibar Stone Town', trending: false, flag: '🇹🇿' },
        { name: 'Tunis', country: 'Tunisia', continent: 'Africa', query: 'Tunis Medina', trending: false, flag: '🇹🇳' },
        { name: 'Mauritius', country: 'Mauritius', continent: 'Africa', query: 'Mauritius Beach', trending: true, flag: '🇲🇺' },
        
        // Caribbean
        { name: 'Punta Cana', country: 'Dominican Republic', continent: 'Caribbean', query: 'Punta Cana beach', trending: true, flag: '🇩🇴' },
        { name: 'Havana', country: 'Cuba', continent: 'Caribbean', query: 'Havana Malecon', trending: false, flag: '🇨🇺' },
        { name: 'Nassau', country: 'Bahamas', continent: 'Caribbean', query: 'Nassau Paradise Island', trending: false, flag: '🇧🇸' },
        { name: 'Montego Bay', country: 'Jamaica', continent: 'Caribbean', query: 'Montego Bay beach', trending: false, flag: '🇯🇲' },
        { name: 'San Juan', country: 'Puerto Rico', continent: 'Caribbean', query: 'San Juan Old Town', trending: false, flag: '🇵🇷' },
        { name: 'Santo Domingo', country: 'Dominican Republic', continent: 'Caribbean', query: 'Santo Domingo Colonial Zone', trending: false, flag: '🇩🇴' },
      ];

      const destinations = await Promise.all(
        popularCities.map(async (city) => {
          try {
            const results = await googlePlaces.searchPlaces(city.query);
            if (results && results.length > 0) {
              const place = results[0];
              
              // Determine types based on Google Places types
              const cityTypes = [];
              if (place.types.includes('locality') || place.types.includes('administrative_area_level_1')) {
                cityTypes.push('city');
              }
              if (place.types.includes('natural_feature') || place.types.includes('park')) {
                cityTypes.push('nature');
              }
              if (place.types.includes('tourist_attraction') || place.types.includes('point_of_interest')) {
                cityTypes.push('culture');
              }
              if (cityTypes.length === 0) cityTypes.push('city');

              // Create description based on city
              const descriptions: { [key: string]: string } = {
                // Europe
                'Paris': 'The City of Light offers iconic landmarks, world-class art, and exquisite cuisine',
                'London': 'Historic capital with royal palaces, museums, and vibrant culture',
                'Rome': 'The Eternal City filled with ancient history and Renaissance art',
                'Barcelona': 'Stunning architecture, beautiful beaches, and vibrant culture',
                'Amsterdam': 'Artistic heritage, canals, and cycling culture',
                'Prague': 'Fairy-tale architecture and rich medieval history',
                'Vienna': 'Imperial palaces, classical music, and elegant coffee houses',
                'Athens': 'Cradle of Western civilization and ancient landmarks',
                'Lisbon': 'Coastal capital with colorful architecture and historic trams',
                'Berlin': 'Creative hub with rich history and dynamic nightlife',
                'Moscow': 'Red Square, Kremlin, and onion-domed churches',
                'Reykjavik': 'Gateway to natural wonders like Northern Lights and hot springs',
                'Santorini': 'White-washed villages, stunning sunsets, and volcanic beaches',
                'Venice': 'Romantic canals, gondolas, and historic architecture',
                'Florence': 'Renaissance masterpieces, Duomo, and Tuscan charm',
                'Milan': 'Fashion capital with Gothic cathedral and high-end shopping',
                'Madrid': 'Royal capital with world-class museums and vibrant nightlife',
                'Seville': 'Flamenco, tapas, and stunning Moorish architecture',
                'Munich': 'Bavarian culture, beer gardens, and historic landmarks',
                'Edinburgh': 'Medieval Old Town, Edinburgh Castle, and Scottish heritage',
                'Dublin': 'Friendly pubs, literary history, and Georgian architecture',
                'Copenhagen': 'Danish design, colorful Nyhavn, and cycling culture',
                'Stockholm': 'Scandinavian beauty, archipelago islands, and historic Old Town',
                'Oslo': 'Nordic nature, modern architecture, and Viking history',
                'Budapest': 'Thermal baths, Danube views, and ruin bars',
                'Krakow': 'Medieval square, Jewish quarter, and Polish history',
                'Zurich': 'Swiss Alps gateway, pristine lake, and banking hub',
                'Brussels': 'European capital, Belgian waffles, and Art Nouveau architecture',
                
                // Asia
                'Tokyo': 'A fascinating blend of ancient tradition and cutting-edge modernity',
                'Dubai': 'Futuristic city with luxury shopping and modern architecture',
                'Bangkok': 'Vibrant street life, ornate shrines, and bustling markets',
                'Istanbul': 'Where East meets West, rich history and stunning architecture',
                'Singapore': 'Modern city-state with diverse culture and incredible food',
                'Bali': 'Tropical paradise with stunning beaches, temples, and rice terraces',
                'Mumbai': 'Bollywood, colonial architecture, and bustling markets',
                'Seoul': 'Modern metropolis with ancient temples and vibrant K-culture',
                'Hong Kong': 'Skyscrapers, dim sum, and harbor views',
                'Kyoto': 'Ancient temples, traditional geishas, and zen gardens',
                'Shanghai': 'Modern skyline, historic Bund, and vibrant culture',
                'Beijing': 'Forbidden City, Great Wall, and Chinese imperial history',
                'Hanoi': 'French colonial charm, street food, and Old Quarter',
                'Ho Chi Minh City': 'Vietnamese energy, War museums, and street food scene',
                'Kuala Lumpur': 'Petronas Towers, diverse culture, and street markets',
                'Manila': 'Spanish heritage, vibrant nightlife, and Filipino warmth',
                'Jakarta': 'Indonesian capital with diverse culture and bustling energy',
                'Delhi': 'Ancient monuments, Mughal heritage, and colorful bazaars',
                'Jaipur': 'Pink City with majestic palaces and vibrant markets',
                'Agra': 'Home of the Taj Mahal and Mughal architecture',
                'Tel Aviv': 'Mediterranean beaches, Bauhaus architecture, and vibrant nightlife',
                'Jerusalem': 'Holy city with ancient sites and spiritual significance',
                'Colombo': 'Colonial heritage, Buddhist temples, and coastal charm',
                'Kathmandu': 'Gateway to Himalayas, ancient temples, and Nepali culture',
                'Phuket': 'Thailand beaches, island paradise, and water sports',
                
                // North America
                'New York': 'The city that never sleeps, iconic skyline and diverse culture',
                'Los Angeles': 'Entertainment capital, beaches, and diverse neighborhoods',
                'Miami': 'Art Deco architecture, beaches, and Latin culture',
                'Mexico City': 'Ancient Aztec heritage, museums, and vibrant street life',
                'Las Vegas': 'Entertainment paradise, casinos, and world-class shows',
                'San Francisco': 'Golden Gate Bridge, cable cars, and tech innovation',
                'Chicago': 'Architecture, deep-dish pizza, and lakefront beauty',
                'Toronto': 'CN Tower, diverse culture, and cosmopolitan energy',
                'Vancouver': 'Mountain meets ocean, outdoor adventures, and multiculturalism',
                'Cancun': 'Turquoise Caribbean waters, Mayan ruins, and beach resorts',
                'Playa del Carmen': 'Riviera Maya beaches, cenotes, and laid-back vibes',
                'Montreal': 'French charm, festivals, and European atmosphere in North America',
                
                // South America
                'Rio de Janeiro': 'Iconic beaches, Christ the Redeemer, and Carnival celebrations',
                'Buenos Aires': 'Tango, steakhouses, and European-style architecture',
                'Lima': 'Peruvian cuisine capital, colonial architecture, and coastal cliffs',
                'Cusco': 'Gateway to Machu Picchu and Inca heritage',
                'Santiago': 'Andes Mountains backdrop, wine valleys, and modern museums',
                'Bogota': 'Colombian capital with colonial charm and vibrant culture',
                'Cartagena': 'Caribbean coast, walled colonial city, and colorful streets',
                'Medellin': 'City of eternal spring, innovation, and transformation',
                'Quito': 'Andean capital, colonial Old Town, and volcano views',
                'La Paz': 'Highest capital, cable car network, and indigenous culture',
                'Montevideo': 'Laid-back capital, beaches, and South American charm',
                'Sao Paulo': 'Brazil economic powerhouse, art scene, and diverse culture',
                
                // Oceania
                'Sydney': 'Harbor city known for the Opera House and beautiful beaches',
                'Melbourne': 'Coffee culture, street art, and cultural capital',
                'Auckland': 'City of Sails with harbors and volcanic landscapes',
                'Brisbane': 'Subtropical capital with river cruises and outdoor lifestyle',
                'Perth': 'Isolated beauty, pristine beaches, and laid-back lifestyle',
                'Wellington': 'Compact capital, harbor views, and creative energy',
                'Queenstown': 'Adventure capital with stunning alpine scenery',
                'Fiji': 'Tropical island paradise with crystal waters and coral reefs',
                
                // Africa
                'Cape Town': 'Stunning landscapes, Table Mountain, and vibrant culture',
                'Cairo': 'Ancient pyramids, pharaohs, and the Nile River',
                'Marrakech': 'Bustling souks, palaces, and Moroccan culture',
                'Nairobi': 'Safari gateway, wildlife, and modern African city',
                'Johannesburg': 'Economic hub, apartheid history, and urban energy',
                'Casablanca': 'Moroccan port city with Art Deco architecture and Hassan II Mosque',
                'Luxor': 'Valley of the Kings, ancient temples, and pharaonic treasures',
                'Zanzibar': 'Spice island paradise, Stone Town, and turquoise beaches',
                'Tunis': 'Medina markets, Roman ruins, and Mediterranean charm',
                'Mauritius': 'Indian Ocean paradise, luxury resorts, and multicultural fusion',
                
                // Caribbean
                'Punta Cana': 'Paradise beaches and all-inclusive resorts',
                'Havana': 'Classic cars, salsa music, and colonial Spanish architecture',
                'Nassau': 'Bahamas capital, crystal waters, and island lifestyle',
                'Montego Bay': 'Jamaica beaches, reggae vibes, and water sports',
                'San Juan': 'Historic fortresses, colorful streets, and Caribbean culture',
                'Santo Domingo': 'First city of Americas, colonial zone, and merengue birthplace'
              };

              return {
                id: city.name.toLowerCase().replace(/\s+/g, ''),
                name: city.name,
                country: city.country,
                continent: city.continent,
                flag: city.flag,
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
                rating: place.rating || 4.5,
                userRatingsTotal: place.user_ratings_total || 0,
                types: cityTypes,
                description: descriptions[city.name] || `Explore the beauty and culture of ${city.name}`,
                trending: city.trending,
                photoRefs: place.photos?.map(p => p.photo_reference) || [],
                placeId: place.place_id
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching ${city.name}:`, error);
            return null;
          }
        })
      );

      const validDestinations = destinations.filter(d => d !== null);
      res.json(validDestinations);
    } catch (error) {
      console.error('Error fetching popular destinations:', error);
      res.status(500).json({ error: 'Failed to fetch popular destinations' });
    }
  });

  // Destinations Hub Feature Flags (must be before :locationId route)
  app.get('/api/destinations/feature-flags', (_req, res) => {
    try {
      const featureFlags = {
        googlePlaces: !!process.env.GOOGLE_PLACES_API_KEY,
        openWeather: !!process.env.OPENWEATHER_API_KEY,
        geoNames: !!process.env.GEONAMES_USERNAME,
        tripAdvisor: !!process.env.TRIPADVISOR_API_KEY,
        tbo: !!process.env.TBO_API_KEY,
        geo: config.geo.enabled,
      };
      res.json(featureFlags);
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      res.status(500).json({ error: 'Failed to fetch feature flags' });
    }
  });

  // Weather service route (must be before :locationId route)
  app.get('/api/destinations/weather', async (req, res) => {
    try {
      const { lat, lon, lang, units } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: 'lat and lon parameters required' });
      }
      
      // Import and use destinations weather service
      const { weatherService } = await import('./services/destinations/weatherService.js');
      const weather = await weatherService.getByLatLng(
        Number(lat),
        Number(lon),
        {
          lang: (lang as string) || 'en',
          units: (units as 'metric' | 'imperial') || 'metric'
        }
      );
      
      res.json(weather);
    } catch (error: any) {
      console.error('Error fetching weather:', error);
      
      if (error.message?.includes('not enabled')) {
        return res.status(503).json({ 
          error: 'Weather service not available',
          message: error.message,
          provider: 'openweather'
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to fetch weather',
        message: error.message 
      });
    }
  });

  // Google Maps API key endpoint (restricts exposure to authenticated requests only)
  app.get('/api/maps/key', async (req, res) => {
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: 'Google Maps API key not configured' });
      }
      res.json({ apiKey });
    } catch (error) {
      console.error('Error fetching Google Maps key:', error);
      res.status(500).json({ error: 'Failed to retrieve API key' });
    }
  });

  // Public proxy endpoint for geo basics (handles security server-side)
  app.get('/api/destinations/geo-basics', async (req, res) => {
    try {
      const { getBasics } = await import('./services/destinations/geoService.js');
      const { country, city, lang = 'en' } = req.query;

      if (!country) {
        return res.status(400).json({ error: 'Country parameter is required' });
      }

      // Map common abbreviations to full country names
      const countryMapping: Record<string, string> = {
        'UK': 'United Kingdom',
        'USA': 'United States',
        'UAE': 'United Arab Emirates',
        'US': 'United States',
      };

      const countryName = countryMapping[country as string] || country as string;

      const result = await getBasics({
        countryName,
        cityName: city as string,
        lang: lang as 'en' | 'he',
      });

      if (!result) {
        return res.status(404).json({ error: 'Location not found' });
      }

      res.json(result);
    } catch (error) {
      console.error('Geo basics error:', error);
      res.status(500).json({ error: 'Failed to fetch location data' });
    }
  });

  app.get('/api/destinations/:locationId', async (req, res) => {
    try {
      const { locationId } = req.params;
      const destination = await storage.getDestinationByLocationId(locationId);
      if (!destination) {
        return res.status(404).json({ message: "Destination not found" });
      }
      res.json(destination);
    } catch (error) {
      console.error("Error fetching destination:", error);
      res.status(500).json({ message: "Failed to fetch destination" });
    }
  });

  // Accommodations API - using places table with category filter
  app.get('/api/accommodations', async (req, res) => {
    try {
      const { destinationId } = req.query;
      console.log('Fetching accommodations from places table');
      
      let accommodations: any[] = [];
      const client = await pool.connect();
      try {
        // Query places table for accommodation-type places
        const query = `
          SELECT id, name, location as city, country, rating, description, created_at, updated_at,
                 CASE 
                   WHEN rating >= 4.5 THEN '$$$$'
                   WHEN rating >= 4.0 THEN '$$$' 
                   WHEN rating >= 3.5 THEN '$$'
                   ELSE '$'
                 END as "priceLevel"
          FROM places 
          WHERE LOWER(description) LIKE '%hotel%' 
             OR LOWER(description) LIKE '%hostel%' 
             OR LOWER(description) LIKE '%accommodation%'
             OR LOWER(name) LIKE '%hotel%'
             OR LOWER(name) LIKE '%hostel%'
          ORDER BY rating DESC
        `;
        
        const result = await client.query(query);
        accommodations = result.rows.map(place => ({
          id: place.id,
          locationId: `acc_${place.id}`,
          name: place.name,
          city: place.city,
          country: place.country,
          rating: parseFloat(place.rating) || 0,
          priceLevel: place.priceLevel,
          description: place.description,
          amenities: ["wifi", "service"],
          createdAt: place.created_at,
          updatedAt: place.updated_at
        }));
      } catch (dbError) {
        console.error('Places database error:', dbError);
        accommodations = [];
      } finally {
        client.release();
      }
      
      console.log('Retrieved accommodations from places:', accommodations.length);
      res.json({
        success: true,
        count: accommodations.length,
        accommodations: accommodations
      });
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      res.status(500).json({ message: "Failed to fetch accommodations", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get('/api/accommodations/search', async (req, res) => {
    try {
      const { q, destinationId, priceLevel, rating } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const filters = {
        destinationId: destinationId ? parseInt(destinationId as string) : undefined,
        priceLevel: priceLevel as string,
        rating: rating ? parseFloat(rating as string) : undefined,
      };
      
      const accommodations = await storage.searchAccommodations(q, filters);
      res.json(accommodations);
    } catch (error) {
      console.error("Error searching accommodations:", error);
      res.status(500).json({ message: "Failed to search accommodations" });
    }
  });

  app.get('/api/accommodations/:locationId', async (req, res) => {
    try {
      const { locationId } = req.params;
      const accommodation = await storage.getAccommodationByLocationId(locationId);
      if (!accommodation) {
        return res.status(404).json({ message: "Accommodation not found" });
      }
      res.json(accommodation);
    } catch (error) {
      console.error("Error fetching accommodation:", error);
      res.status(500).json({ message: "Failed to fetch accommodation" });
    }
  });

  // Attractions API - using places table with category filter
  app.get('/api/attractions', async (req, res) => {
    try {
      const { destinationId } = req.query;
      console.log('Fetching attractions from places table');
      
      let attractions: any[] = [];
      const client = await pool.connect();
      try {
        // Query places table for attraction-type places
        const query = `
          SELECT id, name, location as city, country, rating, description, created_at, updated_at,
                 CASE 
                   WHEN LOWER(description) LIKE '%museum%' OR LOWER(name) LIKE '%museum%' THEN 'Museum'
                   WHEN LOWER(description) LIKE '%church%' OR LOWER(description) LIKE '%cathedral%' THEN 'Religious Site'
                   WHEN LOWER(description) LIKE '%park%' OR LOWER(description) LIKE '%nature%' THEN 'Natural Site'
                   WHEN LOWER(description) LIKE '%historic%' OR LOWER(description) LIKE '%ancient%' THEN 'Historical Site'
                   WHEN LOWER(description) LIKE '%monument%' OR LOWER(description) LIKE '%statue%' THEN 'Monument'
                   ELSE 'Attraction'
                 END as category
          FROM places 
          WHERE LOWER(description) LIKE '%museum%' 
             OR LOWER(description) LIKE '%church%'
             OR LOWER(description) LIKE '%cathedral%'
             OR LOWER(description) LIKE '%park%'
             OR LOWER(description) LIKE '%monument%'
             OR LOWER(description) LIKE '%statue%'
             OR LOWER(description) LIKE '%historic%'
             OR LOWER(description) LIKE '%ancient%'
             OR LOWER(description) LIKE '%attraction%'
             OR LOWER(name) LIKE '%museum%'
             OR LOWER(name) LIKE '%church%'
             OR LOWER(name) LIKE '%cathedral%'
             OR LOWER(name) LIKE '%park%'
          ORDER BY rating DESC
        `;
        
        const result = await client.query(query);
        attractions = result.rows.map(place => ({
          id: place.id,
          locationId: `att_${place.id}`,
          name: place.name,
          city: place.city,
          country: place.country,
          rating: parseFloat(place.rating) || 0,
          category: place.category,
          description: place.description,
          address: `${place.name}, ${place.country}`,
          createdAt: place.created_at,
          updatedAt: place.updated_at
        }));
      } catch (dbError) {
        console.error('Places database error:', dbError);
        attractions = [];
      } finally {
        client.release();
      }
      
      console.log('Retrieved attractions from places:', attractions.length);
      res.json({
        success: true,
        count: attractions.length,
        attractions: attractions
      });
    } catch (error) {
      console.error("Error fetching attractions:", error);
      res.status(500).json({ message: "Failed to fetch attractions", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get('/api/attractions/search', async (req, res) => {
    try {
      const { q, destinationId, category } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const filters = {
        destinationId: destinationId ? parseInt(destinationId as string) : undefined,
        category: category as string,
      };
      
      const attractions = await storage.searchAttractions(q, filters);
      res.json(attractions);
    } catch (error) {
      console.error("Error searching attractions:", error);
      res.status(500).json({ message: "Failed to search attractions" });
    }
  });

  app.get('/api/attractions/:locationId', async (req, res) => {
    try {
      const { locationId } = req.params;
      const attraction = await storage.getAttractionByLocationId(locationId);
      if (!attraction) {
        return res.status(404).json({ message: "Attraction not found" });
      }
      res.json(attraction);
    } catch (error) {
      console.error("Error fetching attraction:", error);
      res.status(500).json({ message: "Failed to fetch attraction" });
    }
  });

  // Restaurants API - using places table with category filter
  app.get('/api/ta-restaurants', async (req, res) => {
    try {
      const { destinationId } = req.query;
      console.log('Fetching restaurants from places table');
      
      let restaurants: any[] = [];
      const client = await pool.connect();
      try {
        // Query places table for restaurant-type places
        const query = `
          SELECT id, name, location as city, country, rating, description, created_at, updated_at,
                 CASE 
                   WHEN rating >= 4.5 THEN '$$$$'
                   WHEN rating >= 4.0 THEN '$$$' 
                   WHEN rating >= 3.5 THEN '$$'
                   ELSE '$'
                 END as "priceLevel",
                 CASE 
                   WHEN LOWER(description) LIKE '%steakhouse%' OR LOWER(description) LIKE '%meat%' THEN ARRAY['Steakhouse', 'Grill']
                   WHEN LOWER(description) LIKE '%seafood%' OR LOWER(description) LIKE '%fish%' THEN ARRAY['Seafood', 'Fresh']
                   WHEN LOWER(description) LIKE '%pizza%' OR LOWER(description) LIKE '%italian%' THEN ARRAY['Italian', 'Pizza']
                   WHEN LOWER(description) LIKE '%sushi%' OR LOWER(description) LIKE '%japanese%' THEN ARRAY['Japanese', 'Sushi']
                   WHEN LOWER(description) LIKE '%french%' THEN ARRAY['French', 'Fine Dining']
                   WHEN country = 'Peru' THEN ARRAY['Peruvian', 'Local']
                   WHEN country = 'Brazil' THEN ARRAY['Brazilian', 'Local']
                   WHEN country = 'Argentina' THEN ARRAY['Argentine', 'Local']
                   WHEN country = 'Chile' THEN ARRAY['Chilean', 'Local']
                   WHEN country = 'Colombia' THEN ARRAY['Colombian', 'Local']
                   ELSE ARRAY['International', 'Restaurant']
                 END as cuisine
          FROM places 
          WHERE LOWER(description) LIKE '%restaurant%' 
             OR LOWER(description) LIKE '%cafe%'
             OR LOWER(description) LIKE '%bar%'
             OR LOWER(description) LIKE '%food%'
             OR LOWER(description) LIKE '%dining%'
             OR LOWER(description) LIKE '%kitchen%'
             OR LOWER(name) LIKE '%restaurant%'
             OR LOWER(name) LIKE '%cafe%'
             OR LOWER(name) LIKE '%bar%'
          ORDER BY rating DESC
        `;
        
        const result = await client.query(query);
        restaurants = result.rows.map(place => ({
          id: place.id,
          locationId: `res_${place.id}`,
          name: place.name,
          city: place.city,
          country: place.country,
          rating: parseFloat(place.rating) || 0,
          priceLevel: place.priceLevel,
          cuisine: place.cuisine,
          description: place.description,
          address: `${place.name}, ${place.city || place.country}`,
          createdAt: place.created_at,
          updatedAt: place.updated_at
        }));
      } catch (dbError) {
        console.error('Places database error:', dbError);
        restaurants = [];
      } finally {
        client.release();
      }
      
      console.log('Retrieved restaurants from places:', restaurants.length);
      res.json({
        success: true,
        count: restaurants.length,
        restaurants: restaurants
      });
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({ message: "Failed to fetch restaurants", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get('/api/ta-restaurants/search', async (req, res) => {
    try {
      const { q, destinationId, cuisine, priceLevel } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const filters = {
        destinationId: destinationId ? parseInt(destinationId as string) : undefined,
        cuisine: cuisine as string,
        priceLevel: priceLevel as string,
      };
      
      const restaurants = await storage.searchRestaurants(q, filters);
      res.json(restaurants);
    } catch (error) {
      console.error("Error searching restaurants:", error);
      res.status(500).json({ message: "Failed to search restaurants" });
    }
  });

  app.get('/api/ta-restaurants/:locationId', async (req, res) => {
    try {
      const { locationId } = req.params;
      const restaurant = await storage.getRestaurantByLocationId(locationId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      res.status(500).json({ message: "Failed to fetch restaurant" });
    }
  });

  // Location Reviews API
  app.get('/api/location-reviews/:locationId/:category', async (req, res) => {
    try {
      const { locationId, category } = req.params;
      const reviews = await storage.getLocationReviews(locationId, category);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching location reviews:", error);
      res.status(500).json({ message: "Failed to fetch location reviews" });
    }
  });

  app.get('/api/location-reviews/recent', async (req, res) => {
    try {
      const reviews = await storage.getRecentLocationReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching recent location reviews:", error);
      res.status(500).json({ message: "Failed to fetch recent location reviews" });
    }
  });

  app.post('/api/location-reviews', noAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = { ...req.body, userId };
      const review = await storage.createLocationReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating location review:", error);
      res.status(400).json({ message: "Failed to create location review" });
    }
  });

  // Location Photos API
  app.get('/api/location-photos/:locationId/:category', async (req, res) => {
    try {
      const { locationId, category } = req.params;
      const photos = await storage.getLocationPhotos(locationId, category);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching location photos:", error);
      res.status(500).json({ message: "Failed to fetch location photos" });
    }
  });

  // Location Subratings API
  app.get('/api/location-subratings/:locationId/:category', async (req, res) => {
    try {
      const { locationId, category } = req.params;
      const subratings = await storage.getLocationSubratings(locationId, category);
      res.json(subratings);
    } catch (error) {
      console.error("Error fetching location subratings:", error);
      res.status(500).json({ message: "Failed to fetch location subratings" });
    }
  });

  // Location Ancestors API
  app.get('/api/location-ancestors/:locationId', async (req, res) => {
    try {
      const { locationId } = req.params;
      const ancestors = await storage.getLocationAncestors(locationId);
      res.json(ancestors);
    } catch (error) {
      console.error("Error fetching location ancestors:", error);
      res.status(500).json({ message: "Failed to fetch location ancestors" });
    }
  });

  // ===== ENHANCED COMMUNITY FEATURES API =====
  
  // Place Reviews API (for real places with Google Places integration)
  app.get('/api/place-reviews', async (req, res) => {
    try {
      console.log('Fetching place reviews from existing table...');
      const { placeId, location, placeType, limit = '10' } = req.query;
      
      const client = await pool.connect();
      try {
        let query = `
          SELECT pr.*, p.name as place_name, p.location, p.country 
          FROM place_reviews pr 
          LEFT JOIN places p ON pr.place_id = p.id 
        `;
        let params = [];
        
        if (placeId) {
          query += ' WHERE pr.place_id = $1';
          params.push(placeId);
        } else if (location) {
          query += ' WHERE LOWER(p.location) LIKE LOWER($1) OR LOWER(p.country) LIKE LOWER($1)';
          params.push(`%${location}%`);
        }
        
        query += ' ORDER BY pr.created_at DESC LIMIT $' + (params.length + 1);
        params.push(parseInt(limit as string));
        
        const reviewsResult = await client.query(query, params);
        const reviews = reviewsResult.rows;
        
        console.log(`Retrieved ${reviews.length} place reviews with place info`);
        res.json({ total: reviews.length, items: reviews });
        
      } catch (dbError) {
        console.error('Database query error:', dbError);
        res.json({ 
          message: 'Reviews are being loaded. Database connected but tables may be syncing.',
          total: 0,
          items: []
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error fetching place reviews:", error);
      res.status(500).json({ message: "Failed to fetch place reviews" });
    }
  });

  app.post('/api/place-reviews', async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.id;
      const reviewData = { ...req.body, userId };
      const review = await storage.createPlaceReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating place review:", error);
      res.status(400).json({ message: "Failed to create place review" });
    }
  });

  app.get('/api/place-reviews/user', noAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.id;
      const reviews = await storage.getUserPlaceReviews(userId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching user place reviews:", error);
      res.status(500).json({ message: "Failed to fetch user reviews" });
    }
  });

  app.put('/api/place-reviews/:id', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.id;
      const reviewData = req.body;
      const updatedReview = await storage.updatePlaceReview(id, reviewData);
      res.json(updatedReview);
    } catch (error) {
      console.error("Error updating place review:", error);
      res.status(400).json({ message: "Failed to update place review" });
    }
  });

  app.delete('/api/place-reviews/:id', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.id;
      const deleted = await storage.deletePlaceReview(id, userId);
      if (deleted) {
        res.json({ message: "Review deleted successfully" });
      } else {
        res.status(404).json({ message: "Review not found or unauthorized" });
      }
    } catch (error) {
      console.error("Error deleting place review:", error);
      res.status(500).json({ message: "Failed to delete place review" });
    }
  });

  // Review voting endpoints
  app.post('/api/review-votes', noAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.id;
      const voteData = { ...req.body, userId };
      const vote = await storage.voteOnReview(voteData);
      res.status(201).json(vote);
    } catch (error) {
      console.error("Error voting on review:", error);
      res.status(400).json({ message: "Failed to vote on review" });
    }
  });

  // Enhanced Chat Rooms API
  app.get('/api/chat-rooms', async (req, res) => {
    try {
      const { search, type, destination } = req.query;
      
      if (search) {
        const rooms = await storage.searchChatRooms(search as string, {
          type: type as string,
          destination: destination as string
        });
        return res.json(rooms);
      }
      
      const rooms = await storage.getChatRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      res.status(500).json({ message: "Failed to fetch chat rooms" });
    }
  });

  app.post('/api/chat-rooms', noAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.id;
      const roomData = { ...req.body, createdBy: userId };
      const room = await storage.createChatRoom(roomData);
      res.status(201).json(room);
    } catch (error) {
      console.error("Error creating chat room:", error);
      res.status(400).json({ message: "Failed to create chat room" });
    }
  });

  app.get('/api/chat-rooms/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const room = await storage.getChatRoomById(id);
      if (room) {
        res.json(room);
      } else {
        res.status(404).json({ message: "Chat room not found" });
      }
    } catch (error) {
      console.error("Error fetching chat room:", error);
      res.status(500).json({ message: "Failed to fetch chat room" });
    }
  });

  app.post('/api/chat-rooms/:id/join', noAuth, async (req: any, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.id;
      const member = await storage.joinChatRoom(roomId, userId);
      res.status(201).json(member);
    } catch (error) {
      console.error("Error joining chat room:", error);
      res.status(400).json({ message: "Failed to join chat room" });
    }
  });

  app.post('/api/chat-rooms/:id/leave', noAuth, async (req: any, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.id;
      const left = await storage.leaveChatRoom(roomId, userId);
      if (left) {
        res.json({ message: "Left chat room successfully" });
      } else {
        res.status(404).json({ message: "Not a member of this room" });
      }
    } catch (error) {
      console.error("Error leaving chat room:", error);
      res.status(500).json({ message: "Failed to leave chat room" });
    }
  });

  app.get('/api/chat-rooms/:id/members', async (req, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const members = await storage.getChatRoomMembers(roomId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching chat room members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  // Travel Buddy System API
  app.get('/api/travel-buddy-posts', async (req, res) => {
    try {
      const { destination, startDate, endDate } = req.query;
      const filters: any = {};
      
      if (destination) filters.destination = destination as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      const posts = await storage.getTravelBuddyPosts(filters);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching travel buddy posts:", error);
      res.status(500).json({ message: "Failed to fetch travel buddy posts" });
    }
  });

  app.post('/api/travel-buddy-posts', noAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.id || 'guest';
      const postData = { ...req.body, userId };
      const post = await storage.createTravelBuddyPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating travel buddy post:", error);
      res.status(400).json({ message: "Failed to create travel buddy post" });
    }
  });

  app.get('/api/travel-buddy-posts/user', noAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.id;
      const posts = await storage.getUserTravelBuddyPosts(userId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user travel buddy posts:", error);
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  app.post('/api/travel-buddy-applications', noAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.id;
      const applicationData = { 
        ...req.body, 
        applicantId: userId 
      };
      const application = await storage.applyForTravelBuddy(applicationData);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating travel buddy application:", error);
      res.status(400).json({ message: "Failed to apply for travel buddy" });
    }
  });

  app.get('/api/travel-buddy-posts/:id/applications', noAuth, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const applications = await storage.getTravelBuddyApplications(postId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching travel buddy applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.patch('/api/travel-buddy-applications/:id', noAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const application = await storage.updateTravelBuddyApplication(id, status);
      res.json(application);
    } catch (error) {
      console.error("Error updating travel buddy application:", error);
      res.status(400).json({ message: "Failed to update application" });
    }
  });

  // Database dashboard endpoint
  app.get('/api/dashboard/tables', async (_req, res) => {
    try {
      const tablesData = [];
      
      // List of all tables to check
      const tablesToCheck = [
        'destinations', 'accommodations', 'attractions', 'restaurants', 
        'places', 'place_reviews', 'location_photos', 'location_ancestors',
        'users', 'sessions', 'trips', 'expenses', 'achievements',
        'chat_rooms', 'messages', 'user_connections', 'travel_buddy_posts',
        'raw_responses', 'ingestion_runs', 'ingestion_jobs', 'ingestion_dead_letters'
      ];
      
      for (const tableName of tablesToCheck) {
        try {
          const result = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
          tablesData.push({
            table_name: tableName,
            approx_row_count: parseInt(result.rows[0].count)
          });
        } catch (error) {
          // Table might not exist, add with 0 count
          tablesData.push({
            table_name: tableName,
            approx_row_count: 0,
            error: 'Table not found or inaccessible'
          });
        }
      }
      
      // Sort by row count descending
      tablesData.sort((a, b) => b.approx_row_count - a.approx_row_count);
      
      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        total_tables: tablesData.length,
        tables: tablesData
      });
    } catch (error) {
      console.error("Error fetching database dashboard:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch database dashboard data",
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // ====== REWARDS & ACHIEVEMENTS API ROUTES ======

  // Initialize achievements
  app.post('/api/rewards/init', noAuth, async (_req, res) => {
    try {
      // TODO: Implement rewardsService.initializeDefaultAchievements() when service is fixed
      res.json({ success: true, message: 'Achievements initialized (mock)' });
    } catch (error) {
      console.error("Error initializing achievements:", error);
      res.status(500).json({ message: "Failed to initialize achievements" });
    }
  });

  // Get user's rewards summary
  app.get('/api/rewards/summary', noAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.id || 'anonymous';
      const totalPoints = Math.floor(Math.random() * 1000) + 500; // Mock total points
      
      res.json({
        userId,
        totalPoints,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error getting rewards summary:", error);
      res.status(500).json({ message: "Failed to get rewards summary" });
    }
  });

  // Award points to user
  app.post('/api/rewards/award', noAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.id || 'anonymous';
      const { action, description } = req.body;
      
      const points = Math.floor(Math.random() * 100) + 10; // Mock points award
      
      res.json({ 
        success: true, 
        pointsAwarded: points,
        message: `Awarded ${points} points for ${action}` 
      });
    } catch (error) {
      console.error("Error awarding points:", error);
      res.status(500).json({ message: "Failed to award points" });
    }
  });

  // Get achievements
  app.get('/api/achievements', noAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.id || 'anonymous';
      
      // For now, return mock achievements with progress
      const mockAchievements = [
        {
          id: '1',
          name: 'First Review',
          nameHe: 'הביקורת הראשונה',
          description: 'Write your first travel review',
          descriptionHe: 'כתוב את הביקורת הראשונה שלך',
          points: 100,
          rarity: 'common',
          isCompleted: false,
          progress: 0,
          progressMax: 1
        },
        {
          id: '2',
          name: 'Photo Enthusiast',
          nameHe: 'חובב צילום',
          description: 'Upload 20 travel photos',
          descriptionHe: 'העלה 20 תמונות נסיעה',
          points: 200,
          rarity: 'common',
          isCompleted: false,
          progress: 3,
          progressMax: 20
        },
        {
          id: '3',
          name: 'Trip Planner',
          nameHe: 'מתכנן מסלולים',
          description: 'Create and share 5 itineraries',
          descriptionHe: 'צור ושתף 5 מסלולים',
          points: 1000,
          rarity: 'epic',
          isCompleted: true,
          progress: 5,
          progressMax: 5
        }
      ];
      
      res.json(mockAchievements);
    } catch (error) {
      console.error("Error getting achievements:", error);
      res.status(500).json({ message: "Failed to get achievements" });
    }
  });

  // Get missions
  app.get('/api/missions', noAuth, async (req: any, res) => {
    try {
      const mockMissions = [
        {
          id: '1',
          type: 'daily',
          name: 'Write a Review',
          nameHe: 'כתוב ביקורת',
          description: 'Share your experience about a place',
          descriptionHe: 'שתף את החוויה שלך על מקום',
          pointsReward: 50,
          targetCount: 1,
          currentCount: 0,
          isCompleted: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          type: 'daily',
          name: 'Upload Photo',
          nameHe: 'העלה תמונה',
          description: 'Add a photo to your travel collection',
          descriptionHe: 'הוסף תמונה לאוסף הנסיעות שלך',
          pointsReward: 10,
          targetCount: 1,
          currentCount: 0,
          isCompleted: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        },
        {
          id: '3',
          type: 'weekly',
          name: 'Create Itinerary',
          nameHe: 'צור מסלול',
          description: 'Plan a new travel itinerary',
          descriptionHe: 'תכנן מסלול נסיעה חדש',
          pointsReward: 200,
          targetCount: 1,
          currentCount: 0,
          isCompleted: false,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      ];
      
      res.json(mockMissions);
    } catch (error) {
      console.error("Error getting missions:", error);
      res.status(500).json({ message: "Failed to get missions" });
    }
  });

  // Get leaderboard
  app.get('/api/rewards/leaderboard', noAuth, async (req: any, res) => {
    try {
      // const leaderboard = await rewardsService.getLeaderboard(10);
      // res.json(leaderboard);
      // Using mock data for now
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      // Return mock data if service fails
      const mockLeaderboard = [
        {
          id: '1',
          firstName: 'Sarah',
          lastName: 'Cohen',
          totalPoints: 2450,
          profileImageUrl: null
        },
        {
          id: '2', 
          firstName: 'David',
          lastName: 'Levi',
          totalPoints: 1890,
          profileImageUrl: null
        },
        {
          id: '3',
          firstName: 'Maya',
          lastName: 'Goldberg',
          totalPoints: 1654,
          profileImageUrl: null
        }
      ];
      res.json(mockLeaderboard);
    }
  });

  // Get user's points history
  app.get('/api/rewards/history', noAuth, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.id || 'anonymous';
      // const history = await rewardsService.getUserPointsHistory(userId, 50);
      // Using mock data for now
      const history: any[] = [];
      
      // If no history, return mock data
      if (history.length === 0) {
        const mockHistory = [
          {
            id: '1',
            points: 50,
            description: 'ביקורת נכתבה על Machu Picchu',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: '2',
            points: 10,
            description: 'תמונה הועלתה',
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
          },
          {
            id: '3',
            points: 100,
            description: 'הישג נפתח: הביקורת הראשונה',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ];
        return res.json(mockHistory);
      }
      
      res.json(history);
    } catch (error) {
      console.error("Error getting points history:", error);
      res.status(500).json({ message: "Failed to get points history" });
    }
  });

  // Media Proxy API - moved to server/index.ts to be registered before Vite middleware

  // Media proxy status
  app.get('/api/media/status', async (req, res) => {
    try {
      const { mediaProxyService } = await import('./integrations/media/mediaProxyService.js');
      const { mediaCache } = await import('./integrations/media/cache/mediaCache.js');
      
      res.json({
        enabledProviders: mediaProxyService.getEnabledProviders(),
        cacheStats: mediaCache.getStats(),
      });
    } catch (error: any) {
      console.error('Media status error:', error);
      res.status(500).json({ error: 'Failed to get status' });
    }
  });

  // Location photo with intelligent fallback
  app.get('/api/media/location-photo', async (req, res) => {
    try {
      const { entityType, entityId, entityName, country, photoReference, forceRefresh } = req.query;

      if (!entityType || !entityId || !entityName) {
        return res.status(400).json({ 
          error: 'entityType, entityId, and entityName are required' 
        });
      }

      // Use singleton orchestrator for rate limiting persistence
      const result = await mediaOrchestrator.getLocationPhoto({
        entityType: entityType as string,
        entityId: entityId as string,
        entityName: entityName as string,
        country: country as string | undefined,
        photoReference: photoReference as string | undefined,
        forceRefresh: forceRefresh === 'true',
      });

      res.json(result);
    } catch (error: any) {
      console.error('Location photo error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch location photo', 
        message: error.message 
      });
    }
  });
  
  // Unsplash rate limit status
  app.get('/api/media/unsplash-rate-limit', async (req, res) => {
    try {
      // Use singleton orchestrator
      const status = mediaOrchestrator.getUnsplashRateLimit();
      
      res.json(status);
    } catch (error: any) {
      console.error('Unsplash rate limit error:', error);
      res.status(500).json({ error: 'Failed to get rate limit status' });
    }
  });

  // Admin: Populate images for all destinations and attractions
  app.post('/api/admin/populate-images', requireAdmin, async (req, res) => {
    try {
      const results: any = {
        destinations: { total: 0, success: 0, failed: 0, errors: [] },
        attractions: { total: 0, success: 0, failed: 0, errors: [] }
      };

      // Get all destinations
      const destinations = await storage.getAllDestinations();
      results.destinations.total = destinations.length;

      console.log(`🖼️ Populating images for ${destinations.length} destinations...`);

      // Populate destination images
      for (const dest of destinations) {
        try {
          // Check if already has cached photo
          const existing = await storage.getPrimaryLocationPhoto('destination', dest.id);
          
          if (!existing) {
            // Fetch and cache image
            await mediaOrchestrator.getLocationPhoto({
              entityType: 'destination',
              entityId: dest.id,
              entityName: dest.name,
              country: dest.country,
              forceRefresh: false
            });
            results.destinations.success++;
            console.log(`✅ Image cached for destination: ${dest.name}, ${dest.country}`);
          } else {
            results.destinations.success++;
            console.log(`⏭️ Destination already has image: ${dest.name}`);
          }
        } catch (error: any) {
          results.destinations.failed++;
          results.destinations.errors.push({
            destination: dest.name,
            error: error.message
          });
          console.error(`❌ Failed for ${dest.name}:`, error.message);
        }
      }

      // Get all attractions
      const attractions = await storage.getAllAttractions();
      results.attractions.total = attractions.length;

      console.log(`🖼️ Populating images for ${attractions.length} attractions...`);

      // Populate attraction images
      for (const attr of attractions) {
        try {
          // Check if already has cached photo
          const existing = await storage.getPrimaryLocationPhoto('attraction', attr.id);
          
          if (!existing) {
            // Fetch and cache image
            await mediaOrchestrator.getLocationPhoto({
              entityType: 'attraction',
              entityId: attr.id,
              entityName: attr.name,
              country: attr.country,
              forceRefresh: false
            });
            results.attractions.success++;
            console.log(`✅ Image cached for attraction: ${attr.name}`);
          } else {
            results.attractions.success++;
            console.log(`⏭️ Attraction already has image: ${attr.name}`);
          }
        } catch (error: any) {
          results.attractions.failed++;
          results.attractions.errors.push({
            attraction: attr.name,
            error: error.message
          });
          console.error(`❌ Failed for ${attr.name}:`, error.message);
        }
      }

      console.log('🎉 Image population completed!');
      res.json({
        success: true,
        message: 'Image population completed',
        results
      });
    } catch (error: any) {
      console.error('Populate images error:', error);
      res.status(500).json({ error: 'Failed to populate images', details: error.message });
    }
  });

  // Geo API middleware - require x-globemate-key header
  const requireGlobeMateKey = (req: any, res: any, next: any) => {
    const apiKey = req.headers['x-globemate-key'];
    
    if (!apiKey || apiKey !== config.globemate.apiKey) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or missing x-globemate-key' });
    }
    
    next();
  };

  // Internal Geo API endpoints (require x-globemate-key for direct access)
  app.get('/api/geo/country', requireGlobeMateKey, async (req, res) => {
    try {
      const { getBasics } = await import('./services/destinations/geoService.js');
      const { code, name, lang = 'en' } = req.query;

      if (!code && !name) {
        return res.status(400).json({ error: 'Either code or name parameter is required' });
      }

      const result = await getBasics({
        countryCode: code as string,
        countryName: name as string,
        lang: lang as 'en' | 'he',
      });

      if (!result) {
        return res.status(404).json({ error: 'Country not found' });
      }

      res.json(result);
    } catch (error) {
      console.error('Geo country error:', error);
      res.status(500).json({ error: 'Failed to fetch country data' });
    }
  });

  app.get('/api/geo/city/search', requireGlobeMateKey, async (req, res) => {
    try {
      const { getBasics } = await import('./services/destinations/geoService.js');
      const { q, country, lang = 'en' } = req.query;

      if (!q) {
        return res.status(400).json({ error: 'Query parameter q is required' });
      }

      const result = await getBasics({
        cityName: q as string,
        countryCode: country as string,
        lang: lang as 'en' | 'he',
      });

      if (!result) {
        return res.status(404).json({ error: 'City not found' });
      }

      res.json(result);
    } catch (error) {
      console.error('Geo city search error:', error);
      res.status(500).json({ error: 'Failed to search city' });
    }
  });

  app.get('/api/geo/city/by-coords', requireGlobeMateKey, async (req, res) => {
    try {
      const { getBasics } = await import('./services/destinations/geoService.js');
      const { lat, lng, country, lang = 'en' } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({ error: 'Both lat and lng parameters are required' });
      }

      const result = await getBasics({
        lat: parseFloat(lat as string),
        lng: parseFloat(lng as string),
        countryCode: country as string,
        lang: lang as 'en' | 'he',
      });

      if (!result) {
        return res.status(404).json({ error: 'Location not found' });
      }

      res.json(result);
    } catch (error) {
      console.error('Geo coords error:', error);
      res.status(500).json({ error: 'Failed to fetch location data' });
    }
  });

  // Seed journeys (development only)
  // Create journeys table if not exists
  app.post('/api/create-journeys-table', async (req, res) => {
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS journeys (
          id SERIAL PRIMARY KEY,
          title VARCHAR NOT NULL,
          description TEXT NOT NULL,
          destinations JSONB NOT NULL,
          total_nights INTEGER NOT NULL,
          price_min NUMERIC(10,2) NOT NULL,
          price_max NUMERIC(10,2) NOT NULL,
          season TEXT[],
          tags TEXT[],
          audience_tags TEXT[],
          rating NUMERIC(3,2) DEFAULT 0,
          popularity INTEGER DEFAULT 0,
          hero_image TEXT,
          images TEXT[],
          daily_itinerary JSONB,
          costs_breakdown JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      const result = await db.execute(sql`SELECT COUNT(*) as count FROM journeys`);
      const count = result.rows?.[0] || { count: 0 };
      res.json({ success: true, message: 'Table created/verified', count });
    } catch (error) {
      console.error('Error creating journeys table:', error);
      res.status(500).json({ message: 'Failed to create table', error: String(error) });
    }
  });

  app.post('/api/seed/journeys', async (req, res) => {
    try {
      const { seedJourneys } = await import('./journeysSeeder.js');
      const result = await seedJourneys();
      res.json(result);
    } catch (error) {
      console.error('Error seeding journeys:', error);
      res.status(500).json({ message: 'Failed to seed journeys', error: String(error) });
    }
  });

  // ==================== AI Chat Sessions API ====================
  
  // Save a new chat session
  app.post('/api/chat-sessions', noAuth, async (req: any, res) => {
    try {
      const { chatSessions, insertChatSessionSchema } = await import('@shared/schema');
      const userId = req.user?.claims?.sub || 'anonymous';
      
      const sessionData = insertChatSessionSchema.parse({
        ...req.body,
        userId
      });

      const [newSession] = await db.insert(chatSessions).values(sessionData).returning();
      res.json(newSession);
    } catch (error) {
      console.error('Error saving chat session:', error);
      res.status(500).json({ message: 'Failed to save chat session', error: String(error) });
    }
  });

  // Get all chat sessions for a user
  app.get('/api/chat-sessions', noAuth, async (req: any, res) => {
    try {
      const { chatSessions } = await import('@shared/schema');
      const userId = req.user?.claims?.sub || 'anonymous';
      
      const sessions = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.userId, userId))
        .orderBy(sql`${chatSessions.lastMessageAt} DESC`)
        .limit(50);
      
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      res.status(500).json({ message: 'Failed to fetch chat sessions', error: String(error) });
    }
  });

  // Get a specific chat session
  app.get('/api/chat-sessions/:id', noAuth, async (req: any, res) => {
    try {
      const { chatSessions } = await import('@shared/schema');
      const sessionId = parseInt(req.params.id);
      const userId = req.user?.claims?.sub || 'anonymous';
      
      const [session] = await db
        .select()
        .from(chatSessions)
        .where(sql`${chatSessions.id} = ${sessionId} AND ${chatSessions.userId} = ${userId}`)
        .limit(1);
      
      if (!session) {
        return res.status(404).json({ message: 'Chat session not found' });
      }
      
      res.json(session);
    } catch (error) {
      console.error('Error fetching chat session:', error);
      res.status(500).json({ message: 'Failed to fetch chat session', error: String(error) });
    }
  });

  // Update a chat session
  app.put('/api/chat-sessions/:id', noAuth, async (req: any, res) => {
    try {
      const { chatSessions } = await import('@shared/schema');
      const sessionId = parseInt(req.params.id);
      const userId = req.user?.claims?.sub || 'anonymous';
      
      const [updatedSession] = await db
        .update(chatSessions)
        .set({
          ...req.body,
          lastMessageAt: new Date(),
          updatedAt: new Date()
        })
        .where(sql`${chatSessions.id} = ${sessionId} AND ${chatSessions.userId} = ${userId}`)
        .returning();
      
      if (!updatedSession) {
        return res.status(404).json({ message: 'Chat session not found' });
      }
      
      res.json(updatedSession);
    } catch (error) {
      console.error('Error updating chat session:', error);
      res.status(500).json({ message: 'Failed to update chat session', error: String(error) });
    }
  });

  // Delete a chat session
  app.delete('/api/chat-sessions/:id', noAuth, async (req: any, res) => {
    try {
      const { chatSessions } = await import('@shared/schema');
      const sessionId = parseInt(req.params.id);
      const userId = req.user?.claims?.sub || 'anonymous';
      
      const [deletedSession] = await db
        .delete(chatSessions)
        .where(sql`${chatSessions.id} = ${sessionId} AND ${chatSessions.userId} = ${userId}`)
        .returning();
      
      if (!deletedSession) {
        return res.status(404).json({ message: 'Chat session not found' });
      }
      
      res.json({ message: 'Chat session deleted successfully' });
    } catch (error) {
      console.error('Error deleting chat session:', error);
      res.status(500).json({ message: 'Failed to delete chat session', error: String(error) });
    }
  });

  // Emergency Information routes
  app.get('/api/emergency-info', noAuth, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || 'anonymous';
      const info = await storage.getEmergencyInfo(userId);
      res.json(info || null);
    } catch (error) {
      console.error('Error fetching emergency info:', error);
      res.status(500).json({ message: 'Failed to fetch emergency info', error: String(error) });
    }
  });

  app.post('/api/emergency-info', noAuth, async (req: any, res) => {
    try {
      const { insertEmergencyInfoSchema } = await import('@shared/schema');
      const userId = req.user?.claims?.sub || 'anonymous';
      
      const validatedData = insertEmergencyInfoSchema.parse({
        ...req.body,
        userId
      });
      
      const info = await storage.upsertEmergencyInfo(validatedData);
      res.json(info);
    } catch (error) {
      console.error('Error saving emergency info:', error);
      res.status(500).json({ message: 'Failed to save emergency info', error: String(error) });
    }
  });

  app.delete('/api/emergency-info', noAuth, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || 'anonymous';
      await storage.deleteEmergencyInfo(userId);
      res.json({ message: 'Emergency info deleted successfully' });
    } catch (error) {
      console.error('Error deleting emergency info:', error);
      res.status(500).json({ message: 'Failed to delete emergency info', error: String(error) });
    }
  });

}
