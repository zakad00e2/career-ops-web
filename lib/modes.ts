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

// Forces Arabic output for the web dashboard without editing the system-layer
// mode files (modes/oferta.md, modes/_shared.md). The "stable lines" rules keep
// the report machine-readable so parseScore / parseCompanyRole in the client and
// the score/legitimacy columns keep working on Arabic reports.
const ARABIC_OUTPUT_DIRECTIVE = `---

## لغة المخرجات (إلزامي)

اكتب التقرير **بالكامل باللغة العربية الفصحى**: كل العناوين، الجداول، والفقرات.

التزم بهذه الصيغ الثابتة حرفياً للحفاظ على قابلية القراءة الآلية:
- العنوان الرئيسي: \`# تقييم: {اسم الشركة} — {المسمى الوظيفي}\` مع الفاصل "—".
- سطر الدرجة: \`**التقييم:** {X}/5\` حيث {X} رقم بالأرقام الغربية (مثل 4.5).
- سطر المصداقية: \`**المصداقية:** {ثقة عالية | المتابعة بحذر | مشبوه}\`.
- أبقِ أسماء الشركات والمسميات الوظيفية والمصطلحات التقنية وأسماء الأدوات بلغتها الأصلية عند الحاجة.
- استخدم الأرقام الغربية (0-9) لكل الأرقام والدرجات.`;

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
    ARABIC_OUTPUT_DIRECTIVE,
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
