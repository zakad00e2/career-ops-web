import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'docs', 'client-cost-proposal.html');
const pdfPath = path.join(__dirname, 'docs', 'Career-Ops-Cost-Proposal-2026-06.pdf');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '15mm', right: '12mm', bottom: '15mm', left: '12mm' },
});
await browser.close();
console.log(`PDF created: ${pdfPath}`);
