import assert from 'node:assert/strict';
import test from 'node:test';
import { deriveTitleFilter } from './title-filter';

const AI_CV = `# Demo User

## Summary
Senior AI Engineer with 6+ years building production ML systems. Specialized in LLMOps, evaluation frameworks, and agentic workflows.

## Skills
Python, TypeScript, PyTorch, Ray, Kubernetes, LangChain
`;

test('uses target role as the primary filter signal', () => {
  const filter = deriveTitleFilter('', 'AI Platform Engineer');
  assert.ok(filter.some(k => k.toLowerCase().includes('platform')));
  assert.ok(filter.some(k => k.toLowerCase().includes('engineer')));
});

test('expands tech CVs with role-family keywords', () => {
  const filter = deriveTitleFilter(AI_CV, 'AI Platform Engineer');
  assert.ok(filter.some(k => /ml|ai|machine learning|data/i.test(k)));
});

test('changes keywords when the CV changes', () => {
  const frontendCv = `${AI_CV}\nReact, Next.js, Tailwind, frontend development across multiple teams.`;
  const backendCv = `${AI_CV}\nDjango, FastAPI, microservices, backend development across multiple teams.`;

  const frontendFilter = deriveTitleFilter(frontendCv, 'Software Engineer');
  const backendFilter = deriveTitleFilter(backendCv, 'Software Engineer');

  assert.notDeepEqual(frontendFilter, backendFilter);
  assert.ok(frontendFilter.some(k => /react|frontend|fullstack/i.test(k)));
  assert.ok(backendFilter.some(k => /backend|api|platform/i.test(k)));
});

test('falls back to generic engineer keywords when nothing matches', () => {
  const filter = deriveTitleFilter('', '');
  assert.deepEqual(filter, ['Engineer', 'Developer']);
});
