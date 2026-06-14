export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { desc, eq, sql } from 'drizzle-orm';
import { Briefcase, CheckCircle, Clock, FileText, GitBranch, Star, TrendingUp } from 'lucide-react';
import { DashboardCharts } from '@/components/DashboardCharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db, applications, reports, pipeline } from '@/lib/db';
import { DEMO_MODE, mockApplications, mockReports, mockPipeline } from '@/lib/mock-data';
import { cn, scoreBg, scoreColor } from '@/lib/utils';

async function getStats() {
  if (DEMO_MODE) {
    const allApps = mockApplications;
    const total = allApps.length;
    const applied = allApps.filter(a => ['Applied', 'Responded', 'Interview', 'Offer'].includes(a.status)).length;
    const interviews = allApps.filter(a => a.status === 'Interview').length;
    const offers = allApps.filter(a => a.status === 'Offer').length;
    const scoredApps = allApps.filter(a => a.score);
    const avgScore = scoredApps.length ? scoredApps.reduce((s, a) => s + (a.score ?? 0), 0) / scoredApps.length : 0;
    const scoreDist = { high: 0, good: 0, medium: 0, low: 0 };
    for (const a of allApps) {
      if (!a.score) continue;
      if (a.score >= 4.5) scoreDist.high++;
      else if (a.score >= 4.0) scoreDist.good++;
      else if (a.score >= 3.5) scoreDist.medium++;
      else scoreDist.low++;
    }
    return {
      total,
      applied,
      interviews,
      offers,
      avgScore,
      scoreDist,
      recentReports: mockReports.slice(0, 5),
      pendingPipeline: mockPipeline.filter(p => p.status === 'pending').length,
      recentApps: allApps.slice(0, 8),
    };
  }

  const [allApps, allReports, pendingPipeline] = await Promise.all([
    db.select().from(applications).orderBy(desc(applications.createdAt)),
    db.select().from(reports).orderBy(desc(reports.createdAt)).limit(5),
    db.select({ count: sql<number>`count(*)` }).from(pipeline).where(eq(pipeline.status, 'pending')),
  ]);

  const total = allApps.length;
  const applied = allApps.filter(a => ['Applied', 'Responded', 'Interview', 'Offer'].includes(a.status)).length;
  const interviews = allApps.filter(a => a.status === 'Interview').length;
  const offers = allApps.filter(a => a.status === 'Offer').length;
  const scoredApps = allApps.filter(a => a.score);
  const avgScore = scoredApps.length ? scoredApps.reduce((s, a) => s + (a.score ?? 0), 0) / scoredApps.length : 0;

  const scoreDist = { high: 0, good: 0, medium: 0, low: 0 };
  for (const a of allApps) {
    if (!a.score) continue;
    if (a.score >= 4.5) scoreDist.high++;
    else if (a.score >= 4.0) scoreDist.good++;
    else if (a.score >= 3.5) scoreDist.medium++;
    else scoreDist.low++;
  }

  return {
    total,
    applied,
    interviews,
    offers,
    avgScore,
    scoreDist,
    recentReports: allReports,
    pendingPipeline: Number(pendingPipeline[0]?.count ?? 0),
    recentApps: allApps.slice(0, 8),
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const statCards = [
    { label: 'Total Evaluated', value: stats.total, icon: Briefcase },
    { label: 'Applied', value: stats.applied, icon: CheckCircle },
    { label: 'Interviews', value: stats.interviews, icon: TrendingUp },
    { label: 'Offers', value: stats.offers, icon: Star },
    { label: 'Avg Score', value: stats.avgScore > 0 ? stats.avgScore.toFixed(1) : '-', icon: FileText },
    { label: 'Pipeline Pending', value: stats.pendingPipeline, icon: GitBranch },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your job search pipeline at a glance</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label} size="sm" className="flex min-h-28 flex-col py-3">
            <CardContent className="flex flex-1 flex-col justify-between gap-3 py-0">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{label}</p>
                <Icon className="size-4 shrink-0 text-primary" />
              </div>
              <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <DashboardCharts scoreDist={stats.scoreDist} recentApps={stats.recentApps} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock />
              Recent Applications
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {stats.recentApps.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No applications yet</p>
            ) : (
              stats.recentApps.map(app => (
                <div key={app.id} className="flex items-center justify-between border-b py-2 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{app.company}</p>
                    <p className="truncate text-xs text-muted-foreground">{app.role}</p>
                  </div>
                  <div className="ml-2 flex shrink-0 items-center gap-2">
                    {app.score && (
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', scoreBg(app.score), scoreColor(app.score))}>
                        {app.score.toFixed(1)}
                      </span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {app.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="self-start w-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pb-0">
            {[
              { label: '4.5+ Strong match', count: stats.scoreDist.high, color: 'var(--chart-2)' },
              { label: '4.0-4.4 Good match', count: stats.scoreDist.good, color: 'var(--chart-1)' },
              { label: '3.5-3.9 Decent', count: stats.scoreDist.medium, color: 'var(--chart-3)' },
              { label: 'Below 3.5 Skip', count: stats.scoreDist.low, color: 'var(--destructive)' },
            ].map(({ label, count, color }) => {
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>{label}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/evaluate">
          <Button>Evaluate a Job</Button>
        </Link>
        <Link href="/pipeline">
          <Button variant="secondary">View Pipeline ({stats.pendingPipeline})</Button>
        </Link>
      </div>
    </div>
  );
}
