'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpDown, ExternalLink, FileText, RefreshCw, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CANONICAL_STATUSES, cn, scoreBg, scoreColor, statusLabel } from '@/lib/utils';

interface Application {
  id: number;
  num: number;
  date: string;
  company: string;
  role: string;
  score: number | null;
  status: string;
  hasPdf: string;
  reportPath: string | null;
  notes: string | null;
  url: string | null;
}

type SortField = 'date' | 'score' | 'company' | 'status';

export function ApplicationsClient() {
  const [apps, setApps] = useState<Application[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetch('/api/applications').then(r => r.json());
    setApps(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Initial client-side fetch for dashboard data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    let result = [...apps];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        (a.notes?.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(a => a.status === statusFilter);
    }

    result.sort((a, b) => {
      let diff = 0;
      if (sortField === 'date') diff = a.date.localeCompare(b.date);
      else if (sortField === 'score') diff = (a.score ?? 0) - (b.score ?? 0);
      else if (sortField === 'company') diff = a.company.localeCompare(b.company);
      else if (sortField === 'status') diff = a.status.localeCompare(b.status);
      return sortAsc ? diff : -diff;
    });

    return result;
  }, [apps, search, statusFilter, sortField, sortAsc]);

  async function updateStatus(id: number, status: string) {
    await fetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }

  async function deleteApp(id: number) {
    if (!confirm('هل تريد حذف هذا الطلب؟')) return;
    await fetch(`/api/applications/${id}`, { method: 'DELETE' });
    setApps(prev => prev.filter(a => a.id !== id));
  }

  function toggleSort(field: SortField) {
    if (sortField === field) setSortAsc(a => !a);
    else {
      setSortField(field);
      setSortAsc(false);
    }
  }

  const headLabelClass = 'text-muted-foreground';

  const staticHead = (label: string) => (
    <span className={headLabelClass}>{label}</span>
  );

  const sortableHead = (field: SortField, label: string) => (
    <Button variant="ghost" size="xs" className={cn('h-auto w-full justify-start px-0', headLabelClass)} onClick={() => toggleSort(field)}>
      {label}
      <ArrowUpDown />
    </Button>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-foreground">الطلبات</h1>
          <p className="mt-1 text-sm text-muted-foreground">{apps.length} إجمالاً · {filtered.length} ظاهرة</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={cn(loading && 'animate-spin')} />
          تحديث
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث في الشركة أو الدور أو الملاحظات..."
            className="ps-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="الحالة">
              {statusFilter !== 'all' ? statusLabel(statusFilter) : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            {CANONICAL_STATUSES.map(s => (
              <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>{sortableHead('company', 'الشركة')}</TableHead>
              <TableHead>{staticHead('الدور')}</TableHead>
              <TableHead>{sortableHead('date', 'التاريخ')}</TableHead>
              <TableHead>{sortableHead('score', 'التقييم')}</TableHead>
              <TableHead>{sortableHead('status', 'الحالة')}</TableHead>
              <TableHead>{staticHead('إجراءات')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 7 }).map((__, cell) => (
                    <TableCell key={cell}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  لا توجد طلبات
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(app => (
                <TableRow key={app.id}>
                  <TableCell className="text-xs text-muted-foreground">{app.num}</TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{app.company}</span>
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-muted-foreground">{app.role}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{app.date}</TableCell>
                  <TableCell>
                    {app.score ? (
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium tabular-nums', scoreBg(app.score), scoreColor(app.score))}>
                        {app.score.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select value={app.status} onValueChange={(v) => { if (v) updateStatus(app.id, v); }}>
                      <SelectTrigger size="sm" className="w-36 border-transparent bg-transparent hover:bg-muted/50 dark:bg-transparent">
                        <SelectValue>
                          <StatusBadge status={app.status} className="border-transparent bg-transparent px-0" />
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="min-w-44">
                        {CANONICAL_STATUSES.map(s => (
                          <SelectItem key={s} value={s}>
                            <StatusBadge status={s} className="border-transparent bg-transparent px-0" />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {app.reportPath && (
                        <Link href={app.reportPath ?? '#'} title="عرض التقرير">
                          <Button size="icon-xs" variant="ghost">
                            <FileText />
                          </Button>
                        </Link>
                      )}
                      {app.url && (
                        <a href={app.url} target="_blank" rel="noopener noreferrer" title="فتح الرابط">
                          <Button size="icon-xs" variant="ghost">
                            <ExternalLink />
                          </Button>
                        </a>
                      )}
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => deleteApp(app.id)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
