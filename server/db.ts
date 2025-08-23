import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use Transaction Pooler address to fix Supabase connection from Replit
const DATABASE_URL = process.env.DATABASE_URL.includes('pooler.supabase.com') 
  ? process.env.DATABASE_URL 
  : 'postgresql://postgres.wuzhvkmfdyiwaaladyxc:!Dornt0740$@aws-1-sa-east-1.pooler.supabase.com:6543/postgres';

console.log('Using DATABASE_URL via Transaction Pooler for Supabase compatibility');

export const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
export const db = drizzle(pool, { schema });