import { describe, expect, it } from 'vitest';
import { csvToJson, detectDelimiter, jsonToCsv, parseCsv } from './csv';

describe('parseCsv', () => {
  it('parseCsv_champEntreGuillemetsMultiligne_resteUnSeulChamp', () => {
    expect(parseCsv('a,b\n"ligne1\nligne2",x', ',')).toEqual([
      ['a', 'b'],
      ['ligne1\nligne2', 'x'],
    ]);
  });
  it('parseCsv_guillemetsEchappes_sontRestitues', () => {
    expect(parseCsv('"il dit ""ok""",2', ',')).toEqual([['il dit "ok"', '2']]);
  });
  it('parseCsv_crlfEtLigneFinale_neCreePasDeLigneVide', () => {
    expect(parseCsv('a,b\r\n1,2\r\n', ',')).toEqual([['a', 'b'], ['1', '2']]);
  });
  it('parseCsv_champsVidesFinaux_sontConserves', () => {
    expect(parseCsv('a,b,c\n1,,', ',')).toEqual([['a', 'b', 'c'], ['1', '', '']]);
  });
  it('parseCsv_pointVirgule_estUnSeparateur', () => {
    expect(parseCsv('a;b\n1;"x;y"', ';')).toEqual([['a', 'b'], ['1', 'x;y']]);
  });
});

describe('detectDelimiter', () => {
  it('detectDelimiter_pointVirguleExcelFr_detecte', () => {
    expect(detectDelimiter('nom;age\nAlice;30')).toBe(';');
  });
  it('detectDelimiter_virguleDansGuillemets_lIgnore', () => {
    expect(detectDelimiter('nom,ville\nA,"Paris; France"')).toBe(',');
  });
  it('detectDelimiter_tabulation_detectee', () => {
    expect(detectDelimiter('a\tb\n1\t2')).toBe('\t');
  });
});

describe('csvToJson', () => {
  it('csvToJson_virgulesEtGuillemets_produitUnTableauDObjets', () => {
    const { result } = csvToJson('nom,ville\nAlice,"Paris, France"');
    expect(JSON.parse(result)).toEqual([{ nom: 'Alice', ville: 'Paris, France' }]);
  });
  it('csvToJson_champMultiligne_estPreserve', () => {
    const { result } = csvToJson('nom,note\nAlice,"a\nb"\nBob,c');
    expect(JSON.parse(result)).toEqual([
      { nom: 'Alice', note: 'a\nb' },
      { nom: 'Bob', note: 'c' },
    ]);
  });
  it('csvToJson_separateurPointVirgule_detecteAutomatiquement', () => {
    const { result } = csvToJson('nom;age\nAlice;30');
    expect(JSON.parse(result)).toEqual([{ nom: 'Alice', age: '30' }]);
  });
  it('csvToJson_uneSeuleLigne_renvoieUneErreur', () => {
    expect(csvToJson('a,b').error).not.toBe('');
  });
  it('csvToJson_guillemetNonFerme_renvoieUneErreur', () => {
    expect(csvToJson('a,b\n"x,1').error).toMatch(/guillemet/i);
  });
});

describe('jsonToCsv', () => {
  it('jsonToCsv_valeurAvecVirgule_laMetEntreGuillemets', () => {
    expect(jsonToCsv('[{"a":"x,y"}]').result).toBe('a\n"x,y"');
  });
  it('jsonToCsv_separateurPointVirgule_quoteSeulementSiNecessaire', () => {
    expect(jsonToCsv('[{"a":"x,y","b":"p;q"}]', ';').result).toBe('a;b\nx,y;"p;q"');
  });
  it('jsonToCsv_objetImbrique_serialiseEnJsonPlutotQueObjectObject', () => {
    expect(jsonToCsv('[{"a":{"b":1}}]').result).toBe('a\n"{""b"":1}"');
  });
  it('jsonToCsv_roundTripMultiligne_restitueLeChamp', () => {
    const csv = jsonToCsv('[{"a":"x\\ny"}]').result;
    expect(JSON.parse(csvToJson(csv).result)).toEqual([{ a: 'x\ny' }]);
  });
});
