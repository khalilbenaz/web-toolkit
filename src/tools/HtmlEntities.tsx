import { useState } from 'react';

import { encodeHtml, decodeHtml } from '../lib/htmlEntities';

export default function HtmlEntities() {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  function runEncode() {
    setError('');
    setCopied(false);
    try {
      setOutput(encodeHtml(input));
    } catch {
      setError("Erreur lors de l'encodage.");
      setOutput('');
    }
  }

  function runDecode() {
    setError('');
    setCopied(false);
    try {
      setOutput(decodeHtml(input));
    } catch {
      setError('Erreur lors du décodage.');
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
      <div>
        <label htmlFor="htmlentities-44" className="lbl">Texte source</label>
        <textarea
          id="htmlentities-44"
          className="fld h-36 resize-y"
          placeholder={"Saisissez du texte brut ou du HTML avec entités (&amp;, &lt;, &#233;…)"}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError('');
            setOutput('');
            setCopied(false);
          }}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="btnp" onClick={runEncode}>
          Encoder &rarr; entités
        </button>
        <button className="btn" onClick={runDecode}>
          &larr; Décoder entités
        </button>
        {output && (
          <button className="btn ml-auto" onClick={copy}>
            {copied ? 'Copié ✓' : 'Copier le résultat'}
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {output && !error && (
        <div>
          <label htmlFor="htmlentities-80" className="lbl">Résultat</label>
          <textarea
            id="htmlentities-80"
            readOnly
            className="fld h-36 resize-y text-emerald-400 font-mono text-sm"
            value={output}
          />
        </div>
      )}
    </div>
  );
}
