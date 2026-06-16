import { DEFAULT_TARGETS, type ScanTarget } from './scan-targets';

export interface ScanJob {
  title: string;
  url: string;
  company: string;
  location?: string;
}

interface GreenhouseJob {
  title: string;
  absolute_url: string;
  location?: { name: string };
}

interface AshbyJob {
  title: string;
  jobUrl: string;
  location?: string;
}

interface LeverJob {
  text: string;
  hostedUrl: string;
  categories?: { location?: string };
}

async function fetchGreenhouse(boardToken: string, titleFilter: string[]): Promise<ScanJob[]> {
  try {
    const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=false`);
    if (!res.ok) return [];
    const data = await res.json() as { jobs: GreenhouseJob[] };
    return data.jobs
      .filter(j => matchesFilter(j.title, titleFilter))
      .map(j => ({
        title: j.title,
        url: j.absolute_url,
        company: boardToken,
        location: j.location?.name,
      }));
  } catch {
    return [];
  }
}

async function fetchAshby(companySlug: string, titleFilter: string[]): Promise<ScanJob[]> {
  try {
    const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${companySlug}`);
    if (!res.ok) return [];
    const data = await res.json() as { jobPostings: AshbyJob[] };
    return (data.jobPostings || [])
      .filter(j => matchesFilter(j.title, titleFilter))
      .map(j => ({
        title: j.title,
        url: j.jobUrl,
        company: companySlug,
        location: j.location,
      }));
  } catch {
    return [];
  }
}

async function fetchLever(company: string, titleFilter: string[]): Promise<ScanJob[]> {
  try {
    const res = await fetch(`https://api.lever.co/v0/postings/${company}?mode=json`);
    if (!res.ok) return [];
    const data = await res.json() as LeverJob[];
    return data
      .filter(j => matchesFilter(j.text, titleFilter))
      .map(j => ({
        title: j.text,
        url: j.hostedUrl,
        company,
        location: j.categories?.location,
      }));
  } catch {
    return [];
  }
}

function matchesFilter(title: string, filters: string[]): boolean {
  if (!filters || filters.length === 0) return true;
  const t = title.toLowerCase();
  return filters.some(f => t.includes(f.toLowerCase()));
}

export type { ScanTarget };
export { DEFAULT_TARGETS };

export async function scanPortals(
  targets: ScanTarget[],
  globalTitleFilter: string[] = [],
  knownUrls: Set<string> = new Set()
): Promise<ScanJob[]> {
  const results: ScanJob[] = [];

  await Promise.allSettled(
    targets.map(async (target) => {
      const filter = target.titleFilter ?? globalTitleFilter;
      let jobs: ScanJob[] = [];

      if (target.provider === 'greenhouse') {
        jobs = await fetchGreenhouse(target.boardToken, filter);
      } else if (target.provider === 'ashby') {
        jobs = await fetchAshby(target.boardToken, filter);
      } else if (target.provider === 'lever') {
        jobs = await fetchLever(target.boardToken, filter);
      }

      for (const job of jobs) {
        if (!knownUrls.has(job.url)) {
          job.company = target.company || job.company;
          results.push(job);
        }
      }
    })
  );

  return results;
}
