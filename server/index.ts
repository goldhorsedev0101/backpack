import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { registerRoutes } from './routes.js';
import { setupVite } from './vite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoints for monitoring
  app.get('/health', async (_req, res) => {
    try {
      // Test Supabase connection
      const { getSupabaseAdmin } = await import('./supabase.js');
      const supabase = getSupabaseAdmin();
      
      // Quick connection test
      const { data, error } = await supabase.from('destinations').select('*', { count: 'exact' }).limit(1);
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: error ? 'error' : 'connected',
          supabase: error ? 'disconnected' : 'connected'
        }
      });
    } catch (err) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  });

  // Database health check endpoint
  app.get('/health/db', async (_req, res) => {
    try {
      const { db } = await import('./db.js');
      const { sql } = await import('drizzle-orm');
      
      // Test basic query with trips table (string comparison)
      await db.execute(sql`SELECT 1 as test`);
      
      res.json({
        ok: true,
        timestamp: new Date().toISOString(),
        database: 'connected'
      });
    } catch (err) {
      res.status(503).json({
        ok: false,
        error: 'database',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
  });

  app.get('/ready', (_req, res) => {
    res.json({ 
      status: 'ready',
      timestamp: new Date().toISOString(),
      port: PORT 
    });
  });


  // Dashboard API endpoint - registered before Vite middleware
  app.get('/api/dashboard/tables', async (_req, res) => {
    try {
      const { getActualTables } = await import('./supabase.js');
      const tablesData = await getActualTables();
      
      // Group tables by category for better display
      const categorizedTables = {
        "Places & Locations": tablesData.filter(t => 
          ['destinations', 'accommodations', 'attractions', 'restaurants', 
           'places', 'place_reviews', 'location_photos', 'location_ancestors'].includes(t.table_name)
        ),
        "Users & Auth": tablesData.filter(t => 
          ['users', 'sessions', 'user_connections'].includes(t.table_name)
        ),
        "Travel Planning": tablesData.filter(t => 
          ['trips', 'expenses'].includes(t.table_name)
        ),
        "Gamification": tablesData.filter(t => 
          ['achievements'].includes(t.table_name)
        ),
        "Community": tablesData.filter(t => 
          ['chat_rooms', 'messages', 'travel_buddy_posts'].includes(t.table_name)
        ),
        "Data Processing": tablesData.filter(t => 
          ['raw_responses', 'ingestion_runs', 'ingestion_jobs', 'ingestion_dead_letters'].includes(t.table_name)
        )
      };
      
      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        total_tables: tablesData.length,
        tables: tablesData,
        categorized: categorizedTables
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

  // Get port from configuration
  const { config } = await import('./config.js');
  const PORT = config.server.port;
  const HOST = config.server.host;
  
  const server = createServer(app);
  
  // Configure timeouts for Replit stability
  server.keepAliveTimeout = 61000;
  server.headersTimeout = 65000;
  server.requestTimeout = 60000;
  server.timeout = 65000;

  // Create itinerary tables setup endpoint with correct schema
  app.post('/api/setup/create-itinerary-tables', async (_req, res) => {
    try {
      const { db } = await import('./db.js');
      const { sql } = await import('drizzle-orm');
      
      console.log('Creating itinerary tables with new schema...');
      console.log('Testing database connection first...');
      
      // Test connection first
      await db.execute(sql`SELECT 1 as test`);
      
      // Create itineraries table with new schema
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS itineraries (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL,
            title text NOT NULL,
            start_date timestamp with time zone,
            end_date timestamp with time zone,
            source text,
            source_ref text,
            plan_json jsonb,
            created_at timestamp with time zone DEFAULT NOW(),
            updated_at timestamp with time zone DEFAULT NOW()
        );
      `);
      
      // Create indexes for itineraries
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS itineraries_user_id_idx ON itineraries(user_id);
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS itineraries_created_at_idx ON itineraries(created_at);
      `);
      
      // Create itinerary_items table with new schema
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS itinerary_items (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            itinerary_id uuid NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
            day_index integer NOT NULL DEFAULT 1,
            position integer NOT NULL DEFAULT 0,
            item_type text NOT NULL,
            ref_table text,
            ref_id text,
            title text,
            notes text,
            start_time timestamp with time zone,
            end_time timestamp with time zone,
            source text,
            source_ref text,
            created_at timestamp with time zone DEFAULT NOW(),
            updated_at timestamp with time zone DEFAULT NOW()
        );
      `);
      
      // Create indexes for itinerary_items
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS items_itinerary_id_idx ON itinerary_items(itinerary_id);
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS items_day_position_idx ON itinerary_items(day_index, position);
      `);
      
      console.log('✅ Itinerary tables created successfully');
      
      res.json({ 
        success: true, 
        message: "Itinerary tables created successfully with new schema" 
      });
    } catch (error) {
      console.error('❌ Error creating itinerary tables:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create tables' 
      });
    }
  });

  // IMPORTANT: Register API routes BEFORE Vite middleware in development
  await registerRoutes(app);
  
  // Add itinerary routes
  const { default: itineraryRouter } = await import('./itineraryRoutes.js');
  app.use(itineraryRouter);

  // Save Suggested Trip route - POST /api/trips/save-suggestion
  app.post('/api/trips/save-suggestion', async (req: any, res) => {
    try {
      // Derive userId from authenticated session, fallback to guest mode
      const userId = req.user?.claims?.sub || req.user?.id || 'guest-user';
      
      // Allow guest users to save trips for demo purposes
      console.log(`💾 Saving trip for user: ${userId}`);
      
      const suggestion = req.body.suggestion;
      if (!suggestion) {
        return res.status(400).json({
          error: 'validation',
          message: 'Trip suggestion data is required'
        });
      }

      // Import required modules
      const { db } = await import('./db.js');
      const { trips } = await import('@shared/schema.js');
      
      // Save to public.trips table with user_id as string
      const [newTrip] = await db
        .insert(trips)
        .values({
          userId: userId,
          title: `${suggestion.destination}, ${suggestion.country}`,
          description: suggestion.description,
          destinations: [suggestion.destination],
          budget: suggestion.estimatedBudget?.high?.toString() || '1000',
          travelStyle: Array.isArray(suggestion.travelStyle) ? suggestion.travelStyle.join(', ') : (suggestion.travelStyle || 'Adventure'),
          isPublic: false
        })
        .returning();

      if (!newTrip) {
        throw new Error('Failed to create trip');
      }

      console.log(`✅ Trip saved to public.trips (user_id=${userId})`);
      
      res.json({
        success: true,
        trip: newTrip,
        message: 'Saved to My Trips'
      });
      
    } catch (error: any) {
      console.error('Save suggestion error:', error);
      
      // Friendly error messages in English
      let message = 'Could not save trip. Please try again.';
      let errorType = 'database';
      
      if (error?.message?.includes('does not exist')) {
        message = 'Database setup incomplete. Please contact support.';
        errorType = 'schema';
      } else if (error?.message?.includes('connection')) {
        message = 'Database temporarily unavailable. Please try again.';
        errorType = 'network';
      }
      
      res.status(500).json({
        error: errorType,
        message,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Get user trips with string comparison - GET /api/trips/my-trips  
  app.get('/api/trips/my-trips', async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id || 'guest-user';
      
      console.log(`📋 Fetching trips for user: ${userId}`);

      const { db } = await import('./db.js');
      const { trips } = await import('@shared/schema.js');
      const { eq, desc } = await import('drizzle-orm');
      
      // Query public.trips by string equality: user_id == userId  
      const userTrips = await db
        .select()
        .from(trips)
        .where(eq(trips.userId, userId))
        .orderBy(desc(trips.updatedAt));
      
      res.json(userTrips);
      
    } catch (error: any) {
      console.error('Error fetching user trips:', error);
      res.status(500).json({
        error: 'database',
        message: 'Failed to load your trips'
      });
    }
  });

  // Setup Vite in development mode
  if (process.env.NODE_ENV === 'development') {
    await setupVite(app, server);
  } else {
    // Production mode - serve static files
    const publicDir = path.join(__dirname, '../dist/public');
    app.use(express.static(publicDir));

    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) return res.status(404).end();
      res.sendFile(path.join(publicDir, 'index.html'));
    });
  }

  server.listen(PORT, HOST, () => {
    console.log(`[server] BackpackBuddy listening on http://${HOST}:${PORT}`);
    console.log(`[server] Environment: ${config.server.nodeEnv}`);
    console.log(`[server] Health check: http://${HOST}:${PORT}/health`);
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});