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
  // Report header is "**Score:** 4.8/5" — the character class after the label
  // tolerates the markdown bold (**) and whitespace between "Score:" and the number.
  const m = text.match(/(?:Global\s+)?Score[:*\s]*([0-9](?:\.[0-9]+)?)\s*\/\s*5/i);
  if (m) return parseFloat(m[1]);
  return null;
}

export function EvaluateClient({ initialUrl = '' }: { initialUrl?: string }) {
  const [input, setInput] = useState(initialUrl);
  const [status, setStatus] = useState<Status>('idle');
  const [output, setOutput] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
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

    const { company, role } = parseCompanyRole(output);

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
    if (downloadingPdf) return;
    setDownloadingPdf(true);
    try {
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

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.error || 'Failed to generate CV');
      }

      // The route returns a print-ready HTML document. Open it in a new tab so
      // the browser's print dialog ("Save as PDF") handles the PDF export.
      const html = await res.text();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) {
        // Popup blocked — fall back to downloading the HTML.
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cv-tailored.html';
        a.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } finally {
      setDownloadingPdf(false);
    }
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

                  <Button size="sm" variant="outline" onClick={handleDownloadPdf} disabled={downloadingPdf}>
                    {downloadingPdf ? <Loader2 className="animate-spin" /> : <FileDown />}
                    {downloadingPdf ? 'Preparing CV...' : 'Print / Save CV PDF'}
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

// Company and role live only in the report title: "# Evaluation: {Company} — {Role}".
// There is no "**Company:**"/"**Role:**" field, so we parse the H1 line. The dash
// must be surrounded by whitespace so intra-word hyphens (e.g. "Front-End") don't split.
function parseCompanyRole(text: string): { company: string; role: string } {
  const m = text.match(/^#\s*Evaluation:\s*(.+?)\s+[—–-]\s+(.+?)\s*$/im);
  if (m) return { company: m[1].trim(), role: m[2].trim() };
  return { company: 'Unknown', role: 'Unknown' };
}
