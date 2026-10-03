import { describe, expect, it } from 'vitest';
import { decodeBase64, encodeBase64 } from './base64';

describe('encodeBase64', () => {
  it('encodeBase64_texteUnicode_roundTrip', () => {
    expect(decodeBase64(encodeBase64('héllo ✓ 😀'))).toBe('héllo ✓ 😀');
  });
  it('encodeBase64_urlSafe_remplacePlusSlashEtRetirePadding', () => {
    // 0xfb 0xff 0xfe → "+//+" en Base64 standard
    expect(encodeBase64('ÿþ', { urlSafe: true })).not.toMatch(/[+/=]/);
    expect(encodeBase64('?>>', { urlSafe: false })).toBe('Pz4+');
    expect(encodeBase64('?>>', { urlSafe: true })).toBe('Pz4-');
  });
  it('encodeBase64_grosTexte_neDepassePasLaPile', () => {
    const big = 'a'.repeat(3_000_000);
    expect(encodeBase64(big).length).toBe(4_000_000);
  });
});

describe('decodeBase64', () => {
  it('decodeBase64_urlSafe_estAccepte', () => {
    expect(decodeBase64('Pz4-')).toBe('?>>');
  });
  it('decodeBase64_sansPadding_estAccepte', () => {
    expect(decodeBase64('aGk')).toBe('hi');
  });
  it('decodeBase64_retoursALaLigneEtEspaces_sontIgnores', () => {
    expect(decodeBase64('aGVs\r\nbG8g\n d29ybGQ=')).toBe('hello world');
  });
  it('decodeBase64_octetsNonUtf8_leve_uneErreur', () => {
    expect(() => decodeBase64('/w==')).toThrow(/UTF-8/);
  });
  it('decodeBase64_caracteresInvalides_leve_uneErreur', () => {
    expect(() => decodeBase64('***')).toThrow();
  });
});
