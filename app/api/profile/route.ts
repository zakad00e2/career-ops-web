import { NextRequest } from 'next/server';
import { db, profile } from '@/lib/db';
import { DEMO_MODE } from '@/lib/mock-data';
import { eq } from 'drizzle-orm';

const demoProfile: Record<string, string> = {
  name: 'Demo User',
  email: 'demo@career-ops.dev',
  location: 'Remote',
  targetRole: 'AI Platform Engineer / LLMOps',
  salaryMin: '150000',
  salaryMax: '220000',
  salaryNote: 'USD',
  remotePolicy: 'Full Remote',
  cv: `# Demo User\n\nhi@career-ops.dev | Remote\n\n## Summary\nSenior AI Engineer with 6+ years building production ML systems. Specialized in LLMOps, evaluation frameworks, and agentic workflows.\n\n## Experience\n\n### Senior AI Platform Engineer — Acme AI (2023–Present)\n- Built evaluation pipeline reducing hallucination rate by 40%\n- Led migration of 3 model serving systems to unified platform\n- Designed HITL escalation system for 50k+ daily agent runs\n\n### ML Engineer — TechCorp (2020–2023)\n- Deployed 12 production ML models serving 2M+ users\n- Built monitoring dashboards with 99.9% uptime\n\n## Skills\nPython, TypeScript, PyTorch, Ray, Kubernetes, LangChain, OpenAI API, Anthropic API, PostgreSQL, Redis\n\n## Education\nM.Sc. Computer Science — State University (2018–2020)`,
};

export async function GET() {
  if (DEMO_MODE) return Response.json(demoProfile);
  const rows = await db.select().from(profile);
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return Response.json(result);
}

export async function PUT(req: NextRequest) {
  const body = await req.json() as Record<string, string>;

  for (const [key, value] of Object.entries(body)) {
    await db
      .insert(profile)
      .values({ key, value })
      .onConflictDoUpdate({
        target: profile.key,
        set: { value, updatedAt: new Date() },
      });
  }

  return Response.json({ saved: Object.keys(body).length });
}
