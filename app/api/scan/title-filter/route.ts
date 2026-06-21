import { buildTitleFilterFromProfile } from '@/lib/build-title-filter';

export const runtime = 'nodejs';

/** Preview which job-title keywords the next scan will use (derived from CV + target role). */
export async function GET() {
  const { titleFilter, cv, targetRole } = await buildTitleFilterFromProfile();

  return Response.json({
    titleFilter,
    hasCv: Boolean(cv),
    hasTargetRole: Boolean(targetRole),
  });
}
