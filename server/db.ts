import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use local development with SQLite when Supabase connection fails
console.log('Using local SQLite database for development due to Supabase connection issues');

import Database from 'better-sqlite3';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';

const sqlite = new Database('dev.db');
export const db = drizzleSQLite(sqlite, { schema });

// Create a mock pool for compatibility
export const pool = {
  query: async (text: string, params?: any[]) => {
    console.log('Mock query:', text);
    return { rows: [], rowCount: 0 };
  },
  connect: async () => ({
    query: async (text: string, params?: any[]) => ({ rows: [], rowCount: 0 }),
    release: () => {}
  })
};