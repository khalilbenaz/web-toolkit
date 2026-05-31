import { useState } from 'react';

// Table des entités HTML nommées courantes (décodage)
const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  copy: '©',
  reg: '®',
  trade: '™',
  euro: '€',
  pound: '£',
  yen: '¥',
  cent: '¢',
  mdash: '—',
  ndash: '–',
  laquo: '«',
  raquo: '»',
  hellip: '…',
  prime: '′',
  Prime: '″',
  larr: '←',
  rarr: '→',
  uarr: '↑',
  darr: '↓',
  bull: '•',
  middot: '·',
  acute: '´',
  cedil: '¸',
  uml: '¨',
  macr: '¯',
  deg: '°',
  plusmn: '±',
  frac14: '¼',
  frac12: '½',
  frac34: '¾',
  times: '×',
  divide: '÷',
  iexcl: '¡',
  iquest: '¿',
  szlig: 'ß',
  agrave: 'à',
  aacute: 'á',
  acirc: 'â',
  atilde: 'ã',
  auml: 'ä',
  aring: 'å',
  aelig: 'æ',
  ccedil: 'ç',
  egrave: 'è',
  eacute: 'é',
  ecirc: 'ê',
  euml: 'ë',
  igrave: 'ì',
  iacute: 'í',
  icirc: 'î',
  iuml: 'ï',
  eth: 'ð',
  ntilde: 'ñ',
  ograve: 'ò',
  oacute: 'ó',
  ocirc: 'ô',
  otilde: 'õ',
  ouml: 'ö',
  oslash: 'ø',
  ugrave: 'ù',
  uacute: 'ú',
  ucirc: 'û',
  uuml: 'ü',
  yacute: 'ý',
  thorn: 'þ',
  yuml: 'ÿ',
  Agrave: 'À',
  Aacute: 'Á',
  Acirc: 'Â',
  Atilde: 'Ã',
  Auml: 'Ä',
  Aring: 'Å',
  AElig: 'Æ',
  Ccedil: 'Ç',
  Egrave: 'È',
  Eacute: 'É',
  Ecirc: 'Ê',
  Euml: 'Ë',
  Igrave: 'Ì',
  Iacute: 'Í',
  Icirc: 'Î',
  Iuml: 'Ï',
  ETH: 'Ð',
  Ntilde: 'Ñ',
  Ograve: 'Ò',
  Oacute: 'Ó',
  Ocirc: 'Ô',
  Otilde: 'Õ',
  Ouml: 'Ö',
  Oslash: 'Ø',
  Ugrave: 'Ù',
  Uacute: 'Ú',
  Ucirc: 'Û',
  Uuml: 'Ü',
  Yacute: 'Ý',
  THORN: 'Þ',
  Szlig: 'ß',
};

function encodeHtml(text: string): string {
  return text
    .split('')
    .map((ch) => {
      if (ch === '&') return '&amp;';
      if (ch === '<') return '&lt;';
      if (ch === '>') return '&gt;';
      if (ch === '"') return '&quot;';
      if (ch === "'") return '&#39;';
      const code = ch.codePointAt(0)!;
      if (code > 127) return `&#${code};`;
      return ch;
    })
    .join('');
}

function decodeHtml(text: string): string {
  return text.replace(/&([^;]+);/g, (_match, entity: string) => {
    // Entité numérique hexadécimale &#xHH;
    if (/^#x[0-9a-fA-F]+$/.test(entity)) {
      return String.fromCodePoint(parseInt(entity.slice(2), 16));
    }
    // Entité numérique décimale &#nn;
    if (/^#\d+$/.test(entity)) {
      return String.fromCodePoint(parseInt(entity.slice(1), 10));
    }
    // Entité nommée
    if (Object.prototype.hasOwnProperty.call(NAMED, entity)) {
      return NAMED[entity];
    }
    return `&${entity};`;
  });
}

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
        <label className="lbl">Texte source</label>
        <textarea
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
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {output && !error && (
        <div>
          <label className="lbl">Résultat</label>
          <textarea
            readOnly
            className="fld h-36 resize-y text-emerald-400 font-mono text-sm"
            value={output}
          />
        </div>
      )}
    </div>
  );
}
