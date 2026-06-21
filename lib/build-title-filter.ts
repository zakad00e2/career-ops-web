import { deriveTitleFilter } from '@/lib/title-filter';
import { deriveTitleFilterLLM } from '@/lib/title-filter-llm';
import { loadProfileFromDb } from '@/lib/profile-store';

export interface TitleFilterInput {
  cv?: string;
  targetRole?: string;
}

/** Derive scan keywords from CV + target role. LLM first, deterministic fallback. */
export async function buildTitleFilter(input: TitleFilterInput): Promise<string[]> {
  const { cv, targetRole } = input;

  try {
    const llm = await deriveTitleFilterLLM(cv, targetRole);
    if (llm.length > 0) return llm;
  } catch {
    // fall through to deterministic derivation
  }

  return deriveTitleFilter(cv, targetRole);
}

/** Read profile from DB and derive the scan title filter. Re-runs every call. */
export async function buildTitleFilterFromProfile(): Promise<{
  titleFilter: string[];
  cv?: string;
  targetRole?: string;
}> {
  let cv: string | undefined;
  let targetRole: string | undefined;

  try {
    const map = await loadProfileFromDb();
    cv = map.cv?.trim() || undefined;
    targetRole = map.targetRole?.trim() || undefined;
  } catch {
    // deriveTitleFilter falls back when both are missing
  }

  const titleFilter = await buildTitleFilter({ cv, targetRole });
  return { titleFilter, cv, targetRole };
}
