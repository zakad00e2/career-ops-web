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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your profile, CV, and personalization</p>
        </div>
        <Button variant={saved ? 'secondary' : 'default'} onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="animate-spin" />
          ) : saved ? (
            <Check />
          ) : (
            <Save />
          )}
          {saved ? 'Saved' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <User />
            Profile
          </TabsTrigger>
          <TabsTrigger value="cv">
            <FileText />
            CV
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Settings />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Personal Info</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full Name">
                  <Input
                    value={profile.name || ''}
                    onChange={e => update('name', e.target.value)}
                    placeholder="Your name"
                  />
                </Field>
                <Field label="Email">
                  <Input
                    value={profile.email || ''}
                    onChange={e => update('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </Field>
                <Field label="Location">
                  <Input
                    value={profile.location || ''}
                    onChange={e => update('location', e.target.value)}
                    placeholder="City, Country"
                  />
                </Field>
                <Field label="Remote Policy">
                  <Input
                    value={profile.remotePolicy || ''}
                    onChange={e => update('remotePolicy', e.target.value)}
                    placeholder="Full remote / Hybrid / On-site"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Target Role & Compensation</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field label="Target Role(s)">
                <Input
                  value={profile.targetRole || ''}
                  onChange={e => update('targetRole', e.target.value)}
                  placeholder="e.g. Senior AI Engineer, ML Platform Lead"
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Salary Min">
                  <Input
                    value={profile.salaryMin || ''}
                    onChange={e => update('salaryMin', e.target.value)}
                    placeholder="120,000"
                  />
                </Field>
                <Field label="Salary Max">
                  <Input
                    value={profile.salaryMax || ''}
                    onChange={e => update('salaryMax', e.target.value)}
                    placeholder="180,000"
                  />
                </Field>
                <Field label="Currency / Note">
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
              <CardTitle className="text-base">Your CV (Markdown)</CardTitle>
              <p className="text-xs text-muted-foreground">
                This is the source of truth for evaluations and PDF generation.
                Keep it in clean markdown with Summary, Experience, Projects, Education, and Skills.
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
              <CardTitle className="text-base">_profile.md Customization</CardTitle>
              <p className="text-xs text-muted-foreground">
                Override archetypes, negotiation scripts, and framing. This maps to{' '}
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
              <CardTitle className="text-base">profile.yml Config</CardTitle>
              <p className="text-xs text-muted-foreground">
                Raw YAML config passed to evaluations. Maps to{' '}
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
              <strong>Environment variables required:</strong> Make sure{' '}
              <code className="rounded bg-muted px-1">ANTHROPIC_API_KEY</code> and{' '}
              <code className="rounded bg-muted px-1">DATABASE_URL</code> are set in{' '}
              <code className="rounded bg-muted px-1">.env.local</code> before using evaluations and PDF generation.
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
