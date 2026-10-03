interface CfProperties {
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  asOrganization?: string;
}

export const onRequest = async (context: { request: Request & { cf?: CfProperties } }) => {
  const req = context.request;

  // Appel strictement same-origin (IpTool → /api/ip) : aucun en-tête CORS, donc un site tiers
  // ne peut pas lire l'IP et la géolocalisation du visiteur. Pas de préflight à servir.
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return new Response(null, { status: 405, headers: { allow: 'GET, HEAD' } });
  }

  const cf = req.cf ?? {};
  const ip =
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for') ||
    '';

  const payload = {
    ip,
    country: cf.country ?? null,
    city: cf.city ?? null,
    region: cf.region ?? null,
    timezone: cf.timezone ?? null,
    asOrganization: cf.asOrganization ?? null,
    userAgent: req.headers.get('user-agent'),
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
};
