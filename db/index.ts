import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV === "production") {
  console.warn("Upozorenje: DATABASE_URL nije definisan!");
}

const sql = neon(connectionString || "");
export const db = drizzle(sql, { schema });