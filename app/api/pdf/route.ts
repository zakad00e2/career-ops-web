import { NextRequest } from 'next/server';
import { getTemplateHtml } from '@/lib/modes';
import { getAnthropic, MODEL } from '@/lib/claude';

export const runtime = 'nodejs';
export const maxDuration = 120;

interface CvExperience {
  company?: string;
  period?: string;
  role?: string;
  location?: string;
  bullets?: string[];
}

interface CvProject {
  title?: string;
  badge?: string;
  description?: string;
  tech?: string;
}

interface CvEducation {
  title?: string;
  org?: string;
  year?: string;
  description?: string;
}

interface CvCertification {
  title?: string;
  org?: string;
  year?: string;
}

interface CvSkill {
  category?: string;
  items?: string;
}

interface CvData {
  name?: string;
  phone?: string;
  email?: string;
  linkedinUrl?: string;
  linkedinDisplay?: string;
  portfolioUrl?: string;
  portfolioDisplay?: string;
  location?: string;
  summary?: string;
  competencies?: string[];
  experience?: CvExperience[];
  projects?: CvProject[];
  education?: CvEducation[];
  certifications?: CvCertification[];
  skills?: CvSkill[];
}

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Extract the JSON object from a model response that may wrap it in prose or fences. */
function parseCvJson(text: string): CvData {
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return {};
    return JSON.parse(text.slice(start, end + 1)) as CvData;
  } catch {
    return {};
  }
}

/**
 * Ask the model to convert the CV (tailored to the JD) into the structured shape
 * the template expects. Returning compact JSON — instead of a full HTML echo —
 * keeps the response well under the token limit and never mangles the CSS.
 */
async function buildCvData(
  cvContent: string,
  jobDescription: string,
  profileYml: string,
): Promise<CvData> {
  const anthropic = getAnthropic();
  const tailorLine = jobDescription
    ? 'Tailor the wording and ordering to the job description below (reorder bullets by relevance, rewrite the summary to speak to this role). Never invent facts, employers, dates, or metrics.'
    : 'Structure the CV faithfully. Never invent facts.';

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are an expert CV writer. Convert the CV into a JSON object matching EXACTLY this shape (omit fields you cannot fill; never invent data):

{
  "name": string,
  "phone": string,
  "email": string,
  "linkedinUrl": string,
  "linkedinDisplay": string,
  "portfolioUrl": string,
  "portfolioDisplay": string,
  "location": string,
  "summary": string,
  "competencies": string[],
  "experience": [{ "company": string, "period": string, "role": string, "location": string, "bullets": string[] }],
  "projects": [{ "title": string, "badge": string, "description": string, "tech": string }],
  "education": [{ "title": string, "org": string, "year": string, "description": string }],
  "certifications": [{ "title": string, "org": string, "year": string }],
  "skills": [{ "category": string, "items": string }]
}

${tailorLine}

Output ONLY the JSON object, no prose, no markdown fences.

## CV
${cvContent}

## Profile / Config (contact details may live here)
${profileYml}

## Job Description
${jobDescription || '(none provided)'}`,
      },
    ],
  });

  const text = message.content[0]?.type === 'text' ? message.content[0].text : '';
  return parseCvJson(text);
}

function buildCompetencies(items: string[]): string {
  return items
    .filter(Boolean)
    .map(c => `<span class="competency-tag">${esc(c)}</span>`)
    .join('\n      ');
}

function buildExperience(jobs: CvExperience[]): string {
  return jobs
    .map(j => {
      const bullets = (j.bullets ?? []).filter(Boolean);
      return `<div class="job">
      <div class="job-header">
        <span class="job-company">${esc(j.company)}</span>
        <span class="job-period">${esc(j.period)}</span>
      </div>
      <div class="job-role">${esc(j.role)}${j.location ? ` <span class="job-location">${esc(j.location)}</span>` : ''}</div>
      ${bullets.length ? `<ul>${bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
    </div>`;
    })
    .join('\n    ');
}

function buildProjects(projects: CvProject[]): string {
  return projects
    .map(p => `<div class="project">
      <span class="project-title">${esc(p.title)}</span>${p.badge ? `<span class="project-badge">${esc(p.badge)}</span>` : ''}
      ${p.description ? `<div class="project-desc">${esc(p.description)}</div>` : ''}
      ${p.tech ? `<div class="project-tech">${esc(p.tech)}</div>` : ''}
    </div>`)
    .join('\n    ');
}

function buildEducation(items: CvEducation[]): string {
  return items
    .map(e => `<div class="edu-item">
      <div class="edu-header">
        <span class="edu-title">${esc(e.title)}${e.org ? ` — <span class="edu-org">${esc(e.org)}</span>` : ''}</span>
        <span class="edu-year">${esc(e.year)}</span>
      </div>
      ${e.description ? `<div class="edu-desc">${esc(e.description)}</div>` : ''}
    </div>`)
    .join('\n    ');
}

