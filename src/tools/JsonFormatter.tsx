import { useState, useCallback } from 'react';

export default function JsonFormatter() {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [sizeInfo, setSizeInfo] = useState<{ before: number; after: number } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const clearState = () => {
    setError('');
    setSizeInfo(null);
  };

  const format = useCallback(() => {
    clearState();
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  }, [input]);

  const minify = useCallback(() => {
    clearState();
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      const before = new TextEncoder().encode(input).length;
      const after = new TextEncoder().encode(minified).length;
      setOutput(minified);
      setSizeInfo({ before, after });
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  }, [input]);

  const copy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

  const formatBytes = (n: number): string => {
    if (n < 1024) return `${n} o`;
    return `${(n / 1024).toFixed(1)} Ko`;
  };

  const gain = sizeInfo
    ? Math.round((1 - sizeInfo.after / sizeInfo.before) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto">
      {/* Zone d'entrée */}
      <div>
        <label className="lbl">JSON d&apos;entrée</label>
        <textarea
          className="fld min-h-[200px] resize-y"
          placeholder='{ "exemple": "collez votre JSON ici" }'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button className="btnp" onClick={format}>
          Formater
        </button>
        <button className="btn" onClick={minify}>
          Minifier
        </button>
        <button
          className="btn"
          onClick={copy}
          disabled={!output}
        >
          {copied ? 'Copié ✓' : 'Copier'}
        </button>

        {sizeInfo && (
          <span className="pill ml-2">
            {formatBytes(sizeInfo.before)} → {formatBytes(sizeInfo.after)}
            {sizeInfo.before > 0 && (
              <span className="ml-1 text-emerald-400">−{gain}%</span>
            )}
          </span>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div className="card border-red-800 bg-red-950/30">
          <p className="text-sm text-red-400 font-mono">{error}</p>
        </div>
      )}

      {/* Sortie */}
      {output && !error && (
        <div>
          <label className="lbl">Résultat</label>
          <textarea
            className="fld min-h-[200px] resize-y"
            readOnly
            value={output}
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}
