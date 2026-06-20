import { FlaskConical } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function DemoBanner() {
  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-accent/45 text-xs">
      <FlaskConical />
      <AlertDescription>
        <strong>وضع العرض التجريبي</strong> - يعرض بيانات تجريبية. أضِف{' '}
        <code className="rounded bg-background/70 px-1">DATABASE_URL</code> و{' '}
        <code className="rounded bg-background/70 px-1">ANTHROPIC_API_KEY</code> في{' '}
        <code className="rounded bg-background/70 px-1">.env.local</code> لاستخدام بيانات حقيقية.
      </AlertDescription>
    </Alert>
  );
}
