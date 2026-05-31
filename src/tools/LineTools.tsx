import { useState, useMemo } from 'react';

type Op =
  | 'sort-asc'
  | 'sort-desc'
  | 'dedup'
  | 'reverse'
  | 'remove-empty'
  | 'trim'
  | 'number';

const OPERATIONS: { id: Op; label: string }[] = [
  { id: 'sort-asc', label: 'Trier A → Z' },
  { id: 'sort-desc', label: 'Trier Z → A' },
  { id: 'dedup', label: 'Supprimer les doublons' },
  { id: 'reverse', label: "Inverser l'ordre" },
  { id: 'remove-empty', label: 'Supprimer les lignes vides' },
  { id: 'trim', label: "Retirer les espaces de début/fin" },
  { id: 'number', label: 'Numéroter les lignes' },
];

function applyOp(lines: string[], op: Op): string[] {
  switch (op) {
    case 'sort-asc':
      return [...lines].sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
    case 'sort-desc':
      return [...lines].sort((a, b) => b.localeCompare(a, 'fr', { sensitivity: 'base' }));
    case 'dedup': {
      const seen = new Set<string>();
      return lines.filter((l) => {
        if (seen.has(l)) return false;
        seen.add(l);
        return true;
      });
    }
    case 'reverse':
      return [...lines].reverse();
    case 'remove-empty':
      return lines.filter((l) => l.trim() !== '');
    case 'trim':
      return lines.map((l) => l.trim());
    case 'number':
      return lines.map((l, i) => `${i + 1}. ${l}`);
    default:
      return lines;
  }
}

export default function LineTools() {
  const [input, setInput] = useState<string>('');
  const [pendingOps, setPendingOps] = useState<Op[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  const inputLines = useMemo(
    () => (input === '' ? [] : input.split('\n')),
    [input]
  );

  const result = useMemo(() => {
    if (pendingOps.length === 0) return null;
    let lines = inputLines;
    for (const op of pendingOps) {
      lines = applyOp(lines, op);
    }
    return lines;
  }, [inputLines, pendingOps]);

  const resultText = result ? result.join('\n') : '';
  const lineCount = result ? result.length : inputLines.length;

  function applyAndShow(op: Op) {
    setPendingOps([op]);
    setCopied(false);
  }

  function copy() {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="lbl">Texte (une entrée par ligne)</label>
        <textarea
          className="fld h-44 resize-y font-mono text-sm"
          placeholder={"Collez vos lignes ici…"}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setPendingOps([]);
            setCopied(false);
          }}
        />
        <p className="mt-1 text-xs text-zinc-500">
          {inputLines.length} ligne{inputLines.length !== 1 ? 's' : ''} en entrée
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {OPERATIONS.map((op) => (
          <button
            key={op.id}
            className={pendingOps.includes(op.id) ? 'btnp' : 'btn'}
            onClick={() => applyAndShow(op.id)}
            disabled={inputLines.length === 0}
          >
            {op.label}
          </button>
        ))}
      </div>

      {result !== null && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="lbl mb-0">
              Résultat&nbsp;
              <span className="pill">
                {lineCount} ligne{lineCount !== 1 ? 's' : ''}
              </span>
            </label>
            <button className="btn text-sm" onClick={copy}>
              {copied ? 'Copié ✓' : 'Copier'}
            </button>
          </div>
          <textarea
            readOnly
            className="fld h-44 resize-y font-mono text-sm text-emerald-400"
            value={resultText}
          />
        </div>
      )}
    </div>
  );
}
