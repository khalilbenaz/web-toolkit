import { useState, useMemo } from 'react';
import { useWorkerTask } from '../lib/useWorkerTask';

export default function DiffTool() {
  const [before, setBefore] = useState<string>('');
  const [after, setAfter] = useState<string>('');

  // Le LCS est exécuté dans un Web Worker (délai maximal, plafonds de taille).
  const taskInput = useMemo(() => (before || after ? { before, after } : null), [before, after]);
  const task = useWorkerTask('diff', taskInput, 250);
  const { lines: diff, added, removed, error: diffError } = task.result ?? {
    lines: [],
    added: 0,
    removed: 0,
    error: '',
  };

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
          {task.status === 'running' && (
            <p className="text-xs text-zinc-500" role="status">Calcul en cours…</p>
          )}
          {(task.status === 'error' || diffError) && (
            <p className="text-sm text-amber-300 bg-amber-400/10 border border-amber-400/30 rounded-lg px-4 py-2" role="alert">
              {task.error || diffError}
            </p>
          )}

          {/* Compteurs */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="pill text-xs bg-emerald-400/10 text-emerald-400 border-emerald-400/30">
              +{added} ajout{added !== 1 ? 's' : ''}
            </span>
            <span className="pill text-xs bg-red-400/10 text-red-400 border-red-400/30">
              -{removed} suppression{removed !== 1 ? 's' : ''}
            </span>
            {task.status === 'done' && !diffError && added === 0 && removed === 0 && (
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
