import { NextRequest } from 'next/server';
import { eq, inArray } from 'drizzle-orm';
import { scanPortals, DEFAULT_TARGETS, type ScanTarget } from '@/lib/scanner';
import { db, profile, scanHistory, pipeline as pipelineTable } from '@/lib/db';
import { buildTitleFilterFromProfile } from '@/lib/build-title-filter';
import {
  fingerprintCv,
  LAST_SCANNED_CV_FINGERPRINT_KEY,
  shouldClearPendingJobs,
} from '@/lib/scan-cv-state';

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

    // Explicit filter from the request wins; otherwise derive from CV + target role.
    const derived = await buildTitleFilterFromProfile();
    const titleFilter: string[] = Array.isArray(body.titleFilter)
      ? body.titleFilter
      : derived.titleFilter;

    if (targets.length === 0) {
      return Response.json({ error: 'Select at least one company to scan.' }, { status: 400 });
    }

    const currentFingerprint = fingerprintCv(derived.cv);
    const [storedFingerprint] = await db
      .select({ value: profile.value })
      .from(profile)
      .where(eq(profile.key, LAST_SCANNED_CV_FINGERPRINT_KEY))
      .limit(1);

    let clearedPending = 0;
    if (shouldClearPendingJobs(storedFingerprint?.value, currentFingerprint)) {
      const pendingRows = await db
        .select({ url: pipelineTable.url })
        .from(pipelineTable)
        .where(eq(pipelineTable.status, 'pending'));
      const pendingUrls = pendingRows.map(row => row.url);

      await db.delete(pipelineTable).where(eq(pipelineTable.status, 'pending'));
      if (pendingUrls.length > 0) {
        await db.delete(scanHistory).where(inArray(scanHistory.url, pendingUrls));
      }
      clearedPending = pendingUrls.length;
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

    await db
      .insert(profile)
      .values({ key: LAST_SCANNED_CV_FINGERPRINT_KEY, value: currentFingerprint })
      .onConflictDoUpdate({
        target: profile.key,
        set: { value: currentFingerprint, updatedAt: new Date() },
      });

    return Response.json({
      found: jobs.length,
      added,
      clearedPending,
      titleFilter,
      hasCv: Boolean(derived.cv),
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
