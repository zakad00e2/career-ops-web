'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { prefersReducedMotion } from '@/lib/gsap/motion';

gsap.registerPlugin(useGSAP);

export function CountUp({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        el.textContent = String(value);
        return;
      }

      const counter = { val: 0 };
      gsap.to(counter, {
        val: value,
        duration: 0.9,
        ease: 'power2.out',
        snap: { val: 1 },
        onUpdate: () => {
          el.textContent = String(Math.round(counter.val));
        },
      });
    },
    { scope: ref, dependencies: [value], revertOnUpdate: true },
  );

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
