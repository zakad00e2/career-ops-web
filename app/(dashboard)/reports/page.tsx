export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { desc } from 'drizzle-orm';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { db, reports } from '@/lib/db';
import { DEMO_MODE, mockReports } from '@/lib/mock-data';
import { cn, scoreColor } from '@/lib/utils';

function legitimacyVariant(legitimacy: string | null) {
  if (legitimacy === 'High Confidence') return 'secondary';
  if (legitimacy === 'Suspicious') return 'destructive';
  return 'outline';
}

function snippet(content: string): string {
  return content
    .replace(/^#.*$/gm, '')
    .replace(/\*\*/g, '')
    .replace(/[|>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

export default async function ReportsPage() {
  const allReports = DEMO_MODE
    ? mockReports
    : await db.select().from(reports).orderBy(desc(reports.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">{allReports.length} evaluation reports</p>
      </div>

      {allReports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No reports yet - evaluate a job to generate one
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden py-0">
          <div className="hidden items-center gap-4 border-b border-border/60 bg-muted/30 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:flex">
            <span className="w-12 shrink-0 text-center">Score</span>
            <span className="flex-1">Company / Role</span>
            <span className="shrink-0">Legitimacy · Date</span>
          </div>

          <div className="divide-y divide-border/60">
            {allReports.map(report => (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <div
                  className={cn(
                    'flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-current text-sm font-bold tabular-nums',
                    scoreColor(report.score),
                  )}
                >
                  {report.score ? report.score.toFixed(1) : '—'}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{report.company}</p>
                  <p className="truncate text-sm text-muted-foreground">{report.role}</p>
                  <p className="mt-0.5 hidden truncate text-xs text-muted-foreground/80 sm:block">
                    {snippet(report.content)}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {report.legitimacy && (
                    <Badge variant={legitimacyVariant(report.legitimacy)} className="text-xs">
                      {report.legitimacy}
                    </Badge>
                  )}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="size-3" />
                    {report.date}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
