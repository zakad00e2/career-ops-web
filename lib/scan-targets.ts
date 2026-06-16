export interface ScanTarget {
  company: string;
  provider: 'greenhouse' | 'ashby' | 'lever';
  boardToken: string;
  // Optional per-company override. Left unset so the dynamic, CV-derived global
  // filter (see lib/title-filter.ts) applies to every company instead.
  titleFilter?: string[];
}

// All tokens verified live against the provider APIs (2026-06). Companies that
// disabled their public ATS API (OpenAI, Cohere, Mistral, Replit, Retool, Linear,
// Notion) were removed — they can't be scanned via Greenhouse/Ashby/Lever and
// must be added to the pipeline manually. Vercel moved from Lever to Greenhouse.
export const DEFAULT_TARGETS: ScanTarget[] = [
  { company: 'Anthropic', provider: 'greenhouse', boardToken: 'anthropic' },
  { company: 'Figma', provider: 'greenhouse', boardToken: 'figma' },
  { company: 'Vercel', provider: 'greenhouse', boardToken: 'vercel' },
  { company: 'Stripe', provider: 'greenhouse', boardToken: 'stripe' },
  { company: 'Databricks', provider: 'greenhouse', boardToken: 'databricks' },
  { company: 'Dropbox', provider: 'greenhouse', boardToken: 'dropbox' },
  { company: 'Reddit', provider: 'greenhouse', boardToken: 'reddit' },
  { company: 'Robinhood', provider: 'greenhouse', boardToken: 'robinhood' },
  { company: 'Twilio', provider: 'greenhouse', boardToken: 'twilio' },
  { company: 'Coinbase', provider: 'greenhouse', boardToken: 'coinbase' },
  { company: 'Discord', provider: 'greenhouse', boardToken: 'discord' },
  { company: 'Webflow', provider: 'greenhouse', boardToken: 'webflow' },
];
