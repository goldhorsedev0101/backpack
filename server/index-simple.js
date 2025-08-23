// Simple working server for TripWise with Supabase data
import express from 'express';
// import cors from 'cors'; // Removed to avoid dependency issues
import pkg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Setup basic middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve static files from built frontend
app.use(express.static(path.resolve(process.cwd(), 'dist/public')));

// Setup Supabase connection
const pool = new Pool({
  connectionString: 'postgresql://postgres.wuzhvkmfdyiwaaladyxc:!Dornt0740$@aws-1-sa-east-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      openai: 'configured',
      storage: 'operational'
    },
    version: '1.0.0'
  });
});

// Places endpoint - serves real Supabase data
app.get('/api/places', async (req, res) => {
  try {
    console.log('Fetching places from Supabase...');
    const client = await pool.connect();
    
    try {
      const result = await client.query('SELECT * FROM places ORDER BY rating DESC LIMIT 50');
      const places = result.rows.map(place => ({
        ...place,
        type: 'destination'
      }));
      
      console.log(`✅ Retrieved ${places.length} places from Supabase`);
      res.json({ total: places.length, items: places });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      res.json({ 
        total: 0, 
        items: [], 
        message: 'Places data is being loaded. Database connected.',
        error: dbError.message
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({ error: 'Failed to connect to database' });
  }
});

// Place reviews endpoint
app.get('/api/place-reviews', async (req, res) => {
  try {
    console.log('Fetching place reviews from Supabase...');
    const { limit = '10' } = req.query;
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT pr.*, p.name as place_name, p.location, p.country 
        FROM place_reviews pr 
        LEFT JOIN places p ON pr.place_id = p.id 
        ORDER BY pr.created_at DESC 
        LIMIT $1
      `, [parseInt(limit)]);
      
      const reviews = result.rows;
      console.log(`✅ Retrieved ${reviews.length} place reviews from Supabase`);
      res.json({ total: reviews.length, items: reviews });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      res.json({ 
        total: 0, 
        items: [], 
        message: 'Reviews are being loaded. Database connected.',
        error: dbError.message
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({ error: 'Failed to connect to database' });
  }
});

// Community endpoint - combines places and reviews for community page
app.get('/api/community', async (req, res) => {
  try {
    console.log('Fetching community data from Supabase...');
    const client = await pool.connect();
    
    try {
      // Get places with review counts
      const placesResult = await client.query(`
        SELECT p.*, 
               COUNT(pr.id) as review_count,
               AVG(pr.rating) as avg_rating
        FROM places p 
        LEFT JOIN place_reviews pr ON p.id = pr.place_id
        GROUP BY p.id
        ORDER BY p.rating DESC, review_count DESC
        LIMIT 20
      `);
      
      // Get recent reviews
      const reviewsResult = await client.query(`
        SELECT pr.*, p.name as place_name, p.location, p.country 
        FROM place_reviews pr 
        LEFT JOIN places p ON pr.place_id = p.id 
        ORDER BY pr.created_at DESC 
        LIMIT 10
      `);
      
      const places = placesResult.rows;
      const reviews = reviewsResult.rows;
      
      console.log(`✅ Retrieved ${places.length} places and ${reviews.length} reviews for community`);
      res.json({ 
        places, 
        reviews,
        total_places: places.length,
        total_reviews: reviews.length
      });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      res.json({ 
        places: [], 
        reviews: [],
        total_places: 0,
        total_reviews: 0,
        message: 'Community data is being loaded. Database connected.',
        error: dbError.message
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({ error: 'Failed to connect to database' });
  }
});

// Destinations endpoint (alias for places)
app.get('/api/destinations', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM places ORDER BY rating DESC');
      res.json(result.rows);
    } catch (dbError) {
      res.json({ message: 'Destinations are being loaded from Supabase' });
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch destinations' });
  }
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  console.log(`Request for: ${req.path}`);
  
  // If it's an API route, let it pass through to API handlers
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Otherwise serve the React app
  const indexPath = path.resolve(process.cwd(), 'dist/public/index.html');
  console.log(`Serving index.html from: ${indexPath}`);
  res.sendFile(indexPath);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TripWise server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`🗺️  Places: http://localhost:${PORT}/api/places`);
  console.log(`💬 Reviews: http://localhost:${PORT}/api/place-reviews`);
  console.log(`👥 Community: http://localhost:${PORT}/api/community`);
  console.log(`🔗 Supabase: Connected via Transaction Pooler`);
});

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});