// ---- LCS (Longest Common Subsequence) ligne par ligne ----
// Retourne un tableau de paires [indexA | null, indexB | null]
// représentant le diff entre deux tableaux de lignes.

export type DiffLine =
  | { kind: 'equal';   text: string }
  | { kind: 'added';   text: string }
  | { kind: 'removed'; text: string };

export function computeDiff(linesA: string[], linesB: string[]): DiffLine[] {
  const m = linesA.length;
  const n = linesB.length;

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

  return result;
}
