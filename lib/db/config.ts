/** Shared DB / demo-mode detection — safe to import at build time (no DB connection). */
export function isDbConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  return Boolean(url && !url.includes('user:password@host') && process.env.DEMO_MODE !== 'true');
}

export function isDemoMode(): boolean {
  return !isDbConfigured();
}
