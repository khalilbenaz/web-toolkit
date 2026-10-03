import { describe, expect, it } from 'vitest';
import { csvToJson, jsonToCsv } from './csv';

describe('csvToJson', () => {
  it('csvToJson_virgulesEtGuillemets_produitUnTableauDObjets', () => {
    const { result } = csvToJson('nom,ville\nAlice,"Paris, France"');
    expect(JSON.parse(result)).toEqual([{ nom: 'Alice', ville: 'Paris, France' }]);
  });
});

describe('jsonToCsv', () => {
  it('jsonToCsv_valeurAvecVirgule_laMetEntreGuillemets', () => {
    expect(jsonToCsv('[{"a":"x,y"}]').result).toBe('a\n"x,y"');
  });
});
