// server/config.ts
import { z } from 'zod';

const Env = z.object({
  NODE_ENV: z.enum(['development','production']).default('development'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  SUPABASE_ANON_KEY: z.string().min(20),
  DATABASE_URL: z.string().min(10).optional(), // אופציונלי אם יש Drizzle/pg
  PORT: z.string().transform(Number).default('5000'),
  HOST: z.string().default('0.0.0.0'),
  OPENAI_API_KEY: z.string().optional(),
  SESSION_SECRET: z.string().default('dev-secret-change-in-production'),
});

export const env = Env.parse(process.env);

// Legacy config object for backward compatibility
export const config = {
  supabase: {
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },
  database: {
    url: env.DATABASE_URL || '',
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
} as const;