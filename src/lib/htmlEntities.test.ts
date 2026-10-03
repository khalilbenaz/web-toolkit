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
