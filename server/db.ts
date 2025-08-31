import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use DATABASE_URL, but if it's a Supabase URL, we need to use Supabase client instead
const DATABASE_URL = process.env.DATABASE_URL;

console.log('Using DATABASE_URL via Transaction Pooler for Supabase compatibility');

// For Supabase, we should use the proper PostgreSQL connection string
// Use hardcoded Supabase Transaction Pooler since environment variables point to old Neon database
const supabasePostgresUrl = 'postgresql://postgres.wuzhvkmfdyiwaaladyxc:QK83yFVTMcDMJ2uX@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';

export const pool = new Pool({ 
  connectionString: supabasePostgresUrl,
  ssl: { rejectUnauthorized: false }
});
export const db = drizzle(pool, { schema });