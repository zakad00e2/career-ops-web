/**
 * One-off backfill: translate existing English report content in the DB to Arabic.
 *
 * Usage:
 *   npx tsx scripts/translate-reports.ts          # translate all non-Arabic reports
 *   npx tsx scripts/translate-reports.ts --dry     # show what would change, no writes
 *   npx tsx scripts/translate-reports.ts --force   # re-translate even if already Arabic
 *
 * Only the markdown `content` column is translated. The score / legitimacy /
 * company / role columns are stored separately and left untouched. The prompt
 * keeps the machine-readable header lines stable so the app's parsers keep working.
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import { reports } from '../lib/db/schema';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const DRY = process.argv.includes('--dry');
const FORCE = process.argv.includes('--force');
const MODEL = 'claude-opus-4-5';

// Share of Arabic letters above which we treat the report as already translated.
function arabicRatio(text: string): number {
  const arabic = (text.match(/[؀-ۿ]/g) || []).length;
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  const total = arabic + latin;
  return total === 0 ? 0 : arabic / total;
}

const TRANSLATE_PROMPT = `ترجم تقرير تقييم الوظيفة التالي (بصيغة Markdown) إلى اللغة العربية الفصحى.

القواعد:
- ترجم كل العناوين والجداول والفقرات إلى العربية.
- حافظ على بنية Markdown كما هي تماماً (مستويات العناوين #، الجداول، القوائم، الفواصل ---).
- حوّل العنوان الرئيسي إلى الصيغة: "# تقييم: {اسم الشركة} — {المسمى الوظيفي}" مع الإبقاء على الفاصل "—".
- حوّل سطر الدرجة إلى: "**التقييم:** {X}/5" مع إبقاء الرقم كما هو بالأرقام الغربية.
- حوّل سطر المصداقية إلى: "**المصداقية:** {القيمة}".
- أبقِ أسماء الشركات والمسميات الوظيفية والمصطلحات التقنية وأسماء الأدوات بلغتها الأصلية.
- استخدم الأرقام الغربية (0-9) لكل الأرقام.
- أعِد نص Markdown المترجم فقط، بدون أي مقدمة أو تعليق.

التقرير:
`;

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!dbUrl) throw new Error('DATABASE_URL is required (.env)');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is required (.env)');

  const db = drizzle(neon(dbUrl), { schema: { reports } });
  const anthropic = new Anthropic({ apiKey });

  const rows = await db.select().from(reports);
  console.log(`Found ${rows.length} report(s).`);

  let translated = 0;
  let skipped = 0;

  for (const row of rows) {
    const ratio = arabicRatio(row.content);
    if (ratio > 0.4 && !FORCE) {
      console.log(`  [skip] #${row.id} ${row.company} — already Arabic (${(ratio * 100) | 0}%)`);
      skipped++;
      continue;
    }

    console.log(`  [translate] #${row.id} ${row.company} — ${row.role}${DRY ? ' (dry-run)' : ''}`);
    if (DRY) {
      translated++;
      continue;
    }

    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8192,
      messages: [{ role: 'user', content: TRANSLATE_PROMPT + row.content }],
    });

    const out = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim();

    if (!out) {
      console.log(`  [warn] #${row.id} produced empty output — left unchanged`);
      continue;
    }

    await db.update(reports).set({ content: out }).where(eq(reports.id, row.id));
    translated++;
  }

  console.log(`\nDone. Translated: ${translated}, Skipped: ${skipped}.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
