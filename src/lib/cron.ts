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

/* ── constantes ──────────────────────────────────────────────── */

export const FIELD_NAMES = ['minutes', 'heure', 'jour (mois)', 'mois', 'jour (semaine)'];

const FIELD_RANGES: [number, number][] = [
  [0, 59], // min
  [0, 23], // heure
  [1, 31], // jour du mois
  [1, 12], // mois
  [0, 7], // jour de la semaine (0 et 7 = dimanche)
];

const MONTHS_FR = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'aoû', 'sep', 'oct', 'nov', 'déc'];
const DAYS_FR = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

const MONTH_NAMES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const ALIASES: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
};

const EVERY_LABELS = ['toutes les minutes', 'toutes les heures', 'tous les jours', 'tous les mois', 'tous les jours de la semaine'];
const STEP_UNITS = ['minutes', 'heures', 'jours', 'mois', 'jours'];

/* ── normalisation (noms JAN/MON → nombres) ──────────────────── */

function normalizeNames(token: string, idx: number): string {
  if (idx !== 3 && idx !== 4) return token;
  const names = idx === 3 ? MONTH_NAMES : DAY_NAMES;
  const offset = idx === 3 ? 1 : 0;
  return token.replace(/[a-z]{3}/gi, (name) => {
    const i = names.indexOf(name.toLowerCase());
    return i === -1 ? name : String(i + offset);
  });
}

/* ── validation d'une partie de champ ────────────────────────── */

const PART_RE = /^(?:\*|(\d+)(?:-(\d+))?)(?:\/(\d+))?$/;

function validatePart(part: string, min: number, max: number): string {
  const m = part.match(PART_RE);
  if (!m) return `Valeur invalide : ${part}`;
  const [, aStr, bStr, stepStr] = m;
  if (aStr !== undefined) {
    const a = Number(aStr);
    if (bStr !== undefined) {
      const b = Number(bStr);
      if (a < min || a > max || b < min || b > max || a > b) {
        return `Plage invalide : ${part} (attendu ${min}-${max})`;
      }
    } else if (a < min || a > max) {
      return `Valeur ${aStr} hors plage (${min}-${max})`;
    }
  }
  if (stepStr !== undefined) {
    const step = Number(stepStr);
    if (step < 1 || step > max) return `Pas invalide : ${step} (attendu 1-${max})`;
  }
  return '';
}

/* ── explication humaine ─────────────────────────────────────── */

function single(n: number, idx: number): string {
  if (idx === 0) return `à la minute ${n}`;
  if (idx === 1) return `à ${n}h`;
  if (idx === 2) return `le ${n}`;
  if (idx === 3) return `en ${MONTHS_FR[n - 1]}`;
  return `le ${DAYS_FR[n]}`;
}

function rangeText(a: number, b: number, idx: number): string {
  if (idx === 4) return `du ${DAYS_FR[a]} au ${DAYS_FR[b]}`;
  if (idx === 3) return `de ${MONTHS_FR[a - 1]} à ${MONTHS_FR[b - 1]}`;
  if (idx === 1) return `de ${a}h à ${b}h`;
  if (idx === 0) return `de la minute ${a} à ${b}`;
  return `du ${a} au ${b}`;
}

function explainPart(part: string, idx: number): string {
  const m = part.match(PART_RE);
  if (!m) return part;
  const [, aStr, bStr, stepStr] = m;
  const step = stepStr !== undefined ? `toutes les ${stepStr} ${STEP_UNITS[idx]}` : '';

  if (aStr === undefined) return step || EVERY_LABELS[idx];
  const a = Number(aStr);
  if (bStr !== undefined) {
    const range = rangeText(a, Number(bStr), idx);
    return step ? `${step} ${range}` : range;
  }
  return step ? `${step} à partir de ${single(a, idx).replace(/^(à la |à |le |en )/, '')}` : single(a, idx);
}

