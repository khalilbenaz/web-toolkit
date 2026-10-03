import { useState, useMemo } from 'react';
import { CATEGORIES, CATEGORY_KEYS, convert, defaultUnit, formatResult, type Category } from '../lib/units';

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
        <div className="lbl" id="unit-category">Catégorie</div>
        <div role="group" aria-labelledby="unit-category" className="flex flex-wrap gap-2">
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
          <label htmlFor="unit-72" className="lbl">Valeur</label>
          <input
            id="unit-72"
            type="number"
            className="fld"
            value={rawValue}
            onChange={(e) => { setRawValue(e.target.value); setCopied(false); }}
            placeholder="0"
          />
        </div>

        {/* Unité source */}
        <div>
          <label htmlFor="unit-84" className="lbl">De</label>
          <select
            id="unit-84"
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
          <label htmlFor="unit-107" className="lbl">Vers</label>
          <select
            id="unit-107"
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
        <p role="alert" className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-2">
          Valeur invalide — saisissez un nombre.
        </p>
      )}
    </div>
  );
}
