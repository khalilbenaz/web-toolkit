import { formatCount, LIMITS } from './limits';

// ─── CSV ⇄ JSON ──────────────────────────────────────────────────────────────
// Parseur RFC 4180 : champs entre guillemets (virgules, séparateurs et sauts de
// ligne internes, guillemets doublés), CRLF ou LF, séparateur configurable.

export type Delimiter = ',' | ';' | '\t' | '|';

export const DELIMITERS: Delimiter[] = [',', ';', '\t', '|'];

/** Déduit le séparateur d'après le premier enregistrement (hors guillemets). */
export function detectDelimiter(csv: string): Delimiter {
  const counts = new Map<Delimiter, number>(DELIMITERS.map((d) => [d, 0]));
  let inQuotes = false;
  for (const ch of csv) {
    if (ch === '"') inQuotes = !inQuotes;
    else if (!inQuotes) {
      if (ch === '\n' || ch === '\r') break;
      if (counts.has(ch as Delimiter)) counts.set(ch as Delimiter, counts.get(ch as Delimiter)! + 1);
    }
  }
  let best: Delimiter = ',';
  let bestCount = 0;
  for (const [d, n] of counts) {
    if (n > bestCount) {
      best = d;
      bestCount = n;
    }
  }
  return best;
}

/** Découpe un texte CSV en lignes de champs. Lève une erreur si un guillemet n'est pas fermé. */
export function parseCsv(text: string, delimiter: Delimiter = ','): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  const endRow = () => {
    row.push(field);
    field = '';
    // Ignore les lignes totalement vides (ligne finale, lignes blanches)
    if (!(row.length === 1 && row[0].trim() === '')) rows.push(row);
    row = [];
  };

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
      } else {
        field += ch;
      }
      i++;
      continue;
    }
    if (ch === '"' && field === '') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      endRow();
    } else {
      field += ch;
    }
    i++;
  }
  if (inQuotes) throw new Error('Guillemet non fermé : un champ entre guillemets n’est jamais terminé.');
  if (field !== '' || row.length > 0) endRow();
  return rows;
}

const tooBigMessage = (n: number): string =>
  `Entrée trop volumineuse (${formatCount(n)} caractères, maximum ${formatCount(LIMITS.csvChars)}).`;

export function csvToJson(
  csv: string,
  delimiter: Delimiter | 'auto' = 'auto',
): { result: string; error: string } {
  if (csv.trim() === '') return { result: '', error: '' };
  if (csv.length > LIMITS.csvChars) return { result: '', error: tooBigMessage(csv.length) };

  let rows: string[][];
  try {
    rows = parseCsv(csv, delimiter === 'auto' ? detectDelimiter(csv) : delimiter);
  } catch (e) {
    return { result: '', error: (e as Error).message };
  }
  if (rows.length < 2) {
    return { result: '', error: "Le CSV doit contenir au moins une ligne d'en-tête et une ligne de données." };
  }

  const headers = rows[0];
  const objects = rows.slice(1).map((values) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] ?? '';
    });
    return obj;
  });

  return { result: JSON.stringify(objects, null, 2), error: '' };
}

// ─── JSON → CSV ───────────────────────────────────────────────────────────────

export function escapeCsvField(value: unknown, delimiter: Delimiter = ','): string {
  let s: string;
  if (value === null || value === undefined) s = '';
  else if (typeof value === 'object') s = JSON.stringify(value);
  else s = String(value);
  if (s.includes(delimiter) || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function jsonToCsv(json: string, delimiter: Delimiter = ','): { result: string; error: string } {
  if (json.length > LIMITS.csvChars) return { result: '', error: tooBigMessage(json.length) };
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { result: '', error: 'JSON invalide — impossible de le parser.' };
  }

  if (!Array.isArray(parsed)) {
    return { result: '', error: "Le JSON doit être un tableau d'objets (array)." };
  }
  if (parsed.length === 0) {
    return { result: '', error: 'Le tableau JSON est vide.' };
  }

  // Union de toutes les clés, dans l'ordre d'apparition
  const keySet = new Set<string>();
  for (const item of parsed) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      Object.keys(item as object).forEach((k) => keySet.add(k));
    }
  }
  const headers = Array.from(keySet);

  const csvLines: string[] = [headers.map((h) => escapeCsvField(h, delimiter)).join(delimiter)];

  for (const item of parsed) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const row = headers.map((h) => escapeCsvField((item as Record<string, unknown>)[h], delimiter));
      csvLines.push(row.join(delimiter));
    } else {
      return { result: '', error: `Élément non-objet détecté dans le tableau : ${JSON.stringify(item)}` };
    }
  }

  return { result: csvLines.join('\n'), error: '' };
}
