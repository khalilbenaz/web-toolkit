import { useState, useMemo } from 'react';

interface Stats {
  chars: number;
  charsNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  readingMin: number;
  readingSec: number;
}

function compute(text: string): Stats {
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;

  // Words: split on whitespace, filter empty tokens
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

  // Lines: number of newline-separated lines (always at least 1 if non-empty)
  const lines = text === '' ? 0 : text.split('\n').length;

  // Paragraphs: non-empty blocks separated by one or more blank lines
  const paragraphs =
    text.trim() === ''
      ? 0
      : text
          .split(/\n\s*\n/)
          .filter((p) => p.trim().length > 0).length;

  const totalSec = Math.round((words / 200) * 60);
  const readingMin = Math.floor(totalSec / 60);
  const readingSec = totalSec % 60;

  return { chars, charsNoSpaces, words, lines, paragraphs, readingMin, readingSec };
}

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: string;
}

function StatCard({ label, value, accent = 'text-sky-400' }: StatCardProps) {
  return (
    <div className="card flex flex-col gap-1 min-w-[110px]">
      <span className={`text-2xl font-bold font-mono ${accent}`}>{value}</span>
      <span className="text-xs text-zinc-400 uppercase tracking-wide font-semibold">{label}</span>
    </div>
  );
}

export default function CounterTool() {
  const [text, setText] = useState<string>('');

  const stats = useMemo<Stats>(() => compute(text), [text]);

  const readingLabel =
    stats.readingMin > 0
      ? `${stats.readingMin} min ${stats.readingSec} s`
      : `${stats.readingSec} s`;

  return (
    <div className="space-y-6">
      {/* Textarea */}
      <div>
        <label className="lbl">Texte à analyser</label>
        <textarea
          className="fld h-56 resize-y"
          placeholder="Collez ou saisissez votre texte ici…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
        />
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Caractères" value={stats.chars} accent="text-sky-400" />
        <StatCard
          label="Sans espaces"
          value={stats.charsNoSpaces}
          accent="text-violet-400"
        />
        <StatCard label="Mots" value={stats.words} accent="text-emerald-400" />
        <StatCard label="Lignes" value={stats.lines} accent="text-amber-400" />
        <StatCard label="Paragraphes" value={stats.paragraphs} accent="text-pink-400" />
        <StatCard
          label="Lecture ~"
          value={text.trim() === '' ? '0 s' : readingLabel}
          accent="text-zinc-300"
        />
      </div>

      {/* Note lecture */}
      {stats.words > 0 && (
        <p className="text-xs text-zinc-500">
          Temps de lecture estimé à 200 mots / minute.
        </p>
      )}
    </div>
  );
}
