import { useState, useMemo, useCallback, useId } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ColorStop {
  id: string;
  color: string;
  position: number; // 0–100
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function buildCss(
  type: 'linear' | 'radial',
  angle: number,
  stops: ColorStop[]
): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const stopStr = sorted.map((s) => `${s.color} ${s.position}%`).join(', ');
  if (type === 'linear') {
    return `background: linear-gradient(${angle}deg, ${stopStr});`;
  }
  return `background: radial-gradient(circle, ${stopStr});`;
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

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function GradientTool() {
  const labelId = useId();
  const [type, setType] = useState<'linear' | 'radial'>('linear');
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<ColorStop[]>([
    { id: uid(), color: '#3b82f6', position: 0 },
    { id: uid(), color: '#8b5cf6', position: 100 },
  ]);

  const css = useMemo(() => buildCss(type, angle, stops), [type, angle, stops]);

  const gradientStyle = useMemo(() => {
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    const stopStr = sorted.map((s) => `${s.color} ${s.position}%`).join(', ');
    return type === 'linear'
      ? { background: `linear-gradient(${angle}deg, ${stopStr})` }
      : { background: `radial-gradient(circle, ${stopStr})` };
  }, [type, angle, stops]);

  const updateStop = (id: string, patch: Partial<ColorStop>) => {
    setStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  const addStop = () => {
    setStops((prev) => [
      ...prev,
      { id: uid(), color: '#10b981', position: 50 },
    ]);
  };

  const removeStop = (id: string) => {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      {/* Options */}
      <div className="card space-y-5">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
          Options du dégradé
        </h2>

        {/* Type */}
        <div>
          <label className="lbl">Type</label>
          <div className="flex gap-2">
            {(['linear', 'radial'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`btn px-4 py-1.5 text-xs ${type === t ? 'bg-sky-700 border-sky-500 text-white' : ''}`}
              >
                {t === 'linear' ? "Linéaire" : "Radial"}
              </button>
            ))}
          </div>
        </div>

        {/* Angle (uniquement pour linéaire) */}
        {type === 'linear' && (
          <div>
            <label htmlFor={labelId} className="lbl">
              Angle — {angle}°
            </label>
            <input
              id={labelId}
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>
        )}

        {/* Arrêts de couleur */}
        <div>
          <label className="lbl">Arrêts de couleur</label>
          <div className="space-y-2">
            {stops.map((stop, idx) => (
              <div key={stop.id} className="flex items-center gap-3 flex-wrap">
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                  className="w-9 h-9 rounded cursor-pointer border border-zinc-700 bg-zinc-900 p-0.5 flex-shrink-0"
                />
                <input
                  className="fld w-24 font-mono text-xs"
                  value={stop.color}
                  onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                  spellCheck={false}
                />
                <div className="flex-1 min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={stop.position}
                      onChange={(e) =>
                        updateStop(stop.id, { position: Number(e.target.value) })
                      }
                      className="flex-1 accent-sky-500 cursor-pointer"
                    />
                    <span className="text-xs text-zinc-400 w-9 text-right font-mono">
                      {stop.position}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeStop(stop.id)}
                  disabled={stops.length <= 2}
                  className="btn px-2 py-1 text-xs text-red-400 border-red-900/50 hover:bg-red-950/40 disabled:opacity-30"
                  title="Supprimer cet arrêt"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button onClick={addStop} className="btn mt-3 text-xs px-3 py-1.5">
            + Ajouter un arrêt
          </button>
        </div>
      </div>

      {/* Aperçu */}
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
          Aperçu
        </h2>
        <div
          className="w-full h-40 rounded-xl border border-zinc-700 shadow-inner"
          style={gradientStyle}
        />
      </div>

      {/* Sortie CSS */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
            CSS généré
          </h2>
          <CopyButton text={css} />
        </div>
        <pre className="fld text-xs whitespace-pre-wrap break-all leading-relaxed min-h-[3rem]">
          {css}
        </pre>
      </div>
    </div>
  );
}
