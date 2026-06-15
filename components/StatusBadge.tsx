import { cn } from '@/lib/utils';

const STATUS_DOT: Record<string, string> = {
  Evaluated: 'bg-zinc-400',
  Applied: 'bg-blue-400',
  Responded: 'bg-sky-400',
  Interview: 'bg-amber-400',
  Offer: 'bg-emerald-400',
  Rejected: 'bg-red-400',
  Discarded: 'bg-zinc-500',
  SKIP: 'bg-zinc-600',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-xs font-medium text-foreground',
        className,
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', STATUS_DOT[status] ?? 'bg-zinc-400')} />
      {status}
    </span>
  );
}
