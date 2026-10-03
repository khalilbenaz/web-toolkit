import { useState } from 'react';

export default function UrlCodec() {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  function encode() {
    setError('');
    try {
      setOutput(encodeURIComponent(input));
    } catch {
      setError("Erreur lors de l'encodage URL.");
      setOutput('');
    }
  }

  function decode() {
    setError('');
    try {
      setOutput(decodeURIComponent(input));
    } catch {
      setError('Séquence URL invalide — impossible de décoder.');
      setOutput('');
    }
  }

  function copy() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="space-y-6">
      {/* Entrée */}
      <div>
        <label htmlFor="url-41" className="lbl">URL ou texte</label>
        <textarea
          id="url-41"
          className="fld h-36 resize-y"
          placeholder="Saisir l'URL à encoder, ou la chaîne encodée à décoder…"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError('');
            setOutput('');
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button className="btnp" onClick={encode}>
          Encoder →
        </button>
        <button className="btn" onClick={decode}>
          ← Décoder
        </button>
        {output && (
          <button className="btn ml-auto" onClick={copy}>
            {copied ? 'Copié ✓' : 'Copier le résultat'}
          </button>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <p role="alert" className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {/* Résultat */}
      {output && !error && (
        <div>
          <label htmlFor="url-79" className="lbl">Résultat</label>
          <textarea
            id="url-79"
            readOnly
            className="fld h-36 resize-y text-emerald-400"
            value={output}
          />
        </div>
      )}
    </div>
  );
}
