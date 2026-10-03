/* ── types ────────────────────────────────────────────────────── */

export interface FieldResult {
  raw: string;
  label: string;
  error: string;
}

export interface ParseResult {
  fields: FieldResult[];
  summary: string;
  error: string;
}


/* ── noms des champs ─────────────────────────────────────────── */

export const FIELD_NAMES = ['minutes', 'heure', 'jour (mois)', 'mois', 'jour (semaine)'];

/* ── validation basique d'une partie de champ ────────────────── */

export const FIELD_RANGES: [number, number][] = [
  [0, 59],   // min
  [0, 23],   // heure
  [1, 31],   // jour du mois
  [1, 12],   // mois
  [0, 7],    // jour de la semaine (0 et 7 = dimanche)
];

export const MONTHS_FR = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'aoû', 'sep', 'oct', 'nov', 'déc'];
export const DAYS_FR = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

export function numInRange(n: number, min: number, max: number): boolean {
  return n >= min && n <= max;
}

export function validateToken(token: string, min: number, max: number): string {
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

export function explainField(raw: string, idx: number): string {
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

export function buildSummary(fields: string[]): string {
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

export function parseCron(expr: string): ParseResult {
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
