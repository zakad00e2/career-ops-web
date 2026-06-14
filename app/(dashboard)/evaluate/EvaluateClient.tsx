'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Copy, FileDown, Loader2, Save, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn, scoreBg, scoreColor } from '@/lib/utils';

type Status = 'idle' | 'fetching' | 'streaming' | 'done' | 'error';

function parseScore(text: string): number | null {
  const m = text.match(/\*\*(?:Global Score|Score)[:\s]*([0-9.]+)\s*\/\s*5/i)
    || text.match(/Global Score[:\s]*([0-9.]+)/i)
    || text.match(/Score[:\s]*([0-9.]+)\s*\/\s*5/i);
  if (m) return parseFloat(m[1]);
  return null;
}

export function EvaluateClient() {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [output, setOutput] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  async function fetchJobContent(url: string): Promise<string> {
    try {
      const res = await fetch(`/api/fetch-jd?url=${encodeURIComponent(url)}`);
      if (!res.ok) return url;
      const { content } = await res.json();
      return content || url;
    } catch {
      return url;
    }
  }

  async function handleEvaluate() {
    if (!input.trim()) return;

    setStatus('streaming');
    setOutput('');
    setScore(null);
    setSaved(false);
    setError('');

    try {
      const profile = await fetch('/api/profile').then(r => r.json()).catch(() => ({}));
      const cvContent = profile.cv || '';
      const profileContent = profile.profileMd || '';

      if (!cvContent) {
        setError('No CV found. Please add your CV in Settings first.');
        setStatus('error');
        return;
      }

      let jobDescription = input.trim();

      if (jobDescription.startsWith('http')) {
        setStatus('fetching');
        jobDescription = await fetchJobContent(jobDescription);
        setStatus('streaming');
      }

      abortRef.current = new AbortController();

      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, cvContent, profileContent }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Evaluation failed');
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setOutput(fullText);

        const s = parseScore(fullText);
        if (s) setScore(s);
      }

      setOutput(fullText);
      const finalScore = parseScore(fullText);
      if (finalScore) setScore(finalScore);
      setStatus('done');
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setStatus('idle');
        return;
      }
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  }

  async function handleSave() {
    if (!output) return;

    const company = extractField(output, 'Company') || 'Unknown';
    const role = extractField(output, 'Role') || 'Unknown';

    await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company,
        role,
        score,
        status: 'Evaluated',
        notes: `Evaluated on ${new Date().toISOString().split('T')[0]}`,
      }),
    });

    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company,
        role,
        slug: `${company}-${role}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        date: new Date().toISOString().split('T')[0],
        score,
        content: output,
      }),
    });

    setSaved(true);
  }

  async function handleDownloadPdf() {
    const profile = await fetch('/api/profile').then(r => r.json()).catch(() => ({}));
    const res = await fetch('/api/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cvContent: profile.cv || '',
        jobDescription: input,
        profileYml: profile.profileYml || '',
        candidateName: profile.name || 'Candidate',
      }),
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv-tailored.pdf';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleStop() {
    abortRef.current?.abort();
    setStatus('done');
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Evaluate a Job</h1>
        <p className="mt-1 text-sm text-muted-foreground">Paste a job URL or description to get a full A-G evaluation</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Job Posting</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Textarea
              placeholder="Paste the job URL or full job description here..."
              className="min-h-[300px] resize-none bg-background font-mono text-sm"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={status === 'streaming' || status === 'fetching'}
            />

            <div className="flex gap-2">
              {status === 'streaming' || status === 'fetching' ? (
                <Button variant="destructive" onClick={handleStop} className="flex-1">
                  <Loader2 className="animate-spin" />
                  {status === 'fetching' ? 'Fetching job...' : 'Stop Evaluation'}
                </Button>
              ) : (
                <Button className="flex-1" onClick={handleEvaluate} disabled={!input.trim()}>
                  <Zap />
                  Evaluate
                </Button>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Evaluation Report</CardTitle>
              <div className="flex items-center gap-2">
                {score && (
                  <span className={cn('rounded-full px-3 py-1 text-sm font-semibold', scoreBg(score), scoreColor(score))}>
                    {score.toFixed(1)}/5
                  </span>
                )}
                {status === 'streaming' && (
                  <Badge variant="secondary" className="animate-pulse">
                    Streaming...
                  </Badge>
                )}
                {status === 'done' && output && (
                  <Badge variant="outline">Done</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div
              ref={outputRef}
              className="h-[300px] overflow-y-auto whitespace-pre-wrap rounded-lg border bg-background p-4 font-mono text-xs text-muted-foreground"
            >
              {output || (
                <span className="text-muted-foreground">
                  {status === 'idle'
                    ? 'Evaluation output will appear here...'
                    : status === 'fetching'
                      ? 'Fetching job posting...'
                      : 'Starting evaluation...'}
                </span>
              )}
            </div>

            {status === 'done' && output && (
              <>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    {copied ? <Check /> : <Copy />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(saved && 'border-primary text-primary')}
                    onClick={handleSave}
                    disabled={saved}
                  >
                    <Save />
                    {saved ? 'Saved' : 'Save to Tracker'}
                  </Button>

                  <Button size="sm" variant="outline" onClick={handleDownloadPdf}>
                    <FileDown />
                    Download CV PDF
                  </Button>
                </div>

                {score && score < 4.0 && (
                  <Alert>
                    <AlertTriangle />
                    <AlertDescription>
                      Score below 4.0 - career-ops recommends against applying to this role.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function extractField(text: string, field: string): string {
  const patterns = [
    new RegExp(`\\*\\*${field}\\*\\*[:\\s]+([^\\n*|]+)`, 'i'),
    new RegExp(`${field}[:\\s]+([^\\n*|]+)`, 'i'),
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].trim().replace(/\*+/g, '');
  }
  return '';
}
