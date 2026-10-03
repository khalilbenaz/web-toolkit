import React, { useEffect, useMemo, useState } from 'react';

// ── Outils (chaque fichier exporte un composant autonome) ──────────────────
import JsonFormatter from './tools/JsonFormatter';
import Base64Tool from './tools/Base64Tool';
import UrlCodec from './tools/UrlCodec';
import JwtDecoder from './tools/JwtDecoder';
import HashTool from './tools/HashTool';
import UuidTool from './tools/UuidTool';
import PasswordTool from './tools/PasswordTool';
import QrTool from './tools/QrTool';
import ColorTool from './tools/ColorTool';
import LoremTool from './tools/LoremTool';
import MarkdownTool from './tools/MarkdownTool';
import RegexTool from './tools/RegexTool';
import CounterTool from './tools/CounterTool';
import TimestampTool from './tools/TimestampTool';
import CaseTool from './tools/CaseTool';
import NumBaseTool from './tools/NumBaseTool';
import DiffTool from './tools/DiffTool';
import CronTool from './tools/CronTool';
import IpTool from './tools/IpTool';
import UnitConverter from './tools/UnitConverter';
import CsvJson from './tools/CsvJson';
import PaletteTool from './tools/PaletteTool';
import GradientTool from './tools/GradientTool';
import ShadowTool from './tools/ShadowTool';
import SlugTool from './tools/SlugTool';
import HtmlEntities from './tools/HtmlEntities';
import LineTools from './tools/LineTools';
import ImageBase64 from './tools/ImageBase64';
import RandomTool from './tools/RandomTool';

interface Tool {
  id: string;
  name: string;
  category: string;
  blurb: string;
  Component: React.ComponentType;
}

const TOOLS: Tool[] = [
  { id: 'json', name: 'JSON Formatter', category: 'Données', blurb: 'Formater, valider et minifier du JSON', Component: JsonFormatter },
  { id: 'jwt', name: 'JWT Decoder', category: 'Données', blurb: 'Décoder header/payload d’un JWT', Component: JwtDecoder },
  { id: 'timestamp', name: 'Timestamp', category: 'Données', blurb: 'Epoch ⇄ date lisible', Component: TimestampTool },
  { id: 'cron', name: 'Cron Explainer', category: 'Données', blurb: 'Expliquer une expression cron', Component: CronTool },
  { id: 'base64', name: 'Base64', category: 'Encodage', blurb: 'Encoder / décoder en Base64', Component: Base64Tool },
  { id: 'url', name: 'URL Encoder', category: 'Encodage', blurb: 'Encoder / décoder des URL', Component: UrlCodec },
  { id: 'numbase', name: 'Bases numériques', category: 'Encodage', blurb: 'Bin / Oct / Déc / Hex', Component: NumBaseTool },
  { id: 'hash', name: 'Hash (SHA)', category: 'Crypto', blurb: 'SHA-1 / 256 / 384 / 512', Component: HashTool },
  { id: 'uuid', name: 'UUID', category: 'Génération', blurb: 'Générer des UUID v4', Component: UuidTool },
  { id: 'password', name: 'Mot de passe', category: 'Génération', blurb: 'Mots de passe forts configurables', Component: PasswordTool },
  { id: 'qr', name: 'QR Code', category: 'Génération', blurb: 'Générer un QR code (PNG)', Component: QrTool },
  { id: 'lorem', name: 'Lorem Ipsum', category: 'Génération', blurb: 'Texte de remplissage', Component: LoremTool },
  { id: 'markdown', name: 'Markdown', category: 'Texte', blurb: 'Aperçu Markdown en direct', Component: MarkdownTool },
  { id: 'regex', name: 'Regex Tester', category: 'Texte', blurb: 'Tester des expressions régulières', Component: RegexTool },
  { id: 'counter', name: 'Compteur de texte', category: 'Texte', blurb: 'Mots, caractères, lignes', Component: CounterTool },
  { id: 'case', name: 'Casse', category: 'Texte', blurb: 'camelCase, snake_case, kebab…', Component: CaseTool },
  { id: 'diff', name: 'Diff de texte', category: 'Texte', blurb: 'Comparer deux textes', Component: DiffTool },
  { id: 'color', name: 'Couleurs & contraste', category: 'Design', blurb: 'HEX/RGB/HSL + ratio WCAG', Component: ColorTool },
  { id: 'ip', name: 'Mon IP', category: 'Réseau', blurb: 'IP publique + infos requête', Component: IpTool },
  { id: 'unit', name: 'Convertisseur d’unités', category: 'Convertir', blurb: 'Longueur, masse, température, données…', Component: UnitConverter },
  { id: 'csvjson', name: 'CSV ⇄ JSON', category: 'Données', blurb: 'Convertir CSV en JSON et inversement', Component: CsvJson },
  { id: 'palette', name: 'Palette de couleurs', category: 'Design', blurb: 'Nuances et harmonies depuis une couleur', Component: PaletteTool },
  { id: 'gradient', name: 'Dégradé CSS', category: 'Design', blurb: 'Générateur de gradient + code CSS', Component: GradientTool },
  { id: 'shadow', name: 'Box-shadow', category: 'Design', blurb: 'Générateur d’ombre CSS', Component: ShadowTool },
  { id: 'slug', name: 'Slugify', category: 'Texte', blurb: 'Texte → slug d’URL', Component: SlugTool },
  { id: 'entities', name: 'Entités HTML', category: 'Texte', blurb: 'Encoder / décoder les entités HTML', Component: HtmlEntities },
  { id: 'lines', name: 'Outils de lignes', category: 'Texte', blurb: 'Trier, dédupliquer, inverser…', Component: LineTools },
  { id: 'imgb64', name: 'Image → Base64', category: 'Encodage', blurb: 'Convertir une image en data URI', Component: ImageBase64 },
  { id: 'random', name: 'Aléatoire', category: 'Génération', blurb: 'Nombres, chaînes, dés (crypto)', Component: RandomTool },
];

