// server/supabase.ts - Singleton Supabase client for server-side operations
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config.js';

// Singleton pattern - create client once only
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseInstance) {
    console.log('Creating Supabase admin client...');
    supabaseInstance = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey,
      {
        auth: { persistSession: false },
        db: { schema: 'public' },
        global: {
          headers: {
            'User-Agent': 'BackpackBuddy/1.0'
          }
        }
      }
    );
  }
  return supabaseInstance;
}

// Legacy export for backward compatibility
export const supabaseAdmin = getSupabaseAdmin();

// Database table inspection and count helper
export async function getActualTables() {
  const supabase = getSupabaseAdmin();
  
  // Test each expected table to see which ones actually exist
  const expectedTables = [
    'destinations', 'accommodations', 'attractions', 'restaurants', 
    'places', 'place_reviews', 'location_photos', 'location_ancestors',
    'users', 'sessions', 'trips', 'expenses', 'achievements',
    'chat_rooms', 'messages', 'user_connections', 'travel_buddy_posts',
    'itineraries', 'itinerary_items',
    'raw_responses', 'ingestion_runs', 'ingestion_jobs', 'ingestion_dead_letters'
  ];

  return await getTableCountsForTables(expectedTables);
}

async function getTableCountsForTables(tables: string[]) {
  const supabase = getSupabaseAdmin();
  const tableCounts = [];

  for (const tableName of tables) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      tableCounts.push({
        table_name: tableName,
        approx_row_count: error ? 0 : (count || 0),
        error: error ? error.message : undefined
      });
    } catch (error) {
      tableCounts.push({
        table_name: tableName,
        approx_row_count: 0,
        error: 'Access denied'
      });
    }
  }

  return tableCounts.sort((a, b) => b.approx_row_count - a.approx_row_count);
}

async function getTableCountsFallback() {
  const expectedTables = [
    'destinations', 'accommodations', 'attractions', 'restaurants', 
    'places', 'place_reviews', 'location_photos', 'location_ancestors',
    'users', 'sessions', 'trips', 'expenses', 'achievements',
    'chat_rooms', 'messages', 'user_connections', 'travel_buddy_posts',
    'raw_responses', 'ingestion_runs', 'ingestion_jobs', 'ingestion_dead_letters'
  ];

  return await getTableCountsForTables(expectedTables);
}

// Legacy export
export const getTableCounts = getActualTables;

// Storage operations for file uploads
export async function uploadFile(bucket: string, fileName: string, file: Buffer, contentType: string) {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      contentType,
      upsert: true // Allow overwriting files with same name
    });

  if (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }

  return data;
}

export async function getFileUrl(bucket: string, fileName: string) {
  const supabase = getSupabaseAdmin();
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function deleteFile(bucket: string, fileName: string) {
  const supabase = getSupabaseAdmin();
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([fileName]);

  if (error) {
    throw new Error(`File deletion failed: ${error.message}`);
  }

  return true;
}

// Create storage bucket if it doesn't exist
export async function ensureBucketExists(bucketName: string) {
  const supabase = getSupabaseAdmin();
  
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError.message);
      return false;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true, // Make files publicly accessible
        allowedMimeTypes: ['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.*'],
        fileSizeLimit: 10 * 1024 * 1024 // 10MB limit
      });

      if (createError) {
        console.error('Error creating bucket:', createError.message);
        return false;
      }

      console.log(`Storage bucket '${bucketName}' created successfully`);
    }

    return true;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    return false;
  }
}