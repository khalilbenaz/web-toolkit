import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Analyse minimale de public/_headers (format Cloudflare Pages) : bloc "/*".
function globalHeaders(): Map<string, string> {
  const text = readFileSync(new URL('../../public/_headers', import.meta.url), 'utf8');
  const out = new Map<string, string>();
  let inGlobal = false;
  for (const line of text.split('\n')) {
    if (/^\S/.test(line)) inGlobal = line.trim() === '/*';
    else if (inGlobal && line.trim()) {
      const i = line.indexOf(':');
      out.set(line.slice(0, i).trim().toLowerCase(), line.slice(i + 1).trim());
    }
  }
  return out;
}

function directives(csp: string): Map<string, string> {
  return new Map(
    csp.split(';').map((d) => d.trim()).filter(Boolean).map((d) => {
      const [name, ...values] = d.split(/\s+/);
      return [name, values.join(' ')];
    }),
  );
}

describe('public/_headers', () => {
  const h = globalHeaders();
  const csp = directives(h.get('content-security-policy') ?? '');

  it('csp_scriptEtStyle_nAutorisentQueLOrigine', () => {
    expect(csp.get('script-src')).toBe("'self'");
    expect(csp.get('style-src')).toBe("'self'");
  });
  it('csp_aucuneDirectiveNAutoriseUnsafeInlineOuEval', () => {
    expect([...csp.values()].join(' ')).not.toMatch(/unsafe-inline|unsafe-eval/);
  });
  it('csp_connectSrc_limiteLesRequetesALOrigine', () => {
    expect(csp.get('connect-src')).toBe("'self'");
    expect(csp.get('default-src')).toBe("'self'");
  });
  it('csp_frameAncestorsEtObjets_sontInterdits', () => {
    expect(csp.get('frame-ancestors')).toBe("'none'");
    expect(csp.get('object-src')).toBe("'none'");
    expect(csp.get('base-uri')).toBe("'none'");
  });
  it('csp_images_autorisentDataEtBlob_pourQrEtBase64', () => {
    expect(csp.get('img-src')).toBe("'self' data: blob:");
  });
  it('enTetes_nosniffReferrerEtPermissions_sontPresents', () => {
    expect(h.get('x-content-type-options')).toBe('nosniff');
    expect(h.get('referrer-policy')).toBe('no-referrer');
    expect(h.get('permissions-policy')).toMatch(/camera=\(\)/);
    expect(h.get('permissions-policy')).toMatch(/geolocation=\(\)/);
  });
});
