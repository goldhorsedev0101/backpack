// Simple test to fix the API endpoints to work with existing Supabase data
const express = require('express');
const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  connectionString: 'postgresql://postgres.wuzhvkmfdyiwaaladyxc:!Dornt0740$@aws-1-sa-east-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const app = express();

// Simple places endpoint
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

// Simple reviews endpoint
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Simple test server running on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/api/places`);
  console.log(`Test: http://localhost:${PORT}/api/place-reviews`);
});