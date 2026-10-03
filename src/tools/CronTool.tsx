import { useState, useMemo } from 'react';
import { FIELD_NAMES, parseCron } from '../lib/cron';

/* ── exemples cliquables ─────────────────────────────────────── */

const EXAMPLES: { label: string; expr: string; desc: string }[] = [
  { label: 'Chaque minute', expr: '* * * * *', desc: "S'exécute toutes les minutes." },
  { label: 'Toutes les 5 min', expr: '*/5 * * * *', desc: 'Toutes les 5 minutes.' },
  { label: 'Tous les jours à minuit', expr: '0 0 * * *', desc: 'À minuit chaque jour.' },
  { label: 'Lun–Ven à 9h', expr: '0 9 * * 1-5', desc: 'À 9h du lundi au vendredi.' },
  { label: 'Le 1er du mois', expr: '0 0 1 * *', desc: 'À minuit le premier de chaque mois.' },
  { label: 'Chaque dimanche à 3h30', expr: '30 3 * * 0', desc: 'À 3h30 chaque dimanche.' },
  { label: 'À 8h et 20h en semaine', expr: '0 8,20 * * 1-5', desc: 'À 8h et 20h du lundi au vendredi.' },
];


/* ── composant ────────────────────────────────────────────────── */

export default function CronTool() {
  const [expr, setExpr] = useState<string>('0 9 * * 1-5');

  const result = useMemo(() => parseCron(expr), [expr]);

  const fieldColors = [
    'text-sky-400',
    'text-emerald-400',
    'text-violet-400',
    'text-amber-400',
    'text-pink-400',
  ];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 p-4">

      {/* Input */}
      <div className="card flex flex-col gap-3">
        <label className="lbl mb-0">Expression cron (5 champs)</label>
        <div className="flex flex-col gap-1">
          <div className="flex gap-1 text-xs font-mono text-zinc-500 px-1">
            {FIELD_NAMES.map((n, i) => (
              <span key={i} className={`flex-1 text-center ${fieldColors[i]}`}>{n}</span>
            ))}
          </div>
          <input
            className="fld text-center tracking-widest text-base"
            type="text"
            spellCheck={false}
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            placeholder="* * * * *"
          />
        </div>

        {/* Erreur globale */}
        {result.error && (
          <p className="text-red-400 text-sm">{result.error}</p>
        )}
      </div>

      {/* Explication par champ */}
      {result.fields.length === 5 && (
        <div className="card flex flex-col gap-3">
          <span className="lbl mb-0">Détail par champ</span>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {result.fields.map((f, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex flex-col gap-1">
                <span className={`text-xs font-semibold uppercase tracking-wide ${fieldColors[i]}`}>
                  {FIELD_NAMES[i]}
                </span>
                <span className="font-mono text-sm text-zinc-100">{f.raw}</span>
                {f.error ? (
                  <span className="text-xs text-red-400">{f.error}</span>
                ) : (
                  <span className="text-xs text-zinc-400">{f.label}</span>
                )}
              </div>
            ))}
          </div>

          {/* Phrase récapitulative */}
          {result.summary && (
            <div className="mt-1 rounded-lg bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-sm text-zinc-200">
              <span className="text-zinc-500 mr-2">Signification :</span>
              {result.summary}
            </div>
          )}
        </div>
      )}

      {/* Exemples */}
      <div className="card flex flex-col gap-3">
        <span className="lbl mb-0">Exemples</span>
        <div className="flex flex-col gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.expr}
              className="flex items-center gap-3 text-left w-full rounded-lg px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-sky-700 hover:bg-zinc-800 transition group"
              onClick={() => setExpr(ex.expr)}
            >
              <code className="font-mono text-sm text-sky-400 w-36 shrink-0">{ex.expr}</code>
              <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition">{ex.desc}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
