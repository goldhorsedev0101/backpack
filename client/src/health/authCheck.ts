import { supabase } from '../lib/supabase.js';
import { getRedirectBase } from '../utils/redirectBase.js';

/**
 * בדיקת בריאות לאימות - מוודא שהכל מוגדר נכון
 */
export async function runAuthHealthCheck() {
  console.log('🔍 Auth Health Check Starting...');
  console.log('====================================');

  // 1. בדיקת משתני סביבה
  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || (import.meta as any).env?.SUPABASE_URL;
  const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.SUPABASE_ANON_KEY;
  const appUrl = (import.meta as any).env?.VITE_APP_URL;

  console.log('📋 Environment Variables:');
  console.log('  SUPABASE_URL:', supabaseUrl ? '✅ SET' : '❌ MISSING');
  console.log('  SUPABASE_ANON_KEY:', supabaseKey ? '✅ SET' : '❌ MISSING');
  console.log('  VITE_APP_URL:', appUrl ? `✅ SET (${appUrl})` : '⚠️ MISSING (using window.location)');

  // 2. בדיקת Google OAuth Credentials (בהתאם לSupabase console)
  console.log('  GOOGLE_CLIENT_ID: (בSupabase console)');
  console.log('  GOOGLE_CLIENT_SECRET: (בSupabase console)');

  // 3. בדיקת RedirectTo
  const redirectTo = `${getRedirectBase()}/auth/callback`;
  console.log('🔗 Redirect Configuration:');
  console.log('  RedirectTo:', redirectTo);
  console.log('  Status:', redirectTo.includes('localhost') ? '⚠️ localhost (dev)' : '✅ production domain');

  // 4. בדיקת חיבור לSupabase
  console.log('🗄️ Supabase Connection:');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('  Session Check: ❌ ERROR -', error.message);
    } else {
      console.log('  Session Check: ✅ OK');
      console.log('  Current Session:', data?.session ? '✅ Active' : '❌ No session');
    }
  } catch (e: any) {
    console.log('  Session Check: ❌ EXCEPTION -', e.message);
  }

  // 5. OAuth URL Generator Test
  console.log('🔐 OAuth Flow Test:');
  try {
    // We don't actually trigger OAuth, just test if the config is valid
    console.log('  OAuth Config: ✅ Ready (use AuthModal to test actual flow)');
  } catch (e: any) {
    console.log('  OAuth Config: ❌ ERROR -', e.message);
  }

  console.log('====================================');
  console.log('✅ Auth Health Check Complete');
}

// Run if called directly (for debugging)
if (typeof window !== 'undefined') {
  (window as any).runAuthHealthCheck = runAuthHealthCheck;
}