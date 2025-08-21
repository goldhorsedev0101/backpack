// Simple test to check Supabase connection and create basic tables
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://postgres.wuzhvkmfdyiwaaladyxc:!Dornt0740$@aws-1-sa-east-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('Testing connection...');
    const client = await pool.connect();
    
    // Test basic query
    const result = await client.query('SELECT NOW()');
    console.log('Connection successful:', result.rows[0]);
    
    // Check existing tables
    const tablesResult = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);
    console.log('Existing tables:', tablesResult.rows);
    
    // Try to create a simple test table
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS test_destinations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          country VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('Test table created successfully');
      
      // Insert test data
      await client.query(`
        INSERT INTO test_destinations (name, country) 
        VALUES ('Lima', 'Peru'), ('Buenos Aires', 'Argentina')
        ON CONFLICT DO NOTHING;
      `);
      console.log('Test data inserted');
      
      // Query test data
      const testData = await client.query('SELECT * FROM test_destinations LIMIT 5');
      console.log('Test data:', testData.rows);
      
    } catch (createError) {
      console.error('Error creating test table:', createError.message);
    }
    
    client.release();
    
  } catch (error) {
    console.error('Connection error:', error.message);
  } finally {
    pool.end();
  }
}

testConnection();