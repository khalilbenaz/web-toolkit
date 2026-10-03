interface CfProperties {
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  asOrganization?: string;
}

export const onRequest = async (context: { request: Request & { cf?: CfProperties } }) => {
  const req = context.request;

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, OPTIONS',
        'access-control-allow-headers': 'Content-Type',
      },
    });
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
      'access-control-allow-origin': '*',
    },
  });
};
