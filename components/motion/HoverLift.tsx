'use client';

import { useRef, type ComponentProps, type ReactNode } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/gsap/motion';

gsap.registerPlugin(useGSAP);

export function HoverLift({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & ComponentProps<'div'>) {
  const ref = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP(() => {}, { scope: ref });

  const onEnter = contextSafe(() => {
    if (prefersReducedMotion() || !ref.current) return;
    gsap.to(ref.current, {
      y: -3,
      duration: 0.25,
      ease: 'power2.out',
    });
  });

  const onLeave = contextSafe(() => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      y: 0,
      duration: 0.3,
      ease: 'power2.out',
    });
  });

  return (
    <div
      ref={ref}
      className={cn(className)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      {...props}
    >
      {children}
    </div>
  );
}
