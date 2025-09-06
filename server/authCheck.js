// Auth Health Check for Server-side ENV variables
console.log('🔍 Server Auth Health Check Starting...');
console.log('====================================');

// Check server environment variables
console.log('📋 Server Environment Variables:');
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✅ SET' : '❌ MISSING');
console.log('  SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ SET' : '❌ MISSING');
console.log('  SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ SET' : '❌ MISSING');
console.log('  SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ SET' : '❌ MISSING');

// Google OAuth (if using server-side config)
console.log('  GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ SET' : '⚠️ MISSING (check Supabase console)');
console.log('  GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ SET' : '⚠️ MISSING (check Supabase console)');

// Replit specific
console.log('  REPL_SLUG:', process.env.REPL_SLUG ? `✅ ${process.env.REPL_SLUG}` : '❌ Not on Replit');
console.log('  REPLIT_DOMAINS:', process.env.REPLIT_DOMAINS ? `✅ ${process.env.REPLIT_DOMAINS}` : '❌ MISSING');

console.log('====================================');
console.log('✅ Server Auth Health Check Complete');
console.log('💡 Run client-side: runAuthHealthCheck() in browser console');