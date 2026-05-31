import { useState, useMemo, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Expand 3-digit hex to 6-digit hex, return null on invalid input */
function normalizeHex(raw: string): string | null {
  const s = raw.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(s)) {
    return '#' + s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  }
  if (/^[0-9a-fA-F]{6}$/.test(s)) {
    return '#' + s;
  }
  return null;
}

interface RGB { r: number; g: number; b: number }
interface HSL { h: number; s: number; l: number }

function hexToRgb(hex: string): RGB | null {
  const n = normalizeHex(hex);
  if (!n) return null;
  return {
    r: parseInt(n.slice(1, 3), 16),
    g: parseInt(n.slice(3, 5), 16),
    b: parseInt(n.slice(5, 7), 16),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case rr: h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6; break;
    case gg: h = ((bb - rr) / d + 2) / 6; break;
    case bb: h = ((rr - gg) / d + 4) / 6; break;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/** Relative luminance per WCAG 2.1 */
function luminance({ r, g, b }: RGB): number {
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(a: RGB, b: RGB): number {
  const l1 = luminance(a), l2 = luminance(b);
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);
  return (
    <button className="btn text-xs px-2 py-1" onClick={copy}>
      {copied ? 'Copié ✓' : 'Copier'}
    </button>
  );
}

interface VerdictProps { label: string; threshold: number; ratio: number }
function Verdict({ label, threshold, ratio }: VerdictProps) {
  const pass = ratio >= threshold;
  return (
    <div className={`pill ${pass ? 'text-emerald-400 border-emerald-700/50 bg-emerald-950/40' : 'text-red-400 border-red-700/50 bg-red-950/40'}`}>
      {pass ? '✓' : '✗'} {label}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ColorTool() {
  // ---- Conversion section ----
  const [hexInput, setHexInput] = useState('#3b82f6');
  const [pickerValue, setPickerValue] = useState('#3b82f6');

  const rgb = useMemo(() => hexToRgb(hexInput), [hexInput]);
  const hsl = useMemo(() => (rgb ? rgbToHsl(rgb) : null), [rgb]);
  const isValidHex = rgb !== null;

  const handleHexChange = (value: string) => {
    setHexInput(value);
    const n = normalizeHex(value);
    if (n) setPickerValue(n);
  };

  const handlePickerChange = (value: string) => {
    setPickerValue(value);
    setHexInput(value);
  };

  // ---- Contrast section ----
  const [fgHex, setFgHex] = useState('#ffffff');
  const [bgHex, setBgHex] = useState('#1e3a5f');

  const fgRgb = useMemo(() => hexToRgb(fgHex), [fgHex]);
  const bgRgb = useMemo(() => hexToRgb(bgHex), [bgHex]);

  const ratio = useMemo(() => {
    if (!fgRgb || !bgRgb) return null;
    return contrastRatio(fgRgb, bgRgb);
  }, [fgRgb, bgRgb]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">

      {/* ================================================================ */}
      {/* SECTION 1 — Conversion de couleur                                */}
      {/* ================================================================ */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Conversion de couleur</h2>

        <div className="flex flex-wrap items-end gap-3">
          {/* HEX input */}
          <div className="flex-1 min-w-[140px]">
            <label className="lbl">Hex</label>
            <input
              className={`fld ${!isValidHex && hexInput.length > 1 ? 'border-red-500' : ''}`}
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="#rrggbb"
              spellCheck={false}
            />
          </div>

          {/* Color picker */}
          <div className="flex flex-col items-center gap-1">
            <label className="lbl">Sélecteur</label>
            <input
              type="color"
              value={pickerValue}
              onChange={(e) => handlePickerChange(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-zinc-700 bg-zinc-900 p-0.5"
            />
          </div>

          {/* Preview swatch */}
          {isValidHex && (
            <div
              className="w-10 h-10 rounded-lg border border-zinc-700 flex-shrink-0"
              style={{ backgroundColor: normalizeHex(hexInput) ?? undefined }}
              title="Aperçu"
            />
          )}

          {/* Copy button */}
          {isValidHex && (
            <CopyButton text={normalizeHex(hexInput) ?? hexInput} />
          )}
        </div>

        {/* Error */}
        {!isValidHex && hexInput.length > 1 && (
          <p className="text-red-400 text-xs">Hex invalide — attendu #rgb ou #rrggbb</p>
        )}

        {/* Conversions */}
        {isValidHex && rgb && hsl && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="card py-3 px-4 space-y-1">
              <span className="lbl mb-0">RGB</span>
              <p className="text-zinc-100 font-mono text-sm">
                rgb({rgb.r}, {rgb.g}, {rgb.b})
              </p>
              <p className="text-zinc-500 text-xs">R {rgb.r} · G {rgb.g} · B {rgb.b}</p>
            </div>
            <div className="card py-3 px-4 space-y-1">
              <span className="lbl mb-0">HSL</span>
              <p className="text-zinc-100 font-mono text-sm">
                hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
              </p>
              <p className="text-zinc-500 text-xs">H {hsl.h}° · S {hsl.s}% · L {hsl.l}%</p>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* SECTION 2 — Contraste WCAG                                       */}
      {/* ================================================================ */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Contraste WCAG</h2>

        <div className="flex flex-wrap gap-6">
          {/* Foreground */}
          <div className="flex flex-col gap-1">
            <label className="lbl">Couleur du texte</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgRgb ? rgbToHex(fgRgb) : '#ffffff'}
                onChange={(e) => setFgHex(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-zinc-700 bg-zinc-900 p-0.5"
              />
              <input
                className="fld w-28"
                value={fgHex}
                onChange={(e) => setFgHex(e.target.value)}
                spellCheck={false}
              />
            </div>
          </div>

          {/* Background */}
          <div className="flex flex-col gap-1">
            <label className="lbl">Couleur du fond</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgRgb ? rgbToHex(bgRgb) : '#000000'}
                onChange={(e) => setBgHex(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-zinc-700 bg-zinc-900 p-0.5"
              />
              <input
                className="fld w-28"
                value={bgHex}
                onChange={(e) => setBgHex(e.target.value)}
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {ratio !== null && fgRgb && bgRgb ? (
          <div className="space-y-3">
            {/* Ratio */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl font-bold text-zinc-100 font-mono">
                {ratio.toFixed(2)}:1
              </span>
              <div className="flex flex-wrap gap-2">
                <Verdict label="AA (≥4.5)" threshold={4.5} ratio={ratio} />
                <Verdict label="AA Large (≥3)" threshold={3} ratio={ratio} />
                <Verdict label="AAA (≥7)" threshold={7} ratio={ratio} />
              </div>
            </div>

            {/* Preview */}
            <div
              className="rounded-lg p-4 border border-zinc-700"
              style={{ backgroundColor: rgbToHex(bgRgb), color: rgbToHex(fgRgb) }}
            >
              <p className="text-base font-medium">Texte d'exemple — Normal</p>
              <p className="text-2xl font-bold mt-1">Texte d'exemple — Grand</p>
              <p className="text-xs mt-1 opacity-75">
                Texte / fond : {rgbToHex(fgRgb).toUpperCase()} sur {rgbToHex(bgRgb).toUpperCase()}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-red-400 text-xs">Couleur invalide — vérifiez les valeurs hex.</p>
        )}
      </div>
    </div>
  );
}
