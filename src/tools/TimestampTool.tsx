import { useState, useMemo } from 'react';

/* ── helpers ──────────────────────────────────────────────────── */

function detectUnit(raw: string): 's' | 'ms' | null {
  const n = Number(raw.trim());
  if (!raw.trim() || isNaN(n)) return null;
  // ≥ 13 chiffres → millisecondes, sinon secondes
  return raw.trim().replace('-', '').length >= 13 ? 'ms' : 's';
}

function parseEpoch(raw: string): Date | null {
  const unit = detectUnit(raw);
  if (!unit) return null;
  const n = Number(raw.trim());
  const ms = unit === 'ms' ? n : n * 1000;
  const d = new Date(ms);
  return isNaN(d.getTime()) ? null : d;
}

function relativeLabel(d: Date): string {
  const diffMs = d.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const past = diffMs < 0;

  const units: [number, string][] = [
    [60_000, 'seconde'],
    [3_600_000, 'minute'],
    [86_400_000, 'heure'],
    [2_592_000_000, 'jour'],
    [31_536_000_000, 'mois'],
    [Infinity, 'an'],
  ];

  for (let i = 0; i < units.length; i++) {
    if (abs < units[i][0]) {
      const divisor = i === 0 ? 1000 : units[i - 1][0];
      const count = Math.round(abs / divisor);
      const label = units[i][1];
      const plural = count > 1 && label !== 'mois' ? `${label}s` : label;
      return past ? `il y a ${count} ${plural}` : `dans ${count} ${plural}`;
    }
  }
  return '';
}

function padTwo(n: number): string {
  return String(n).padStart(2, '0');
}

function toDatetimeLocal(d: Date): string {
  // format attendu par input datetime-local : YYYY-MM-DDTHH:mm
  const Y = d.getFullYear();
  const M = padTwo(d.getMonth() + 1);
  const D = padTwo(d.getDate());
  const h = padTwo(d.getHours());
  const m = padTwo(d.getMinutes());
  return `${Y}-${M}-${D}T${h}:${m}`;
}

/* ── composant ────────────────────────────────────────────────── */

export default function TimestampTool() {
  const [epochInput, setEpochInput] = useState<string>('');
  const [dateInput, setDateInput] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string>('');

  /* résultats epoch -> date */
  const epochResult = useMemo<{
    local: string;
    utc: string;
    iso: string;
    relative: string;
    unit: 's' | 'ms' | null;
    error: string;
  }>(() => {
    if (!epochInput.trim()) {
      return { local: '', utc: '', iso: '', relative: '', unit: null, error: '' };
    }
    const d = parseEpoch(epochInput);
    if (!d) {
      return { local: '', utc: '', iso: '', relative: '', unit: null, error: 'Valeur invalide.' };
    }
    const unit = detectUnit(epochInput);
    return {
      local: d.toLocaleString('fr-FR', { timeZoneName: 'short' }),
      utc: d.toUTCString(),
      iso: d.toISOString(),
      relative: relativeLabel(d),
      unit,
      error: '',
    };
  }, [epochInput]);

  /* résultats date -> epoch */
  const dateResult = useMemo<{
    epochS: string;
    epochMs: string;
    error: string;
  }>(() => {
    if (!dateInput) return { epochS: '', epochMs: '', error: '' };
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      return { epochS: '', epochMs: '', error: 'Date invalide.' };
    }
    return {
      epochS: String(Math.floor(d.getTime() / 1000)),
      epochMs: String(d.getTime()),
      error: '',
    };
  }, [dateInput]);

  function handleNow() {
    const now = new Date();
    // Remplir les deux champs avec l'instant courant
    setEpochInput(String(Math.floor(now.getTime() / 1000)));
    setDateInput(toDatetimeLocal(now));
  }

  function copy(key: string, value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 1800);
    });
  }

  function CopyBtn({ k, val }: { k: string; val: string }) {
    return (
      <button
        className="btn text-xs shrink-0"
        onClick={() => copy(k, val)}
        disabled={!val}
      >
        {copiedKey === k ? 'Copié ✓' : 'Copier'}
      </button>
    );
  }

  function Row({ label, value, k }: { label: string; value: string; k: string }) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="w-32 shrink-0 text-xs text-zinc-400 font-semibold uppercase tracking-wide">
          {label}
        </span>
        <span className="flex-1 font-mono text-sm text-zinc-100 break-all">{value || '—'}</span>
        <CopyBtn k={k} val={value} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 p-4">

      {/* Bouton Maintenant */}
      <div className="flex justify-end">
        <button className="btnp" onClick={handleNow}>
          Maintenant
        </button>
      </div>

      {/* Section : Epoch → Date */}
      <div className="card flex flex-col gap-4">
        <label className="lbl mb-0">Epoch → Date lisible</label>
        <input
          className="fld"
          type="number"
          placeholder="Ex. 1717200000 (secondes) ou 1717200000000 (ms)"
          value={epochInput}
          onChange={(e) => setEpochInput(e.target.value)}
        />

        {epochResult.error && (
          <p className="text-red-400 text-sm">{epochResult.error}</p>
        )}

        {epochResult.unit && (
          <span className="pill self-start">
            Détecté : {epochResult.unit === 'ms' ? 'millisecondes' : 'secondes'}
          </span>
        )}

        {epochResult.local && (
          <div className="flex flex-col gap-3 pt-1">
            <Row label="Local" value={epochResult.local} k="local" />
            <Row label="UTC" value={epochResult.utc} k="utc" />
            <Row label="ISO 8601" value={epochResult.iso} k="iso" />
            <Row label="Relatif" value={epochResult.relative} k="rel" />
          </div>
        )}
      </div>

      {/* Section : Date → Epoch */}
      <div className="card flex flex-col gap-4">
        <label className="lbl mb-0">Date → Epoch</label>
        <input
          className="fld"
          type="datetime-local"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
        />

        {dateResult.error && (
          <p className="text-red-400 text-sm">{dateResult.error}</p>
        )}

        {dateResult.epochS && (
          <div className="flex flex-col gap-3 pt-1">
            <Row label="Secondes" value={dateResult.epochS} k="epS" />
            <Row label="Ms" value={dateResult.epochMs} k="epMs" />
          </div>
        )}
      </div>

    </div>
  );
}
