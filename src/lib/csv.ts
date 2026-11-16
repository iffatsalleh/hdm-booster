function cell(v: unknown): string {
  if (v === null || v === undefined) return '';
  let s = String(v);
  // CSV formula injection: a cell Excel/Sheets would read as a formula gets a leading ' (shown as text)
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** RFC 4180 CSV with UTF-8 BOM (for Excel). Columns come from the first row's keys. */
export function toCsv(rows: Record<string, unknown>[]): string {
  const BOM = '\uFEFF';
  if (!rows.length) return BOM;
  const keys = Object.keys(rows[0]);
  const lines = [keys.map(cell).join(',')];
  for (const r of rows) lines.push(keys.map((k) => cell(r[k])).join(','));
  return BOM + lines.join('\r\n') + '\r\n';
}
