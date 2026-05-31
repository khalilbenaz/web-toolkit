import { useState, useMemo } from 'react';

/* ── types ────────────────────────────────────────────────────── */

interface FieldResult {
  raw: string;
  label: string;
  error: string;
}

interface ParseResult {
  fields: FieldResult[];
  summary: string;
  error: string;
}

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

/* ── noms des champs ─────────────────────────────────────────── */

const FIELD_NAMES = ['minutes', 'heure', 'jour (mois)', 'mois', 'jour (semaine)'];

/* ── validation basique d'une partie de champ ────────────────── */

const FIELD_RANGES: [number, number][] = [
  [0, 59],   // min
  [0, 23],   // heure
  [1, 31],   // jour du mois
  [1, 12],   // mois
  [0, 7],    // jour de la semaine (0 et 7 = dimanche)
];

const MONTHS_FR = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'aoû', 'sep', 'oct', 'nov', 'déc'];
const DAYS_FR = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

function numInRange(n: number, min: number, max: number): boolean {
  return n >= min && n <= max;
}

function validateToken(token: string, min: number, max: number): string {
  // *
  if (token === '*') return '';
  // */n
  const stepMatch = token.match(/^\*\/(\d+)$/);
  if (stepMatch) {
    const step = Number(stepMatch[1]);
    if (step < 1) return `Pas invalide : ${step}`;
    return '';
  }
  // a-b
  const rangeMatch = token.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    const a = Number(rangeMatch[1]);
    const b = Number(rangeMatch[2]);
    if (!numInRange(a, min, max) || !numInRange(b, min, max) || a >= b)
      return `Plage invalide : ${token} (attendu ${min}-${max})`;
    return '';
  }
  // liste a,b,c
  if (token.includes(',')) {
    const parts = token.split(',');
    for (const p of parts) {
      const v = Number(p.trim());
      if (isNaN(v) || !numInRange(v, min, max)) return `Valeur invalide dans la liste : ${p}`;
    }
    return '';
  }
  // nombre seul
  const n = Number(token);
  if (isNaN(n) || !numInRange(n, min, max)) {
    return `Valeur ${token} hors plage (${min}-${max})`;
  }
  return '';
}

/* ── explication humaine d'un champ ─────────────────────────── */

function explainField(raw: string, idx: number): string {
  const [min, max] = FIELD_RANGES[idx];

  if (raw === '*') {
    const labels = ['toutes les minutes', 'toutes les heures', 'tous les jours', 'tous les mois', 'tous les jours de la semaine'];
    return labels[idx];
  }

  // */n
  const stepMatch = raw.match(/^\*\/(\d+)$/);
  if (stepMatch) {
    const n = stepMatch[1];
    const units = ['minutes', 'heures', 'jours', 'mois', 'jours'];
    return `toutes les ${n} ${units[idx]}`;
  }

  // a-b
  const rangeMatch = raw.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    const a = Number(rangeMatch[1]);
    const b = Number(rangeMatch[2]);
    if (idx === 4) return `du ${DAYS_FR[a]} au ${DAYS_FR[b]}`;
    if (idx === 3) return `de ${MONTHS_FR[a - 1]} à ${MONTHS_FR[b - 1]}`;
    if (idx === 1) return `de ${a}h à ${b}h`;
    if (idx === 0) return `de la minute ${a} à ${b}`;
    return `du ${a} au ${b}`;
  }

  // liste a,b,c
  if (raw.includes(',')) {
    const parts = raw.split(',').map((p) => p.trim());
    if (idx === 4) {
      const dayNames = parts.map((p) => DAYS_FR[Number(p)]).filter(Boolean);
      return `le ${dayNames.join(', ')}`;
    }
    if (idx === 3) {
      const mNames = parts.map((p) => MONTHS_FR[Number(p) - 1]).filter(Boolean);
      return `en ${mNames.join(', ')}`;
    }
    if (idx === 1) return `à ${parts.map((p) => `${p}h`).join(' et ')}`;
    if (idx === 0) return `à la minute ${parts.join(', ')}`;
    return `les ${parts.join(', ')}`;
  }

  // nombre seul
  const n = Number(raw);
  if (!isNaN(n) && numInRange(n, min, max)) {
    if (idx === 0) return `à la minute ${n}`;
    if (idx === 1) return `à ${n}h`;
    if (idx === 2) return `le ${n}`;
    if (idx === 3) return `en ${MONTHS_FR[n - 1]}`;
    if (idx === 4) return `le ${DAYS_FR[n]}`;
  }

  return raw;
}

/* ── phrase récapitulative ───────────────────────────────────── */

function buildSummary(fields: string[]): string {
  const [min, hour, dom, month, dow] = fields;

  const parts: string[] = [];

  // heure
  if (hour === '*' && min === '*') {
    parts.push('toutes les minutes');
  } else if (hour === '*') {
    const stepMin = min.match(/^\*\/(\d+)$/);
    if (stepMin) parts.push(`toutes les ${stepMin[1]} minutes`);
    else parts.push(`à la minute ${min} de chaque heure`);
  } else {
    // heure définie
    const stepMin = min.match(/^\*\/(\d+)$/);
    if (stepMin) {
      parts.push(`toutes les ${stepMin[1]} minutes`);
    } else if (min.includes(',')) {
      parts.push(`aux minutes ${min}`);
    } else {
      const h = hour.includes(',') ? hour.split(',').map((h) => `${h}h${min === '0' ? '' : min}`).join(' et ') : `${hour}h${min === '0' ? '' : min}`;
      parts.push(`à ${h}`);
    }
  }

  // jour de la semaine
  if (dow !== '*') {
    parts.push(explainField(dow, 4));
  }

  // jour du mois
  if (dom !== '*') {
    parts.push(explainField(dom, 2));
  }

  // mois
  if (month !== '*') {
    parts.push(explainField(month, 3));
  }

  return parts.join(', ') + '.';
}

/* ── parsing global ──────────────────────────────────────────── */

function parseCron(expr: string): ParseResult {
  const tokens = expr.trim().split(/\s+/);

  if (tokens.length !== 5) {
    return {
      fields: [],
      summary: '',
      error: `L'expression doit contenir exactement 5 champs (${tokens.length} trouvé${tokens.length > 1 ? 's' : ''}).`,
    };
  }

  const fields: FieldResult[] = tokens.map((raw, i) => {
    const [min, max] = FIELD_RANGES[i];
    const parts = raw.includes(',') ? raw.split(',') : [raw];
    let fieldError = '';
    for (const part of parts) {
      fieldError = validateToken(part.trim(), min, max);
      if (fieldError) break;
    }
    return {
      raw,
      label: fieldError ? raw : explainField(raw, i),
      error: fieldError,
    };
  });

  const hasError = fields.some((f) => f.error);

  return {
    fields,
    summary: hasError ? '' : buildSummary(tokens),
    error: '',
  };
}

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
