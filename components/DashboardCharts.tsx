'use client';

import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart2, TrendingUp } from 'lucide-react';

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
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

const timelineChartConfig = {
  score: {
    label: 'Score',
    color: 'var(--chart-1)',
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
  const topScoreBucket = [...scoreChartData].sort((a, b) => b.desktop - a.desktop)[0];

  const timelineData = recentApps
    .filter(a => a.score)
    .slice(0, 10)
    .reverse()
    .map((a) => ({
      name: a.company.length > 8 ? `${a.company.slice(0, 8)}...` : a.company,
      score: a.score,
    }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Score Distribution</CardTitle>
          <CardDescription>Applications grouped by fit score</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={scoreChartConfig}>
            <BarChart accessibilityLayer data={scoreChartData}>
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
              <Bar dataKey="desktop" fill="var(--color-desktop)" isAnimationActive={false} radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            {topScoreBucket.desktop > 0
              ? `${topScoreBucket.label} leads with ${topScoreBucket.desktop} applications`
              : 'No scored applications yet'}
            <TrendingUp />
          </div>
          <div className="leading-none text-muted-foreground">
            Showing total evaluated applications by score range
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart2 />
            Recent Scores Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timelineData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No scores yet</p>
          ) : (
            <ChartContainer config={timelineChartConfig} className="aspect-auto h-[180px] w-full">
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
