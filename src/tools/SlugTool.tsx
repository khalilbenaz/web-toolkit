import { useState, useMemo } from 'react';

export default function SlugTool() {
  const [input, setInput] = useState<string>('');
  const [separator, setSeparator] = useState<'-' | '_'>('-');
  const [forceLower, setForceLower] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const slug = useMemo(() => {
    if (!input.trim()) return '';
    let text = input;

    // Normalise les caractères accentués (NFD) puis supprime les diacritiques
    text = text.normalize('NFD').replace(/[̀-ͯ]/g, '');

    if (forceLower) {
      text = text.toLowerCase();
    }

    // Remplace tout caractère non alphanumérique par le séparateur
    const sep = separator;
    text = text.replace(/[^a-zA-Z0-9]+/g, sep);

    // Supprime le séparateur en début/fin
    const escaped = sep.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    text = text.replace(new RegExp(`^${escaped}+|${escaped}+$`, 'g'), '');

    return text;
  }, [input, separator, forceLower]);

  function copy() {
    if (!slug) return;
    navigator.clipboard.writeText(slug).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="lbl">Texte source</label>
        <textarea
          className="fld h-28 resize-y"
          placeholder="Mon Titre avec des Accents et des Espaces !"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setCopied(false);
          }}
        />
      </div>

      <div className="flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-2">
          <label className="lbl mb-0">Séparateur</label>
          <div className="flex gap-1">
            <button
              className={separator === '-' ? 'btnp' : 'btn'}
              onClick={() => setSeparator('-')}
            >
              Tiret &nbsp;<code>-</code>
            </button>
            <button
              className={separator === '_' ? 'btnp' : 'btn'}
              onClick={() => setSeparator('_')}
            >
              Underscore &nbsp;<code>_</code>
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-zinc-300">
          <input
            type="checkbox"
            className="w-4 h-4 accent-sky-500"
            checked={forceLower}
            onChange={(e) => setForceLower(e.target.checked)}
          />
          Forcer les minuscules
        </label>
      </div>

      {slug && (
        <div>
          <label className="lbl">Slug généré</label>
          <div className="fld flex items-center justify-between gap-3">
            <span className="text-emerald-400 font-mono text-sm break-all">{slug}</span>
            <button className="btn shrink-0" onClick={copy}>
              {copied ? 'Copié ✓' : 'Copier'}
            </button>
          </div>
        </div>
      )}

      {!slug && input.trim() && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-2">
          Le texte ne contient aucun caractère alphanumérique utilisable.
        </p>
      )}
    </div>
  );
}
