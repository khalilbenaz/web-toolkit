import { useState } from 'react';
import { decodeBase64, encodeBase64 } from '../lib/base64';

export default function Base64Tool() {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  function encode() {
    setError('');
    try {
      setOutput(encodeBase64(input));
    } catch {
      setError("Erreur lors de l'encodage.");
      setOutput('');
    }
  }

  function decode() {
    setError('');
    try {
      setOutput(decodeBase64(input));
    } catch {
      setError('Base64 invalide — vérifiez le contenu saisi.');
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
        <label className="lbl">Texte ou Base64</label>
        <textarea
          className="fld h-36 resize-y"
          placeholder="Saisir le texte à encoder, ou la chaîne Base64 à décoder…"
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
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {/* Résultat */}
      {output && !error && (
        <div>
          <label className="lbl">Résultat</label>
          <textarea
            readOnly
            className="fld h-36 resize-y text-emerald-400"
            value={output}
          />
        </div>
      )}
    </div>
  );
}
