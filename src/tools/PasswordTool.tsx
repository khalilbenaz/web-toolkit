import { useState, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Options {
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
}

type Strength = 'faible' | 'moyen' | 'fort';

// ── Helpers ────────────────────────────────────────────────────────────────────

const UPPER   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER   = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS  = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?';

function buildAlphabet(opts: Options): string {
  return (
    (opts.upper   ? UPPER   : '') +
    (opts.lower   ? LOWER   : '') +
    (opts.digits  ? DIGITS  : '') +
    (opts.symbols ? SYMBOLS : '')
  );
}

function generate(length: number, opts: Options): string {
  const alphabet = buildAlphabet(opts);
  if (alphabet.length === 0) return '';

  // Génération cryptographiquement sûre via crypto.getRandomValues
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);

  return Array.from(bytes)
    .map((b) => alphabet[b % alphabet.length])
    .join('');
}

function computeStrength(password: string, opts: Options): Strength {
  if (password.length === 0) return 'faible';
  const varietyCount = [opts.upper, opts.lower, opts.digits, opts.symbols].filter(Boolean).length;
  if (password.length >= 16 && varietyCount >= 3) return 'fort';
  if (password.length >= 10 && varietyCount >= 2) return 'moyen';
  return 'faible';
}

// ── Composant ──────────────────────────────────────────────────────────────────

export default function PasswordTool() {
  const [length, setLength]   = useState<number>(16);
  const [opts, setOpts]       = useState<Options>({ upper: true, lower: true, digits: true, symbols: false });
  const [password, setPassword] = useState<string>(() => generate(16, { upper: true, lower: true, digits: true, symbols: false }));
  const [copied, setCopied]   = useState(false);

  const regen = useCallback(() => {
    setPassword(generate(length, opts));
    setCopied(false);
  }, [length, opts]);

  const toggleOpt = (key: keyof Options) => {
    setOpts((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      setPassword(generate(length, next));
      setCopied(false);
      return next;
    });
  };

  const handleLength = (v: number) => {
    setLength(v);
    setPassword(generate(v, opts));
    setCopied(false);
  };

  const copy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silencieux si refus presse-papier
    }
  };

  const strength = computeStrength(password, opts);

  const strengthMeta: Record<Strength, { label: string; color: string; width: string }> = {
    faible: { label: 'Faible',  color: 'bg-red-500',     width: 'w-1/3'  },
    moyen:  { label: 'Moyen',   color: 'bg-yellow-400',  width: 'w-2/3'  },
    fort:   { label: 'Fort',    color: 'bg-emerald-400', width: 'w-full' },
  };
  const sm = strengthMeta[strength];

  const alphabet = buildAlphabet(opts);
  const noCharset = alphabet.length === 0;

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Longueur */}
      <div className="card space-y-3">
        <label className="lbl">Longueur : <span className="text-sky-400 font-bold">{length}</span></label>
        <input
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={(e) => handleLength(Number(e.target.value))}
          className="w-full accent-sky-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-zinc-600 select-none">
          <span>8</span><span>64</span>
        </div>
      </div>

      {/* Options de jeu de caractères */}
      <div className="card">
        <p className="lbl mb-3">Jeu de caractères</p>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { key: 'upper',   label: 'Majuscules',  example: 'A–Z' },
              { key: 'lower',   label: 'Minuscules',  example: 'a–z' },
              { key: 'digits',  label: 'Chiffres',    example: '0–9' },
              { key: 'symbols', label: 'Symboles',    example: '!@#…' },
            ] as { key: keyof Options; label: string; example: string }[]
          ).map(({ key, label, example }) => (
            <label
              key={key}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <input
                type="checkbox"
                checked={opts[key]}
                onChange={() => toggleOpt(key)}
                className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
              />
              <span className="text-sm text-zinc-200 group-hover:text-white transition">
                {label} <span className="text-zinc-500 font-mono text-xs">({example})</span>
              </span>
            </label>
          ))}
        </div>
        {noCharset && (
          <p className="mt-3 text-xs text-red-400">Sélectionnez au moins un jeu de caractères.</p>
        )}
      </div>

      {/* Résultat */}
      <div className="card space-y-4">
        <p className="lbl">Mot de passe généré</p>

        {/* Barre de force */}
        {!noCharset && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Force</span>
              <span className={`font-semibold ${
                strength === 'fort'  ? 'text-emerald-400' :
                strength === 'moyen' ? 'text-yellow-400'  : 'text-red-400'
              }`}>{sm.label}</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${sm.color} ${sm.width}`} />
            </div>
          </div>
        )}

        {/* Affichage du mot de passe */}
        <div className="bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 min-h-[3rem] flex items-center break-all">
          {noCharset ? (
            <span className="text-zinc-600 italic text-sm">Aucun jeu de caractères sélectionné</span>
          ) : (
            <span className="font-mono text-base text-zinc-100 select-all">{password}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            className="btn"
            onClick={regen}
            disabled={noCharset}
            title="Générer un nouveau mot de passe"
          >
            ↻ Régénérer
          </button>
          <button
            className="btnp"
            onClick={copy}
            disabled={noCharset || !password}
          >
            {copied ? '✓ Copié' : 'Copier'}
          </button>
        </div>
      </div>
    </div>
  );
}
