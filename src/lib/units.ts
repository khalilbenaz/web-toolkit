// ─── Types ────────────────────────────────────────────────────────────────────

export type Category = 'Longueur' | 'Masse' | 'Température' | 'Données' | 'Vitesse' | 'Temps';

export interface UnitDef {
  label: string;
  factor?: number; // toward base unit (for linear categories)
  toBase?: (v: number) => number; // for Temperature
  fromBase?: (v: number) => number;
}

export type CategoryDef = {
  units: Record<string, UnitDef>;
};

// ─── Conversion tables ────────────────────────────────────────────────────────

export const CATEGORIES: Record<Category, CategoryDef> = {
  Longueur: {
    units: {
      mm:  { label: 'Millimètre (mm)',    factor: 0.001 },
      cm:  { label: 'Centimètre (cm)',    factor: 0.01 },
      m:   { label: 'Mètre (m)',          factor: 1 },
      km:  { label: 'Kilomètre (km)',     factor: 1000 },
      in:  { label: 'Pouce (in)',         factor: 0.0254 },
      ft:  { label: 'Pied (ft)',          factor: 0.3048 },
      yd:  { label: 'Yard (yd)',          factor: 0.9144 },
      mi:  { label: 'Mile (mi)',          factor: 1609.344 },
      nmi: { label: 'Mille marin (nmi)',  factor: 1852 },
    },
  },
  Masse: {
    units: {
      mg:  { label: 'Milligramme (mg)',   factor: 0.000001 },
      g:   { label: 'Gramme (g)',         factor: 0.001 },
      kg:  { label: 'Kilogramme (kg)',    factor: 1 },
      t:   { label: 'Tonne (t)',          factor: 1000 },
      oz:  { label: 'Once (oz)',          factor: 0.028349523 },
      lb:  { label: 'Livre (lb)',         factor: 0.45359237 },
      st:  { label: 'Stone (st)',         factor: 6.35029318 },
    },
  },
  Température: {
    units: {
      C: {
        label: 'Celsius (°C)',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      F: {
        label: 'Fahrenheit (°F)',
        toBase: (v) => (v - 32) * (5 / 9),
        fromBase: (v) => v * (9 / 5) + 32,
      },
      K: {
        label: 'Kelvin (K)',
        toBase: (v) => v - 273.15,
        fromBase: (v) => v + 273.15,
      },
    },
  },
  Données: {
    // base = octet (B)
    units: {
      b:   { label: 'Bit (b)',            factor: 0.125 },
      B:   { label: 'Octet (B)',          factor: 1 },
      // Préfixes SI (décimaux) : 1 KB = 1000 octets
      KB:  { label: 'Kilooctet (KB)',     factor: 1000 },
      MB:  { label: 'Mégaoctet (MB)',     factor: 1000 ** 2 },
      GB:  { label: 'Gigaoctet (GB)',     factor: 1000 ** 3 },
      TB:  { label: 'Téraoctet (TB)',     factor: 1000 ** 4 },
      PB:  { label: 'Pétaoctet (PB)',     factor: 1000 ** 5 },
      // Préfixes binaires (CEI) : 1 KiB = 1024 octets
      KiB: { label: 'Kibioctet (KiB)',    factor: 1024 },
      MiB: { label: 'Mébioctet (MiB)',    factor: 1024 ** 2 },
      GiB: { label: 'Gibioctet (GiB)',    factor: 1024 ** 3 },
      TiB: { label: 'Tébioctet (TiB)',    factor: 1024 ** 4 },
      PiB: { label: 'Pébioctet (PiB)',    factor: 1024 ** 5 },
    },
  },
  Vitesse: {
    // base = m/s
    units: {
      'ms':   { label: 'Mètre/seconde (m/s)',      factor: 1 },
      'kmh':  { label: 'Kilomètre/heure (km/h)',   factor: 1 / 3.6 },
      'mph':  { label: 'Mile/heure (mph)',          factor: 0.44704 },
      'kn':   { label: 'Nœud (kn)',                factor: 0.514444 },
      'fps':  { label: 'Pied/seconde (ft/s)',       factor: 0.3048 },
      'mach': { label: 'Mach (à 20°C)',            factor: 343 },
    },
  },
  Temps: {
    // base = seconde
    units: {
      ns:  { label: 'Nanoseconde (ns)',   factor: 1e-9 },
      us:  { label: 'Microseconde (µs)',  factor: 1e-6 },
      ms:  { label: 'Milliseconde (ms)',  factor: 0.001 },
      s:   { label: 'Seconde (s)',        factor: 1 },
      min: { label: 'Minute (min)',       factor: 60 },
      h:   { label: 'Heure (h)',          factor: 3600 },
      d:   { label: 'Jour (j)',           factor: 86400 },
      wk:  { label: 'Semaine',           factor: 604800 },
      mo:  { label: 'Mois (30 j)',        factor: 2592000 },
      yr:  { label: 'Année (365 j)',      factor: 31536000 },
    },
  },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];

export function defaultUnit(cat: Category, index: 0 | 1): string {
  const keys = Object.keys(CATEGORIES[cat].units);
  if (cat === 'Longueur')     return index === 0 ? 'm'   : 'km';
  if (cat === 'Masse')        return index === 0 ? 'kg'  : 'lb';
  if (cat === 'Température')  return index === 0 ? 'C'   : 'F';
  if (cat === 'Données')      return index === 0 ? 'MB'  : 'GB';
  if (cat === 'Vitesse')      return index === 0 ? 'kmh' : 'mph';
  if (cat === 'Temps')        return index === 0 ? 's'   : 'min';
  return keys[index] ?? keys[0];
}

export function convert(value: number, fromKey: string, toKey: string, cat: Category): number {
  const catDef = CATEGORIES[cat];
  const from = catDef.units[fromKey];
  const to   = catDef.units[toKey];
  if (!from || !to) return NaN;

  if (cat === 'Température') {
    const base = from.toBase!(value);
    return to.fromBase!(base);
  }
  // linear
  const base = value * (from.factor ?? 1);
  return base / (to.factor ?? 1);
}

export function formatResult(n: number): string {
  if (!isFinite(n)) return '—';
  // avoid scientific notation for very common ranges, use it for extremes
  if (Math.abs(n) === 0) return '0';
  if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-9 && Math.abs(n) > 0)) {
    return n.toExponential(6);
  }
  // up to 10 significant digits, strip trailing zeros
  const s = parseFloat(n.toPrecision(10)).toString();
  return s;
}
