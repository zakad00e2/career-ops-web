import { db, profile } from '@/lib/db';

/** Load key/value profile fields from the database (CV, targetRole, etc.). */
export async function loadProfileFromDb(): Promise<Record<string, string>> {
  const rows = await db.select().from(profile);
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}
