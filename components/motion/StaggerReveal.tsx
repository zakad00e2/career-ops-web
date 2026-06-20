'use client';

import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/lib/utils';
import { motionDefaults, prefersReducedMotion } from '@/lib/gsap/motion';

gsap.registerPlugin(useGSAP);

export function StaggerReveal({
  children,
  className,
  stagger = motionDefaults.stagger,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const items = ref.current?.querySelectorAll('[data-motion-item]');
      if (!items?.length) return;

      gsap.from(items, {
        opacity: 0,
        y: 18,
        duration: motionDefaults.duration,
        stagger,
        ease: motionDefaults.ease,
        clearProps: 'opacity,transform',
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
