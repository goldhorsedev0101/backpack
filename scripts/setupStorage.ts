// scripts/setupStorage.ts - DEV Storage Setup
// Run with: tsx scripts/setupStorage.ts
// Requires SUPABASE_SERVICE_KEY in environment

import { createClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'chat-uploads';

interface SetupResult {
  bucketExists: boolean;
  bucketCreated: boolean;
  policies: {
    created: string[];
    errors: string[];
  };
  error?: string;
}

async function setupChatStorage(): Promise<SetupResult> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return {
      bucketExists: false,
      bucketCreated: false,
      policies: { created: [], errors: [] },
      error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables'
    };
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });

  const result: SetupResult = {
    bucketExists: false,
    bucketCreated: false,
    policies: { created: [], errors: [] }
  };

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      result.error = `Failed to list buckets: ${listError.message}`;
      return result;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    result.bucketExists = bucketExists;

    if (!bucketExists) {
      // Create bucket
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false, // Recommended: use signed URLs for access control
        allowedMimeTypes: [
          'image/*',
          'application/pdf',
          'text/*',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.*',
          'application/zip',
          'application/x-zip-compressed'
        ],
        fileSizeLimit: 10 * 1024 * 1024 // 10MB
      });

      if (createError) {
        result.error = `Failed to create bucket: ${createError.message}`;
        return result;
      }

      result.bucketCreated = true;
      console.log(`✅ Created bucket: ${BUCKET_NAME}`);
    } else {
      console.log(`ℹ️  Bucket already exists: ${BUCKET_NAME}`);
    }

    // Create storage policies (DEV mode - adjust for PROD)
    const policies = [
      {
        name: 'dev_upload_chat_files',
        sql: `
          CREATE POLICY IF NOT EXISTS "dev_upload_chat_files" 
          ON storage.objects FOR INSERT 
          WITH CHECK (bucket_id = '${BUCKET_NAME}');
        `
      },
      {
        name: 'dev_view_chat_files',
        sql: `
          CREATE POLICY IF NOT EXISTS "dev_view_chat_files" 
          ON storage.objects FOR SELECT 
          USING (bucket_id = '${BUCKET_NAME}');
        `
      },
      {
        name: 'dev_delete_chat_files',
        sql: `
          CREATE POLICY IF NOT EXISTS "dev_delete_chat_files" 
          ON storage.objects FOR DELETE 
          USING (bucket_id = '${BUCKET_NAME}');
        `
      }
    ];

    // Apply policies
    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
        if (error) {
          result.policies.errors.push(`${policy.name}: ${error.message}`);
        } else {
          result.policies.created.push(policy.name);
        }
      } catch (error) {
        // Fallback: policies might need to be created manually
        result.policies.errors.push(`${policy.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return result;

  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown setup error';
    return result;
  }
}

function printResults(result: SetupResult) {
  console.log('\n🗂️  Storage Setup Results');
  console.log('========================\n');

  if (result.error) {
    console.log(`❌ Setup failed: ${result.error}`);
    return;
  }

  console.log(`📦 Bucket "${BUCKET_NAME}":`);
  if (result.bucketCreated) {
    console.log('   ✅ Created successfully');
  } else if (result.bucketExists) {
    console.log('   ℹ️  Already exists');
  } else {
    console.log('   ❌ Not found and creation failed');
  }

  console.log('\n🔒 Storage Policies:');
  if (result.policies.created.length > 0) {
    result.policies.created.forEach(policy => {
      console.log(`   ✅ ${policy}`);
    });
  }

  if (result.policies.errors.length > 0) {
    console.log('\n⚠️  Policy Errors (might need manual setup):');
    result.policies.errors.forEach(error => {
      console.log(`   ❌ ${error}`);
    });
    console.log('\n💡 If policies failed, you may need to:');
    console.log('   1. Enable RLS on storage.objects table');
    console.log('   2. Manually create policies in Supabase dashboard');
    console.log('   3. See docs/community-rls.md for examples');
  }

  console.log('\n✨ Next Steps:');
  console.log('   • Test file uploads in your app');
  console.log('   • Adjust policies for production (see docs/community-rls.md)');
  console.log('   • Consider signed URLs for private access');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Setting up Supabase Storage for Chat Uploads...');
  
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  WARNING: Running storage setup in production mode!');
    console.log('   Make sure this is intentional and you have backups.');
  }

  setupChatStorage()
    .then(printResults)
    .catch(console.error);
}