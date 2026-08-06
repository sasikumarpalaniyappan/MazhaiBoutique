const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const input = path.join(process.cwd(), 'PROJECT_DOCUMENTATION_PACK.md');
const output = path.join(process.cwd(), 'PROJECT_DOCUMENTATION_PACK.pdf');

if (!fs.existsSync(input)) {
  console.error('Input file not found:', input);
  process.exit(1);
}

const chromeCandidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'MicrosoftEdge',
  'msedge'
];

function findExecutable() {
  for (const candidate of chromeCandidates) {
    try {
      execFileSync(candidate, ['--version'], { stdio: 'ignore' });
      return candidate;
    } catch {
      // continue
    }
  }
  return null;
}

const browser = findExecutable();
if (!browser) {
  console.error('No supported browser executable found for PDF export.');
  process.exit(1);
}

const tempHtml = path.join(process.cwd(), 'PROJECT_DOCUMENTATION_PACK.html');
const markdown = fs.readFileSync(input, 'utf8');
const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Project Documentation</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.5; max-width: 900px; margin: 40px auto; color: #222; }
      h1, h2, h3 { color: #1f2937; }
      code { background: #f3f4f6; padding: 2px 4px; border-radius: 4px; }
      pre { background: #f3f4f6; padding: 12px; overflow-x: auto; }
    </style>
  </head>
  <body>
    ${markdown
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^### (.*)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*)$/gm, '<h1>$1</h1>')
      .replace(/\n/g, '<br />')}
  </body>
</html>`;

fs.writeFileSync(tempHtml, html);

try {
  const args = ['--headless=new', '--disable-gpu', '--print-to-pdf=' + output, tempHtml];
  execFileSync(browser, args, { stdio: 'inherit' });
  console.log('Created', output);
} catch (err) {
  console.error(err.message);
  process.exit(1);
} finally {
  if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
}
