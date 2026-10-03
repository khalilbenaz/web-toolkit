import { useState, useMemo } from 'react';
import { csvToJson, jsonToCsv } from '../lib/csv';

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
