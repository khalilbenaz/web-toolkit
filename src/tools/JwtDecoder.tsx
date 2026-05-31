import { useState, useCallback } from 'react';

interface JwtSection {
  raw: string;
  decoded: Record<string, unknown>;
}

interface DecodedJwt {
  header: JwtSection;
  payload: JwtSection;
}

function decodeBase64Url(segment: string): string {
  // Rétablir le padding base64 standard
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4;
  const withPad = pad === 0 ? padded : padded + '='.repeat(4 - pad);

  // Décoder en bytes puis UTF-8
  const binary = atob(withPad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder('utf-8').decode(bytes);
}

function formatTimestamp(ts: unknown): string | null {
  if (typeof ts !== 'number') return null;
  try {
    return new Date(ts * 1000).toLocaleString('fr-FR', {
      dateStyle: 'full',
      timeStyle: 'medium',
    });
  } catch {
    return null;
  }
}

function isExpired(exp: unknown): boolean {
  if (typeof exp !== 'number') return false;
  return Date.now() / 1000 > exp;
}

const DATE_CLAIMS: Record<string, string> = {
  exp: 'Expiration (exp)',
  iat: 'Émis le (iat)',
  nbf: 'Pas avant (nbf)',
};

export default function JwtDecoder() {
  const [token, setToken] = useState<string>('');
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<'header' | 'payload' | null>(null);

  const decode = useCallback(() => {
    setError('');
    setDecoded(null);

    const trimmed = token.trim();
    if (!trimmed) return;

    const parts = trimmed.split('.');
    if (parts.length < 2) {
      setError('JWT invalide : au moins 2 segments séparés par « . » sont requis.');
      return;
    }

    try {
      const headerStr = decodeBase64Url(parts[0]);
      const payloadStr = decodeBase64Url(parts[1]);

      const header = JSON.parse(headerStr) as Record<string, unknown>;
      const payload = JSON.parse(payloadStr) as Record<string, unknown>;

      setDecoded({
        header: { raw: headerStr, decoded: header },
        payload: { raw: payloadStr, decoded: payload },
      });
    } catch (e) {
      setError(`Erreur de décodage : ${(e as Error).message}`);
    }
  }, [token]);

  const copySection = (section: 'header' | 'payload') => {
    if (!decoded) return;
    const text = JSON.stringify(decoded[section].decoded, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(section);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') decode();
  };

  const expiredFlag =
    decoded && typeof decoded.payload.decoded['exp'] === 'number'
      ? isExpired(decoded.payload.decoded['exp'])
      : null;

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto">
      {/* Entrée */}
      <div>
        <label className="lbl">Token JWT</label>
        <input
          className="fld"
          type="text"
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
      </div>

      <div className="flex gap-2">
        <button className="btnp" onClick={decode}>
          Décoder
        </button>
        <button
          className="btn"
          onClick={() => {
            setToken('');
            setDecoded(null);
            setError('');
          }}
        >
          Effacer
        </button>
      </div>

      {/* Avertissement signature */}
      <div className="pill w-fit text-amber-400 border-amber-800">
        ⚠ Signature NON vérifiée — décodage uniquement
      </div>

      {/* Erreur */}
      {error && (
        <div className="card border-red-800 bg-red-950/30">
          <p className="text-sm text-red-400 font-mono">{error}</p>
        </div>
      )}

      {decoded && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Header */}
          <div className="card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="lbl mb-0">Header</span>
              <button className="btn text-xs px-2 py-1" onClick={() => copySection('header')}>
                {copied === 'header' ? 'Copié ✓' : 'Copier'}
              </button>
            </div>
            <pre className="text-sm text-zinc-100 font-mono bg-zinc-950 rounded-lg p-3 overflow-auto whitespace-pre-wrap break-all">
              {JSON.stringify(decoded.header.decoded, null, 2)}
            </pre>
          </div>

          {/* Payload */}
          <div className="card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="lbl mb-0">Payload</span>
              <button className="btn text-xs px-2 py-1" onClick={() => copySection('payload')}>
                {copied === 'payload' ? 'Copié ✓' : 'Copier'}
              </button>
            </div>
            <pre className="text-sm text-zinc-100 font-mono bg-zinc-950 rounded-lg p-3 overflow-auto whitespace-pre-wrap break-all">
              {JSON.stringify(decoded.payload.decoded, null, 2)}
            </pre>

            {/* Claims temporels */}
            {Object.keys(DATE_CLAIMS).some(
              (k) => k in decoded.payload.decoded,
            ) && (
              <div className="flex flex-col gap-1.5 border-t border-zinc-800 pt-3">
                <span className="lbl mb-0">Dates décodées</span>
                {Object.entries(DATE_CLAIMS).map(([key, label]) => {
                  const val = decoded.payload.decoded[key];
                  const dateStr = formatTimestamp(val);
                  if (!dateStr) return null;
                  const isExp = key === 'exp';
                  const expired = isExp && isExpired(val);
                  return (
                    <div key={key} className="flex items-baseline gap-2 text-sm">
                      <span className="text-zinc-500 w-44 shrink-0">{label}</span>
                      <span
                        className={
                          isExp
                            ? expired
                              ? 'text-red-400 font-medium'
                              : 'text-emerald-400'
                            : 'text-zinc-300'
                        }
                      >
                        {dateStr}
                        {isExp && (
                          <span className="ml-2 pill text-xs">
                            {expired ? 'Expiré' : 'Valide'}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Segments bruts */}
      {decoded && (
        <details className="card cursor-pointer select-none">
          <summary className="text-sm text-zinc-400 font-medium">Segments bruts</summary>
          <div className="flex flex-col gap-2 mt-3">
            {token
              .trim()
              .split('.')
              .map((seg, i) => {
                const labels = ['Header', 'Payload', 'Signature'];
                return (
                  <div key={i}>
                    <span className="lbl">{labels[i] ?? `Segment ${i + 1}`}</span>
                    <p className="text-xs font-mono text-zinc-400 break-all">{seg}</p>
                  </div>
                );
              })}
          </div>
        </details>
      )}
    </div>
  );
}
