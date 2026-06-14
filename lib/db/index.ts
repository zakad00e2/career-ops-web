import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes('user:password@host')) {
    if (process.env.DEMO_MODE === 'true') {
      // Return null — pages will fall back to mock data
      return null as unknown as ReturnType<typeof drizzle>;
    }
    throw new Error(
      'DATABASE_URL not configured. Either:\n' +
      '1. Set DATABASE_URL in .env.local (get free DB at neon.tech)\n' +
      '2. Set DEMO_MODE=true in .env.local to use mock data'
    );
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}

export const db = getDb();
export * from './schema';
