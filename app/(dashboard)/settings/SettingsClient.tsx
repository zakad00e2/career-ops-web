'use client';

import { useEffect, useState } from 'react';
import { Check, FileText, Loader2, Save, Settings, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface Profile {
  name?: string;
  email?: string;
  location?: string;
  targetRole?: string;
  salaryMin?: string;
  salaryMax?: string;
  salaryNote?: string;
  remotePolicy?: string;
  cv?: string;
  profileMd?: string;
  profileYml?: string;
}

export function SettingsClient() {
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then((data: Profile) => {
        setProfile(data);
        setLoading(false);
      });
  }, []);

  function update(key: keyof Profile, value: string) {
    setProfile(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">الإعدادات</h1>
          <p className="mt-1 text-sm text-muted-foreground">ملفك الشخصي وسيرتك الذاتية والتخصيص</p>
        </div>
        <Button variant={saved ? 'secondary' : 'default'} onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="animate-spin" />
          ) : saved ? (
            <Check />
          ) : (
            <Save />
          )}
          {saved ? 'تم الحفظ' : 'حفظ التغييرات'}
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <User />
            الملف الشخصي
          </TabsTrigger>
          <TabsTrigger value="cv">
            <FileText />
            السيرة الذاتية
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Settings />
            متقدم
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">المعلومات الشخصية</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="الاسم الكامل">
                  <Input
                    value={profile.name || ''}
                    onChange={e => update('name', e.target.value)}
                    placeholder="اسمك"
                  />
                </Field>
                <Field label="البريد الإلكتروني">
                  <Input
                    value={profile.email || ''}
                    onChange={e => update('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </Field>
                <Field label="الموقع">
                  <Input
                    value={profile.location || ''}
                    onChange={e => update('location', e.target.value)}
                    placeholder="المدينة، الدولة"
                  />
                </Field>
                <Field label="سياسة العمل عن بُعد">
                  <Input
                    value={profile.remotePolicy || ''}
                    onChange={e => update('remotePolicy', e.target.value)}
                    placeholder="عن بُعد كليًا / هجين / من المكتب"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">الدور المستهدف والراتب</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field label="الدور (الأدوار) المستهدفة">
                <Input
                  value={profile.targetRole || ''}
                  onChange={e => update('targetRole', e.target.value)}
                  placeholder="مثال: مهندس ذكاء اصطناعي أول، قائد منصة تعلم آلي"
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="أدنى راتب">
                  <Input
                    value={profile.salaryMin || ''}
                    onChange={e => update('salaryMin', e.target.value)}
                    placeholder="120,000"
                  />
                </Field>
                <Field label="أعلى راتب">
                  <Input
                    value={profile.salaryMax || ''}
                    onChange={e => update('salaryMax', e.target.value)}
                    placeholder="180,000"
                  />
                </Field>
                <Field label="العملة / ملاحظة">
                  <Input
                    value={profile.salaryNote || ''}
                    onChange={e => update('salaryNote', e.target.value)}
                    placeholder="USD / EUR"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cv" className="mt-4 flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">سيرتك الذاتية (Markdown)</CardTitle>
              <p className="text-xs text-muted-foreground">
                هذا هو المصدر المرجعي للتقييمات وتوليد PDF.
                احتفظ به بصيغة markdown نظيفة مع الأقسام: Summary وExperience وProjects وEducation وSkills.
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={profile.cv || ''}
                onChange={e => update('cv', e.target.value)}
                placeholder={`# Your Name\n\n## Summary\nBrief professional summary...\n\n## Experience\n\n### Company - Role (2020-Present)\n- Achievement with metric\n- Achievement with metric\n\n## Skills\nPython, TypeScript, LLMs, ...`}
                className="min-h-[500px] resize-none bg-background font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="mt-4 flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">تخصيص _profile.md</CardTitle>
              <p className="text-xs text-muted-foreground">
                تجاوز النماذج الأصلية ونصوص التفاوض والصياغة. يقابل هذا الملف{' '}
                <code className="rounded bg-muted px-1 text-primary">modes/_profile.md</code>.
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={profile.profileMd || ''}
                onChange={e => update('profileMd', e.target.value)}
                placeholder="## Your Target Roles&#10;&#10;| Archetype | Thematic axes | What they buy |&#10;|-----------|---------------|---------------|&#10;| AI Platform Engineer | ... | ... |"
                className="min-h-[300px] resize-none bg-background font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">إعدادات profile.yml</CardTitle>
              <p className="text-xs text-muted-foreground">
                إعدادات YAML الخام المُمرَّرة للتقييمات. تقابل{' '}
                <code className="rounded bg-muted px-1 text-primary">config/profile.yml</code>.
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={profile.profileYml || ''}
                onChange={e => update('profileYml', e.target.value)}
                placeholder="candidate:&#10;  name: Your Name&#10;  email: you@example.com&#10;  location: City, Country&#10;targets:&#10;  roles:&#10;    - Senior AI Engineer"
                className="min-h-[200px] resize-none bg-background font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Alert>
            <AlertDescription>
              <strong>متغيرات البيئة المطلوبة:</strong> تأكد من ضبط{' '}
              <code className="rounded bg-muted px-1">ANTHROPIC_API_KEY</code> و{' '}
              <code className="rounded bg-muted px-1">DATABASE_URL</code> في{' '}
              <code className="rounded bg-muted px-1">.env.local</code> قبل استخدام التقييمات وتوليد PDF.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
