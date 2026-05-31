import { useState, useMemo, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Helpers HSL / HEX
// ---------------------------------------------------------------------------

function normalizeHex(raw: string): string | null {
  const s = raw.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(s))
    return '#' + s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  if (/^[0-9a-fA-F]{6}$/.test(s)) return '#' + s;
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

function hslToHex(h: number, s: number, l: number): string {
  const hh = h / 360, ss = s / 100, ll = l / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  let r: number, g: number, b: number;
  if (ss === 0) {
    r = g = b = ll;
  } else {
    const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
    const p = 2 * ll - q;
    r = hue2rgb(p, q, hh + 1 / 3);
    g = hue2rgb(p, q, hh);
    b = hue2rgb(p, q, hh - 1 / 3);
  }
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

function wrapHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

// ---------------------------------------------------------------------------
// Swatch component
// ---------------------------------------------------------------------------

function Swatch({ hex, label }: { hex: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  }, [hex]);

  // Decide text contrast: dark bg -> white text, light bg -> dark text
  const rgb = hexToRgb(hex);
  const lum = rgb
    ? 0.2126 * Math.pow(rgb.r / 255, 2.2) +
      0.7152 * Math.pow(rgb.g / 255, 2.2) +
      0.0722 * Math.pow(rgb.b / 255, 2.2)
    : 0;
  const textColor = lum > 0.35 ? '#18181b' : '#f4f4f5';

  return (
    <button
      onClick={copy}
      title={`Copier ${hex}`}
      className="flex flex-col items-center gap-1 group focus:outline-none"
    >
      <div
        className="w-12 h-12 rounded-lg border border-white/10 shadow flex items-center justify-center transition-transform group-hover:scale-110 group-hover:shadow-lg"
        style={{ backgroundColor: hex }}
      >
        <span
          className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: textColor }}
        >
          {copied ? "OK" : ""}
        </span>
      </div>
      <span className="text-[10px] font-mono text-zinc-400 group-hover:text-zinc-200 transition-colors leading-tight">
        {copied ? "Copié ✓" : hex.toUpperCase()}
      </span>
      {label && (
        <span className="text-[9px] text-zinc-600 leading-tight">{label}</span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function PaletteTool() {
  const [hexInput, setHexInput] = useState('#3b82f6');
  const [pickerValue, setPickerValue] = useState('#3b82f6');

  const handleHexChange = (value: string) => {
    setHexInput(value);
    const n = normalizeHex(value);
    if (n) setPickerValue(n);
  };

  const handlePickerChange = (value: string) => {
    setPickerValue(value);
    setHexInput(value);
  };

  const rgb = useMemo(() => hexToRgb(hexInput), [hexInput]);
  const hsl = useMemo(() => (rgb ? rgbToHsl(rgb) : null), [rgb]);
  const isValid = rgb !== null;

  // Nuances : lightness de 10% à 90% par pas de 8 niveaux
  const shades = useMemo(() => {
    if (!hsl) return [];
    const steps = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    return steps.map((l) => ({
      hex: hslToHex(hsl.h, hsl.s, l),
      label: `${l}%`,
    }));
  }, [hsl]);

  // Harmonies
  const harmonies = useMemo(() => {
    if (!hsl) return [];
    const { h, s, l } = hsl;
    return [
      {
        title: "Complémentaire",
        swatches: [
          { hex: hslToHex(h, s, l), label: "Base" },
          { hex: hslToHex(wrapHue(h + 180), s, l), label: "+180°" },
        ],
      },
      {
        title: "Analogues",
        swatches: [
          { hex: hslToHex(wrapHue(h - 30), s, l), label: "-30°" },
          { hex: hslToHex(h, s, l), label: "Base" },
          { hex: hslToHex(wrapHue(h + 30), s, l), label: "+30°" },
        ],
      },
      {
        title: "Triadiques",
        swatches: [
          { hex: hslToHex(h, s, l), label: "Base" },
          { hex: hslToHex(wrapHue(h + 120), s, l), label: "+120°" },
          { hex: hslToHex(wrapHue(h + 240), s, l), label: "+240°" },
        ],
      },
    ];
  }, [hsl]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      {/* Sélecteur de couleur */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
          Couleur de base
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px]">
            <label className="lbl">Valeur hex</label>
            <input
              className={`fld ${!isValid && hexInput.length > 1 ? 'border-red-500' : ''}`}
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="#rrggbb"
              spellCheck={false}
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <label className="lbl">Sélecteur</label>
            <input
              type="color"
              value={pickerValue}
              onChange={(e) => handlePickerChange(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-zinc-700 bg-zinc-900 p-0.5"
            />
          </div>
          {isValid && (
            <div
              className="w-10 h-10 rounded-lg border border-zinc-700 flex-shrink-0"
              style={{ backgroundColor: normalizeHex(hexInput) ?? undefined }}
            />
          )}
        </div>
        {!isValid && hexInput.length > 1 && (
          <p className="text-red-400 text-xs">Hex invalide — attendu #rgb ou #rrggbb</p>
        )}
        {hsl && (
          <p className="text-zinc-500 text-xs font-mono">
            HSL : {hsl.h}° · {hsl.s}% · {hsl.l}%
          </p>
        )}
      </div>

      {isValid && (
        <>
          {/* Nuances */}
          <div className="card space-y-3">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
              Nuances (luminosité HSL)
            </h2>
            <div className="flex flex-wrap gap-4">
              {shades.map((s) => (
                <Swatch key={s.hex + s.label} hex={s.hex} label={s.label} />
              ))}
            </div>
          </div>

          {/* Harmonies */}
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
              Harmonies chromatiques
            </h2>
            <div className="space-y-5">
              {harmonies.map((group) => (
                <div key={group.title}>
                  <p className="text-xs font-medium text-zinc-400 mb-2">{group.title}</p>
                  <div className="flex flex-wrap gap-4">
                    {group.swatches.map((sw, i) => (
                      <Swatch key={sw.hex + i} hex={sw.hex} label={sw.label} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
