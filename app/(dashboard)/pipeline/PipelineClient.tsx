'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, Clock, ExternalLink, Loader2, Plus, Radar, RefreshCw, Search, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { cn, pipelineStatusLabel } from '@/lib/utils';

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
  const [companies, setCompanies] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [companyQuery, setCompanyQuery] = useState('');

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

  // Open the company picker before scanning. Loads the company list on first use
  // and selects all of them by default.
  async function openPicker() {
    if (companies.length === 0) {
      const list: string[] = await fetch('/api/scan/companies').then(r => r.json());
      setCompanies(list);
      setSelected(new Set(list));
    }
    setCompanyQuery('');
    setPickerOpen(true);
  }

  function toggleCompany(company: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(company)) next.delete(company);
      else next.add(company);
      return next;
    });
  }

  const filteredCompanies = companies.filter(c => c.toLowerCase().includes(companyQuery.trim().toLowerCase()));
  // Select-all acts on the currently visible (filtered) companies.
  const allFilteredSelected = filteredCompanies.length > 0 && filteredCompanies.every(c => selected.has(c));

  function toggleSelectAll() {
    setSelected(prev => {
      const next = new Set(prev);
      if (allFilteredSelected) filteredCompanies.forEach(c => next.delete(c));
      else filteredCompanies.forEach(c => next.add(c));
      return next;
    });
  }

  async function handleScan() {
    setPickerOpen(false);
    setScanning(true);
    setScanResult(null);
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companies: [...selected] }),
    });
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
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>اختر الشركات للمسح</DialogTitle>
            <DialogDescription>حدّد البوابات المراد تضمينها في هذا المسح.</DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 start-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ابحث عن شركات..."
              className="ps-8"
              value={companyQuery}
              onChange={e => setCompanyQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs text-muted-foreground">{selected.size} من {companies.length} محدد</span>
            <Button variant="ghost" size="xs" onClick={toggleSelectAll} disabled={filteredCompanies.length === 0}>
              {allFilteredSelected ? 'إلغاء الكل' : 'تحديد الكل'}
            </Button>
          </div>

          <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
            {filteredCompanies.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">لا توجد شركات مطابقة لـ &ldquo;{companyQuery}&rdquo;</p>
            ) : (
              filteredCompanies.map(company => (
                <label
                  key={company}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50"
                >
                  <Checkbox checked={selected.has(company)} onCheckedChange={() => toggleCompany(company)} />
                  <span className="text-sm text-foreground">{company}</span>
                </label>
              ))
            )}
          </div>

          <DialogFooter showCloseButton>
            <Button onClick={handleScan} disabled={selected.size === 0}>
              <Radar />
              امسح {selected.size} شركة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">قائمة الانتظار</h1>
          <p className="mt-1 text-sm text-muted-foreground">{pending.length} قيد الانتظار · {done.length} مُعالَجة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn(loading && 'animate-spin')} />
            تحديث
          </Button>
          <Button size="sm" onClick={openPicker} disabled={scanning}>
            {scanning ? <Loader2 className="animate-spin" /> : <Radar />}
            مسح البوابات
          </Button>
        </div>
      </div>

      {scanResult && (
        <Alert>
          <CheckCircle />
          <AlertDescription>
            اكتمل المسح - تم العثور على {scanResult.found}، وأُضيف {scanResult.added} جديدة إلى القائمة
          </AlertDescription>
        </Alert>
      )}

      <Card className="gap-2">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus />
            إضافة روابط وظائف
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea
            placeholder="الصق رابطًا أو أكثر للوظائف (رابط في كل سطر)..."
            className="min-h-[100px] bg-background font-mono text-sm"
            value={addText}
            onChange={e => setAddText(e.target.value)}
          />
          <Button size="sm" className="w-fit" onClick={handleAdd} disabled={adding || !addText.trim()}>
            {adding ? <Loader2 className="animate-spin" /> : <Plus />}
            إضافة إلى القائمة
          </Button>
        </CardContent>
      </Card>

      <Card className="gap-2">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock />
            قيد الانتظار ({pending.length})
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
            <p className="py-4 text-center text-sm text-muted-foreground">لا توجد عناصر قيد الانتظار - شغّل مسحًا أو أضف روابط بالأعلى</p>
          ) : (
            pending.map(item => (
              <div key={item.id} className="flex flex-col gap-3 rounded-lg border bg-background p-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="secondary">{pipelineStatusLabel(item.status)}</Badge>
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
                      تقييم
                    </Button>
                  </a>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" title="فتح الرابط">
                    <Button size="icon-xs" variant="ghost">
                      <ExternalLink />
                    </Button>
                  </a>
                  <Button size="icon-xs" variant="ghost" onClick={() => markDone(item.id)} title="وضع علامة مكتمل">
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
