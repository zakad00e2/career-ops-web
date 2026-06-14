import { NextRequest } from 'next/server';
import { db, reports } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.id, parseInt(id)));
  if (!report) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(report);
}
