import { NextRequest } from 'next/server';
import { db, applications } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const [updated] = await db
    .update(applications)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where(eq(applications.id, parseInt(id)))
    .returning();

  if (!updated) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(applications).where(eq(applications.id, parseInt(id)));
  return new Response(null, { status: 204 });
}
