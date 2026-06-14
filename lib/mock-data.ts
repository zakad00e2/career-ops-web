import type { Application, Report, PipelineItem } from './db/schema';

export const DEMO_MODE = process.env.DEMO_MODE === 'true' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('user:password@host');

export const mockApplications: Application[] = [
  { id: 1, num: 1, date: '2026-06-01', company: 'Anthropic', role: 'AI Platform Engineer', score: 4.8, status: 'Interview', hasPdf: '✅', reportPath: '/reports/1', notes: 'Strong match on LLMOps and evals', url: 'https://anthropic.com/careers', createdAt: new Date('2026-06-01'), updatedAt: new Date('2026-06-01') },
  { id: 2, num: 2, date: '2026-06-02', company: 'OpenAI', role: 'ML Engineer, Inference', score: 4.5, status: 'Applied', hasPdf: '✅', reportPath: '/reports/2', notes: 'Great comp, strong infra match', url: 'https://openai.com/careers', createdAt: new Date('2026-06-02'), updatedAt: new Date('2026-06-02') },
  { id: 3, num: 3, date: '2026-06-03', company: 'Mistral AI', role: 'Solutions Engineer', score: 4.2, status: 'Evaluated', hasPdf: '❌', reportPath: '/reports/3', notes: 'Good role but smaller team', url: 'https://mistral.ai/careers', createdAt: new Date('2026-06-03'), updatedAt: new Date('2026-06-03') },
  { id: 4, num: 4, date: '2026-06-04', company: 'Cohere', role: 'AI Product Manager', score: 3.8, status: 'Discarded', hasPdf: '❌', reportPath: null, notes: 'Too much enterprise sales focus', url: null, createdAt: new Date('2026-06-04'), updatedAt: new Date('2026-06-04') },
  { id: 5, num: 5, date: '2026-06-05', company: 'Replit', role: 'Staff AI Engineer', score: 4.6, status: 'Applied', hasPdf: '✅', reportPath: '/reports/5', notes: 'Excellent product vision alignment', url: 'https://replit.com/careers', createdAt: new Date('2026-06-05'), updatedAt: new Date('2026-06-05') },
  { id: 6, num: 6, date: '2026-06-05', company: 'Vercel', role: 'AI Engineer', score: 4.3, status: 'Responded', hasPdf: '✅', reportPath: '/reports/6', notes: 'Great infra culture, good comp', url: 'https://vercel.com/careers', createdAt: new Date('2026-06-05'), updatedAt: new Date('2026-06-05') },
  { id: 7, num: 7, date: '2026-06-06', company: 'Linear', role: 'AI Product Lead', score: 3.5, status: 'SKIP', hasPdf: '❌', reportPath: null, notes: 'Too PM-heavy, not enough technical depth', url: null, createdAt: new Date('2026-06-06'), updatedAt: new Date('2026-06-06') },
  { id: 8, num: 8, date: '2026-06-07', company: 'Notion', role: 'AI Forward Deployed Engineer', score: 4.1, status: 'Evaluated', hasPdf: '❌', reportPath: '/reports/8', notes: 'Interesting client-facing AI role', url: 'https://notion.so/careers', createdAt: new Date('2026-06-07'), updatedAt: new Date('2026-06-07') },
  { id: 9, num: 9, date: '2026-06-08', company: 'ElevenLabs', role: 'ML Platform Engineer', score: 4.7, status: 'Interview', hasPdf: '✅', reportPath: '/reports/9', notes: 'Top match — fast-growing, great equity', url: 'https://elevenlabs.io/careers', createdAt: new Date('2026-06-08'), updatedAt: new Date('2026-06-08') },
  { id: 10, num: 10, date: '2026-06-09', company: 'Retool', role: 'AI Solutions Architect', score: 4.0, status: 'Evaluated', hasPdf: '❌', reportPath: '/reports/10', notes: 'Solid match, enterprise-heavy', url: 'https://retool.com/careers', createdAt: new Date('2026-06-09'), updatedAt: new Date('2026-06-09') },
];

