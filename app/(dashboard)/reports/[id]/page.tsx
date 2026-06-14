export const dynamic = 'force-dynamic';

import { db, reports } from '@/lib/db';
import { DEMO_MODE, mockReports } from '@/lib/mock-data';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ReportViewer } from './ReportViewer';

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let report;
  if (DEMO_MODE) {
    report = mockReports.find(r => r.id === parseInt(id));
  } else {
    const [found] = await db.select().from(reports).where(eq(reports.id, parseInt(id)));
    report = found;
  }

  if (!report) notFound();

  return <ReportViewer report={report} />;
}
