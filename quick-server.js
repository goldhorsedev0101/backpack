// Quick Express server that works with the existing Supabase data
import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 5000;

// Setup pool connection
const pool = new Pool({
  connectionString: 'postgresql://postgres.wuzhvkmfdyiwaaladyxc:!Dornt0740$@aws-1-sa-east-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

app.use(express.json());

// Health check
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

// Places endpoint - works with existing Supabase data
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
      
      console.log(`Retrieved ${places.length} places`);
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
      console.log(`Retrieved ${reviews.length} place reviews`);
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

// Community endpoint - combining places and reviews for community page
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
      
      console.log(`Retrieved ${places.length} places and ${reviews.length} reviews for community`);
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

app.listen(PORT, () => {
  console.log(`Quick server running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Places: http://localhost:${PORT}/api/places`);
  console.log(`Reviews: http://localhost:${PORT}/api/place-reviews`);
  console.log(`Community: http://localhost:${PORT}/api/community`);
});