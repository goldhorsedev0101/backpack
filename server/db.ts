// server/db.ts - Database connection using Drizzle ORM with Supabase
import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema.js";
import { config, DATABASE_URL } from './config.js';

console.log('Connecting to Supabase via Transaction Pooler...');

// Use singleton pattern for connection pool
let poolInstance: typeof Pool.prototype | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getPool() {
  if (!poolInstance) {
    poolInstance = new Pool({ 
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10, // Maximum connections in pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Increased from 2000 to 10000ms for Supabase
    });
  }
  return poolInstance;
}

export function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(getPool(), { schema });
  }
  return dbInstance;
}

// Legacy exports for backward compatibility
export const pool = getPool();
export const db = getDb();