import { NextRequest } from 'next/server';
import { db, applications } from '@/lib/db';
import { DEMO_MODE, mockApplications } from '@/lib/mock-data';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  if (DEMO_MODE) return Response.json(mockApplications);
  const rows = await db
    .select()
    .from(applications)
    .orderBy(desc(applications.createdAt));
  return Response.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const maxNumResult = await db
    .select({ num: applications.num })
    .from(applications)
    .orderBy(desc(applications.num))
    .limit(1);
  const nextNum = maxNumResult.length > 0 ? maxNumResult[0].num + 1 : 1;

  const [created] = await db
    .insert(applications)
    .values({
      num: body.num ?? nextNum,
      date: body.date ?? new Date().toISOString().split('T')[0],
      company: body.company,
      role: body.role,
      score: body.score,
      status: body.status ?? 'Evaluated',
      hasPdf: body.hasPdf ?? '❌',
      reportPath: body.reportPath,
      notes: body.notes,
      url: body.url,
    })
    .returning();

  return Response.json(created, { status: 201 });
}