const CATEGORIES = ['Données', 'Encodage', 'Convertir', 'Crypto', 'Génération', 'Texte', 'Design', 'Réseau'];

export default function App() {
  const [activeId, setActiveId] = useState<string>(TOOLS[0].id);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOOLS;
    return TOOLS.filter((t) => (t.name + ' ' + t.blurb).toLowerCase().includes(q));
  }, [query]);

  const active = TOOLS.find((t) => t.id === activeId) ?? TOOLS[0];
  const Active = active.Component;

  // Échap referme le menu sur mobile
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  function selectTool(id: string) {
    setActiveId(id);
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen md:flex">
      {/* Barre supérieure (mobile uniquement) */}
      <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <button
          type="button"
          className="btn !px-2.5"
          aria-label="Ouvrir le menu des outils"
          aria-expanded={menuOpen}
          aria-controls="sidebar"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
        <span className="font-bold text-white truncate">
          <span className="text-sky-400">🧰</span> {active.name}
        </span>
      </div>

      {/* Fond assombri derrière le menu (mobile) */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          tabIndex={-1}
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Barre latérale : tiroir sur mobile, colonne fixe dès md */}
      <aside
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-zinc-800 bg-zinc-950 flex flex-col transition-transform duration-200
          md:sticky md:top-0 md:h-screen md:shrink-0 md:translate-x-0 md:visible md:bg-zinc-950/60
          ${menuOpen ? 'translate-x-0' : 'max-md:-translate-x-full max-md:invisible'}`}
      >
        <div className="px-5 py-4 border-b border-zinc-800 flex items-start justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-sky-400">🧰</span> Web Toolkit
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">{TOOLS.length} outils · 100% navigateur</p>
          </div>
          <button
            type="button"
            className="md:hidden btn !px-2.5"
            aria-label="Fermer le menu"
            onClick={() => setMenuOpen(false)}
          >
            ✕
          </button>
        </div>
        <div className="px-4 py-3">
          <input
            className="fld"
            placeholder="Rechercher un outil…"
            aria-label="Rechercher un outil"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <nav aria-label="Outils" className="flex-1 overflow-y-auto px-3 pb-4 space-y-4">
          {CATEGORIES.map((cat) => {
            const items = filtered.filter((t) => t.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{cat}</div>
                {items.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => selectTool(t.id)}
                    aria-current={t.id === activeId ? 'page' : undefined}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      t.id === activeId
                        ? 'bg-sky-600/20 text-sky-300 border border-sky-700/50'
                        : 'text-zinc-300 hover:bg-zinc-800/60 border border-transparent'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>
        <a
          href="https://github.com/khalilbenaz/web-toolkit"
          className="px-5 py-3 text-xs text-zinc-600 border-t border-zinc-800 hover:text-zinc-400"
        >
          Open-source · déployé sur Cloudflare
        </a>
      </aside>

      {/* Contenu */}
      <main id="main" className="flex-1 min-w-0">
        <header className="px-4 py-4 sm:px-8 sm:py-6 border-b border-zinc-800">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{active.name}</h2>
          <p className="text-sm text-zinc-400 mt-1">{active.blurb}</p>
        </header>
        <div className="p-4 sm:p-8 max-w-5xl">
          <Active />
        </div>
      </main>
    </div>
  );
}
