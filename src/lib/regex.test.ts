import { describe, expect, it } from 'vitest';
import { runRegex } from './regex';

describe('runRegex', () => {
  it('runRegex_flagGlobal_renvoieToutesLesCorrespondances', () => {
    const r = runRegex('a(b)?', 'g', 'ab a');
    expect(r.matches.map((m) => m.fullMatch)).toEqual(['ab', 'a']);
  });
  it('runRegex_motifInvalide_renvoieUneErreur', () => {
    expect(runRegex('(', 'g', 'x').error).not.toBe('');
  });
});