function buildCertifications(items: CvCertification[]): string {
  return items
    .map(c => `<div class="cert-item">
      <span class="cert-title">${esc(c.title)}</span>
      <span class="cert-org">${esc(c.org)}</span>
      <span class="cert-year">${esc(c.year)}</span>
    </div>`)
    .join('\n    ');
}

function buildSkills(items: CvSkill[]): string {
  return items
    .map(s => `<div class="skill-item"><span class="skill-category">${esc(s.category)}:</span> ${esc(s.items)}</div>`)
    .join('\n      ');
}

/** Fill every template placeholder. Section titles are blanked when their section is empty. */
function fillTemplate(rawTemplate: string, data: CvData, name: string): string {
  const competencies = (data.competencies ?? []).filter(Boolean);
  const experience = data.experience ?? [];
  const projects = data.projects ?? [];
  const education = data.education ?? [];
  const certifications = data.certifications ?? [];
  const skills = data.skills ?? [];

  let html = rawTemplate
    .replace(/{{LANG}}/g, 'en')
    .replace(/{{PAGE_WIDTH}}/g, '800px')
    .replace(/{{NAME}}/g, esc(name))
    .replace(/{{PHONE}}/g, esc(data.phone))
    .replace(/{{EMAIL}}/g, esc(data.email))
    .replace(/{{LINKEDIN_URL}}/g, esc(data.linkedinUrl || '#'))
    .replace(/{{LINKEDIN_DISPLAY}}/g, esc(data.linkedinDisplay))
    .replace(/{{PORTFOLIO_URL}}/g, esc(data.portfolioUrl || '#'))
    .replace(/{{PORTFOLIO_DISPLAY}}/g, esc(data.portfolioDisplay))
    .replace(/{{LOCATION}}/g, esc(data.location))
    .replace(/{{SECTION_SUMMARY}}/g, data.summary ? 'Professional Summary' : '')
    .replace(/{{SUMMARY_TEXT}}/g, esc(data.summary))
    .replace(/{{SECTION_COMPETENCIES}}/g, competencies.length ? 'Core Competencies' : '')
    .replace(/{{COMPETENCIES}}/g, buildCompetencies(competencies))
    .replace(/{{SECTION_EXPERIENCE}}/g, experience.length ? 'Experience' : '')
    .replace(/{{EXPERIENCE}}/g, buildExperience(experience))
    .replace(/{{SECTION_PROJECTS}}/g, projects.length ? 'Projects' : '')
    .replace(/{{PROJECTS}}/g, buildProjects(projects))
    .replace(/{{SECTION_EDUCATION}}/g, education.length ? 'Education' : '')
    .replace(/{{EDUCATION}}/g, buildEducation(education))
    .replace(/{{SECTION_CERTIFICATIONS}}/g, certifications.length ? 'Certifications' : '')
    .replace(/{{CERTIFICATIONS}}/g, buildCertifications(certifications))
    .replace(/{{SECTION_SKILLS}}/g, skills.length ? 'Skills' : '')
    .replace(/{{SKILLS}}/g, buildSkills(skills));

  // Defense-in-depth: never let an unhandled placeholder reach the user again.
  html = html.replace(/{{[A-Z0-9_]+}}/g, '');
  return html;
}

export async function POST(req: NextRequest) {
  try {
    const { cvContent, jobDescription, profileYml, candidateName } = await req.json();

    if (!cvContent) {
      return Response.json({ error: 'cvContent is required' }, { status: 400 });
    }

    const data = await buildCvData(cvContent, jobDescription || '', profileYml || '');

    // Fallback: if the model returned nothing usable, at least show the raw CV
    // in the summary so the user never gets an empty document.
    if (!data.summary && !(data.experience?.length) && !(data.skills?.length)) {
      data.summary = cvContent;
    }

    const name = candidateName || data.name || 'Candidate';

    const template = fillTemplate(getTemplateHtml(), data, name);

    // Return a print-ready HTML document instead of rendering a PDF server-side.
    // Vercel's serverless functions cannot run a headless Chromium (no browser
    // binary, function-size limits), so we let the browser produce the PDF via
    // "Print → Save as PDF". An auto-print script opens the dialog on load.
    const printScript =
      '<script>window.addEventListener("load",function(){setTimeout(function(){window.print();},400);});</script>';
    const printable = template.includes('</body>')
      ? template.replace('</body>', `${printScript}</body>`)
      : template + printScript;

    return new Response(printable, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${slugify(name)}-cv.html"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
