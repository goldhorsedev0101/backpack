// src/health/communityCheck.ts - Community Health Check
import { supabaseAdmin } from '../../server/supabase.js';
import { config } from '../../server/config.js';

interface TableResult {
  rows: any[];
  count: number;
  error?: string;
}

interface HealthCheckResult {
  chat_rooms: TableResult;
  messages: TableResult;
  travel_buddy_posts: TableResult;
  chat_room_members?: TableResult;
  chat_attachments?: TableResult;
  test_insert?: {
    success: boolean;
    error?: string;
  };
}

async function checkTable(tableName: string, limit = 5): Promise<TableResult> {
  try {
    const supabase = supabaseAdmin;
    
    // Get count first
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return { rows: [], count: 0, error: countError.message };
    }

    // Get sample rows
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { rows: [], count: count || 0, error: error.message };
    }

    return { rows: data || [], count: count || 0 };
  } catch (error) {
    return { 
      rows: [], 
      count: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function testInsert(): Promise<{ success: boolean; error?: string }> {
  const allowDevWrites = process.env.ALLOW_DEV_WRITES === 'true';
  
  if (!allowDevWrites) {
    return { success: false, error: 'ALLOW_DEV_WRITES not enabled' };
  }

  try {
    const supabase = supabaseAdmin;
    
    // Try to insert a test message
    const testMessage = {
      room_id: 1, // Assuming room 1 exists or using fallback
      content: `[TEST] Health check - ${new Date().toISOString()}`,
      author_name: 'Health Check Bot',
      user_id: null
    };

    const { error } = await supabase
      .from('messages')
      .insert([testMessage]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function runCommunityHealthCheck(): Promise<HealthCheckResult> {
  console.log('🔍 Running Community Health Check...\n');

  const result: HealthCheckResult = {
    chat_rooms: await checkTable('chat_rooms'),
    messages: await checkTable('messages'),
    travel_buddy_posts: await checkTable('travel_buddy_posts')
  };

  // Optional tables
  result.chat_room_members = await checkTable('chat_room_members');
  result.chat_attachments = await checkTable('chat_attachments');

  // Test insert if enabled
  if (process.env.ALLOW_DEV_WRITES === 'true') {
    result.test_insert = await testInsert();
  }

  return result;
}

function printResults(result: HealthCheckResult) {
  console.log('📊 Community Health Check Results\n');
  console.log('=====================================\n');

  // Print each table result
  Object.entries(result).forEach(([tableName, tableResult]) => {
    if (tableName === 'test_insert') {
      console.log(`🧪 Test Insert:`);
      if (tableResult.success) {
        console.log('   ✅ SUCCESS - Can write to messages table');
      } else {
        console.log(`   ❌ FAILED - ${tableResult.error}`);
      }
      console.log('');
      return;
    }

    const { rows, count, error } = tableResult as TableResult;
    
    console.log(`📋 ${tableName}:`);
    if (error) {
      console.log(`   ❌ ERROR: ${error}`);
    } else {
      console.log(`   📈 Total Count: ${count}`);
      console.log(`   📄 Sample Rows: ${rows.length}`);
      
      if (rows.length > 0) {
        console.log('   🔍 Recent entries:');
        rows.slice(0, 3).forEach((row, i) => {
          const id = row.id || '?';
          const name = row.name || row.content?.substring(0, 50) || row.title || '?';
          const date = row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '?';
          console.log(`      ${i + 1}. ID: ${id} | ${name} | ${date}`);
        });
      }
    }
    console.log('');
  });

  console.log('=====================================');
  console.log('💡 Next Steps:');
  console.log('   • If tables are missing, run the SQL scripts in scripts/sql/');
  console.log('   • If RLS blocks writes, check docs/community-rls.md');
  console.log('   • For storage setup, run: npm run dev:setup:storage');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCommunityHealthCheck()
    .then(printResults)
    .catch(console.error);
}