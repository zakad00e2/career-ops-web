import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { isDbConfigured } from './config';
import * as schema from './schema';

function getDb() {
  if (!isDbConfigured()) {
    // No throw at import time — pages/API routes use mock data when isDemoMode()
    return null as unknown as ReturnType<typeof drizzle>;
  }
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql, { schema });
}

export const db = getDb();
export * from './schema';
