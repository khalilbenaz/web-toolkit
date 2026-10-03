import { describe, expect, it } from 'vitest';
import { decodeHtml, encodeHtml } from './htmlEntities';

describe('htmlEntities', () => {
  it('encodeHtml_caracteresSpeciaux_lesEchappe', () => {
    expect(encodeHtml('<a href="x">&é</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#233;&lt;/a&gt;');
  });
  it('decodeHtml_entiteNommeeEtNumerique_lesDecode', () => {
    expect(decodeHtml('&eacute;&#233;&#xe9;&amp;')).toBe('ééé&');
  });
});

describe('htmlEntities hors BMP', () => {
  it('encodeHtml_emoji_produitUneSeuleEntiteValide', () => {
    expect(encodeHtml('😀')).toBe('&#128512;');
  });
  it('encodeHtml_puisDecodeHtml_roundTripAvecEmoji', () => {
    expect(decodeHtml(encodeHtml('a😀é𝒳'))).toBe('a😀é𝒳');
  });
  it('decodeHtml_pointDeCodeHorsPlage_laisseLEntiteTelleQuelle', () => {
    expect(decodeHtml('x&#x110000;y&#99999999999;')).toBe('x&#x110000;y&#99999999999;');
  });
});
