export const motionDefaults = {
  duration: 0.5,
  ease: 'power2.out' as const,
  stagger: 0.07,
  pageDuration: 0.45,
};

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
