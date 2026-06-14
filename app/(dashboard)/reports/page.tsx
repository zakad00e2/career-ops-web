export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { desc } from 'drizzle-orm';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { db, reports } from '@/lib/db';
import { DEMO_MODE, mockReports } from '@/lib/mock-data';
import { cn, scoreBg, scoreColor } from '@/lib/utils';

function legitimacyVariant(legitimacy: string | null) {
  if (legitimacy === 'High Confidence') return 'secondary';
  if (legitimacy === 'Suspicious') return 'destructive';
  return 'outline';
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allReports.map(report => (
            <Link key={report.id} href={`/reports/${report.id}`}>
              <Card className="h-full cursor-pointer transition-colors hover:bg-muted/40">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                        {report.company}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">{report.role}</p>
                    </div>
                    {report.score && (
                      <span className={cn('ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold', scoreBg(report.score), scoreColor(report.score))}>
                        {report.score.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar />
                      {report.date}
                    </span>
                    {report.legitimacy && (
                      <Badge variant={legitimacyVariant(report.legitimacy)} className="text-xs">
                        {report.legitimacy}
                      </Badge>
                    )}
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                    {report.content.slice(0, 100)}...
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
