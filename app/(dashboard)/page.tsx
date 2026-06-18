export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { Clock } from 'lucide-react';
import type { Application } from '@/lib/db/schema';
import { DashboardCharts } from '@/components/DashboardCharts';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db, applications, reports, pipeline } from '@/lib/db';
import { DEMO_MODE, mockApplications, mockReports, mockPipeline } from '@/lib/mock-data';
import { cn, formatDateLong, scoreColor } from '@/lib/utils';

type Tone = 'up' | 'down' | 'neutral';
type Delta = { lead: string; suffix?: string; tone: Tone } | null;

function monthDelta(current: number, previous: number): Delta {
  if (current === 0 && previous === 0) return null;
  if (previous === 0) {
    return { lead: '+100%', suffix: 'vs last month', tone: 'up' };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return { lead: '0%', suffix: 'vs last month', tone: 'neutral' };
  return { lead: `${pct > 0 ? '+' : ''}${pct}%`, suffix: 'vs last month', tone: pct > 0 ? 'up' : 'down' };
}

function computeDeltas(apps: Application[], pendingPipeline: { addedAt: Date | null }[]) {
  const now = new Date();
  const curY = now.getFullYear();
  const curM = now.getMonth();
  const prev = new Date(curY, curM - 1, 1);
  const prevY = prev.getFullYear();
  const prevM = prev.getMonth();

  const inMonth = (d: Date | string | null | undefined, y: number, m: number) => {
    if (!d) return false;
    const dt = typeof d === 'string' ? new Date(d) : d;
    return dt.getFullYear() === y && dt.getMonth() === m;
  };

  const appliedStatuses = ['Applied', 'Responded', 'Interview', 'Offer'];
  const countApps = (y: number, m: number, pred: (a: Application) => boolean) =>
    apps.filter(a => inMonth(a.createdAt, y, m) && pred(a)).length;

  return {
    total: monthDelta(countApps(curY, curM, () => true), countApps(prevY, prevM, () => true)),
    applied: monthDelta(
      countApps(curY, curM, a => appliedStatuses.includes(a.status)),
      countApps(prevY, prevM, a => appliedStatuses.includes(a.status)),
    ),
    interviews: monthDelta(
      countApps(curY, curM, a => a.status === 'Interview'),
      countApps(prevY, prevM, a => a.status === 'Interview'),
    ),
    pipeline: monthDelta(
      pendingPipeline.filter(p => inMonth(p.addedAt, curY, curM)).length,
      pendingPipeline.filter(p => inMonth(p.addedAt, prevY, prevM)).length,
    ),
  };
}

async function getStats() {
  if (DEMO_MODE) {
    const allApps = mockApplications;
    const total = allApps.length;
    const applied = allApps.filter(a => ['Applied', 'Responded', 'Interview', 'Offer'].includes(a.status)).length;
    const interviews = allApps.filter(a => a.status === 'Interview').length;
    const scoreDist = { high: 0, good: 0, medium: 0, low: 0 };
    for (const a of allApps) {
      if (!a.score) continue;
      if (a.score >= 4.5) scoreDist.high++;
      else if (a.score >= 4.0) scoreDist.good++;
      else if (a.score >= 3.5) scoreDist.medium++;
      else scoreDist.low++;
    }
    const pendingPipelineRows = mockPipeline.filter(p => p.status === 'pending');
    return {
      total,
      applied,
      interviews,
      scoreDist,
      recentReports: mockReports.slice(0, 5),
      pendingPipeline: pendingPipelineRows.length,
      recentApps: allApps.slice(0, 8),
      deltas: computeDeltas(allApps, pendingPipelineRows),
    };
  }

  const [allApps, allReports, pendingPipelineRows] = await Promise.all([
    db.select().from(applications).orderBy(desc(applications.createdAt)),
    db.select().from(reports).orderBy(desc(reports.createdAt)).limit(5),
    db.select({ addedAt: pipeline.addedAt }).from(pipeline).where(eq(pipeline.status, 'pending')),
  ]);

  const total = allApps.length;
  const applied = allApps.filter(a => ['Applied', 'Responded', 'Interview', 'Offer'].includes(a.status)).length;
  const interviews = allApps.filter(a => a.status === 'Interview').length;

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
    scoreDist,
    recentReports: allReports,
    pendingPipeline: pendingPipelineRows.length,
    recentApps: allApps.slice(0, 8),
    deltas: computeDeltas(allApps, pendingPipelineRows),
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const statCards = [
    { label: 'Total Evaluated', value: stats.total, delta: stats.deltas.total },
    { label: 'Applied', value: stats.applied, delta: stats.deltas.applied },
    { label: 'Interviews', value: stats.interviews, delta: stats.deltas.interviews },
    { label: 'Pipeline Pending', value: stats.pendingPipeline, delta: stats.deltas.pipeline },
  ];

  const toneClass: Record<Tone, string> = {
    up: 'text-emerald-600',
    down: 'text-orange-600',
    neutral: 'text-muted-foreground',
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your job search pipeline at a glance</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ label, value, delta }) => (
          <Card key={label} size="sm" className="flex flex-col py-3">
            <CardContent className="flex flex-col gap-2 py-0">
              <p className="text-xs font-medium text-foreground">{label}</p>
              <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">{value}</p>
              {delta ? (
                <p className="text-xs text-muted-foreground">
                  <span className={cn('font-semibold', toneClass[delta.tone])}>{delta.lead}</span>
                  {delta.suffix ? <span className="ml-1 text-[10px]">{delta.suffix}</span> : null}
                </p>
              ) : (
                <p className="text-[10px] text-muted-foreground">No change yet</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <DashboardCharts scoreDist={stats.scoreDist} recentApps={stats.recentApps} />

      <div className="grid grid-cols-1 items-start gap-6">
        <Card className="rounded-2xl border border-border/60 bg-card shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-3 pb-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">Recent Applications</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
                  {stats.recentApps.length}
                </span>
                <span className="text-xs text-muted-foreground">in your pipeline</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Clock className="size-3.5" />
              Latest
            </span>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {stats.recentApps.length === 0 ? (
              <p className="px-6 py-6 text-center text-sm text-muted-foreground">No applications yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-y border-border/60 bg-muted/40">
                      <th className="px-6 py-2.5 text-xs font-medium text-muted-foreground">Company</th>
                      <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">Score</th>
                      <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">Date</th>
                      <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentApps.map(app => {
                      const pct = app.score ? Math.min(100, Math.round((app.score / 5) * 100)) : 0;
                      return (
                        <tr key={app.id} className="border-b border-border/50 last:border-0 transition-colors hover:bg-muted/30">
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                                {app.company.slice(0, 2).toUpperCase()}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">{app.company}</p>
                                <p className="truncate text-xs text-muted-foreground">{app.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3.5">
                            {app.score ? (
                              <div className={cn('flex w-24 flex-col gap-1.5', scoreColor(app.score))}>
                                <span className="text-xs font-semibold">{app.score.toFixed(1)}</span>
                                <span className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                  <span
                                    className="block h-full rounded-full bg-current"
                                    style={{ width: `${pct}%` }}
                                  />
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-3 py-3.5">
                            <span className="whitespace-nowrap text-xs text-muted-foreground">{formatDateLong(app.date)}</span>
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <StatusBadge status={app.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
