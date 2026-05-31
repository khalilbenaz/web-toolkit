import { useState, useEffect } from 'react';

interface IpData {
  ip: string;
  country: string | null;
  city: string | null;
  region: string | null;
  timezone: string | null;
  asOrganization: string | null;
  userAgent: string | null;
}

interface BrowserInfo {
  userAgent: string;
  language: string;
  platform: string;
  screen: string;
  cores: number | null;
}

function getBrowserInfo(): BrowserInfo {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screen: `${screen.width} × ${screen.height}`,
    cores: navigator.hardwareConcurrency ?? null,
  };
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="card flex flex-col gap-1">
      <span className="lbl text-xs uppercase tracking-wider">{label}</span>
      <span className="font-mono text-sm text-zinc-100 break-all">
        {value ?? <span className="text-zinc-500 italic">—</span>}
      </span>
    </div>
  );
}

export default function IpTool() {
  const [ipData, setIpData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cfUnavailable, setCfUnavailable] = useState(false);
  const [browserInfo] = useState<BrowserInfo>(getBrowserInfo);

  const fetchIp = async () => {
    setLoading(true);
    setError(null);
    setCfUnavailable(false);
    try {
      const res = await fetch('/api/ip');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: IpData = await res.json();
      setIpData(data);
    } catch {
      setCfUnavailable(true);
      setError(null);
      setIpData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIp();
  }, []);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-zinc-200 font-semibold text-lg">
          Informations réseau &amp; navigateur
        </h2>
        <button
          className="btn"
          onClick={fetchIp}
          disabled={loading}
        >
          {loading ? 'Chargement…' : 'Rafraîchir'}
        </button>
      </div>

      {/* Cloudflare unavailable notice */}
      {cfUnavailable && (
        <div className="card border border-amber-500/40 bg-amber-500/10 text-amber-300 text-sm">
          <span className="font-semibold">API réseau indisponible.</span>{' '}
          Les données IP (pays, ville, organisation…) sont disponibles uniquement
          une fois déployé sur Cloudflare Pages.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card border border-red-500/40 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* IP / Network section */}
      {ipData && (
        <section className="flex flex-col gap-3">
          <h3 className="text-sky-400 font-medium text-sm uppercase tracking-widest">
            Réseau (Cloudflare)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoCard label="Adresse IP publique" value={ipData.ip || '—'} />
            <InfoCard label="Organisation / ASN" value={ipData.asOrganization} />
            <InfoCard label="Pays" value={ipData.country} />
            <InfoCard label="Région" value={ipData.region} />
            <InfoCard label="Ville" value={ipData.city} />
            <InfoCard label="Fuseau horaire" value={ipData.timezone} />
          </div>
          {ipData.userAgent && (
            <div className="card flex flex-col gap-1">
              <span className="lbl text-xs uppercase tracking-wider">
                User-Agent (serveur)
              </span>
              <span className="font-mono text-xs text-zinc-400 break-all">
                {ipData.userAgent}
              </span>
            </div>
          )}
        </section>
      )}

      {/* Browser section */}
      <section className="flex flex-col gap-3">
        <h3 className="text-emerald-400 font-medium text-sm uppercase tracking-widest">
          Navigateur (client)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard label="Langue" value={browserInfo.language} />
          <InfoCard label="Plateforme" value={browserInfo.platform} />
          <InfoCard
            label="Résolution écran"
            value={browserInfo.screen}
          />
          <InfoCard
            label="Cœurs logiques (CPU)"
            value={
              browserInfo.cores !== null ? String(browserInfo.cores) : null
            }
          />
        </div>
        <div className="card flex flex-col gap-1">
          <span className="lbl text-xs uppercase tracking-wider">
            User-Agent (navigateur)
          </span>
          <span className="font-mono text-xs text-zinc-400 break-all">
            {browserInfo.userAgent}
          </span>
        </div>
      </section>
    </div>
  );
}
