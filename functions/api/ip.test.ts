import { describe, expect, it } from 'vitest';
import { onRequest } from './ip';

const call = (init?: RequestInit, cf?: Record<string, string>) => {
  const request = Object.assign(new Request('https://example.test/api/ip', init), cf ? { cf } : {});
  return onRequest({ request });
};

describe('GET /api/ip', () => {
  it('onRequest_get_nExposePasDeCorsOuvert', async () => {
    const res = await call({ headers: { 'cf-connecting-ip': '203.0.113.7' } });
    expect(res.status).toBe(200);
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });
  it('onRequest_get_neMetPasLaReponseEnCache', async () => {
    const res = await call();
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
  });
  it('onRequest_get_renvoieIpEtGeolocalisationDeCloudflare', async () => {
    const res = await call({ headers: { 'cf-connecting-ip': '203.0.113.7' } }, { country: 'MA', city: 'Rabat' });
    expect(await res.json()).toMatchObject({ ip: '203.0.113.7', country: 'MA', city: 'Rabat' });
  });
  it('onRequest_options_nAnnoncePasDePolitiqueCors', async () => {
    const res = await call({ method: 'OPTIONS' });
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
    expect(res.status).toBe(405);
  });
});
