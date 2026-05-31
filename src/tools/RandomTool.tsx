import { useState, useMemo } from 'react';

type Tab = 'numbers' | 'string' | 'dice';

// Generateur cryptographique utilitaire
function cryptoRandBetween(min: number, max: number): number {
  // [min, max] inclusif
  const range = max - min + 1;
  const array = new Uint32Array(1);
  // Rejection sampling pour eviter le biais modulo
  const maxUnbiased = Math.floor(0xffffffff / range) * range;
  let value: number;
  do {
    crypto.getRandomValues(array);
    value = array[0];
  } while (value > maxUnbiased);
  return min + (value % range);
}

function cryptoRandFloat(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / 0x100000000;
}

function cryptoRandString(length: number, charset: string): string {
  if (!charset.length) return '';
  const result: string[] = [];
  const charArray = charset.split('');
  for (let i = 0; i < length; i++) {
    result.push(charArray[cryptoRandBetween(0, charArray.length - 1)]);
  }
  return result.join('');
}

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?';

export default function RandomTool() {
  const [tab, setTab] = useState<Tab>('numbers');

  // --- Onglet Nombres ---
  const [numMin, setNumMin] = useState<string>('1');
  const [numMax, setNumMax] = useState<string>('100');
  const [numQty, setNumQty] = useState<string>('5');
  const [numInteger, setNumInteger] = useState<boolean>(true);
  const [numDecimals, setNumDecimals] = useState<string>('2');
  const [numResults, setNumResults] = useState<number[]>([]);
  const [numError, setNumError] = useState<string>('');
  const [numCopied, setNumCopied] = useState<boolean>(false);

  // --- Onglet Chaine ---
  const [strLen, setStrLen] = useState<string>('16');
  const [strUpper, setStrUpper] = useState<boolean>(true);
  const [strLower, setStrLower] = useState<boolean>(true);
  const [strDigits, setStrDigits] = useState<boolean>(true);
  const [strSymbols, setStrSymbols] = useState<boolean>(false);
  const [strResults, setStrResults] = useState<string[]>([]);
  const [strQty, setStrQty] = useState<string>('3');
  const [strError, setStrError] = useState<string>('');
  const [strCopied, setStrCopied] = useState<string | null>(null);

  // --- Onglet De / Pile ou Face ---
  const [diceType, setDiceType] = useState<'d6' | 'd20' | 'coin'>('d6');
  const [diceQty, setDiceQty] = useState<string>('1');
  const [diceResults, setDiceResults] = useState<(number | string)[]>([]);
  const [diceCopied, setDiceCopied] = useState<boolean>(false);

  // ---- Actions Nombres ----
  function generateNumbers() {
    setNumError('');
    setNumResults([]);
    const min = parseFloat(numMin);
    const max = parseFloat(numMax);
    const qty = parseInt(numQty, 10);
    const dec = parseInt(numDecimals, 10);

    if (isNaN(min) || isNaN(max)) { setNumError('Min et Max doivent etre des nombres.'); return; }
    if (min >= max) { setNumError('Min doit etre strictement inferieur a Max.'); return; }
    if (isNaN(qty) || qty < 1 || qty > 1000) { setNumError('La quantite doit etre entre 1 et 1000.'); return; }
    if (!numInteger && (isNaN(dec) || dec < 1 || dec > 10)) { setNumError('Les decimales doivent etre entre 1 et 10.'); return; }

    const results: number[] = [];
    for (let i = 0; i < qty; i++) {
      if (numInteger) {
        results.push(cryptoRandBetween(Math.ceil(min), Math.floor(max)));
      } else {
        const raw = min + cryptoRandFloat() * (max - min);
        results.push(parseFloat(raw.toFixed(dec)));
      }
    }
    setNumResults(results);
  }

  function copyNumbers() {
    const text = numResults.join(', ');
    navigator.clipboard.writeText(text).then(() => {
      setNumCopied(true);
      setTimeout(() => setNumCopied(false), 1500);
    });
  }

  // ---- Actions Chaine ----
  const charset = useMemo(() => {
    let s = '';
    if (strUpper) s += UPPER;
    if (strLower) s += LOWER;
    if (strDigits) s += DIGITS;
    if (strSymbols) s += SYMBOLS;
    return s;
  }, [strUpper, strLower, strDigits, strSymbols]);

  function generateStrings() {
    setStrError('');
    setStrResults([]);
    const len = parseInt(strLen, 10);
    const qty = parseInt(strQty, 10);
    if (isNaN(len) || len < 1 || len > 4096) { setStrError('La longueur doit etre entre 1 et 4096.'); return; }
    if (isNaN(qty) || qty < 1 || qty > 50) { setStrError('La quantite doit etre entre 1 et 50.'); return; }
    if (!charset.length) { setStrError('Selectionnez au moins un jeu de caracteres.'); return; }
    const results: string[] = [];
    for (let i = 0; i < qty; i++) {
      results.push(cryptoRandString(len, charset));
    }
    setStrResults(results);
  }

  function copyStr(s: string, idx: number) {
    navigator.clipboard.writeText(s).then(() => {
      setStrCopied(String(idx));
      setTimeout(() => setStrCopied(null), 1500);
    });
  }

  function copyAllStr() {
    navigator.clipboard.writeText(strResults.join('\n')).then(() => {
      setStrCopied('all');
      setTimeout(() => setStrCopied(null), 1500);
    });
  }

  // ---- Actions De / Piece ----
  function rollDice() {
    const qty = parseInt(diceQty, 10);
    const count = isNaN(qty) || qty < 1 ? 1 : Math.min(qty, 100);
    const results: (number | string)[] = [];
    for (let i = 0; i < count; i++) {
      if (diceType === 'coin') {
        results.push(cryptoRandBetween(0, 1) === 0 ? 'Pile' : 'Face');
      } else {
        const sides = diceType === 'd6' ? 6 : 20;
        results.push(cryptoRandBetween(1, sides));
      }
    }
    setDiceResults(results);
  }

  function copyDice() {
    navigator.clipboard.writeText(diceResults.join(', ')).then(() => {
      setDiceCopied(true);
      setTimeout(() => setDiceCopied(false), 1500);
    });
  }

  const diceSum = diceResults.every((r) => typeof r === 'number')
    ? (diceResults as number[]).reduce((a, b) => a + b, 0)
    : null;

  // ---- UI ----
  const tabs: { key: Tab; label: string }[] = [
    { key: 'numbers', label: 'Nombres' },
    { key: 'string', label: 'Chaine' },
    { key: 'dice', label: 'Des & Piece' },
  ];

  return (
    <div className="space-y-6">
      {/* Onglets */}
      <div className="flex gap-1 bg-zinc-800 rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === t.key
                ? 'bg-sky-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ======= Onglet Nombres ======= */}
      {tab === 'numbers' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="lbl">Minimum</label>
              <input
                type="number"
                className="fld"
                value={numMin}
                onChange={(e) => setNumMin(e.target.value)}
              />
            </div>
            <div>
              <label className="lbl">Maximum</label>
              <input
                type="number"
                className="fld"
                value={numMax}
                onChange={(e) => setNumMax(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="lbl">Quantite</label>
              <input
                type="number"
                min={1}
                max={1000}
                className="fld"
                value={numQty}
                onChange={(e) => setNumQty(e.target.value)}
              />
            </div>
            {!numInteger && (
              <div>
                <label className="lbl">Decimales</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="fld"
                  value={numDecimals}
                  onChange={(e) => setNumDecimals(e.target.value)}
                />
              </div>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
            <input
              type="checkbox"
              className="w-4 h-4 accent-sky-500"
              checked={numInteger}
              onChange={(e) => setNumInteger(e.target.checked)}
            />
            <span className="text-sm text-zinc-300">Entiers uniquement</span>
          </label>

          <button className="btnp" onClick={generateNumbers}>
            Generer
          </button>

          {numError && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-2">
              {numError}
            </p>
          )}

          {numResults.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="lbl mb-0">Resultats ({numResults.length})</label>
                <button className="btn text-sm" onClick={copyNumbers}>
                  {numCopied ? 'Copie ✓' : 'Copier tout'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {numResults.map((n, i) => (
                  <span key={i} className="pill bg-zinc-700 text-emerald-400 font-mono text-sm">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======= Onglet Chaine ======= */}
      {tab === 'string' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="lbl">Longueur</label>
              <input
                type="number"
                min={1}
                max={4096}
                className="fld"
                value={strLen}
                onChange={(e) => setStrLen(e.target.value)}
              />
            </div>
            <div>
              <label className="lbl">Quantite</label>
              <input
                type="number"
                min={1}
                max={50}
                className="fld"
                value={strQty}
                onChange={(e) => setStrQty(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="lbl">Jeux de caracteres</label>
            <div className="flex flex-wrap gap-4 mt-2">
              {([
                { label: 'Majuscules (A-Z)', checked: strUpper, set: setStrUpper },
                { label: 'Minuscules (a-z)', checked: strLower, set: setStrLower },
                { label: 'Chiffres (0-9)', checked: strDigits, set: setStrDigits },
                { label: 'Symboles (!@#…)', checked: strSymbols, set: setStrSymbols },
              ] as { label: string; checked: boolean; set: (v: boolean) => void }[]).map(({ label, checked, set }) => (
                <label key={label} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-sky-500"
                    checked={checked}
                    onChange={(e) => set(e.target.checked)}
                  />
                  <span className="text-sm text-zinc-300">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {charset.length > 0 && (
            <p className="text-xs text-zinc-500">
              Pool : {charset.length} caracteres
            </p>
          )}

          <button className="btnp" onClick={generateStrings}>
            Generer
          </button>

          {strError && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-2">
              {strError}
            </p>
          )}

          {strResults.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="lbl mb-0">Resultats</label>
                {strResults.length > 1 && (
                  <button className="btn text-sm" onClick={copyAllStr}>
                    {strCopied === 'all' ? 'Copie ✓' : 'Copier tout'}
                  </button>
                )}
              </div>
              {strResults.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <code className="fld flex-1 font-mono text-sm text-emerald-400 py-2 truncate">
                    {s}
                  </code>
                  <button
                    className="btn text-sm shrink-0"
                    onClick={() => copyStr(s, i)}
                  >
                    {strCopied === String(i) ? '✓' : 'Copier'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======= Onglet Des & Piece ======= */}
      {tab === 'dice' && (
        <div className="space-y-5">
          <div>
            <label className="lbl">Type</label>
            <div className="flex flex-wrap gap-3 mt-2">
              {([
                { key: 'd6', label: 'D6 (1-6)' },
                { key: 'd20', label: 'D20 (1-20)' },
                { key: 'coin', label: 'Pile ou Face' },
              ] as { key: 'd6' | 'd20' | 'coin'; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => { setDiceType(key); setDiceResults([]); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border
                    ${diceType === key
                      ? 'bg-sky-600 border-sky-500 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="lbl">
              {diceType === 'coin' ? 'Nombre de lancers' : 'Nombre de des'}
            </label>
            <input
              type="number"
              min={1}
              max={100}
              className="fld w-32"
              value={diceQty}
              onChange={(e) => setDiceQty(e.target.value)}
            />
          </div>

          <button className="btnp" onClick={rollDice}>
            {diceType === 'coin' ? 'Lancer la piece' : 'Lancer les des'}
          </button>

          {diceResults.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="lbl mb-0">
                  Resultats ({diceResults.length} lancer{diceResults.length > 1 ? 's' : ''})
                  {diceSum !== null && diceResults.length > 1 && (
                    <span className="ml-3 text-amber-400">
                      Total : {diceSum}
                    </span>
                  )}
                </label>
                <button className="btn text-sm" onClick={copyDice}>
                  {diceCopied ? 'Copie ✓' : 'Copier'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {diceResults.map((r, i) => (
                  <span
                    key={i}
                    className={`pill font-mono text-sm font-bold
                      ${diceType === 'coin'
                        ? r === 'Pile'
                          ? 'bg-amber-700/40 text-amber-300'
                          : 'bg-sky-700/40 text-sky-300'
                        : diceType === 'd20' && r === 20
                          ? 'bg-emerald-700/40 text-emerald-300'
                          : diceType === 'd20' && r === 1
                            ? 'bg-red-700/40 text-red-300'
                            : 'bg-zinc-700 text-zinc-200'
                      }`}
                  >
                    {r}
                  </span>
                ))}
              </div>
              {diceType === 'd20' && (
                <p className="text-xs text-zinc-500 mt-2">
                  20 = critique (emeraude) · 1 = echec critique (rouge)
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
