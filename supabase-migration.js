import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

// Configuration for Supabase connection
const supabaseUrl = process.env.DATABASE_URL;
console.log('Attempting to connect to Supabase...');
console.log('URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'Not found');

async function testSupabaseConnection() {
  try {
    const pool = new Pool({ connectionString: supabaseUrl });
    const client = await pool.connect();
    
    console.log('✅ Connected to Supabase successfully!');
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('Current time from Supabase:', result.rows[0].current_time);
    
    // Check existing tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Existing tables in Supabase:', tablesResult.rows.map(r => r.table_name));
    
    client.release();
    pool.end();
    
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error.message);
    return false;
  }
}

async function exportExistingData() {
  console.log('Exporting existing data from current database...');
  
  // Export commands for critical tables
  const exportCommands = [
    'SELECT COUNT(*) FROM users',
    'SELECT COUNT(*) FROM place_reviews', 
    'SELECT COUNT(*) FROM chat_rooms',
    'SELECT COUNT(*) FROM travel_buddy_posts'
  ];
  
  // This would connect to the old database and export data
  console.log('Data export commands prepared:', exportCommands);
}

async function main() {
  console.log('🚀 Starting Supabase migration process...');
  
  const connected = await testSupabaseConnection();
  
  if (connected) {
    console.log('✅ Supabase connection successful!');
    console.log('📤 Ready to migrate data to Supabase');
    await exportExistingData();
  } else {
    console.log('❌ Cannot connect to Supabase. Please check:');
    console.log('1. DATABASE_URL is correct in secrets');
    console.log('2. Supabase project is active');
    console.log('3. Network connectivity from Replit to Supabase');
  }
}

main().catch(console.error);