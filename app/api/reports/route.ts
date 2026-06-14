import { NextRequest } from 'next/server';
import { db, reports, applications } from '@/lib/db';
import { DEMO_MODE, mockReports } from '@/lib/mock-data';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  if (DEMO_MODE) return Response.json(mockReports);
  const rows = await db
    .select()
    .from(reports)
    .orderBy(desc(reports.createdAt));
  return Response.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const [created] = await db
    .insert(reports)
    .values({
      applicationId: body.applicationId,
      company: body.company,
      role: body.role,
      slug: body.slug,
      date: body.date ?? new Date().toISOString().split('T')[0],
      score: body.score,
      legitimacy: body.legitimacy,
      url: body.url,
      content: body.content,
    })
    .returning();

  // Update application to link the report
  if (body.applicationId) {
    await db
      .update(applications)
      .set({ reportPath: `/reports/${created.id}`, hasPdf: '❌' })
      .where(eq(applications.id, body.applicationId));
  }

  return Response.json(created, { status: 201 });
}
