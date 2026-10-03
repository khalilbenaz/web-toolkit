import { useState, useMemo } from 'react';
import { computeDiff, type DiffLine } from '../lib/diff';

export default function DiffTool() {
  const [before, setBefore] = useState<string>('');
  const [after, setAfter] = useState<string>('');

  const { diff, added, removed } = useMemo<{
    diff: DiffLine[];
    added: number;
    removed: number;
  }>(() => {
    if (!before && !after) return { diff: [], added: 0, removed: 0 };

    const linesA = before.split('\n');
    const linesB = after.split('\n');
    const d = computeDiff(linesA, linesB);

    let a = 0;
    let r = 0;
    for (const line of d) {
      if (line.kind === 'added')   a++;
      if (line.kind === 'removed') r++;
    }

    return { diff: d, added: a, removed: r };
  }, [before, after]);

  const hasContent = before.length > 0 || after.length > 0;

  return (
    <div className="space-y-6">
      {/* Zones de saisie côte à côte */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="lbl">Avant</label>
          <textarea
            className="fld h-56 resize-y"
            placeholder="Coller le texte original…"
            value={before}
            onChange={(e) => setBefore(e.target.value)}
          />
        </div>
        <div>
          <label className="lbl">Après</label>
          <textarea
            className="fld h-56 resize-y"
            placeholder="Coller le texte modifié…"
            value={after}
            onChange={(e) => setAfter(e.target.value)}
          />
        </div>
      </div>

      {/* Résultat */}
      {hasContent && (
        <div className="space-y-3">
          {/* Compteurs */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="pill text-xs bg-emerald-400/10 text-emerald-400 border-emerald-400/30">
              +{added} ajout{added !== 1 ? 's' : ''}
            </span>
            <span className="pill text-xs bg-red-400/10 text-red-400 border-red-400/30">
              -{removed} suppression{removed !== 1 ? 's' : ''}
            </span>
            {added === 0 && removed === 0 && (
              <span className="text-sm text-zinc-500 italic">
                Les deux textes sont identiques.
              </span>
            )}
          </div>

          {/* Affichage du diff */}
          <div className="card p-0 overflow-hidden">
            <pre className="text-sm font-mono leading-relaxed overflow-x-auto p-4 space-y-0">
              {diff.map((line, idx) => {
                if (line.kind === 'equal') {
                  return (
                    <div key={idx} className="text-zinc-500 whitespace-pre">
                      {'  '}{line.text}
                    </div>
                  );
                }
                if (line.kind === 'added') {
                  return (
                    <div
                      key={idx}
                      className="text-emerald-400 bg-emerald-400/5 whitespace-pre"
                    >
                      {'+ '}{line.text}
                    </div>
                  );
                }
                // removed
                return (
                  <div
                    key={idx}
                    className="text-red-400 bg-red-400/5 whitespace-pre"
                  >
                    {'- '}{line.text}
                  </div>
                );
              })}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
