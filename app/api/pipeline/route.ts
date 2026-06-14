import { NextRequest } from 'next/server';
import { db, pipeline } from '@/lib/db';
import { DEMO_MODE, mockPipeline } from '@/lib/mock-data';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  if (DEMO_MODE) return Response.json(mockPipeline);
  const rows = await db
    .select()
    .from(pipeline)
    .orderBy(desc(pipeline.addedAt));
  return Response.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const urls: string[] = Array.isArray(body.urls) ? body.urls : [body.url];

  const inserted = [];
  for (const url of urls) {
    if (!url) continue;
    try {
      const [row] = await db
        .insert(pipeline)
        .values({ url: url.trim(), status: 'pending', notes: body.notes })
        .onConflictDoNothing()
        .returning();
      if (row) inserted.push(row);
    } catch {
      // skip
    }
  }

  return Response.json({ added: inserted.length, items: inserted }, { status: 201 });
}
