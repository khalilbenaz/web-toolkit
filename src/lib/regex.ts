import { formatCount, LIMITS } from './limits';

export interface MatchInfo {
  fullMatch: string;
  index: number;
  groups: (string | undefined)[];
}

export interface RegexResult {
  error: string;
  matches: MatchInfo[];
  /** Vrai si la collecte s'est arrêtée au plafond LIMITS.regexMatches. */
  truncated: boolean;
}

export function runRegex(pattern: string, flags: string, text: string): RegexResult {
  if (text.length > LIMITS.regexTextChars) {
    return {
      error: `Texte trop long (${formatCount(text.length)} caractères, maximum ${formatCount(LIMITS.regexTextChars)}).`,
      matches: [],
      truncated: false,
    };
  }
  try {
    const rx = new RegExp(pattern, flags);
    const matches: MatchInfo[] = [];
    let truncated = false;
    if (flags.includes('g')) {
      let m: RegExpExecArray | null;
      rx.lastIndex = 0;
      while ((m = rx.exec(text)) !== null) {
        if (matches.length >= LIMITS.regexMatches) {
          truncated = true;
          break;
        }
        matches.push({ fullMatch: m[0], index: m.index, groups: m.slice(1) });
        // Évite la boucle infinie sur une correspondance de largeur nulle
        if (m[0].length === 0) rx.lastIndex++;
      }
    } else {
      const m = rx.exec(text);
      if (m) matches.push({ fullMatch: m[0], index: m.index, groups: m.slice(1) });
    }
    return { error: '', matches, truncated };
  } catch (e) {
    return { error: (e as Error).message, matches: [], truncated: false };
  }
}
