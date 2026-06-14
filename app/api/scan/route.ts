import { NextRequest } from 'next/server';
import { scanPortals, DEFAULT_TARGETS, ScanTarget } from '@/lib/scanner';
import { db, scanHistory, pipeline as pipelineTable } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targets: ScanTarget[] = body.targets ?? DEFAULT_TARGETS;
    const titleFilter: string[] = body.titleFilter ?? [];

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
