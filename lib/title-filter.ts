// Derives scan title-filter keywords from the user's CV + target role.
// Deterministic and zero-cost. Re-runs on every scan, so editing the CV in
// Settings automatically changes which jobs the scanner surfaces.
//
// Strategy: score each role family by how many of its signals appear in the CV,
// then keep only the dominant family (and any family within DOMINANCE_RATIO of
// it). This avoids a single incidental mention (e.g. a frontend dev who lists
// "Node.js" or "REST APIs") dragging in a whole unrelated role family.

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

/**
 * Build a title filter from the CV text and target role.
 * Returns the keywords of the dominant role family (plus any close runner-up).
 * Falls back to a generic engineer/developer filter if nothing matches.
 */
export function deriveTitleFilter(cv?: string, targetRole?: string): string[] {
  const text = `${cv ?? ''} ${targetRole ?? ''}`.toLowerCase();

  const scored = ROLE_FAMILIES.map(family => ({
    family,
    score: family.signals.filter(signal => text.includes(signal)).length,
  })).filter(entry => entry.score > 0);

  if (scored.length === 0) {
    // No recognizable stack — stay broad rather than returning nothing.
    return ['Engineer', 'Developer'];
  }

  const topScore = Math.max(...scored.map(entry => entry.score));
  const result = new Set<string>();
  for (const { family, score } of scored) {
    if (score >= topScore * DOMINANCE_RATIO) {
      family.expand.forEach(keyword => result.add(keyword));
    }
  }

  return [...result];
}
