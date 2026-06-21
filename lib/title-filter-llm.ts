// LLM-backed title-filter derivation. Turns the user's CV + target role into a
// short list of job-title keywords used to filter scanned postings. Adapts to
// any profession and any CV language (job boards return English titles, so the
// keywords are emitted in English).
//
// This is best-effort: the scan route falls back to the deterministic
// deriveTitleFilter() in lib/title-filter.ts when the key is missing or the call
// fails, so a scan is never blocked on the model.

import { getAnthropic, FAST_MODEL } from './claude';

const MAX_KEYWORDS = 16;

function extractJsonArray(text: string): string[] {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((k): k is string => typeof k === 'string')
      .map(k => k.trim())
      .filter(Boolean)
      .slice(0, MAX_KEYWORDS);
  } catch {
    return [];
  }
}

export async function deriveTitleFilterLLM(
  cv?: string,
  targetRole?: string,
): Promise<string[]> {
  if (!process.env.ANTHROPIC_API_KEY) return [];
  if (!cv && !targetRole) return [];

  const anthropic = getAnthropic();

  const system = [
    'You map a candidate to job-title search keywords for a job-board scanner.',
    'The scanner keeps a posting when its TITLE contains (case-insensitive) any',
    'of your keywords as a substring. Return ONLY a JSON array of 8-16 short',
    'English keywords/phrases (1-3 words each) describing the roles this',
    'candidate should be matched to — the profession and close adjacent roles,',
    'plus key domain terms. Prefer phrases over single generic words like',
    '"Specialist" or "Manager" alone. No seniority-only words. Job titles are in',
    'English even for non-English markets. Output JSON only, nothing else.',
  ].join(' ');

  const userParts: string[] = [];
  if (targetRole) userParts.push(`Target role: ${targetRole}`);
  if (cv) userParts.push(`CV:\n${cv.slice(0, 4000)}`);

  const res = await anthropic.messages.create({
    model: FAST_MODEL,
    max_tokens: 400,
    system,
    messages: [{ role: 'user', content: userParts.join('\n\n') }],
  });

  const text = res.content
    .filter(block => block.type === 'text')
    .map(block => (block as { text: string }).text)
    .join('');

  return extractJsonArray(text);
}
