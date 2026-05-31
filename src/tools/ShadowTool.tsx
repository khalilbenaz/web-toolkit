import { useState, useMemo, useCallback, useId } from 'react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hexToRgba(hex: string, alpha: number): string {
  const s = hex.replace(/^#/, '');
  const full =
    s.length === 3
      ? s[0] + s[0] + s[1] + s[1] + s[2] + s[2]
      : s.length === 6
      ? s
      : '000000';
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}

function buildCss(
  x: number,
  y: number,
  blur: number,
  spread: number,
  color: string,
  opacity: number,
  inset: boolean
): string {
  const rgba = hexToRgba(color, opacity);
  const parts = inset
    ? `inset ${x}px ${y}px ${blur}px ${spread}px ${rgba}`
    : `${x}px ${y}px ${blur}px ${spread}px ${rgba}`;
  return `box-shadow: ${parts};`;
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
      {copied ? "Copié ✓" : "Copier"}
    </button>
  );
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, unit = 'px', onChange }: SliderRowProps) {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="text-xs text-zinc-400 w-24 flex-shrink-0">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-sky-500 cursor-pointer"
      />
      <span className="text-xs font-mono text-zinc-300 w-16 text-right flex-shrink-0">
        {value}{unit}
      </span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
        }}
        className="fld w-16 text-xs text-center px-1"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ShadowTool() {
  const [offsetX, setOffsetX] = useState(4);
  const [offsetY, setOffsetY] = useState(8);
  const [blur, setBlur] = useState(16);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState('#000000');
  const [opacity, setOpacity] = useState(0.35);
  const [inset, setInset] = useState(false);

  const css = useMemo(
    () => buildCss(offsetX, offsetY, blur, spread, color, opacity, inset),
    [offsetX, offsetY, blur, spread, color, opacity, inset]
  );

  const shadowValue = useMemo(() => {
    const rgba = hexToRgba(color, opacity);
    return inset
      ? `inset ${offsetX}px ${offsetY}px ${blur}px ${spread}px ${rgba}`
      : `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${rgba}`;
  }, [offsetX, offsetY, blur, spread, color, opacity, inset]);

  const colorId = useId();
  const insetId = useId();

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      {/* Contrôles */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
          Paramètres de l&apos;ombre
        </h2>

        <div className="space-y-3">
          <SliderRow
            label="Décalage X"
            value={offsetX}
            min={-100}
            max={100}
            onChange={setOffsetX}
          />
          <SliderRow
            label="Décalage Y"
            value={offsetY}
            min={-100}
            max={100}
            onChange={setOffsetY}
          />
          <SliderRow
            label="Flou"
            value={blur}
            min={0}
            max={100}
            onChange={setBlur}
          />
          <SliderRow
            label="Étendue"
            value={spread}
            min={-50}
            max={50}
            onChange={setSpread}
          />
          <SliderRow
            label="Opacité"
            value={Math.round(opacity * 100)}
            min={0}
            max={100}
            unit="%"
            onChange={(v) => setOpacity(v / 100)}
          />
        </div>

        {/* Couleur + Inset */}
        <div className="flex flex-wrap items-center gap-6 pt-1">
          <div className="flex items-center gap-3">
            <label htmlFor={colorId} className="text-xs text-zinc-400">
              Couleur
            </label>
            <input
              id={colorId}
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-9 h-9 rounded cursor-pointer border border-zinc-700 bg-zinc-900 p-0.5"
            />
            <input
              className="fld w-24 text-xs font-mono"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              spellCheck={false}
            />
          </div>
          <label htmlFor={insetId} className="flex items-center gap-2 cursor-pointer select-none">
            <input
              id={insetId}
              type="checkbox"
              checked={inset}
              onChange={(e) => setInset(e.target.checked)}
              className="w-4 h-4 accent-sky-500 cursor-pointer"
            />
            <span className="text-xs text-zinc-400">Inset</span>
          </label>
        </div>
      </div>

      {/* Aperçu */}
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
          Aperçu
        </h2>
        <div className="flex items-center justify-center min-h-[180px] rounded-xl bg-zinc-800/50">
          <div
            className="w-48 h-28 rounded-xl bg-zinc-200 transition-shadow duration-150"
            style={{ boxShadow: shadowValue }}
          />
        </div>
      </div>

      {/* Sortie CSS */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
            CSS généré
          </h2>
          <CopyButton text={css} />
        </div>
        <pre className="fld text-xs whitespace-pre-wrap break-all leading-relaxed min-h-[2.5rem]">
          {css}
        </pre>
      </div>
    </div>
  );
}
