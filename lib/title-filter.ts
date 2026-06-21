// Derives scan title-filter keywords from the user's CV + target role.
// Deterministic and zero-cost. Re-runs on every scan, so editing the CV in
// Settings automatically changes which jobs the scanner surfaces.
//
// Works for ANY profession (engineering, PR, marketing, finance, ...). The
// target role is the strongest signal; the CV adds domain vocabulary. A set of
// software role families is kept as a bonus expansion so tech CVs still get
// rich, recruiter-style title variants — but it is never required.

interface RoleFamily {
  name: string;
  // Substrings that, if present in the CV/target-role text, score this family.
  signals: string[];
  // Job-title keywords matched (case-insensitive substring) against scanned titles.
  expand: string[];
}

// A family is included if its signal score is at least this fraction of the top
// family's score. 0.5 keeps a genuine secondary specialization but drops noise.
const DOMINANCE_RATIO = 0.5;

export const ROLE_FAMILIES: RoleFamily[] = [
  {
    name: 'frontend',
    signals: [
      'frontend', 'front-end', 'front end', 'react', 'vue', 'angular', 'svelte',
      'next.js', 'nextjs', 'tailwind', 'html5', 'css3', 'ui/ux', 'shadcn',
      'material ui', 'framer motion', 'web developer', 'web engineer',
    ],
    expand: [
      'Frontend', 'Front End', 'Front-End', 'React', 'UI Engineer', 'UI/UX',
      'Web Developer', 'Web Engineer', 'Fullstack', 'Full Stack', 'Full-Stack',
      'Product Engineer',
    ],
  },
  {
    name: 'backend',
    // Deliberately excludes weak/shared signals like "node.js" and "rest api"
    // that frontend/fullstack devs commonly list. Needs real backend evidence.
    signals: [
      'backend', 'back-end', 'back end', 'django', 'flask', 'fastapi', 'express',
      'nestjs', 'spring boot', 'rails', 'golang', 'microservice', 'graphql',
    ],
    expand: [
      'Backend', 'Back End', 'Back-End', 'Backend Engineer', 'API Engineer',
      'Platform Engineer', 'Fullstack', 'Full Stack', 'Full-Stack',
    ],
  },
  {
    name: 'data-ai',
    signals: [
      'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'data science',
      'data scientist', 'data engineer', 'llm', 'nlp', 'mlops', 'pandas', 'numpy',
    ],
    expand: [
      'AI', 'ML', 'Machine Learning', 'Data Engineer', 'Data Scientist',
      'Research Engineer', 'MLOps',
    ],
  },
  {
    name: 'devops',
    signals: [
      'devops', 'kubernetes', 'terraform', 'docker', 'ci/cd', 'site reliability',
      'infrastructure', 'ansible', 'cloudformation',
    ],
    expand: [
      'DevOps', 'SRE', 'Site Reliability', 'Infrastructure', 'Platform Engineer',
      'Cloud Engineer',
    ],
  },
  {
    name: 'mobile',
    signals: ['react native', 'flutter', 'swiftui', ' kotlin', 'android developer', 'ios developer'],
    expand: ['Mobile', 'iOS', 'Android', 'React Native', 'Flutter'],
  },
];

// Common words that carry no signal for matching job titles.
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have',
  'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'to', 'with', 'will',
  'who', 'i', 'we', 'our', 'you', 'your', 'their', 'this', 'these', 'those',
  'experience', 'experienced', 'proven', 'strong', 'skilled', 'background',
  'years', 'year', 'work', 'working', 'team', 'teams', 'role', 'roles', 'company',
  'companies', 'business', 'including', 'across', 'within', 'various', 'multiple',
  'ability', 'effective', 'effectively', 'recognized', 'supporting', 'support',
  'responsible', 'responsibilities', 'looking', 'seeking', 'passionate',
]);

// Seniority / generic role-level words. Useful inside a phrase, but too broad to
// match on alone (e.g. "Specialist" would match unrelated specialist roles).
const ROLE_LEVEL = new Set([
  'specialist', 'manager', 'senior', 'junior', 'associate', 'officer', 'lead',
  'coordinator', 'intern', 'director', 'head', 'chief', 'assistant', 'executive',
  'principal', 'staff', 'expert', 'professional', 'generalist',
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    // Keep letters (any script), digits, and common tech punctuation.
    .replace(/[^\p{L}\p{N}+/.#\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Keywords from the target role: the full phrase, its adjacent word pairs, and
// any non-generic single words. This is the highest-signal source.
function keywordsFromRole(targetRole?: string): string[] {
  const role = normalize(targetRole ?? '');
  if (!role) return [];

  const out = new Set<string>();
  const words = role.split(' ').filter(Boolean);

  if (words.length >= 2) out.add(role); // exact full phrase

  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    // Skip bigrams made only of stop/level words.
    if (!isGenericPair(words[i], words[i + 1])) out.add(bigram);
  }

  for (const w of words) {
    if (w.length >= 4 && !STOPWORDS.has(w) && !ROLE_LEVEL.has(w)) out.add(w);
  }

  return [...out];
}

function isGenericPair(a: string, b: string): boolean {
  const aGeneric = STOPWORDS.has(a) || ROLE_LEVEL.has(a);
  const bGeneric = STOPWORDS.has(b) || ROLE_LEVEL.has(b);
  return aGeneric && bGeneric;
}

// Domain vocabulary from the CV: the most frequent meaningful words. Captures
// terms the target-role string omits (e.g. a PR CV mentioning "communications",
// "media", "events", "stakeholder").
function keywordsFromCv(cv?: string, limit = 6): string[] {
  const text = normalize(cv ?? '');
  if (!text) return [];

  const counts = new Map<string, number>();
  for (const raw of text.split(' ')) {
    const w = raw.trim();
    if (w.length < 5 || STOPWORDS.has(w) || ROLE_LEVEL.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, n]) => n >= 2) // appears more than once => likely a theme
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w);
}

// Tech-family expansion (bonus). Returns recruiter-style title variants when the
// CV clearly belongs to one or two software role families; empty otherwise.
function keywordsFromFamilies(cv?: string, targetRole?: string): string[] {
  const text = `${cv ?? ''} ${targetRole ?? ''}`.toLowerCase();

  const scored = ROLE_FAMILIES.map(family => ({
    family,
    score: family.signals.filter(signal => text.includes(signal)).length,
  })).filter(entry => entry.score > 0);

  if (scored.length === 0) return [];

  const topScore = Math.max(...scored.map(entry => entry.score));
  const result = new Set<string>();
  for (const { family, score } of scored) {
    if (score >= topScore * DOMINANCE_RATIO) {
      family.expand.forEach(keyword => result.add(keyword));
    }
  }
  return [...result];
}

/**
 * Build a title filter from the CV text and target role.
 *
 * Sources, in priority order:
 *  1. Target-role phrase + significant words (any profession).
 *  2. Software role-family expansion (bonus, tech CVs only).
 *  3. Frequent domain words from the CV.
 *
 * Falls back to a generic engineer/developer filter only when nothing usable is
 * found, so a scan never returns nothing for lack of a filter.
 */
export function deriveTitleFilter(cv?: string, targetRole?: string): string[] {
  const result = new Set<string>();

  keywordsFromRole(targetRole).forEach(k => result.add(k));
  keywordsFromFamilies(cv, targetRole).forEach(k => result.add(k));

  // Only mine the CV when the role + families gave us little to work with.
  if (result.size < 4) {
    keywordsFromCv(cv).forEach(k => result.add(k));
  }

  if (result.size === 0) {
    return ['Engineer', 'Developer'];
  }

  return [...result];
}
