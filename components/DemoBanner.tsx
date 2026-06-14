import { FlaskConical } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function DemoBanner() {
  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-accent/45 text-xs">
      <FlaskConical />
      <AlertDescription>
        <strong>Demo Mode</strong> - showing sample data. Add{' '}
        <code className="rounded bg-background/70 px-1">DATABASE_URL</code> and{' '}
        <code className="rounded bg-background/70 px-1">ANTHROPIC_API_KEY</code> in{' '}
        <code className="rounded bg-background/70 px-1">.env.local</code> to use real data.
      </AlertDescription>
    </Alert>
  );
}
