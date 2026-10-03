export interface MatchInfo {
  fullMatch: string;
  index: number;
  groups: (string | undefined)[];
}

export interface RegexResult {
  error: string;
  matches: MatchInfo[];
}

export function runRegex(pattern: string, flags: string, text: string): RegexResult {
  try {
    const rx = new RegExp(pattern, flags);
    const matches: MatchInfo[] = [];
    if (flags.includes('g')) {
      let m: RegExpExecArray | null;
      rx.lastIndex = 0;
      while ((m = rx.exec(text)) !== null) {
        matches.push({ fullMatch: m[0], index: m.index, groups: m.slice(1) });
        // Évite la boucle infinie sur une correspondance de largeur nulle
        if (m[0].length === 0) rx.lastIndex++;
      }
    } else {
      const m = rx.exec(text);
      if (m) matches.push({ fullMatch: m[0], index: m.index, groups: m.slice(1) });
    }
    return { error: '', matches };
  } catch (e) {
    return { error: (e as Error).message, matches: [] };
  }
}
