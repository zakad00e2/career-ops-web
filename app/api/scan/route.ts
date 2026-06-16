import { NextRequest } from 'next/server';
import { scanPortals, DEFAULT_TARGETS, type ScanTarget } from '@/lib/scanner';
import { db, scanHistory, pipeline as pipelineTable, profile } from '@/lib/db';
import { deriveTitleFilter } from '@/lib/title-filter';

// Reads the CV + target role from the profile table and turns them into scan
// title keywords. Re-runs every scan, so editing the CV in Settings changes results.
async function cvTitleFilter(): Promise<string[]> {
  try {
    const rows = await db.select().from(profile);
    const map: Record<string, string> = {};
    for (const row of rows) map[row.key] = row.value;
    return deriveTitleFilter(map.cv, map.targetRole);
  } catch {
    return [];
  }
}

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const requestedCompanies = Array.isArray(body.companies)
      ? body.companies
        .filter((company: unknown): company is string => typeof company === 'string')
        .map((company: string) => company.trim().toLowerCase())
        .filter(Boolean)
      : [];
    const selectedTargets = requestedCompanies.length > 0
      ? DEFAULT_TARGETS.filter(target => requestedCompanies.includes(target.company.toLowerCase()))
      : DEFAULT_TARGETS;
    const targets: ScanTarget[] = Array.isArray(body.targets) ? body.targets : selectedTargets;
    // Explicit filter from the request wins; otherwise derive it from the CV.
    const titleFilter: string[] = Array.isArray(body.titleFilter)
      ? body.titleFilter
      : await cvTitleFilter();

    if (targets.length === 0) {
      return Response.json({ error: 'Select at least one company to scan.' }, { status: 400 });
    }

    const existingHistory = await db.select({ url: scanHistory.url }).from(scanHistory);
    const knownUrls = new Set(existingHistory.map(r => r.url));

    const jobs = await scanPortals(targets, titleFilter, knownUrls);

    let added = 0;
    for (const job of jobs) {
      try {
        await db.insert(scanHistory).values({
          url: job.url,
          company: job.company,
          title: job.title,
        }).onConflictDoNothing();

        await db.insert(pipelineTable).values({
          url: job.url,
          status: 'pending',
          notes: `${job.company} — ${job.title}${job.location ? ` (${job.location})` : ''}`,
        }).onConflictDoNothing();

        added++;
      } catch {
        // skip duplicates
      }
    }

    return Response.json({
      found: jobs.length,
      added,
      jobs: jobs.slice(0, 50),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const history = await db
    .select()
    .from(scanHistory)
    .orderBy(scanHistory.scannedAt)
    .limit(100);
  return Response.json(history);
}