export function explainField(raw: string, idx: number): string {
  if (!raw.includes(',')) return explainPart(raw, idx);

  const parts = raw.split(',').map((p) => p.trim());
  if (parts.every((p) => /^\d+$/.test(p))) {
    if (idx === 4) return `le ${parts.map((p) => DAYS_FR[Number(p)]).join(', ')}`;
    if (idx === 3) return `en ${parts.map((p) => MONTHS_FR[Number(p) - 1]).join(', ')}`;
    if (idx === 1) return `à ${parts.map((p) => `${p}h`).join(' et ')}`;
    if (idx === 0) return `à la minute ${parts.join(', ')}`;
    return `les ${parts.join(', ')}`;
  }
  return parts.map((p) => explainPart(p, idx)).join(', ');
}

/* ── phrase récapitulative ───────────────────────────────────── */

const pad2 = (n: string | number): string => String(Number(n)).padStart(2, '0');
const isDigits = (s: string): boolean => /^\d+$/.test(s);
const isDigitList = (s: string): boolean => s.split(',').every(isDigits);

function timeSummary(min: string, hour: string): string {
  // Heures et minutes fixes : « à 9h05 », « à 8h et 20h »
  if (isDigitList(min) && isDigitList(hour)) {
    const mins = min.split(',');
    const hours = hour.split(',');
    if (mins.length * hours.length <= 12) {
      const times = hours.flatMap((h) => mins.map((m) => `${Number(h)}h${m === '0' ? '' : pad2(m)}`));
      return `à ${times.join(' et ')}`;
    }
  }

  const minSingle = isDigits(min);

  let minText: string;
  if (min === '*') minText = hour === '*' ? 'toutes les minutes' : 'chaque minute';
  else if (minSingle) minText = `à la minute ${Number(min)}`;
  else minText = explainField(min, 0);

  if (hour === '*') {
    return minSingle ? `${minText} de chaque heure` : minText;
  }

  let hourText: string;
  if (isDigits(hour)) hourText = `pendant l'heure de ${Number(hour)}h`;
  else hourText = explainField(hour, 1);

  // Minute 0 + heures non fixes : « toutes les 2 heures » suffit
  if (min === '0') return hourText;
  return minSingle ? `${hourText}, ${minText}` : `${minText}, ${hourText}`;
}

export function buildSummary(fields: string[]): string {
  const [min, hour, dom, month, dow] = fields;
  const parts: string[] = [timeSummary(min, hour)];

  if (dow !== '*') parts.push(explainField(dow, 4));
  if (dom !== '*') parts.push(explainField(dom, 2));
  if (month !== '*') parts.push(explainField(month, 3));

  return parts.join(', ') + '.';
}

/* ── parsing global ──────────────────────────────────────────── */

export function parseCron(expr: string): ParseResult {
  let tokens = expr.trim().split(/\s+/);
  if (tokens.length === 1 && tokens[0].toLowerCase() in ALIASES) {
    tokens = ALIASES[tokens[0].toLowerCase()].split(' ');
  }

  if (tokens.length !== 5) {
    return {
      fields: [],
      summary: '',
      error: `L'expression doit contenir exactement 5 champs (${tokens.length} trouvé${tokens.length > 1 ? 's' : ''}).`,
    };
  }

  const normalized = tokens.map((t, i) => normalizeNames(t, i));

  const fields: FieldResult[] = tokens.map((raw, i) => {
    const [min, max] = FIELD_RANGES[i];
    let fieldError = '';
    for (const part of normalized[i].split(',')) {
      fieldError = validatePart(part.trim(), min, max);
      if (fieldError) break;
    }
    return {
      raw,
      label: fieldError ? raw : explainField(normalized[i], i),
      error: fieldError,
    };
  });

  const hasError = fields.some((f) => f.error);

  return {
    fields,
    summary: hasError ? '' : buildSummary(normalized),
    error: '',
  };
}
