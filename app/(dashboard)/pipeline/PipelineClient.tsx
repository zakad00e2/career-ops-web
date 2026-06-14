'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, Clock, ExternalLink, Loader2, Plus, Radar, RefreshCw, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface PipelineItem {
  id: number;
  url: string;
  status: string;
  addedAt: string;
  notes: string | null;
}

export function PipelineClient() {
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [addText, setAddText] = useState('');
  const [adding, setAdding] = useState(false);
  const [scanResult, setScanResult] = useState<{ found: number; added: number } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetch('/api/pipeline').then(r => r.json());
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Initial client-side fetch for pipeline data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function handleAdd() {
    if (!addText.trim()) return;
    setAdding(true);
    const urls = addText.split('\n').map(u => u.trim()).filter(Boolean);
    await fetch('/api/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
    });
    setAddText('');
    setAdding(false);
    await load();
  }

  async function handleScan() {
    setScanning(true);
    setScanResult(null);
    const res = await fetch('/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    const data = await res.json();
    setScanResult({ found: data.found, added: data.added });
    setScanning(false);
    await load();
  }

  async function deleteItem(id: number) {
    await fetch(`/api/pipeline/${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i.id !== id));
  }

  async function markDone(id: number) {
    await fetch(`/api/pipeline/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'done' } : i));
  }

  const pending = items.filter(i => i.status === 'pending');
  const done = items.filter(i => i.status === 'done');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pipeline</h1>
          <p className="mt-1 text-sm text-muted-foreground">{pending.length} pending · {done.length} processed</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn(loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleScan} disabled={scanning}>
            {scanning ? <Loader2 className="animate-spin" /> : <Radar />}
            Scan Portals
          </Button>
        </div>
      </div>

      {scanResult && (
        <Alert>
          <CheckCircle />
          <AlertDescription>
            Scan complete - {scanResult.found} found, {scanResult.added} new added to pipeline
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus />
            Add Job URLs
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea
            placeholder="Paste one or more job URLs (one per line)..."
            className="min-h-[100px] bg-background font-mono text-sm"
            value={addText}
            onChange={e => setAddText(e.target.value)}
          />
          <Button size="sm" className="w-fit" onClick={handleAdd} disabled={adding || !addText.trim()}>
            {adding ? <Loader2 className="animate-spin" /> : <Plus />}
            Add to Pipeline
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock />
            Pending ({pending.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-lg border bg-background p-3">
                <Skeleton className="mb-2 h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))
          ) : pending.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No pending items - run a scan or add URLs above</p>
          ) : (
            pending.map(item => (
              <div key={item.id} className="flex flex-col gap-3 rounded-lg border bg-background p-3 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="secondary">{item.status}</Badge>
                    {item.notes && <p className="truncate text-xs font-medium text-foreground">{item.notes}</p>}
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.url}
                  </a>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <a href={`/evaluate?url=${encodeURIComponent(item.url)}`}>
                    <Button size="xs">
                      Evaluate
                    </Button>
                  </a>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" title="Open URL">
                    <Button size="icon-xs" variant="ghost">
                      <ExternalLink />
                    </Button>
                  </a>
                  <Button size="icon-xs" variant="ghost" onClick={() => markDone(item.id)} title="Mark done">
                    <CheckCircle />
                  </Button>
                  <Button size="icon-xs" variant="ghost" onClick={() => deleteItem(item.id)}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
