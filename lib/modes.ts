import { readFileSync, existsSync } from 'fs';
import path from 'path';

const ROOT = process.env.CAREER_OPS_ROOT
  ? path.resolve(process.cwd(), process.env.CAREER_OPS_ROOT)
  : path.resolve(process.cwd(), '..');

function readModeFile(relativePath: string): string {
  const full = path.join(ROOT, relativePath);
  if (!existsSync(full)) return '';
  return readFileSync(full, 'utf-8');
}

export function buildEvaluationPrompt(cvContent: string, profileContent: string): string {
  const shared = readModeFile('modes/_shared.md');
  const userProfile = profileContent || readModeFile('modes/_profile.md');
  const oferta = readModeFile('modes/oferta.md');
  const articleDigest = readModeFile('article-digest.md');

  const parts = [
    shared,
    userProfile,
    oferta,
    '---',
    '## Candidate CV',
    cvContent,
    articleDigest ? `\n## Article Digest / Proof Points\n${articleDigest}` : '',
  ].filter(Boolean);

  return parts.join('\n\n');
}

export function buildScanPrompt(): string {
  return readModeFile('modes/scan.md');
}

export function buildPipelinePrompt(cvContent: string): string {
  const shared = readModeFile('modes/_shared.md');
  const profile = readModeFile('modes/_profile.md');
  const pipeline = readModeFile('modes/pipeline.md');
  return [shared, profile, pipeline, '## CV\n' + cvContent].filter(Boolean).join('\n\n');
}

export function getTemplateHtml(): string {
  return readModeFile('templates/cv-template.html');
}

export function getProfileYml(): string {
  return readModeFile('config/profile.yml');
}
