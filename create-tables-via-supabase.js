// Quick script to create itinerary tables via Supabase admin client
import { getSupabaseAdmin } from './server/supabase.js';

const createTables = async () => {
  const supabase = getSupabaseAdmin();
  
  try {
    console.log('Creating itineraries table...');
    
    // Create itineraries table
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS itineraries (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id varchar NOT NULL,
            title varchar NOT NULL,
            plan_json jsonb NOT NULL,
            created_at timestamp DEFAULT NOW(),
            updated_at timestamp DEFAULT NOW()
        );
      `
    });
    
    if (createTableError) {
      console.error('Error creating itineraries table:', createTableError);
    } else {
      console.log('✅ Itineraries table created successfully');
    }
    
    // Create itinerary_items table
    const { error: createItemsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (createItemsError) {
      console.error('Error creating itinerary_items table:', createItemsError);
    } else {
      console.log('✅ Itinerary_items table created successfully');
    }
    
    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
        ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
      `
    });
    
    if (rlsError) {
      console.error('Error enabling RLS:', rlsError);
    } else {
      console.log('✅ RLS enabled successfully');
    }
    
    console.log('All done! Tables created successfully.');
    
  } catch (error) {
    console.error('Error:', error);
  }
};

createTables();