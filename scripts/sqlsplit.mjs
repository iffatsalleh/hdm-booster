/**
 * Split a SQL script into statements on top-level `;`.
 * Ignores `;` inside '...', "...", -- line comments, block comments and
 * dollar-quoted blocks ($$...$$ or $tag$...$tag$). Statements are trimmed; empties dropped.
 * @param {string} text
 * @returns {string[]}
 */
export function splitSql(text) {
  const out = [];
  let start = 0;
  let i = 0;
  const n = text.length;

  const push = (end) => {
    const s = text.slice(start, end).trim();
    if (s) out.push(s);
  };

  while (i < n) {
    const c = text[i];
    const next = text[i + 1];
    if (c === "'" || c === '"') {
      i++;
      while (i < n) {
        if (text[i] === c) {
          if (text[i + 1] === c) i += 2; // doubled quote escape
          else break;
        } else i++;
      }
      i++;
    } else if (c === '-' && next === '-') {
      while (i < n && text[i] !== '\n') i++;
    } else if (c === '/' && next === '*') {
      let depth = 1;
      i += 2;
      while (i < n && depth > 0) {
        if (text[i] === '/' && text[i + 1] === '*') { depth++; i += 2; }
        else if (text[i] === '*' && text[i + 1] === '/') { depth--; i += 2; }
        else i++;
      }
    } else if (c === '$') {
      const m = /^\$([A-Za-z_][A-Za-z0-9_]*)?\$/.exec(text.slice(i, i + 64));
      if (m) {
        const close = text.indexOf(m[0], i + m[0].length);
        i = close === -1 ? n : close + m[0].length;
      } else i++;
    } else if (c === ';') {
      push(i);
      start = i + 1;
      i++;
    } else i++;
  }
  push(n);
  return out;
}
