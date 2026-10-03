import { describe, expect, it } from 'vitest';
import { LIMITS } from './limits';
import { runRegex } from './regex';
import { computeDiff, DiffTooLargeError } from './diff';
import { formatJson, minifyJson } from './json';
import { csvToJson, jsonToCsv } from './csv';

describe('plafonds de taille', () => {
  it('runRegex_tropDeCorrespondances_tronqueEtLeSignale', () => {
    const r = runRegex('a', 'g', 'a'.repeat(LIMITS.regexMatches + 500));
    expect(r.matches).toHaveLength(LIMITS.regexMatches);
    expect(r.truncated).toBe(true);
  });
  it('runRegex_peuDeCorrespondances_nEstPasTronque', () => {
    expect(runRegex('a', 'g', 'aaa').truncated).toBe(false);
  });
  it('runRegex_texteTropLong_renvoieUneErreurSansExecuter', () => {
    const r = runRegex('a', 'g', 'a'.repeat(LIMITS.regexTextChars + 1));
    expect(r.error).toMatch(/trop long/i);
    expect(r.matches).toEqual([]);
  });

  it('computeDiff_tropDeLignes_leveDiffTooLargeError', () => {
    const a = Array.from({ length: LIMITS.diffLines + 1 }, (_, i) => `a${i}`);
    expect(() => computeDiff(a, ['x'])).toThrow(DiffTooLargeError);
  });
  it('computeDiff_grandesEntreesTresDifferentes_leveDiffTooLargeError', () => {
    const a = Array.from({ length: 5000 }, (_, i) => `a${i}`);
    const b = Array.from({ length: 5000 }, (_, i) => `b${i}`);
    expect(() => computeDiff(a, b)).toThrow(DiffTooLargeError);
  });
  it('computeDiff_grandesEntreesQuasiIdentiques_restentCalculables', () => {
    const a = Array.from({ length: 15000 }, (_, i) => `l${i}`);
    const b = [...a];
    b[7000] = 'modifiée';
    const d = computeDiff(a, b);
    expect(d.filter((l) => l.kind !== 'equal')).toHaveLength(2);
  });
  it('computeDiff_prefixeEtSuffixeCommuns_resultatIdentiqueAuLCPComplet', () => {
    const d = computeDiff(['x', 'a', 'b', 'z'], ['x', 'b', 'c', 'z']);
    expect(d.map((l) => `${l.kind}:${l.text}`)).toEqual([
      'equal:x', 'removed:a', 'equal:b', 'added:c', 'equal:z',
    ]);
  });

  it('formatJson_entreeTropGrosse_renvoieUneErreur', () => {
    const r = formatJson('1'.repeat(LIMITS.jsonChars + 1));
    expect(r).toEqual({ ok: false, error: expect.stringMatching(/trop volumineu/i) });
    expect(minifyJson('1'.repeat(LIMITS.jsonChars + 1)).ok).toBe(false);
  });
  it('csvToJson_entreeTropGrosse_renvoieUneErreur', () => {
    expect(csvToJson('a\n' + 'x'.repeat(LIMITS.csvChars)).error).toMatch(/trop volumineu/i);
  });
  it('jsonToCsv_entreeTropGrosse_renvoieUneErreur', () => {
    expect(jsonToCsv('['.padEnd(LIMITS.csvChars + 1, ' ')).error).toMatch(/trop volumineu/i);
  });
});
