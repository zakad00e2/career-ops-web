import { NextRequest } from 'next/server';
import { getTemplateHtml } from '@/lib/modes';
import { getAnthropic, MODEL } from '@/lib/claude';
import path from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';
export const maxDuration = 120;

async function generateTailoredCv(
  cvContent: string,
  jobDescription: string,
  profileYml: string
): Promise<string> {
  const anthropic = getAnthropic();
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are an expert CV writer. Tailor the following CV for the job description below.
        
Rules:
- Keep all factual information accurate (never invent metrics)
- Optimize keyword placement for ATS
- Reorder bullet points to match job priorities
- Rewrite the summary to speak directly to this role
- Output ONLY the tailored CV in markdown format

## Original CV
${cvContent}

## Profile/Config
${profileYml}

## Job Description
${jobDescription}`,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : cvContent;
}

function cvMarkdownToHtml(markdown: string, name: string): string {
  const lines = markdown.split('\n');
  let html = '';
  let inList = false;

  for (const line of lines) {
    if (line.startsWith('# ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h1>${line.slice(2)}</h1>`;
    } else if (line.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h2>${line.slice(3)}</h2>`;
    } else if (line.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h3>${line.slice(4)}</h3>`;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${line.slice(2)}</li>`;
    } else if (line.startsWith('**') && line.endsWith('**')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p><strong>${line.slice(2, -2)}</strong></p>`;
    } else if (line.trim() === '') {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<br>';
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p>${line}</p>`;
    }
  }
  if (inList) html += '</ul>';
  return html;
}

export async function POST(req: NextRequest) {
  try {
    const { cvContent, jobDescription, profileYml, candidateName } = await req.json();

    if (!cvContent) {
      return Response.json({ error: 'cvContent is required' }, { status: 400 });
    }

    // Tailor CV with AI if job description is provided
    const tailoredCv = jobDescription
      ? await generateTailoredCv(cvContent, jobDescription, profileYml || '')
      : cvContent;

    // Get the HTML template
    let template = getTemplateHtml();

    const name = candidateName || 'Candidate';
    const cvBodyHtml = cvMarkdownToHtml(tailoredCv, name);

    // Replace template placeholders
    template = template
      .replace(/{{NAME}}/g, name)
      .replace(/{{LANG}}/g, 'en')
      .replace(/{{CV_CONTENT}}/g, cvBodyHtml);

    // Try to use Playwright for PDF generation
    try {
      // dynamically require playwright to avoid missing type errors at compile time
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
      const pw = require('playwright') as any;
      const chromium = pw.chromium;

      // Fix font paths for server-side rendering
      const careerOpsRoot = process.env.CAREER_OPS_ROOT
        ? path.resolve(process.cwd(), process.env.CAREER_OPS_ROOT)
        : path.resolve(process.cwd(), '..');
      const fontsDir = path.join(careerOpsRoot, 'fonts');
      if (existsSync(fontsDir)) {
        template = template.replace(/url\('\.\/fonts\//g, `url('file://${fontsDir.replace(/\\/g, '/')}/`);
      }

      const browser = await chromium.launch();
      const page = await browser.newPage();
      await page.setContent(template, { waitUntil: 'networkidle' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      });
      await browser.close();

      return new Response(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${slugify(name)}-cv.pdf"`,
        },
      });
    } catch {
      // Playwright not available — return HTML
      return new Response(template, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="${slugify(name)}-cv.html"`,
        },
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
