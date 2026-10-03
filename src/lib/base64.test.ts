import { describe, expect, it } from 'vitest';
import { decodeBase64, encodeBase64 } from './base64';

describe('base64', () => {
  it('encodeBase64_texteUnicode_neSePerdPas', () => {
    expect(decodeBase64(encodeBase64('héllo ✓'))).toBe('héllo ✓');
  });
});
