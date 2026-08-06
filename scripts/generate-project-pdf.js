const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const input = path.join(__dirname, '..', 'PROJECT_DETAILS.md');
const output = path.join(__dirname, '..', 'PROJECT_DETAILS.pdf');

function renderMarkdownToPDF(mdText, doc) {
  const lines = mdText.split(/\r?\n/);
  doc.font('Helvetica');
  let first = true;
  lines.forEach((line) => {
    if (!first) doc.moveDown(0.1);
    first = false;
    if (line.startsWith('# ')) {
      doc.fontSize(20).text(line.replace(/^#\s+/, ''));
      doc.moveDown(0.2);
      doc.fontSize(12);
    } else if (line.startsWith('## ')) {
      doc.fontSize(16).text(line.replace(/^##\s+/, ''));
      doc.moveDown(0.1);
      doc.fontSize(12);
    } else if (line.startsWith('### ')) {
      doc.fontSize(14).text(line.replace(/^###\s+/, ''));
      doc.fontSize(12);
    } else {
      doc.fontSize(10).text(line);
    }
  });
}

try {
  const md = fs.readFileSync(input, 'utf8');
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const stream = fs.createWriteStream(output);
  doc.pipe(stream);
  renderMarkdownToPDF(md, doc);
  doc.end();
  stream.on('finish', () => {
    console.log('PROJECT_DETAILS.pdf generated at', output);
  });
} catch (err) {
  console.error('Failed to generate PDF:', err);
  process.exit(1);
}
