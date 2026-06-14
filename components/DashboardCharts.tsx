'use client';

import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart2 } from 'lucide-react';

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

const scoreChartConfig = {
  desktop: {
    label: 'Applications',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

const timelineChartConfig = {
  score: {
    label: 'Score',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export function DashboardCharts({
  scoreDist,
  recentApps,
}: {
  scoreDist: ScoreDist;
  recentApps: Application[];
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
  const timelineData = recentApps
    .filter(a => a.score)
    .slice(0, 10)
    .reverse()
    .map((a) => ({
      name: a.company.length > 8 ? `${a.company.slice(0, 8)}...` : a.company,
      score: a.score,
    }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Score Distribution</CardTitle>
          <CardDescription>Applications grouped by fit score</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col pb-0">
          <ChartContainer config={scoreChartConfig} className="aspect-auto min-h-[180px] w-full flex-1">
            <BarChart accessibilityLayer data={scoreChartData} barCategoryGap={0} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="bucket"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="desktop" fill="var(--color-desktop)" isAnimationActive={false} radius={6} maxBarSize={58} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="flex h-full flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart2 />
            Recent Scores Timeline
          </CardTitle>
          <CardDescription>Latest evaluations by company</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col pb-0">
          {timelineData.length === 0 ? (
            <p className="flex flex-1 items-center justify-center py-10 text-center text-sm text-muted-foreground">No scores yet</p>
          ) : (
            <ChartContainer config={timelineChartConfig} className="aspect-auto min-h-[180px] w-full flex-1">
              <BarChart accessibilityLayer data={timelineData} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis domain={[0, 5]} tickLine={false} axisLine={false} tickMargin={8} width={32} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="score" fill="var(--color-score)" isAnimationActive={false} radius={4} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
