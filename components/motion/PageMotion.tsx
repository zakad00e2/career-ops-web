'use client';

import { useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { motionDefaults, prefersReducedMotion } from '@/lib/gsap/motion';

gsap.registerPlugin(useGSAP);

export function PageMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return;

      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: motionDefaults.pageDuration,
          ease: motionDefaults.ease,
        },
      );
    },
    { scope: ref, dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <div
      ref={ref}
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
    >
      {children}
    </div>
  );
}
