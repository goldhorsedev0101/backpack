export const config = {
  // Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  
  // Database configuration 
  database: {
    url: process.env.DATABASE_URL || '',
  },

  // Server configuration
  server: {
    port: Number(process.env.PORT) || 5000,
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // API Keys
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },

  // Security
  session: {
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  },
} as const;

// Validation function
export function validateConfig() {
  const required = [
    'DATABASE_URL',
    'SUPABASE_URL', 
    'SUPABASE_ANON_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}