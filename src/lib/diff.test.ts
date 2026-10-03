import { describe, expect, it } from 'vitest';
import { computeDiff } from './diff';

describe('computeDiff', () => {
  it('computeDiff_ligneModifiee_donneUneSuppressionEtUnAjout', () => {
    const d = computeDiff(['a', 'b'], ['a', 'c']);
    expect(d.map((l) => l.kind)).toEqual(['equal', 'added', 'removed']);
  });
});
