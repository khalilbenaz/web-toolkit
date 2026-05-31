import { useState, useMemo } from 'react';

interface MatchInfo {
  fullMatch: string;
  index: number;
  groups: (string | undefined)[];
}

export default function RegexTool() {
  const [pattern, setPattern] = useState<string>('');
  const [flags, setFlags] = useState<string>('g');
  const [text, setText] = useState<string>('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const AVAILABLE_FLAGS = ['g', 'i', 'm', 's', 'u'];

  function toggleFlag(f: string) {
    setFlags((prev) =>
      prev.includes(f) ? prev.replace(f, '') : prev + f
    );
  }

  const result = useMemo<{ error: string; matches: MatchInfo[] } | null>(() => {
    if (!pattern) return null;
    try {
      const rx = new RegExp(pattern, flags);
      const matches: MatchInfo[] = [];
      if (flags.includes('g')) {
        let m: RegExpExecArray | null;
        rx.lastIndex = 0;
        while ((m = rx.exec(text)) !== null) {
          matches.push({
            fullMatch: m[0],
            index: m.index,
            groups: m.slice(1),
          });
          // Prevent infinite loop on zero-width match
          if (m[0].length === 0) rx.lastIndex++;
        }
      } else {
        const m = rx.exec(text);
        if (m) {
          matches.push({
            fullMatch: m[0],
            index: m.index,
            groups: m.slice(1),
          });
        }
      }
      return { error: '', matches };
    } catch (e) {
      return { error: (e as Error).message, matches: [] };
    }
  }, [pattern, flags, text]);

  // Build highlighted segments when flag g is active
  const highlighted = useMemo<(string | { match: string; key: number })[]>(() => {
    if (!result || result.error || !flags.includes('g') || result.matches.length === 0)
      return [];

    const segments: (string | { match: string; key: number })[] = [];
    let cursor = 0;
    result.matches.forEach((m, i) => {
      if (m.index > cursor) segments.push(text.slice(cursor, m.index));
      segments.push({ match: m.fullMatch, key: i });
      cursor = m.index + m.fullMatch.length;
    });
    if (cursor < text.length) segments.push(text.slice(cursor));
    return segments;
  }, [result, flags, text]);

  function copyText(val: string, idx: number) {
    navigator.clipboard.writeText(val).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    });
  }

  return (
    <div className="space-y-6">
      {/* Motif + flags */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <label className="lbl">Expression régulière</label>
          <input
            className="fld"
            placeholder="ex: (\w+)@([\w.]+)"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div>
          <label className="lbl">Flags</label>
          <div className="flex gap-2 flex-wrap">
            {AVAILABLE_FLAGS.map((f) => (
              <button
                key={f}
                onClick={() => toggleFlag(f)}
                className={
                  flags.includes(f)
                    ? 'btnp px-3 py-2 font-mono'
                    : 'btn px-3 py-2 font-mono'
                }
                title={
                  f === 'g'
                    ? 'Global'
                    : f === 'i'
                    ? 'Insensible à la casse'
                    : f === 'm'
                    ? 'Multiligne'
                    : f === 's'
                    ? 'Dot-all (. inclut \\n)'
                    : 'Unicode'
                }
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Texte de test */}
      <div>
        <label className="lbl">Texte de test</label>
        <textarea
          className="fld h-40 resize-y"
          placeholder="Saisissez le texte à analyser…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
        />
      </div>

      {/* Erreur */}
      {result?.error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-2">
          Regex invalide : {result.error}
        </p>
      )}

      {/* Résultats */}
      {result && !result.error && (
        <>
          {/* Compteur */}
          <div className="flex items-center gap-3">
            <span className="pill text-sky-300">
              {result.matches.length} correspondance{result.matches.length !== 1 ? 's' : ''}
            </span>
            {!text && (
              <span className="text-xs text-zinc-500">Saisissez un texte pour tester.</span>
            )}
          </div>

          {/* Aperçu surligné */}
          {flags.includes('g') && highlighted.length > 0 && (
            <div>
              <label className="lbl">Aperçu</label>
              <div className="fld min-h-[80px] whitespace-pre-wrap break-all leading-relaxed text-zinc-300">
                {highlighted.map((seg, i) =>
                  typeof seg === 'string' ? (
                    <span key={i}>{seg}</span>
                  ) : (
                    <mark
                      key={seg.key}
                      className="bg-sky-500/30 text-sky-200 rounded px-0.5"
                    >
                      {seg.match}
                    </mark>
                  )
                )}
              </div>
            </div>
          )}

          {/* Liste des matchs */}
          {result.matches.length > 0 && (
            <div>
              <label className="lbl">Correspondances</label>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {result.matches.map((m, i) => (
                  <div key={i} className="card flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-zinc-500 mr-2">#{i + 1}</span>
                        <span className="font-mono text-sm text-emerald-400 break-all">
                          {m.fullMatch || <em className="text-zinc-500">(vide)</em>}
                        </span>
                        <span className="text-xs text-zinc-500 ml-2">@ index {m.index}</span>
                      </div>
                      <button
                        className="btn shrink-0 text-xs"
                        onClick={() => copyText(m.fullMatch, i)}
                      >
                        {copiedIdx === i ? 'Copié ✓' : 'Copier'}
                      </button>
                    </div>
                    {m.groups.length > 0 && (
                      <div className="flex flex-wrap gap-2 pl-5">
                        {m.groups.map((g, gi) => (
                          <span key={gi} className="pill">
                            <span className="text-zinc-500 mr-1">G{gi + 1}</span>
                            <span className="font-mono text-sky-300">
                              {g === undefined ? <em className="text-zinc-600">non capturé</em> : g}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.matches.length === 0 && text && (
            <p className="text-sm text-zinc-500 italic">Aucune correspondance trouvée.</p>
          )}
        </>
      )}
    </div>
  );
}
