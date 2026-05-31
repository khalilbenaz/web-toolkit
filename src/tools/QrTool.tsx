import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

const CORRECTION_LEVELS: { value: ErrorCorrectionLevel; label: string; desc: string }[] = [
  { value: 'L', label: 'L — Bas (7%)', desc: '7 % de correction' },
  { value: 'M', label: 'M — Moyen (15%)', desc: '15 % de correction' },
  { value: 'Q', label: 'Q — Quartile (25%)', desc: '25 % de correction' },
  { value: 'H', label: 'H — Élevé (30%)', desc: '30 % de correction' },
];

const SIZE_OPTIONS = [128, 256, 512, 1024];

export default function QrTool() {
  const [text, setText] = useState<string>('');
  const [level, setLevel] = useState<ErrorCorrectionLevel>('M');
  const [size, setSize] = useState<number>(256);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim()) {
      setDataUrl('');
      setError('');
      return;
    }

    debounceRef.current = setTimeout(() => {
      QRCode.toDataURL(text, {
        errorCorrectionLevel: level,
        width: size,
        margin: 1,
      })
        .then((url: string) => {
          setDataUrl(url);
          setError('');
        })
        .catch((err: unknown) => {
          setDataUrl('');
          setError(err instanceof Error ? err.message : 'Erreur lors de la génération du QR code.');
        });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, level, size]);

  const handleCopyUrl = () => {
    if (!dataUrl) return;
    navigator.clipboard.writeText(dataUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Champ texte/URL */}
      <div>
        <label className="lbl">Texte ou URL à encoder</label>
        <textarea
          className="fld resize-none"
          rows={3}
          placeholder="https://exemple.com ou tout autre texte…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
        />
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <div>
          <label className="lbl">Niveau de correction d'erreur</label>
          <select
            className="fld"
            value={level}
            onChange={(e) => setLevel(e.target.value as ErrorCorrectionLevel)}
          >
            {CORRECTION_LEVELS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-zinc-500">
            Niveau élevé = plus robuste, QR plus dense
          </p>
        </div>

        <div>
          <label className="lbl">Taille (px)</label>
          <select
            className="fld"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            {SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s} × {s} px
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-zinc-500">
            Taille de l'image PNG générée
          </p>
        </div>
      </div>

      {/* Résultat */}
      {error && (
        <div className="card border-red-800/60 bg-red-950/30">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!text.trim() && !error && (
        <div className="card flex flex-col items-center justify-center gap-3 py-12">
          <div className="w-24 h-24 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 4.5h4.5v4.5h-4.5V4.5zM3.75 15h4.5v4.5h-4.5V15zM15 4.5h4.5v4.5H15V4.5zM9 9h1.5v1.5H9V9zM9 13.5H10.5V15H9v-1.5zM13.5 9H15v1.5h-1.5V9zM13.5 13.5H15V15h-1.5v-1.5zM9 18H10.5v1.5H9V18zM13.5 18H15v1.5h-1.5V18zM18 9h1.5v1.5H18V9zM18 13.5h1.5V15H18v-1.5zM18 18h1.5v1.5H18V18z"
              />
            </svg>
          </div>
          <p className="text-sm text-zinc-500">Saisissez du texte ou une URL pour générer le QR code</p>
        </div>
      )}

      {dataUrl && !error && (
        <div className="card flex flex-col items-center gap-5">
          <img
            src={dataUrl}
            alt="QR Code généré"
            className="rounded-lg border border-zinc-700"
            style={{ width: Math.min(size, 320), height: Math.min(size, 320), imageRendering: 'pixelated' }}
          />

          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href={dataUrl}
              download="qrcode.png"
              className="btnp"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Télécharger PNG
            </a>

            <button className="btn" onClick={handleCopyUrl}>
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-emerald-400">Copié ✓</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copier Data URL
                </>
              )}
            </button>
          </div>

          <div className="w-full">
            <label className="lbl">Contenu encodé</label>
            <p className="text-sm text-zinc-400 break-all font-mono bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
              {text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
