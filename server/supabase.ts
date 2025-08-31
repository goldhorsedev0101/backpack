import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

// Public client - for client-side operations
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// Admin client - for server-side operations with elevated permissions
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Database table count helper using Supabase
export async function getTableCounts() {
  const tables = [
    'destinations', 'accommodations', 'attractions', 'restaurants', 
    'places', 'place_reviews', 'location_photos', 'location_ancestors',
    'users', 'sessions', 'trips', 'expenses', 'achievements',
    'chat_rooms', 'messages', 'user_connections', 'travel_buddy_posts',
    'raw_responses', 'ingestion_runs', 'ingestion_jobs', 'ingestion_dead_letters'
  ];

  const tableCounts = [];

  for (const tableName of tables) {
    try {
      const { count, error } = await supabaseAdmin
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        tableCounts.push({
          table_name: tableName,
          approx_row_count: 0,
          error: 'Table not found or inaccessible'
        });
      } else {
        tableCounts.push({
          table_name: tableName,
          approx_row_count: count || 0
        });
      }
    } catch (error) {
      tableCounts.push({
        table_name: tableName,
        approx_row_count: 0,
        error: 'Access denied or table not found'
      });
    }
  }

  return tableCounts.sort((a, b) => b.approx_row_count - a.approx_row_count);
}