export const mockReports: Report[] = [
  {
    id: 1,
    applicationId: 1,
    company: 'Anthropic',
    role: 'AI Platform Engineer',
    slug: 'anthropic-ai-platform-engineer',
    date: '2026-06-01',
    score: 4.8,
    legitimacy: 'High Confidence',
    url: 'https://anthropic.com/careers',
    content: `# Evaluation: Anthropic — AI Platform Engineer

**Score:** 4.8/5
**Date:** 2026-06-01
**Legitimacy:** High Confidence

## Block A — Role Summary

| Field | Value |
|-------|-------|
| Archetype | AI Platform / LLMOps Engineer |
| Domain | Platform / Agentic |
| Function | Build |
| Seniority | Senior / Staff |
| Remote | Full Remote |
| TL;DR | Build the infrastructure that powers Claude in production |

## Block B — Match with CV

| JD Requirement | CV Match | Strength |
|----------------|----------|----------|
| LLM evaluation frameworks | Evaluation pipeline work | Strong |
| Observability & monitoring | Production monitoring dashboards | Strong |
| Python + distributed systems | 5+ years Python, Ray/Spark | Strong |
| ML serving infrastructure | Model serving at scale | Good |
| Cross-functional collaboration | Led AI platform teams | Strong |

**Gaps:** No direct experience with JAX — mitigation: PyTorch proficiency covers 90% of this requirement.

## Block C — Level & Strategy

- **JD Level:** Senior / Staff
- **Your Level:** Strong Senior match, Staff stretch
- **Sell Senior plan:** Lead with eval framework impact (measurable reliability improvements), frame agent orchestration work as platform-building mindset

## Block D — Comp & Demand

| Source | Range |
|--------|-------|
| Levels.fyi (Anthropic Senior SWE) | $280k–$380k TC |
| Glassdoor | $220k–$320k base |
| Blind reports | Top-quartile among AI labs |

## Block E — CV Customization

| # | Section | Change | Why |
|---|---------|--------|-----|
| 1 | Summary | Emphasize "production AI systems" over "AI research" | Matches infra focus |
| 2 | Experience | Lead with eval pipeline metrics | Core JD requirement |
| 3 | Skills | Add "LLM observability" keyword | ATS optimization |

## Block F — Interview Prep

| JD Requirement | STAR Story | Reflection |
|----------------|------------|------------|
| Build reliable AI pipelines | Built eval system reducing hallucination rate 40% | Learned: evals need to be part of CI/CD, not afterthought |
| Cross-team collaboration | Led platform migration with 3 teams | Learned: async docs matter more than meetings |

## Block G — Posting Legitimacy

- **Tier:** High Confidence
- Apply button active ✅
- Posted < 14 days ago ✅
- Known company with consistent hiring history ✅`,
    pdfPath: null,
    createdAt: new Date('2026-06-01'),
  },
  {
    id: 2,
    applicationId: 2,
    company: 'OpenAI',
    role: 'ML Engineer, Inference',
    slug: 'openai-ml-engineer-inference',
    date: '2026-06-02',
    score: 4.5,
    legitimacy: 'High Confidence',
    url: 'https://openai.com/careers',
    content: `# Evaluation: OpenAI — ML Engineer, Inference

**Score:** 4.5/5
**Date:** 2026-06-02
**Legitimacy:** High Confidence

## Block A — Role Summary

| Field | Value |
|-------|-------|
| Archetype | AI Platform / LLMOps Engineer |
| Domain | Infrastructure / Inference |
| Function | Build |
| Seniority | Senior |
| Remote | Hybrid (SF) |
| TL;DR | Optimize inference infrastructure for GPT-4 and beyond |

## Block B — Match with CV

Strong match on ML serving and optimization experience. Main gap: no direct GPU kernel experience (CUDA), but Python-level optimization work is strong.

## Block C — Level & Strategy

Senior match. Compensation at OpenAI is top-of-market — push for Staff if you have 7+ YOE.

## Block D — Comp

Levels.fyi shows $350k–$500k TC for Senior ML Engineers at OpenAI.

## Block G — Posting Legitimacy

**High Confidence** — Active role, verified on Greenhouse.`,
    pdfPath: null,
    createdAt: new Date('2026-06-02'),
  },
  {
    id: 9,
    applicationId: 9,
    company: 'ElevenLabs',
    role: 'ML Platform Engineer',
    slug: 'elevenlabs-ml-platform-engineer',
    date: '2026-06-08',
    score: 4.7,
    legitimacy: 'High Confidence',
    url: 'https://elevenlabs.io/careers',
    content: `# Evaluation: ElevenLabs — ML Platform Engineer

**Score:** 4.7/5
**Date:** 2026-06-08
**Legitimacy:** High Confidence

## Block A — Role Summary

| Field | Value |
|-------|-------|
| Archetype | AI Platform / LLMOps Engineer |
| Domain | Audio AI / Platform |
| Function | Build |
| Seniority | Senior / Staff |
| Remote | Full Remote |
| TL;DR | Build the platform that scales ElevenLabs' voice AI to millions of users |

## Block B — Match with CV

Excellent match. Fast-growing startup phase matches your "builder" profile.

## Block G — Posting Legitimacy

**High Confidence** — Posted 3 days ago, active apply flow.`,
    pdfPath: null,
    createdAt: new Date('2026-06-08'),
  },
];

export const mockPipeline: PipelineItem[] = [
  { id: 1, url: 'https://jobs.ashbyhq.com/mistral/ai-engineer-2026', status: 'pending', addedAt: new Date('2026-06-08'), processedAt: null, notes: 'Mistral — AI Engineer' },
  { id: 2, url: 'https://boards.greenhouse.io/figma/jobs/ai-product-2026', status: 'pending', addedAt: new Date('2026-06-08'), processedAt: null, notes: 'Figma — AI Product Manager' },
  { id: 3, url: 'https://jobs.lever.co/perplexity/ml-engineer', status: 'pending', addedAt: new Date('2026-06-09'), processedAt: null, notes: 'Perplexity — ML Engineer' },
  { id: 4, url: 'https://boards.greenhouse.io/huggingface/ai-engineer', status: 'done', addedAt: new Date('2026-06-07'), processedAt: new Date('2026-06-07'), notes: 'HuggingFace — AI Engineer' },
  { id: 5, url: 'https://jobs.ashbyhq.com/cursor/staff-engineer', status: 'done', addedAt: new Date('2026-06-06'), processedAt: new Date('2026-06-06'), notes: 'Cursor — Staff Engineer' },
];
