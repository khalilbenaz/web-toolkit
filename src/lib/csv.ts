// ─── CSV parser ──────────────────────────────────────────────────────────────
// Handles quoted fields (with embedded commas and escaped double-quotes "").

export function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let i = 0;
  while (i <= line.length) {
    if (line[i] === '"') {
      // quoted field
      let field = '';
      i++; // skip opening quote
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          field += '"';
          i += 2;
        } else if (line[i] === '"') {
          i++; // skip closing quote
          break;
        } else {
          field += line[i++];
        }
      }
      fields.push(field);
      if (line[i] === ',') i++;
    } else {
      // unquoted field
      const end = line.indexOf(',', i);
      if (end === -1) {
        fields.push(line.slice(i));
        break;
      } else {
        fields.push(line.slice(i, end));
        i = end + 1;
      }
    }
  }
  return fields;
}

export function csvToJson(csv: string): { result: string; error: string } {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return { result: '', error: '' };
  if (lines.length === 1) {
    return { result: '', error: "Le CSV doit contenir au moins une ligne d'en-tête et une ligne de données." };
  }

  const headers = parseCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] ?? '';
    });
    rows.push(obj);
  }

  return { result: JSON.stringify(rows, null, 2), error: '' };
}

// ─── JSON → CSV ───────────────────────────────────────────────────────────────

export function escapeCsvField(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  // quote if contains comma, double-quote, or newline
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function jsonToCsv(json: string): { result: string; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { result: '', error: 'JSON invalide — impossible de le parser.' };
  }

  if (!Array.isArray(parsed)) {
    return { result: '', error: 'Le JSON doit être un tableau d\'objets (array).' };
  }

  if (parsed.length === 0) {
    return { result: '', error: 'Le tableau JSON est vide.' };
  }

  // Union of all keys, preserving first-seen order
  const keySet = new Set<string>();
  for (const item of parsed) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      Object.keys(item as object).forEach((k) => keySet.add(k));
    }
  }
  const headers = Array.from(keySet);

  const csvLines: string[] = [headers.map(escapeCsvField).join(',')];

  for (const item of parsed) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const row = headers.map((h) => escapeCsvField((item as Record<string, unknown>)[h]));
      csvLines.push(row.join(','));
    } else {
      return { result: '', error: `Élément non-objet détecté dans le tableau : ${JSON.stringify(item)}` };
    }
  }

  return { result: csvLines.join('\n'), error: '' };
}
