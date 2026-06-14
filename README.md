# Career-Ops Web

A full Next.js 15 web application that ports the Career-Ops AI job search pipeline from CLI to a browser-based interface.

## Features

- **Dashboard** — Stats, score distribution charts, recent activity
- **Evaluate** — Paste a job URL or description, get a live-streamed A-G evaluation powered by Claude
- **Applications** — Full tracker with filtering, sorting, status updates
- **Pipeline** — Queue of pending job URLs + one-click portal scanner (Greenhouse/Ashby/Lever)
- **Reports** — Browse saved evaluation reports with markdown rendering + PDF download
- **Settings** — Edit CV, profile, and personalization in the browser

## Quick Start

### 1. Set up environment

Edit `.env.local`:

```env
# Create a free DB at https://neon.tech
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Get your key at https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-...

# Path to career-ops root (parent directory)
CAREER_OPS_ROOT=..
```

### 2. Push database schema

```bash
npm run db:push
```

### 3. Install Playwright (for PDF generation)

```bash
npx playwright install chromium
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Architecture

```
career-ops-web/
├── app/
│   ├── (dashboard)/        ← All UI pages (route group, no URL prefix)
│   │   ├── page.tsx        ← Dashboard
│   │   ├── evaluate/       ← Evaluate jobs with live streaming
│   │   ├── applications/   ← Application tracker
│   │   ├── pipeline/       ← Job queue + scanner
│   │   ├── reports/        ← Saved reports browser
│   │   └── settings/       ← CV editor + profile
│   └── api/
│       ├── evaluate/       ← POST: Streams Claude evaluation
│       ├── scan/           ← POST: Scans Greenhouse/Ashby/Lever
│       ├── pdf/            ← POST: Generates PDF via Playwright
│       ├── fetch-jd/       ← GET: Fetches job page content
│       ├── applications/   ← CRUD
│       ├── pipeline/       ← CRUD
│       ├── reports/        ← CRUD
│       └── profile/        ← PUT/GET profile key-value store
├── lib/
│   ├── claude.ts           ← Anthropic SDK client
│   ├── modes.ts            ← Reads modes/*.md from career-ops root
│   ├── scanner.ts          ← Zero-token portal scanner
│   ├── utils.ts            ← Helpers (cn, scoreColor, etc.)
│   └── db/
│       ├── schema.ts       ← Drizzle ORM schema
│       └── index.ts        ← DB connection
└── components/
    ├── Sidebar.tsx
    └── DashboardCharts.tsx
```

## How It Works

The web app reads `modes/*.md` files from the parent `career-ops` directory at runtime (server-side). These files contain the evaluation prompts that guide Claude. Your CV and profile are stored in the database (via Settings) rather than in local files.

**Evaluation flow:**
1. User pastes a URL → server fetches the job page HTML
2. Server builds a prompt from `modes/oferta.md` + `modes/_shared.md` + your CV
3. Streams Claude's response token-by-token to the browser
4. User saves the report and it's added to the tracker

## Database Scripts

```bash
npm run db:push      # Apply schema to Neon DB
npm run db:generate  # Generate migration files
npm run db:studio    # Open Drizzle Studio (DB browser)
```

## Stack

- **Next.js 15** (App Router)
- **Anthropic SDK** (claude-opus-4-5, streaming)
- **Neon PostgreSQL** + **Drizzle ORM**
- **shadcn/ui** + **Tailwind CSS**
- **Recharts** (score distribution charts)
- **Playwright** (server-side PDF generation)
