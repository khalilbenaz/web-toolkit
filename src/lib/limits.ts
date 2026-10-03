/** Plafonds appliqués aux calculs lourds (exécutés dans un Web Worker avec délai maximal). */
export const LIMITS = {
  /** Délai maximal d'un calcul avant arrêt du worker. */
  timeoutMs: 3000,
  /** Regex : taille maximale du texte de test (caractères). */
  regexTextChars: 1_000_000,
  /** Regex : nombre maximal de correspondances collectées. */
  regexMatches: 1000,
  /** JSON : taille maximale de l'entrée (caractères). */
  jsonChars: 10_000_000,
  /** CSV : taille maximale de l'entrée (caractères). */
  csvChars: 5_000_000,
  /** Diff : nombre maximal de lignes par côté. */
  diffLines: 20_000,
  /** Diff : nombre maximal de cellules LCS (après retrait du préfixe/suffixe commun). */
  diffCells: 16_000_000,
} as const;

export function formatCount(n: number): string {
  return n.toLocaleString('fr-FR');
}
