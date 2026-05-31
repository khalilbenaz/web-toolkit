import { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'Longueur' | 'Masse' | 'Température' | 'Données' | 'Vitesse' | 'Temps';

interface UnitDef {
  label: string;
  factor?: number; // toward base unit (for linear categories)
  toBase?: (v: number) => number; // for Temperature
  fromBase?: (v: number) => number;
}

type CategoryDef = {
  units: Record<string, UnitDef>;
};

// ─── Conversion tables ────────────────────────────────────────────────────────

const CATEGORIES: Record<Category, CategoryDef> = {
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
      KB:  { label: 'Kilooctet (KB)',     factor: 1024 },
      MB:  { label: 'Mégaoctet (MB)',     factor: 1024 ** 2 },
      GB:  { label: 'Gigaoctet (GB)',     factor: 1024 ** 3 },
      TB:  { label: 'Téraoctet (TB)',     factor: 1024 ** 4 },
      PB:  { label: 'Pétaoctet (PB)',     factor: 1024 ** 5 },
      KiB: { label: 'Kibioctet (KiB)',    factor: 1024 },
      MiB: { label: 'Mébioctet (MiB)',    factor: 1024 ** 2 },
      GiB: { label: 'Gibioctet (GiB)',    factor: 1024 ** 3 },
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

const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];

function defaultUnit(cat: Category, index: 0 | 1): string {
  const keys = Object.keys(CATEGORIES[cat].units);
  if (cat === 'Longueur')     return index === 0 ? 'm'   : 'km';
  if (cat === 'Masse')        return index === 0 ? 'kg'  : 'lb';
  if (cat === 'Température')  return index === 0 ? 'C'   : 'F';
  if (cat === 'Données')      return index === 0 ? 'MB'  : 'GB';
  if (cat === 'Vitesse')      return index === 0 ? 'kmh' : 'mph';
  if (cat === 'Temps')        return index === 0 ? 's'   : 'min';
  return keys[index] ?? keys[0];
}

function convert(value: number, fromKey: string, toKey: string, cat: Category): number {
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

function formatResult(n: number): string {
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function UnitConverter() {
  const [category, setCategory] = useState<Category>('Longueur');
  const [rawValue, setRawValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit]     = useState<string>('km');
  const [copied, setCopied]     = useState<boolean>(false);

  const unitKeys = Object.keys(CATEGORIES[category].units);

  const result = useMemo<string>(() => {
    const v = parseFloat(rawValue);
    if (rawValue.trim() === '' || isNaN(v)) return '';
    return formatResult(convert(v, fromUnit, toUnit, category));
  }, [rawValue, fromUnit, toUnit, category]);

  function changeCategory(cat: Category) {
    setCategory(cat);
    setFromUnit(defaultUnit(cat, 0));
    setToUnit(defaultUnit(cat, 1));
    setRawValue('1');
    setCopied(false);
  }

  function swap() {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setCopied(false);
  }

  function copy() {
    if (!result) return;
    const label = CATEGORIES[category].units[toUnit]?.label ?? toUnit;
    const text = `${result} ${label}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="space-y-6">

      {/* Sélecteur de catégorie */}
      <div>
        <label className="lbl">Catégorie</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_KEYS.map((cat) => (
            <button
              key={cat}
              onClick={() => changeCategory(cat)}
              className={
                cat === category
                  ? 'btnp'
                  : 'btn'
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Valeur + unités */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {/* Valeur source */}
        <div>
          <label className="lbl">Valeur</label>
          <input
            type="number"
            className="fld"
            value={rawValue}
            onChange={(e) => { setRawValue(e.target.value); setCopied(false); }}
            placeholder="0"
          />
        </div>

        {/* Unité source */}
        <div>
          <label className="lbl">De</label>
          <select
            className="fld"
            value={fromUnit}
            onChange={(e) => { setFromUnit(e.target.value); setCopied(false); }}
          >
            {unitKeys.map((k) => (
              <option key={k} value={k}>
                {CATEGORIES[category].units[k].label}
              </option>
            ))}
          </select>
        </div>

        {/* Bouton swap */}
        <div className="flex items-end justify-center pb-0.5">
          <button className="btn" onClick={swap} title="Inverser">
            ⇄
          </button>
        </div>

        {/* Unité cible */}
        <div>
          <label className="lbl">Vers</label>
          <select
            className="fld"
            value={toUnit}
            onChange={(e) => { setToUnit(e.target.value); setCopied(false); }}
          >
            {unitKeys.map((k) => (
              <option key={k} value={k}>
                {CATEGORIES[category].units[k].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Résultat */}
      {result !== '' && (
        <div className="card flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-zinc-500 mb-1">Résultat</p>
            <p className="text-2xl font-mono font-semibold text-emerald-400 break-all">
              {result}{' '}
              <span className="text-base text-zinc-400">
                {CATEGORIES[category].units[toUnit]?.label ?? toUnit}
              </span>
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              {rawValue} {CATEGORIES[category].units[fromUnit]?.label ?? fromUnit}
              {' = '}
              {result} {CATEGORIES[category].units[toUnit]?.label ?? toUnit}
            </p>
          </div>
          <button className="btn shrink-0" onClick={copy}>
            {copied ? 'Copié ✓' : 'Copier'}
          </button>
        </div>
      )}

      {/* Cas particulier : valeur vide */}
      {rawValue.trim() !== '' && isNaN(parseFloat(rawValue)) && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-2">
          Valeur invalide — saisissez un nombre.
        </p>
      )}
    </div>
  );
}
