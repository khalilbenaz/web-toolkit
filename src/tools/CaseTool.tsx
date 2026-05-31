import { useState, useMemo } from 'react';

// Découpe intelligente : espaces, tirets, underscores, transitions de casse
function tokenize(input: string): string[] {
  // Insérer un séparateur avant chaque majuscule précédée d'une minuscule ou d'un chiffre (camelCase / PascalCase)
  const spaced = input
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

  return spaced
    .split(/[\s\-_]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

function toCamel(tokens: string[]): string {
  return tokens
    .map((t, i) =>
      i === 0
        ? t.toLowerCase()
        : t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
    )
    .join('');
}

function toPascal(tokens: string[]): string {
  return tokens
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join('');
}

function toSnake(tokens: string[]): string {
  return tokens.map((t) => t.toLowerCase()).join('_');
}

function toKebab(tokens: string[]): string {
  return tokens.map((t) => t.toLowerCase()).join('-');
}

function toConstant(tokens: string[]): string {
  return tokens.map((t) => t.toUpperCase()).join('_');
}

function toTitleCase(tokens: string[]): string {
  return tokens
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join(' ');
}

function toLower(tokens: string[]): string {
  return tokens.map((t) => t.toLowerCase()).join(' ');
}

function toUpper(tokens: string[]): string {
  return tokens.map((t) => t.toUpperCase()).join(' ');
}

function toSentence(tokens: string[]): string {
  if (tokens.length === 0) return '';
  const sentence = tokens.map((t) => t.toLowerCase()).join(' ');
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

interface Conversion {
  label: string;
  key: string;
  value: string;
}

export default function CaseTool() {
  const [input, setInput] = useState<string>('');
  const [copied, setCopied] = useState<string>('');

  const conversions: Conversion[] = useMemo(() => {
    const tokens = tokenize(input);
    if (tokens.length === 0) return [];
    return [
      { label: 'camelCase',       key: 'camel',    value: toCamel(tokens) },
      { label: 'PascalCase',      key: 'pascal',   value: toPascal(tokens) },
      { label: 'snake_case',      key: 'snake',    value: toSnake(tokens) },
      { label: 'kebab-case',      key: 'kebab',    value: toKebab(tokens) },
      { label: 'CONSTANT_CASE',   key: 'constant', value: toConstant(tokens) },
      { label: 'Title Case',      key: 'title',    value: toTitleCase(tokens) },
      { label: 'lowercase',       key: 'lower',    value: toLower(tokens) },
      { label: 'UPPERCASE',       key: 'upper',    value: toUpper(tokens) },
      { label: 'Sentence case',   key: 'sentence', value: toSentence(tokens) },
    ];
  }, [input]);

  function copy(key: string, value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 1500);
    });
  }

  return (
    <div className="space-y-6">
      {/* Entrée */}
      <div>
        <label className="lbl">Texte source</label>
        <input
          className="fld"
          type="text"
          placeholder="ex : monNomDeVariable, my-css-class, SOME_CONSTANT…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <p className="mt-1 text-xs text-zinc-500">
          Découpe automatique : espaces, tirets, underscores, transitions de casse (camelCase / PascalCase).
        </p>
      </div>

      {/* Résultats */}
      {conversions.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {conversions.map(({ label, key, value }) => (
            <div key={key} className="card flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="pill text-xs">{label}</span>
                <button
                  className="btn text-xs px-2 py-1"
                  onClick={() => copy(key, value)}
                >
                  {copied === key ? 'Copié ✓' : 'Copier'}
                </button>
              </div>
              <code className="block text-sm font-mono text-sky-300 break-all leading-relaxed">
                {value}
              </code>
            </div>
          ))}
        </div>
      )}

      {input.length > 0 && conversions.length === 0 && (
        <p className="text-sm text-zinc-500 italic">
          Aucun token détecté — saisissez du texte avec des lettres.
        </p>
      )}
    </div>
  );
}
