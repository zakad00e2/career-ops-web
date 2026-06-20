'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { prefersReducedMotion } from '@/lib/gsap/motion';

gsap.registerPlugin(useGSAP);

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
  const [greeting, setGreeting] = useState('صباح الخير');
  const ringRef = useRef<SVGCircleElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGreeting(arabicGreeting(new Date().getHours()));
  }, []);

  const pct = Math.max(0, Math.min(100, Math.round(activePct)));
  const r = 49;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct / 100);
  const initials = name.slice(0, 2);

  useGSAP(
    () => {
      if (!ringRef.current) return;

      if (prefersReducedMotion()) {
        gsap.set(ringRef.current, { strokeDashoffset: offset });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      gsap.set(ringRef.current, { strokeDashoffset: circumference });
      tl.to(ringRef.current, {
        strokeDashoffset: offset,
        duration: 1.4,
        delay: 0.15,
      });

      if (badgeRef.current) {
        tl.from(
          badgeRef.current,
          { opacity: 0, scale: 0.6, duration: 0.4 },
          '-=0.8',
        );
      }

      if (textRef.current) {
        tl.from(
          textRef.current.children,
          { opacity: 0, y: 10, duration: 0.45, stagger: 0.1 },
          '-=0.5',
        );
      }
    },
    { dependencies: [offset], revertOnUpdate: true },
  );

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
              ref={ringRef}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="url(#greeting-ring)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
            />
          </svg>
          <span
            ref={badgeRef}
            className="absolute start-4 top-6 rounded-full bg-violet-600 px-2 py-0.5 text-xs font-normal text-white shadow-sm"
          >
            <bdi dir="ltr">{pct}%</bdi>
          </span>
          <Avatar className="absolute inset-0 m-auto size-[132px]">
            <AvatarImage src={avatarSrc} alt={name} />
            <AvatarFallback className="text-xl font-semibold">{initials}</AvatarFallback>
          </Avatar>
        </div>
        <div ref={textRef}>
          <p className="mt-5 text-base font-medium text-foreground">
            {greeting} يا {name} <span aria-hidden>🔥</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">واصل تقدّمك للوصول إلى هدفك!</p>
        </div>
      </CardContent>
    </Card>
  );
}
