import { useState } from 'react';
import { decodeBase64, encodeBase64 } from '../lib/base64';

export default function Base64Tool() {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [urlSafe, setUrlSafe] = useState<boolean>(false);

  function encode() {
    setError('');
    try {
      setOutput(encodeBase64(input, { urlSafe }));
    } catch {
      setError("Erreur lors de l'encodage.");
      setOutput('');
    }
  }

  function decode() {
    setError('');
    try {
      setOutput(decodeBase64(input));
    } catch (e) {
      const msg = (e as Error).message;
      setError(
        msg.includes('UTF-8')
          ? `${msg}.`
          : 'Base64 invalide — vérifiez le contenu saisi.',
      );
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
        <label htmlFor="base64-48" className="lbl">Texte ou Base64</label>
        <textarea
          id="base64-48"
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
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
          <input
            type="checkbox"
            checked={urlSafe}
            onChange={(e) => {
              setUrlSafe(e.target.checked);
              setOutput('');
            }}
          />
          URL-safe (-, _ sans padding)
        </label>
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
          <label htmlFor="base64-97" className="lbl">Résultat</label>
          <textarea
            id="base64-97"
            readOnly
            className="fld h-36 resize-y text-emerald-400"
            value={output}
          />
        </div>
      )}
    </div>
  );
}
