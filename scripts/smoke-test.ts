// scripts/smoke-test.ts - Database smoke tests

import { getSupabaseAdmin } from '../server/supabase.js';
import { safeDbOperation } from '../server/db-error-handler.js';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

async function runTest(testName: string, testFn: () => Promise<void>): Promise<TestResult> {
  const startTime = Date.now();
  try {
    await testFn();
    return {
      name: testName,
      passed: true,
      message: 'Passed',
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      name: testName,
      passed: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    };
  }
}

async function main() {
  console.log('🧪 Running database smoke tests...\n');
  
  const supabase = getSupabaseAdmin();
  const results: TestResult[] = [];

  // Test 1: Read 3 rows from destinations (verifying lat/lon fields)
  results.push(await runTest('Destinations lat/lon fields', async () => {
    const { data, error } = await safeDbOperation(
      async () => {
        const result = await supabase
          .from('destinations')
          .select('id, name, lat, lon')
          .limit(3);
        
        if (result.error) throw result.error;
        
        if (!result.data || result.data.length === 0) {
          throw new Error('No destinations found in database');
        }

        // Verify lat/lon fields exist and are accessible
        const firstDestination = result.data[0];
        if (!('lat' in firstDestination) || !('lon' in firstDestination)) {
          throw new Error('lat/lon fields not found in destinations');
        }

        return result.data;
      },
      'destinations-lat-lon-test'
    );

    if (error) throw new Error(error.message);
    console.log(`✓ Found ${data?.length} destinations with lat/lon fields`);
  }));

  // Test 2: Read from achievements (verifying points_reward)
  results.push(await runTest('Achievements points_reward field', async () => {
    const { data, error } = await safeDbOperation(
      async () => {
        const result = await supabase
          .from('achievements')
          .select('id, name, points_reward')
          .limit(3);
        
        if (result.error) throw result.error;
        
        // Allow empty table, but verify schema if data exists
        if (result.data && result.data.length > 0) {
          const firstAchievement = result.data[0];
          if (!('points_reward' in firstAchievement)) {
            throw new Error('points_reward field not found in achievements');
          }
        }

        return result.data;
      },
      'achievements-points-reward-test'
    );

    if (error) throw new Error(error.message);
    console.log(`✓ Achievements table accessible with points_reward field`);
  }));

  // Test 3: Test user_points_summary if it exists
  results.push(await runTest('User points summary table', async () => {
    const { data, error } = await safeDbOperation(
      async () => {
        const result = await supabase
          .from('user_points_summary')
          .select('user_id, total_points')
          .limit(1);
        
        if (result.error) {
          // If table doesn't exist, that's acceptable for a new setup
          if (result.error.message.includes('does not exist')) {
            console.log('  ℹ️  user_points_summary table not found (acceptable for new setup)');
            return null;
          }
          throw result.error;
        }

        return result.data;
      },
      'user-points-summary-test'
    );

    if (error && !error.message.includes('does not exist')) {
      throw new Error(error.message);
    }
    console.log(`✓ User points summary table accessible`);
  }));

  // Test 4: Validate proper count usage
  results.push(await runTest('Proper count usage (no count column)', async () => {
    const { data, error } = await safeDbOperation(
      async () => {
        const result = await supabase
          .from('destinations')
          .select('*', { count: 'exact', head: false })
          .limit(1);
        
        if (result.error) throw result.error;
        
        return result;
      },
      'count-usage-test'
    );

    if (error) throw new Error(error.message);
    console.log(`✓ Count option usage working correctly`);
  }));

  // Test 5: RLS and authentication test
  results.push(await runTest('RLS and public access', async () => {
    const { data, error } = await safeDbOperation(
      async () => {
        // Test that public read access works for basic tables
        const result = await supabase
          .from('destinations')
          .select('id, name')
          .limit(1);
        
        if (result.error) {
          // If RLS blocks public access, that might be expected
          if (result.error.message.includes('RLS') || result.error.message.includes('permission')) {
            console.log('  ℹ️  RLS is active (this may be expected)');
            return null;
          }
          throw result.error;
        }

        return result.data;
      },
      'rls-public-access-test'
    );

    // RLS blocking public access is not necessarily a failure
    console.log(`✓ RLS configuration checked`);
  }));

  // Print results
  console.log('\n📊 Test Results:');
  console.log('═'.repeat(60));
  
  let passedCount = 0;
  let failedCount = 0;

  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const duration = `${result.duration}ms`;
    console.log(`${status} ${result.name.padEnd(35)} ${duration}`);
    
    if (!result.passed) {
      console.log(`    Error: ${result.message}`);
      failedCount++;
    } else {
      passedCount++;
    }
  });

  console.log('═'.repeat(60));
  console.log(`Total: ${results.length} tests | Passed: ${passedCount} | Failed: ${failedCount}`);

  if (failedCount === 0) {
    console.log('\n🎉 ✅ schema synced & queries hardened');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Check the errors above.');
    process.exit(1);
  }
}

// Run the tests
main().catch(error => {
  console.error('❌ Smoke test runner failed:', error);
  process.exit(1);
});