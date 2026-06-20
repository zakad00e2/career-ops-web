'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Check, Copy, ExternalLink, FileDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn, scoreBg, scoreColor, legitimacyLabel } from '@/lib/utils';

interface Report {
  id: number;
  company: string;
  role: string;
  date: string;
  score: number | null;
  legitimacy: string | null;
  url: string | null;
  content: string;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="mt-5 mb-2 text-base font-semibold text-foreground">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="mt-6 mb-3 border-b border-border pb-2 text-lg font-semibold text-foreground">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="mt-6 mb-3 text-xl font-semibold text-foreground">$1</h1>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic text-muted-foreground">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">$1</code>')
    .replace(/^\| (.+) \|$/gm, (line) => {
      const cells = line.split('|').filter(c => c.trim());
      return '<tr>' + cells.map(c =>
        `<td class="border border-border px-3 py-1.5 text-sm text-muted-foreground">${c.trim()}</td>`
      ).join('') + '</tr>';
    })
    .replace(/^---+$/gm, '<hr class="my-4 border-border" />')
    .replace(/^- (.+)$/gm, '<li class="ms-4 mb-1 text-sm text-muted-foreground">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, m => `<ul class="my-2 list-disc">${m}</ul>`)
    .replace(/(<tr>.*<\/tr>\n?)+/g, m => `<table class="my-3 w-full border-collapse">${m}</table>`)
    .replace(/^([^<\n].+)$/gm, '<p class="mb-2 text-sm text-muted-foreground">$1</p>')
    .replace(/\n{3,}/g, '\n\n');
}

function legitimacyVariant(legitimacy: string | null) {
  if (legitimacy === 'High Confidence') return 'secondary';
  if (legitimacy === 'Suspicious') return 'destructive';
  return 'outline';
}

export function ReportViewer({ report }: { report: Report }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(report.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownloadPdf() {
    setDownloading(true);
    const profile = await fetch('/api/profile').then(r => r.json()).catch(() => ({}));
    const res = await fetch('/api/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cvContent: profile.cv || '',
        jobDescription: '',
        profileYml: profile.profileYml || '',
        candidateName: profile.name || 'Candidate',
      }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.company}-${report.role}-cv.pdf`.toLowerCase().replace(/\s+/g, '-');
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/reports">
          <Button variant="ghost" size="sm">
            <ArrowRight />
            التقارير
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{report.company}</h1>
              <p className="mt-1 text-muted-foreground">{report.role}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar />
                  {report.date}
                </span>
                {report.url && (
                  <a
                    href={report.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 transition-colors hover:text-primary"
                  >
                    <ExternalLink />
                    عرض الإعلان
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {report.score && (
                <div className={cn('rounded-xl px-5 py-3 text-3xl font-semibold', scoreBg(report.score), scoreColor(report.score))}>
                  {report.score.toFixed(1)}<span className="text-lg font-medium">/5</span>
                </div>
              )}
              {report.legitimacy && (
                <Badge variant={legitimacyVariant(report.legitimacy)} className="text-xs">
                  {legitimacyLabel(report.legitimacy)}
                </Badge>
              )}
            </div>
          </div>

          <Separator className="my-5" />

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check /> : <Copy />}
              {copied ? 'تم النسخ' : 'نسخ التقرير'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={downloading}>
              <FileDown />
              {downloading ? 'جارٍ التوليد...' : 'تنزيل السيرة PDF'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div
            className="max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(report.content) }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
