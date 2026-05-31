import { useState } from 'react';

export default function UuidTool() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  function generate(count: number) {
    const newOnes = Array.from({ length: count }, () => crypto.randomUUID());
    setUuids((prev) => [...newOnes, ...prev]);
  }

  function copyAll() {
    if (!uuids.length) return;
    navigator.clipboard.writeText(uuids.join('\n')).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1800);
    });
  }

  function clear() {
    setUuids([]);
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 p-4">
      {/* Actions */}
      <div className="card flex flex-wrap items-center gap-3">
        <span className="lbl mb-0">Générer</span>
        {([1, 5, 10] as const).map((n) => (
          <button
            key={n}
            className="btnp"
            onClick={() => generate(n)}
          >
            {n === 1 ? '1 UUID' : `${n} UUID`}
          </button>
        ))}
        {uuids.length > 0 && (
          <>
            <button className="btn ml-auto" onClick={copyAll}>
              {copiedAll ? 'Copié ✓' : 'Copier tout'}
            </button>
            <button className="btn text-red-400 border-red-900/60 hover:bg-red-950/40" onClick={clear}>
              Effacer
            </button>
          </>
        )}
      </div>

      {/* Liste */}
      {uuids.length > 0 && (
        <div className="card flex flex-col gap-0 divide-y divide-zinc-800">
          {uuids.map((uuid, i) => (
            <div
              key={`${uuid}-${i}`}
              className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
            >
              <span className="font-mono text-sm text-zinc-200 select-all">
                {uuid}
              </span>
              <CopyButton value={uuid} />
            </div>
          ))}
        </div>
      )}

      {uuids.length === 0 && (
        <p className="text-zinc-600 text-sm text-center py-8">
          Aucun UUID généré pour l&apos;instant.
        </p>
      )}
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <button className="btn text-xs shrink-0" onClick={handleCopy}>
      {copied ? 'Copié ✓' : 'Copier'}
    </button>
  );
}
