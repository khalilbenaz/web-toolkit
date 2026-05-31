import { useState, useMemo } from 'react';

// ─── CSV parser ──────────────────────────────────────────────────────────────
// Handles quoted fields (with embedded commas and escaped double-quotes "").

function parseCsvLine(line: string): string[] {
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

function csvToJson(csv: string): { result: string; error: string } {
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

function escapeCsvField(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  // quote if contains comma, double-quote, or newline
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function jsonToCsv(json: string): { result: string; error: string } {
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

// ─── Component ────────────────────────────────────────────────────────────────

type Direction = 'csv2json' | 'json2csv';

export default function CsvJson() {
  const [direction, setDirection] = useState<Direction>('csv2json');
  const [input, setInput]         = useState<string>('');
  const [copied, setCopied]       = useState<boolean>(false);

  const { result, error } = useMemo<{ result: string; error: string }>(() => {
    if (!input.trim()) return { result: '', error: '' };
    return direction === 'csv2json' ? csvToJson(input) : jsonToCsv(input);
  }, [input, direction]);

  function toggleDirection() {
    const next: Direction = direction === 'csv2json' ? 'json2csv' : 'csv2json';
    // if there is a valid result, swap input/output
    if (result && !error) {
      setInput(result);
    } else {
      setInput('');
    }
    setDirection(next);
    setCopied(false);
  }

  function copy() {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const sourceLbl = direction === 'csv2json' ? 'CSV' : 'JSON';
  const targetLbl = direction === 'csv2json' ? 'JSON' : 'CSV';

  const inputPlaceholder =
    direction === 'csv2json'
      ? 'nom,age,ville\nAlice,30,"Paris, France"\nBob,25,Lyon'
      : '[{"nom":"Alice","age":"30"},{"nom":"Bob","age":"25"}]';

  return (
    <div className="space-y-5">

      {/* Direction toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="pill">{sourceLbl}</span>
        <button className="btnp" onClick={toggleDirection}>
          {direction === 'csv2json' ? 'CSV → JSON' : 'JSON → CSV'}
        </button>
        <span className="pill">{targetLbl}</span>
        <span className="text-xs text-zinc-500 ml-1">
          (cliquez pour inverser le sens et basculer les données)
        </span>
      </div>

      {/* Entrée */}
      <div>
        <label className="lbl">Entrée — {sourceLbl}</label>
        <textarea
          className="fld h-48 resize-y"
          placeholder={inputPlaceholder}
          value={input}
          onChange={(e) => { setInput(e.target.value); setCopied(false); }}
          spellCheck={false}
        />
      </div>

      {/* Erreur */}
      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {/* Résultat */}
      {result && !error && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="lbl mb-0">Résultat — {targetLbl}</label>
            <button className="btn" onClick={copy}>
              {copied ? 'Copié ✓' : 'Copier'}
            </button>
          </div>
          <textarea
            readOnly
            className="fld h-56 resize-y text-emerald-400"
            value={result}
            spellCheck={false}
          />
        </div>
      )}

      {/* Info bulle aide */}
      {!input.trim() && (
        <div className="card text-xs text-zinc-500 space-y-1">
          <p className="font-semibold text-zinc-400">Fonctionnement</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>
              <strong>CSV → JSON :</strong>{' '}
              la 1re ligne devient les clés ; les champs entre guillemets et les virgules internes sont gérés.
            </li>
            <li>
              <strong>JSON → CSV :</strong>{' '}
              tableau d'objets requis ; les clés de tous les objets sont fusionnées en en-têtes.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
