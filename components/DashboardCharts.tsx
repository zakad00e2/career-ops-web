'use client';

import { BarChart, Bar, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GreetingCard } from '@/components/GreetingCard';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

interface Application {
  id: number;
  company: string;
  score: number | null;
  status: string;
  date: string;
}

interface ScoreDist {
  high: number;
  good: number;
  medium: number;
  low: number;
}

const scoreBarGradients = [
  { id: 'score-bar-0', from: '#60a5fa', to: '#3b82f6' },
  { id: 'score-bar-1', from: '#34d399', to: '#10b981' },
  { id: 'score-bar-2', from: '#fb923c', to: '#f97316' },
  { id: 'score-bar-3', from: '#f472b6', to: '#ec4899' },
] as const;

const scoreChartConfig = {
  desktop: {
    label: 'الطلبات',
    color: '#3b82f6',
  },
} satisfies ChartConfig;

const statusGroups = [
  { key: 'active', label: 'نشِطة', color: '#3b82f6', statuses: ['Applied', 'Responded', 'Interview', 'Offer'] },
  { key: 'evaluated', label: 'مُقيَّمة', color: '#8b5cf6', statuses: ['Evaluated'] },
  { key: 'closed', label: 'مغلقة', color: '#c4b5fd', statuses: ['Rejected', 'Discarded', 'SKIP'] },
] as const;

const statusChartConfig = {
  active: { label: 'نشِطة', color: '#3b82f6' },
  evaluated: { label: 'مُقيَّمة', color: '#8b5cf6' },
  closed: { label: 'مغلقة', color: '#c4b5fd' },
} satisfies ChartConfig;

export function DashboardCharts({
  scoreDist,
  recentApps,
  greetingName,
  activePct,
}: {
  scoreDist: ScoreDist;
  recentApps: Application[];
  greetingName: string;
  activePct: number;
}) {
  const scoreChartData = [
    {
      bucket: '4.5+',
      label: 'Strong match',
      desktop: scoreDist.high,
    },
    {
      bucket: '4.0-4.4',
      label: 'Good match',
      desktop: scoreDist.good,
    },
    {
      bucket: '3.5-3.9',
      label: 'Decent fit',
      desktop: scoreDist.medium,
    },
    {
      bucket: '<3.5',
      label: 'Below target',
      desktop: scoreDist.low,
    },
  ];
  const statusData = statusGroups.map(g => ({
    status: g.key,
    name: g.label,
    value: recentApps.filter(a => (g.statuses as readonly string[]).includes(a.status)).length,
    fill: g.color,
  }));
  const totalApps = statusData.reduce((sum, d) => sum + d.value, 0);
  const avgPerStatus = statusData.length ? totalApps / statusData.length : 0;

  const scoredApps = recentApps.filter(a => a.score);
  const avgScore = scoredApps.length
    ? scoredApps.reduce((sum, a) => sum + (a.score ?? 0), 0) / scoredApps.length
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <GreetingCard name={greetingName} activePct={activePct} />

      <Card className="flex h-full flex-col pb-3 shadow-none">
        <CardHeader className="gap-3 pb-2">
          <CardTitle className="text-sm font-normal text-muted-foreground">توزيع التقييمات</CardTitle>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-medium tracking-tight tabular-nums text-foreground">
              {avgScore > 0 ? avgScore.toFixed(1) : '—'}
            </span>
            <span className="text-xs text-muted-foreground">متوسط التقييم</span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col px-6 pb-2 pt-0">
          <ChartContainer
            config={scoreChartConfig}
            className="aspect-auto min-h-[200px] w-full flex-1 [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-axis-tick_text]:text-[11px]"
          >
            <BarChart
              accessibilityLayer
              data={scoreChartData}
              barCategoryGap="28%"
              margin={{ top: 8, right: 8, left: -12, bottom: 4 }}
            >
              <defs>
                {scoreBarGradients.map(({ id, from, to }) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={from} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={to} stopOpacity={0.85} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.45} />
              <CartesianGrid vertical strokeDasharray="4 4" horizontal={false} stroke="var(--border)" strokeOpacity={0.35} />
              <XAxis
                dataKey="bucket"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                interval={0}
                tickFormatter={(value: string) => (value.length > 8 ? `${value.slice(0, 8)}…` : value)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={28}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={{ fill: 'var(--muted)', opacity: 0.35 }}
                content={
                  <ChartTooltipContent
                    hideLabel
                    className="rounded-xl border border-border/60 bg-card px-3 py-2 text-xs shadow-md"
                  />
                }
              />
              <Bar
                dataKey="desktop"
                isAnimationActive={false}
                radius={[10, 10, 4, 4]}
                maxBarSize={44}
              >
                {scoreChartData.map((_, index) => (
                  <Cell key={`score-bar-${index}`} fill={`url(#${scoreBarGradients[index].id})`} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="flex h-full flex-col pb-3 shadow-none">
        <CardHeader className="gap-3 pb-2">
          <CardTitle className="text-sm font-normal text-muted-foreground">الطلبات حسب الحالة</CardTitle>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-medium tracking-tight tabular-nums text-foreground">
              {avgPerStatus > 0 ? avgPerStatus.toFixed(1) : '—'}
            </span>
            <span className="text-xs text-muted-foreground">المتوسط لكل حالة</span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-center px-6 pb-2 pt-0">
          {totalApps === 0 ? (
            <p className="flex flex-1 items-center justify-center py-10 text-center text-sm text-muted-foreground">لا توجد طلبات بعد</p>
          ) : (
            <>
              <div className="mx-auto w-full max-w-[260px] lg:max-w-[340px]">
                <div className="relative aspect-[2/1] w-full overflow-hidden">
                  <div className="relative aspect-square w-full">
                    <ChartContainer config={statusChartConfig} className="aspect-square w-full">
                      <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <ChartTooltip
                          cursor={false}
                          content={
                            <ChartTooltipContent
                              nameKey="status"
                              className="rounded-xl border border-border/60 bg-card px-3 py-2 text-xs shadow-md"
                            />
                          }
                        />
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          startAngle={180}
                          endAngle={0}
                          innerRadius="80%"
                          outerRadius="96%"
                          paddingAngle={4}
                          cornerRadius={8}
                          strokeWidth={0}
                          isAnimationActive={false}
                        >
                          {statusData.map(d => (
                            <Cell key={d.status} fill={d.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="xMidYMid meet"
                      className="pointer-events-none absolute inset-0 h-full w-full text-violet-400"
                    >
                      <path
                        d="M 13 50 A 37 37 0 0 1 87 50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.45"
                        strokeDasharray="0.8 2.8"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-x-0 top-0 bottom-1/2 flex flex-col items-center justify-end pb-1">
                      <span className="text-3xl font-medium tracking-tight tabular-nums text-foreground">{totalApps}</span>
                      <span className="text-xs text-muted-foreground">الإجمالي</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-3">
                {statusData.map(d => (
                  <div key={d.status} className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-[4px]" style={{ background: d.fill }} />
                    <span className="text-xs text-muted-foreground">{d.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
