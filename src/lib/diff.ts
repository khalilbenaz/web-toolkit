import { formatCount, LIMITS } from './limits';

// ---- LCS (Longest Common Subsequence) ligne par ligne ----
// Retourne un tableau de paires [indexA | null, indexB | null]
// représentant le diff entre deux tableaux de lignes.

export type DiffLine =
  | { kind: 'equal';   text: string }
  | { kind: 'added';   text: string }
  | { kind: 'removed'; text: string };

export class DiffTooLargeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DiffTooLargeError';
  }
}

export function computeDiff(allA: string[], allB: string[]): DiffLine[] {
  if (allA.length > LIMITS.diffLines || allB.length > LIMITS.diffLines) {
    throw new DiffTooLargeError(
      `Textes trop longs : ${formatCount(LIMITS.diffLines)} lignes maximum par côté.`,
    );
  }

  // Préfixe et suffixe communs : inutile de les passer au LCP (cas courant d'une petite modification)
  let start = 0;
  while (start < allA.length && start < allB.length && allA[start] === allB[start]) start++;
  let endA = allA.length;
  let endB = allB.length;
  while (endA > start && endB > start && allA[endA - 1] === allB[endB - 1]) {
    endA--;
    endB--;
  }
  const prefix: DiffLine[] = allA.slice(0, start).map((text) => ({ kind: 'equal', text }));
  const suffix: DiffLine[] = allA.slice(endA).map((text) => ({ kind: 'equal', text }));
  const linesA = allA.slice(start, endA);
  const linesB = allB.slice(start, endB);

  const m = linesA.length;
  const n = linesB.length;
  if ((m + 1) * (n + 1) > LIMITS.diffCells) {
    throw new DiffTooLargeError(
      'Les différences sont trop nombreuses pour être comparées dans le navigateur (textes trop longs et trop différents).',
    );
  }

  // Tableau LCS (longueur uniquement, pas les séquences entières)
  // On alloue un tableau 1D (m+1)*(n+1)
  const dp = new Uint32Array((m + 1) * (n + 1));

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      const idx = i * (n + 1) + j;
      if (linesA[i] === linesB[j]) {
        dp[idx] = 1 + dp[(i + 1) * (n + 1) + (j + 1)];
      } else {
        const down  = dp[(i + 1) * (n + 1) + j];
        const right = dp[i * (n + 1) + (j + 1)];
        dp[idx] = down > right ? down : right;
      }
    }
  }

  // Reconstruction du diff
  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < m || j < n) {
    if (i < m && j < n && linesA[i] === linesB[j]) {
      result.push({ kind: 'equal', text: linesA[i] });
      i++;
      j++;
    } else if (
      j < n &&
      (i >= m || dp[i * (n + 1) + (j + 1)] >= dp[(i + 1) * (n + 1) + j])
    ) {
      result.push({ kind: 'added', text: linesB[j] });
      j++;
    } else {
      result.push({ kind: 'removed', text: linesA[i] });
      i++;
    }
  }

  return [...prefix, ...result, ...suffix];
}
