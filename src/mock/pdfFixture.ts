// DEV MOCK ONLY: builds a small valid multi-page PDF at runtime (no binary fixture in the repo or in dist).
const enc = new TextEncoder();

const esc = (s: string) => s.replace(/[\\()]/g, (c) => '\\' + c).replace(/[^\x20-\x7e]/g, '?');

function pageContent(title: string, n: number, total: number): string {
  const lines: string[] = [
    '0.07 0.15 0.36 rg 0 762 595 80 re f',
    `BT /F1 22 Tf 1 1 1 rg 40 790 Td (${esc(title)}) Tj ET`,
    `BT /F1 13 Tf 0.07 0.15 0.36 rg 40 720 Td (Halaman ${n} daripada ${total}) Tj ET`,
  ];
  for (let i = 0; i < 18; i++) {
    const w = i % 5 === 4 ? 330 : 515;
    lines.push(`0.89 0.91 0.94 rg 40 ${680 - i * 30} ${w} 10 re f`);
  }
  lines.push(`BT /F1 11 Tf 0.4 0.45 0.55 rg 260 40 Td (- ${n} -) Tj ET`);
  return lines.join('\n');
}

/** `pages`-page A4 PDF with a header, page number and grey text lines; Helvetica (standard font). */
export function buildMockPdf(title: string, pages = 6): Uint8Array {
  // objects: 1 catalog, 2 pages, 3 font, then (page, content) pairs
  const objs: string[] = [];
  const kids: string[] = [];
  objs[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objs[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
  for (let i = 0; i < pages; i++) {
    const pageId = 4 + i * 2;
    const contentId = pageId + 1;
    kids.push(`${pageId} 0 R`);
    const stream = pageContent(title, i + 1, pages);
    objs[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`;
    objs[contentId] = `<< /Length ${enc.encode(stream).length} >>\nstream\n${stream}\nendstream`;
  }
  objs[2] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages} >>`;

  let out = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (let id = 1; id < objs.length; id++) {
    offsets[id] = enc.encode(out).length;
    out += `${id} 0 obj\n${objs[id]}\nendobj\n`;
  }
  const xref = enc.encode(out).length;
  out += `xref\n0 ${objs.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objs.length; id++) out += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  out += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return enc.encode(out);
}
