'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

function arabicGreeting(hour: number): string {
  if (hour >= 4 && hour < 12) return 'صباح الخير';
  return 'مساء الخير';
}

export function GreetingCard({
  name,
  activePct,
  avatarSrc = '/avatar.webp',
}: {
  name: string;
  activePct: number;
  avatarSrc?: string;
}) {
  // Greeting depends on the viewer's local time, so resolve it on the client
  // after mount to avoid a server/client hydration mismatch.
  const [greeting, setGreeting] = useState('صباح الخير');
  useEffect(() => {
    setGreeting(arabicGreeting(new Date().getHours()));
  }, []);

  const pct = Math.max(0, Math.min(100, Math.round(activePct)));
  const r = 49;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct / 100);
  const initials = name.slice(0, 2);

  return (
    <Card className="flex h-full flex-col pb-3 shadow-none">
      <CardContent className="flex flex-1 flex-col items-center justify-center px-6 pb-2 pt-6 text-center">
        <div className="relative size-[200px]">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90">
            <defs>
              <linearGradient id="greeting-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="var(--muted)"
              strokeWidth="3"
            />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="url(#greeting-ring)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <span className="absolute start-4 top-6 rounded-full bg-violet-600 px-2 py-0.5 text-xs font-normal text-white shadow-sm">
            <bdi dir="ltr">{pct}%</bdi>
          </span>
          <Avatar className="absolute inset-0 m-auto size-[132px]">
            <AvatarImage src={avatarSrc} alt={name} />
            <AvatarFallback className="text-xl font-semibold">{initials}</AvatarFallback>
          </Avatar>
        </div>
        <p className="mt-5 text-base font-medium text-foreground">
          {greeting} يا {name} <span aria-hidden>🔥</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">واصل تقدّمك للوصول إلى هدفك!</p>
      </CardContent>
    </Card>
  );
}
