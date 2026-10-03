import { describe, expect, it } from 'vitest';
import { formatJson, minifyJson } from './json';

describe('json', () => {
  it('formatJson_objetValide_indenteSurDeuxEspaces', () => {
    expect(formatJson('{"a":1}')).toEqual({ ok: true, output: '{\n  "a": 1\n}' });
  });
  it('minifyJson_jsonInvalide_renvoieUneErreur', () => {
    expect(minifyJson('{').ok).toBe(false);
  });
});
