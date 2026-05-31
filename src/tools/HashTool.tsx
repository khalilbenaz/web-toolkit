import { useState, useEffect } from 'react';

type Algo = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

const ALGOS: Algo[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

type HashMap = Record<Algo, string>;

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function computeHashes(text: string): Promise<HashMap> {
  const encoded = new TextEncoder().encode(text);
  const results = await Promise.all(
    ALGOS.map((algo) =>
      crypto.subtle.digest(algo, encoded).then(bufToHex)
    )
  );
  return Object.fromEntries(ALGOS.map((a, i) => [a, results[i]])) as HashMap;
}

const EMPTY: HashMap = { 'SHA-1': '', 'SHA-256': '', 'SHA-384': '', 'SHA-512': '' };

export default function HashTool() {
  const [input, setInput] = useState<string>('');
  const [hashes, setHashes] = useState<HashMap>(EMPTY);
  const [copied, setCopied] = useState<Algo | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    setError('');

    if (!input) {
      setHashes(EMPTY);
      return;
    }

    computeHashes(input)
      .then((result) => {
        if (!cancelled) setHashes(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError((err as Error).message ?? 'Erreur de calcul');
          setHashes(EMPTY);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [input]);

  function copyHash(algo: Algo) {
    navigator.clipboard.writeText(hashes[algo]).then(() => {
      setCopied(algo);
      setTimeout(() => setCopied(null), 1800);
    });
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 p-4">
      {/* Entrée */}
      <div>
        <label className="lbl">Texte à hacher</label>
        <textarea
          className="fld min-h-[120px] resize-y"
          placeholder="Saisissez votre texte ici…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {/* Erreur */}
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {/* Résultats */}
      <div className="flex flex-col gap-3">
        {ALGOS.map((algo) => (
          <div key={algo} className="card flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="pill">{algo}</span>
              <button
                className="btn text-xs"
                onClick={() => copyHash(algo)}
                disabled={!hashes[algo]}
              >
                {copied === algo ? 'Copié ✓' : 'Copier'}
              </button>
            </div>
            <span className="font-mono text-xs text-zinc-300 break-all leading-relaxed">
              {hashes[algo] || (
                <span className="text-zinc-600 italic">—</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
