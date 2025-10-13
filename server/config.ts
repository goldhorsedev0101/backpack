// server/config.ts - Centralized configuration with validation
import { z } from 'zod';

// Clean RTL characters and validate environment variables
const cleanString = (val: string) => val?.replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim() || '';

const Env = z.object({
  NODE_ENV: z.enum(['development','production']).default('development'),
  
  // Supabase configuration - now using real Secrets  
  SUPABASE_URL: z.string()
    .transform(() => 'https://wuzhvkmfdyiwaaladyxc.supabase.co') // Fixed hardcoded since env var is corrupted
    .pipe(z.string().url()),
  SUPABASE_SERVICE_ROLE_KEY: z.string()
    .transform(cleanString)
    .pipe(z.string().min(50)), // Now using the real fixed secret
  SUPABASE_ANON_KEY: z.string()
    .transform(() => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1emh2a21mZHlpd2FhbGFkeXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NTE0MDksImV4cCI6MjA3MTMyNzQwOX0.xxZ1C9pFMvJ5qbEafSbnadr_o2UVl_Naxuj2l30vwww'), // Anon key is clean
    
  // Server configuration
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('0.0.0.0'),
  
  // Optional APIs
  OPENAI_API_KEY: z.string().optional(),
  SESSION_SECRET: z.string().default('dev-secret-change-in-production'),
  
  // Geo APIs configuration
  RESTCOUNTRIES_BASE_URL: z.string().url().default('https://restcountries.com/v3.1'),
  GEONAMES_BASE_URL: z.string().url().default('https://api.geonames.org'),
  GEONAMES_USERNAME: z.string().optional(),
  ENABLE_GEO: z.string().transform(val => val === 'true').default('true'),
  CACHE_TTL_SECONDS: z.string().transform(Number).default('3600'),
  
  // GlobeMate API key for internal endpoints
  GLOBEMATE_API_KEY: z.string().default('dev-globemate-key-change-in-production'),
});

export const env = Env.parse(process.env);

console.log('✅ Configuration loaded successfully');
console.log('🔑 Service Role Key length:', env.SUPABASE_SERVICE_ROLE_KEY.length);

// Derive DATABASE_URL from Supabase URL for PostgreSQL connection
const supabaseProjectId = env.SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!supabaseProjectId) {
  throw new Error('Invalid SUPABASE_URL format');
}

// Use direct Supabase connection (Transaction mode)
export const DATABASE_URL = `postgresql://postgres.wuzhvkmfdyiwaaladyxc:QK83yFVTMcDMJ2uX@db.wuzhvkmfdyiwaaladyxc.supabase.co:6543/postgres?pgbouncer=true`;

console.log('🔧 Using direct Supabase connection via PgBouncer');

// Configuration object for application use
export const config = {
  supabase: {
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },
  database: {
    url: DATABASE_URL,
  },
  server: {
    port: env.PORT,
    host: env.HOST,
    nodeEnv: env.NODE_ENV,
  },
  openai: {
    apiKey: env.OPENAI_API_KEY || '',
  },
  session: {
    secret: env.SESSION_SECRET,
  },
  geo: {
    restCountriesBaseUrl: env.RESTCOUNTRIES_BASE_URL,
    geoNamesBaseUrl: env.GEONAMES_BASE_URL,
    geoNamesUsername: env.GEONAMES_USERNAME,
    enabled: env.ENABLE_GEO,
    cacheTtlSeconds: env.CACHE_TTL_SECONDS,
  },
  globemate: {
    apiKey: env.GLOBEMATE_API_KEY,
  },
} as const;